
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
    duration: '10:00'
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

  // Auto-detect duration for direct video links
  useEffect(() => {
    if (videoForm.videoUrl && videoForm.videoUrl.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/.+google.+/i)) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = videoForm.videoUrl;
      video.onloadedmetadata = () => {
        const mins = Math.floor(video.duration / 60);
        const secs = Math.floor(video.duration % 60);
        setVideoForm(prev => ({ ...prev, duration: `${mins}:${secs < 10 ? '0' : ''}${secs}` }));
      };
    }
  }, [videoForm.videoUrl]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchMessages = async () => {
      if (selectedChatUser) {
        const msgs = await db.getChatMessages(selectedChatUser);
        setChatMessages(msgs);
      }
    };
    if (selectedChatUser) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedChatUser]);

  // Handlers
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
      duration: '10:00'
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
        duration: videoForm.duration || '10:00',
        createdAt: editingVideo?.createdAt || Date.now()
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
      alert('Erro ao salvar a receita.');
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
                {dailyMessageCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-sm">
                    {dailyMessageCount}
                  </span>
                )}
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
                  <div className="flex items-center gap-4">
                    <img src={session.userAvatar} className="w-12 h-12 rounded-full border border-gray-100 dark:border-slate-600" alt="Avatar" />
                    <div className="min-w-0">
                      <h5 className="font-bold text-gray-900 dark:text-white truncate">{session.userName}</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{session.lastMessage.text}</p>
                    </div>
                    <div className="ml-auto text-[10px] font-bold text-gray-300 dark:text-gray-600">
                      {new Date(session.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        /* Existing Content for Videos/Recipes */
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
                // FORMULARIO DE VIDEO
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
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link do Vídeo *</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={videoForm.videoUrl}
                            onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                            placeholder="YouTube, Vimeo ou Google Drive"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Thumbnail (opcional)</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={videoForm.thumbnail}
                            onChange={e => setVideoForm({ ...videoForm, thumbnail: e.target.value })}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                            placeholder="URL da imagem de capa"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                        <div className="relative">
                          <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <select
                            value={videoForm.category}
                            onChange={e => setVideoForm({ ...videoForm, category: e.target.value })}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all appearance-none"
                          >
                            <option value="Café da Manhã">Café da Manhã</option>
                            <option value="Almoço">Almoço</option>
                            <option value="Jantar">Jantar</option>
                            <option value="Lanches">Lanches</option>
                            <option value="Doces">Doces</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 flex flex-col h-full">
                      <textarea
                        value={videoForm.shortDescription}
                        onChange={e => setVideoForm({ ...videoForm, shortDescription: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none h-[80px] resize-none font-medium transition-all"
                        placeholder="Uma breve descrição do vídeo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Duração (Min:Seg)</label>
                      <div className="relative">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={videoForm.duration}
                          onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                          placeholder="Ex: 12:45"
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Conteúdo Completo</label>
                        <textarea
                          value={videoForm.description}
                          onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none h-[220px] resize-none font-medium leading-relaxed"
                          placeholder="Detalhes da aula..."
                        />
                      </div>
                      <div className="flex gap-4 mt-auto">
                        <button
                          onClick={() => setIsAdding(false)}
                          className="flex-1 py-5 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-black hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveVideo}
                          disabled={isLoading}
                          className="flex-[2] py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                          {editingVideo ? 'Salvar' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // FORMULARIO DE RECEITA
                <>
                  <div className="mb-10 text-center">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white">{editingRecipe ? 'Editar Receita' : 'Adicionar Nova Receita'}</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome da Receita *</label>
                        <input
                          type="text"
                          value={recipeForm.name}
                          onChange={e => setRecipeForm({ ...recipeForm, name: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                          placeholder="Ex: Bolo de Chocolate Fit"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Imagem (URL)</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            value={recipeForm.image}
                            onChange={e => setRecipeForm({ ...recipeForm, image: e.target.value })}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all"
                            placeholder="URL da imagem do prato"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                        <div className="relative">
                          <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <select
                            value={recipeForm.category}
                            onChange={e => setRecipeForm({ ...recipeForm, category: e.target.value })}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none font-bold transition-all appearance-none"
                          >
                            <option value="Café da Manhã">Café da Manhã</option>
                            <option value="Almoço/Jantar">Almoço/Jantar</option>
                            <option value="Doces Saudáveis">Doces Saudáveis</option>
                            <option value="Lanches">Lanches</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ingredientes (um por linha)</label>
                        <textarea
                          value={ingredientsText}
                          onChange={e => setIngredientsText(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none h-[150px] resize-none font-medium"
                          placeholder="Ex:&#10;2 ovos&#10;1 xícara de farinha de aveia..."
                        />
                      </div>
                    </div>
                    <div className="space-y-6 flex flex-col h-full">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Descrição / Introdução</label>
                        <textarea
                          value={recipeForm.description}
                          onChange={e => setRecipeForm({ ...recipeForm, description: e.target.value })}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none h-[100px] resize-none font-medium leading-relaxed"
                          placeholder="Uma breve introdução sobre a receita..."
                        />
                      </div>
                      <div className="flex-grow">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Modo de Preparo (um passo por linha)</label>
                        <textarea
                          value={instructionsText}
                          onChange={e => setInstructionsText(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white outline-none h-[220px] resize-none font-medium leading-relaxed"
                          placeholder="Ex:&#10;Misture tudo no liquidificador.&#10;Asse por 30min."
                        />
                      </div>
                      <div className="flex gap-4 mt-auto">
                        <button
                          onClick={() => setIsAdding(false)}
                          className="flex-1 py-5 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 font-black hover:bg-gray-200 dark:hover:bg-slate-600 transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveRecipe}
                          disabled={isLoading}
                          className="flex-[2] py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                          {editingRecipe ? 'Salvar' : 'Adicionar'}
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

      {/* CONTENT LIST */}
      {activeTab !== 'support' && (
        <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
          {activeTab === 'videos' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Aula</th>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hidden md:table-cell">Categoria</th>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {videos.map((video) => (
                    <tr key={video.id} className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-14 rounded-xl bg-gray-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden shadow-sm relative border border-white dark:border-slate-600">
                            <img src={video.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={16} className="text-white fill-current" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-md text-lg">{video.title}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest truncate">{video.videoUrl}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 hidden md:table-cell">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest">{video.category || 'Geral'}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditVideo(video)}
                            className="w-12 h-12 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all"
                          >
                            <Edit size={22} />
                          </button>
                          <button
                            onClick={() => removeVideo(video.id)}
                            className="w-12 h-12 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                          >
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {videos.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-10 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Video className="text-gray-100 dark:text-slate-700" size={64} />
                          <p className="text-gray-400 dark:text-gray-500 font-bold">Nenhum vídeo adicionado ainda.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Receita</th>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] hidden md:table-cell">Categoria</th>
                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {recipes.map((recipe) => (
                    <tr key={recipe.id} className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden shadow-sm border border-white dark:border-slate-600">
                            <img src={recipe.image} className="w-full h-full object-cover" alt="recipe" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-md text-lg">{recipe.name}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest truncate">{recipe.ingredients.length} Ingredientes</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 hidden md:table-cell">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full uppercase tracking-widest">{recipe.category}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditRecipe(recipe)}
                            className="w-12 h-12 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all"
                          >
                            <Edit size={22} />
                          </button>
                          <button
                            onClick={() => removeRecipe(recipe.id)}
                            className="w-12 h-12 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                          >
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recipes.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-10 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Utensils className="text-gray-100 dark:text-slate-700" size={64} />
                          <p className="text-gray-400 dark:text-gray-500 font-bold">Nenhuma receita adicionada ainda.</p>
                        </div>
                      </td>
                    </tr>
                  )}
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
