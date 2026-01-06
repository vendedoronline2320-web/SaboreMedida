
import React, { useState, useEffect } from 'react';
import { VideoLesson, Recipe, ChatSession, ChatMessage } from '../types';
import { db } from '../services/database';
import { Plus, Trash2, Edit, Save, X, Loader2, Link as LinkIcon, Image as ImageIcon, Tag, Play, Utensils, Video, MessageCircle, Send, ArrowLeft, Search, Clock } from 'lucide-react';

interface AdminPanelProps {
  videos: VideoLesson[];
  setVideos: (videos: VideoLesson[]) => void;
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  dailyMessageCount: number;
}

type Tab = 'videos' | 'recipes' | 'support';

const AdminPanel: React.FC<AdminPanelProps> = ({ videos, setVideos, recipes, setRecipes, dailyMessageCount }) => {
  const [activeTab, setActiveTab] = useState<Tab>('videos');
  const [isAdding, setIsAdding] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoLesson | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Support State
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [adminReply, setAdminReply] = useState('');

  // Video Form State
  const [videoForm, setVideoForm] = useState<Partial<VideoLesson>>({
    title: '',
    videoUrl: '',
    thumbnail: '',
    category: 'Café da Manhã',
    shortDescription: '',
    description: '',
    duration: '00:00',
    isPremium: false
  });

  // Recipe Form State
  const [recipeForm, setRecipeForm] = useState<Partial<Recipe>>({
    name: '',
    image: '',
    category: 'Café da Manhã',
    description: '',
    ingredients: [],
    instructions: []
  });

  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');

  // Effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchChatSessions = async () => {
      const sessions = await db.getAllChatSessions();
      setChatSessions(sessions);
    };

    if (activeTab === 'support') {
      fetchChatSessions();
      interval = setInterval(fetchChatSessions, 10000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchMessages = async () => {
      if (selectedChatUser) {
        const msgs = await db.getChatMessages(selectedChatUser);
        setChatMessages(msgs);

        const hasUnread = msgs.some(m => !m.isAdmin && !m.isRead);
        if (hasUnread) {
          await db.markChatAsRead(selectedChatUser, true);
        }
      }
    };
    if (selectedChatUser) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatUser]);

  // Auto-duration for external links or uploaded videos
  useEffect(() => {
    const detectDuration = async () => {
      if (videoForm.videoUrl && (videoForm.videoUrl.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/.+google.+/i) || videoForm.videoUrl.includes('supabase.co'))) {
        const directUrl = db.getDirectLink(videoForm.videoUrl);
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.src = directUrl;
        videoElement.onloadedmetadata = () => {
          const mins = Math.floor(videoElement.duration / 60);
          const secs = Math.floor(videoElement.duration % 60);
          if (mins < 999) { // Sanity check
            setVideoForm(prev => ({ ...prev, duration: `${mins}:${secs < 10 ? '0' : ''}${secs}` }));
          }
        };
      } else if (videoForm.videoUrl?.includes('youtube.com') || videoForm.videoUrl?.includes('youtu.be')) {
        // Placeholder for YT duration if we don't have API key, but keep it editable
      }
    };
    detectDuration();
  }, [videoForm.videoUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'video' | 'thumb' | 'recipe') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const bucket = target === 'video' ? 'videos' : 'images';
      const url = await db.uploadFile(file, bucket);

      if (target === 'video') setVideoForm(prev => ({ ...prev, videoUrl: url }));
      else if (target === 'thumb') setVideoForm(prev => ({ ...prev, thumbnail: url }));
      else if (target === 'recipe') setRecipeForm(prev => ({ ...prev, image: url }));

    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Erro no upload: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSendMessage = async () => {
    if (!selectedChatUser || !adminReply.trim()) return;
    const text = adminReply;
    setAdminReply('');
    await db.sendMessage(selectedChatUser, text, true);
    const updated = await db.getChatMessages(selectedChatUser);
    setChatMessages(updated);
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      title: '',
      videoUrl: '',
      thumbnail: '',
      category: 'Café da Manhã',
      shortDescription: '',
      description: '',
      duration: '00:00',
      isPremium: false
    });
    setIsAdding(true);
  };

  const handleEditVideo = (video: VideoLesson) => {
    setEditingVideo(video);
    setVideoForm({ ...video });
    setIsAdding(true);
  };

  const handleSaveVideo = async () => {
    if (!videoForm.title || !videoForm.videoUrl) {
      alert('Por favor, preencha o Título e o Link do Vídeo.');
      return;
    }

    setIsLoading(true);

    try {
      const videoToSave: VideoLesson = {
        id: editingVideo?.id || '',
        title: videoForm.title || '',
        videoUrl: videoForm.videoUrl || '',
        thumbnail: videoForm.thumbnail || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600',
        category: videoForm.category || 'Geral',
        shortDescription: videoForm.shortDescription || '',
        description: videoForm.description || '',
        duration: videoForm.duration || '00:00',
        createdAt: editingVideo?.createdAt || Date.now(),
        isPremium: !!videoForm.isPremium
      };

      await db.saveVideo(videoToSave);
      const updatedVideos = await db.getVideos();
      setVideos(updatedVideos);

      setIsLoading(false);
      setIsAdding(false);
      alert(editingVideo ? 'Vídeo atualizado com sucesso!' : 'Vídeo adicionado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar o vídeo.');
      setIsLoading(false);
    }
  };

  const removeVideo = async (id: string) => {
    if (confirm('Deseja excluir permanentemente este vídeo?')) {
      await db.deleteVideo(id);
      const updatedVideos = await db.getVideos();
      setVideos(updatedVideos);
    }
  };

  const handleOpenAddRecipe = () => {
    setEditingRecipe(null);
    setRecipeForm({
      name: '',
      image: '',
      category: 'Café da Manhã',
      description: '',
      ingredients: [],
      instructions: []
    });
    setIngredientsText('');
    setInstructionsText('');
    setIsAdding(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setRecipeForm({ ...recipe });
    setIngredientsText(recipe.ingredients.join('\n'));
    setInstructionsText(recipe.instructions.join('\n'));
    setIsAdding(true);
  };

  const handleSaveRecipe = async () => {
    if (!recipeForm.name) {
      alert('Por favor, preencha o Nome da Receita.');
      return;
    }

    setIsLoading(true);

    try {
      const recipeToSave: Recipe = {
        id: editingRecipe?.id || '',
        name: recipeForm.name || '',
        image: recipeForm.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600',
        category: recipeForm.category || 'Geral',
        description: recipeForm.description || '',
        ingredients: ingredientsText.split('\n').filter(line => line.trim() !== ''),
        instructions: instructionsText.split('\n').filter(line => line.trim() !== '')
      };

      await db.saveRecipe(recipeToSave);
      const updatedRecipes = await db.getRecipes();
      setRecipes(updatedRecipes);

      setIsLoading(false);
      setIsAdding(false);
      alert(editingRecipe ? 'Receita atualizada com sucesso!' : 'Receita adicionada com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar o receita.');
      setIsLoading(false);
    }
  };

  const removeRecipe = async (id: string) => {
    if (confirm('Deseja excluir permanentemente esta receita?')) {
      await db.deleteRecipe(id);
      const updatedRecipes = await db.getRecipes();
      setRecipes(updatedRecipes);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white transition-colors">Gestão Admin</h3>
          <p className="text-gray-400 dark:text-gray-500 font-medium transition-colors">Gerencie o conteúdo do aplicativo.</p>
        </div>
        <div className="flex gap-2 md:gap-4 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-x-auto max-w-full transition-colors">
          {[
            { id: 'videos', label: 'Vídeos', icon: Video },
            { id: 'recipes', label: 'Receitas', icon: Utensils },
            { id: 'support', label: 'Suporte', icon: MessageCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 md:px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
            >
              <tab.icon size={18} />
              {tab.label}
              {tab.id === 'support' && dailyMessageCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-sm">
                  {dailyMessageCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== 'support' && (
          <button
            onClick={activeTab === 'videos' ? handleOpenAddVideo : handleOpenAddRecipe}
            className="flex items-center gap-3 px-8 py-4 rounded-[24px] font-black bg-gray-900 dark:bg-slate-700 text-white hover:bg-gray-800 dark:hover:bg-slate-600 shadow-xl shadow-gray-200 dark:shadow-none transition-all"
          >
            <Plus size={20} />
            {activeTab === 'videos' ? 'Nova Aula' : 'Nova Receita'}
          </button>
        )}
      </div>

      {activeTab === 'support' ? (
        <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Contacts List */}
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-colors">
            <div className="p-6 border-b border-gray-50 dark:border-slate-700">
              <h4 className="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <MessageCircle size={20} className="text-emerald-500" /> Conversas Ativas
              </h4>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-2">
              {chatSessions.length === 0 && (
                <div className="text-center text-gray-400 dark:text-gray-500 py-10 font-bold text-sm">Nenhuma conversa iniciada.</div>
              )}
              {chatSessions.map(session => (
                <div
                  key={session.userId}
                  onClick={() => setSelectedChatUser(session.userId)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border border-transparent ${selectedChatUser === session.userId ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                  <div className="flex items-center gap-4 relative">
                    <img src={session.userAvatar} className="w-12 h-12 rounded-full border border-gray-100 dark:border-slate-600" alt="Avatar" />
                    <div className="min-w-0">
                      <h5 className="font-bold text-gray-900 dark:text-white truncate">{session.userName}</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{session.lastMessage.text}</p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-2 text-[10px] font-bold text-gray-300 dark:text-gray-600">
                      {new Date(session.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {(session.unreadCount || 0) > 0 && (
                        <span className="w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                          {session.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col relative transition-colors">
            {!selectedChatUser ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-10">
                <MessageCircle size={64} className="text-gray-100 dark:text-slate-700 mb-4" />
                <p className="text-gray-400 dark:text-gray-500 font-bold">Selecione uma conversa para responder.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-700/30">
                  <h4 className="font-black text-gray-900 dark:text-white">Chat com {chatSessions.find(s => s.userId === selectedChatUser)?.userName}</h4>
                  <button onClick={() => setSelectedChatUser(null)} className="lg:hidden p-2 text-gray-400"><X size={20} /></button>
                </div>

                <div className="flex-grow bg-[#E5DDD5] dark:bg-slate-900/50 p-6 overflow-y-auto space-y-4">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-sm font-medium ${msg.isAdmin
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white rounded-tl-none'
                        }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[9px] mt-1 text-right ${msg.isAdmin ? 'text-emerald-200' : 'text-gray-400 dark:text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gray-100 dark:bg-slate-700 flex gap-3">
                  <input
                    type="text"
                    className="flex-grow rounded-full border-none px-6 py-3 focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none shadow-sm font-medium"
                    placeholder="Digite sua resposta..."
                    value={adminReply}
                    onChange={e => setAdminReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdminSendMessage()}
                  />
                  <button
                    onClick={handleAdminSendMessage}
                    className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                  >
                    <Send size={20} className="ml-0.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        isAdding && (
          <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-[40px] shadow-2xl p-8 md:p-12 animate-fade-in relative border border-gray-100 dark:border-slate-700">
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-8 right-8 p-3 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all"
              >
                <X size={28} />
              </button>

              {activeTab === 'videos' ? (
                <>
                  <div className="mb-10 text-center">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{editingVideo ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Título do Vídeo *</label>
                        <input
                          type="text"
                          value={videoForm.title}
                          onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                          placeholder="Ex: Como fazer pão de aveia perfeito"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link do Vídeo (YouTube, Drive ou Direct) *</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                              type="text"
                              value={videoForm.videoUrl}
                              onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                              placeholder="Cole o link ou use o botão à direita"
                            />
                          </div>
                          <label className="cursor-pointer bg-emerald-600 text-white px-6 rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={24} />}
                            <input type="file" className="hidden" accept="video/*" onChange={e => handleFileUpload(e, 'video')} disabled={isLoading} />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thumbnail (Link ou Upload) *</label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                              type="text"
                              value={videoForm.thumbnail}
                              onChange={e => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                              placeholder="URL da imagem ou use o botão"
                            />
                          </div>
                          <label className="cursor-pointer bg-emerald-600 text-white px-6 rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={24} />}
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'thumb')} disabled={isLoading} />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                        <select
                          value={videoForm.category}
                          onChange={e => setVideoForm({ ...videoForm, category: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-900 dark:text-white outline-none font-bold"
                        >
                          <option value="Café da Manhã">Café da Manhã</option>
                          <option value="Almoço">Almoço</option>
                          <option value="Jantar">Jantar</option>
                          <option value="Lanches">Lanches</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Duração (Min:Seg)</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              value={videoForm.duration}
                              onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })}
                              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 focus:border-emerald-500 text-gray-900 dark:text-white outline-none font-bold"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-8">
                          <input
                            type="checkbox"
                            id="isPremiumCheck"
                            checked={videoForm.isPremium}
                            onChange={e => setVideoForm({ ...videoForm, isPremium: e.target.checked })}
                            className="w-5 h-5 accent-emerald-500"
                          />
                          <label htmlFor="isPremiumCheck" className="text-sm font-bold text-gray-700 dark:text-gray-300">Conteúdo Premium</label>
                        </div>
                      </div>
                      <textarea
                        value={videoForm.shortDescription}
                        onChange={e => setVideoForm({ ...videoForm, shortDescription: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 h-24 text-gray-900 dark:text-white outline-none font-medium"
                        placeholder="Breve descrição..."
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <textarea
                        value={videoForm.description}
                        onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 h-40 text-gray-900 dark:text-white outline-none font-medium leading-relaxed"
                        placeholder="Conteúdo completo da aula..."
                      />
                    </div>
                    <div className="lg:col-span-2 flex gap-4">
                      <button onClick={() => setIsAdding(false)} className="flex-1 py-5 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-black">Cancelar</button>
                      <button onClick={handleSaveVideo} disabled={isLoading} className="flex-[2] py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-200">
                        {isLoading ? 'Aguarde...' : editingVideo ? 'Atualizar Vídeo' : 'Publicar Vídeo'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-10 text-center">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{editingRecipe ? 'Editar Receita' : 'Adicionar Nova Receita'}</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <input
                        type="text"
                        value={recipeForm.name}
                        onChange={e => setRecipeForm({ ...recipeForm, name: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-900 dark:text-white font-bold"
                        placeholder="Nome da receita"
                      />
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={recipeForm.image}
                            onChange={e => setRecipeForm({ ...recipeForm, image: e.target.value })}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                            placeholder="Link da imagem ou upload"
                          />
                        </div>
                        <label className="cursor-pointer bg-emerald-600 text-white px-6 rounded-2xl flex items-center justify-center">
                          <Plus size={24} />
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'recipe')} />
                        </label>
                      </div>
                      <textarea
                        value={ingredientsText}
                        onChange={e => setIngredientsText(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 h-40 text-gray-900 dark:text-white font-medium"
                        placeholder="Ingredientes (um por linha)"
                      />
                    </div>
                    <div className="space-y-6">
                      <select
                        value={recipeForm.category}
                        onChange={e => setRecipeForm({ ...recipeForm, category: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-900 dark:text-white font-bold"
                      >
                        <option value="Café da Manhã">Café da Manhã</option>
                        <option value="Almoço/Jantar">Almoço/Jantar</option>
                        <option value="Lanches">Lanches</option>
                      </select>
                      <textarea
                        value={instructionsText}
                        onChange={e => setInstructionsText(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 h-60 text-gray-900 dark:text-white font-medium"
                        placeholder="Modo de preparo (um passo por linha)"
                      />
                      <div className="flex gap-4">
                        <button onClick={() => setIsAdding(false)} className="flex-1 py-5 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-black">Cancelar</button>
                        <button onClick={handleSaveRecipe} disabled={isLoading} className="flex-[2] py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-200">
                          {isLoading ? 'Salvando...' : 'Salvar Receita'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      )}

      {activeTab !== 'support' && (
        <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
          {activeTab === 'videos' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Aula</th>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hidden md:table-cell">Duração</th>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {videos.map((video) => (
                    <tr key={video.id} className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <img src={video.thumbnail} className="w-24 h-14 rounded-xl object-cover border border-gray-100 dark:border-slate-600" alt="thumb" />
                          <p className="font-bold text-gray-900 dark:text-white">{video.title}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6 hidden md:table-cell">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{video.category}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${video.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {video.isPremium ? 'Premium' : 'Comum'}
                          </span>
                        </div>
                        <span className="text-xs font-black text-gray-600 dark:text-gray-400">{video.duration}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEditVideo(video)} className="p-3 text-gray-400 hover:text-emerald-500 transition-colors"><Edit size={20} /></button>
                          <button onClick={() => removeVideo(video.id)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {recipes.map((recipe) => (
                    <tr key={recipe.id} className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <img src={recipe.image} className="w-16 h-16 rounded-xl object-cover border border-gray-100 dark:border-slate-600" alt="recipe" />
                          <p className="font-bold text-gray-900 dark:text-white">{recipe.name}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEditRecipe(recipe)} className="p-3 text-gray-400 hover:text-emerald-500 transition-colors"><Edit size={20} /></button>
                          <button onClick={() => removeRecipe(recipe.id)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
