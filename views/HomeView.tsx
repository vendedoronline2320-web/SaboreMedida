
import React from 'react';
import { User, VideoLesson, Recipe, Notification } from '../types';
import { Play, Utensils, Clock, TrendingUp, History, Sparkles, Flame, Trophy, Bell, ChevronRight, Heart, Lock, RefreshCcw, Crown } from 'lucide-react';
import { db } from '../services/database';

interface HomeViewProps {
  user: User;
  videos: VideoLesson[];
  recipes: Recipe[];
  onOpenVideo: (video: VideoLesson) => void;
  onOpenRecipe: (recipe: Recipe) => void;
  onNavigate: (section: string) => void;
  onNotificationClick: (notification: Notification) => void;
  onRequireUpgrade?: () => void;
  onOpenChat?: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const HomeView: React.FC<HomeViewProps> = ({ user, videos, recipes, onOpenVideo, onOpenRecipe, onNavigate, onNotificationClick, onRequireUpgrade, onOpenChat, setUser }) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Sorting latest content
  const latestVideo = [...videos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
  const videosCount = user.history.filter(h => h.type === 'view_video' || h.type === 'video').length;

  const isTrialActive = user.profile.plan === 'free_trial' && (user.profile.trialExpiresAt || 0) > Date.now();
  const isPremium = user.profile.plan === 'premium' || user.profile.isAdmin || isTrialActive;
  const isEssential = user.profile.plan === 'essential';

  // Recommendations Logic: Category-based
  const recommendations = React.useMemo(() => {
    const viewedCategories = user.history
      .map(h => {
        const item = [...videos, ...recipes].find(i => i.id === h.contentId);
        return item?.category;
      })
      .filter(Boolean);

    const favCategories = user.favorites
      .map(fid => {
        const item = [...videos, ...recipes].find(i => i.id === fid);
        return item?.category;
      })
      .filter(Boolean);

    const interests = [...viewedCategories, ...favCategories];
    const topInterest = interests.sort((a, b) => interests.filter(v => v === b).length - interests.filter(v => v === a).length)[0];

    const combined = [
      ...recipes.map(r => ({ ...r, type: 'recipe' as const })),
      ...videos.map(v => ({ ...v, type: 'video' as const }))
    ];

    let filtered = combined.filter(item => item.category === topInterest);
    if (filtered.length < 4) {
      filtered = [...filtered, ...combined.filter(item => item.category !== topInterest)];
    }

    return filtered.slice(0, 4);
  }, [recipes, videos, user.history, user.favorites]);

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 3600000) return 'Agora pouco';
    if (diff < 86400000) return `Há ${Math.floor(diff / 3600000)}h`;
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(timestamp);
  };

  const handleRefreshActivities = async () => {
    setIsRefreshing(true);
    const updatedUser = await db.getCurrentUser();
    if (updatedUser) setUser(updatedUser);
    setTimeout(() => setIsRefreshing(false), 800);
  };


  const handleRecClick = (item: any) => {
    if (!isPremium && (item.type === 'recipe' || item.isPremium)) {
      if (onRequireUpgrade) onRequireUpgrade();
      return;
    }
    if (item.type === 'video') onOpenVideo(item);
    else onOpenRecipe(item);
  };

  return (
    <div className="animate-fade-in space-y-8 md:space-y-12 pb-20 px-2 md:px-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 transition-colors">Olá, {user.profile.name.split(' ')[0]}! 👋</h1>
          <p className="text-base md:text-lg text-gray-400 dark:text-gray-500 font-medium transition-colors">Sua jornada saudável continua aqui.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-grow md:flex-none bg-white dark:bg-slate-800 px-5 md:px-6 py-4 rounded-[28px] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-xl flex items-center justify-center">
              <Flame size={20} className="fill-current" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sequência</p>
              <p className="text-lg md:text-xl font-black text-gray-900 dark:text-white transition-colors">
                {user.profile.streak || 1} Dia{(user.profile.streak || 1) !== 1 ? 's' : ''} Focado
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8 md:space-y-12">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Objetivo', value: user.profile.goal === 'perder-peso' ? 'Secar' : 'Saúde', icon: Trophy, color: 'bg-indigo-600' },
              { label: 'Peso Atual', value: `${user.profile.weight || '--'} kg`, icon: TrendingUp, color: 'bg-emerald-500' },
              { label: 'Aulas Vistas', value: videosCount.toString(), icon: Play, color: 'bg-blue-500' },
              { label: 'Favoritos', value: user.favorites.length.toString(), icon: Sparkles, color: 'bg-purple-500' }
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} p-5 md:p-6 rounded-[28px] md:rounded-[32px] text-white shadow-xl shadow-gray-200 dark:shadow-none`}>
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3 md:mb-4">
                  <stat.icon size={18} />
                </div>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{stat.label}</p>
                <p className="text-lg md:text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Featured Highlight */}
          <section>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-6 md:mb-8 flex items-center gap-3">
              <Sparkles size={24} className="text-emerald-500" /> Destaque Exclusivo
            </h2>
            {latestVideo && (
              <div
                onClick={() => {
                  if (latestVideo.isPremium && !isPremium) {
                    if (onRequireUpgrade) onRequireUpgrade();
                    return;
                  }
                  onOpenVideo(latestVideo);
                }}
                className={`group relative h-[300px] md:h-[420px] rounded-[40px] md:rounded-[56px] overflow-hidden cursor-pointer shadow-2xl transition-all ${latestVideo.isPremium && !isPremium ? 'grayscale brightness-75' : ''}`}
              >
                <img src={latestVideo.thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 md:p-14 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="bg-emerald-500 text-white text-[9px] md:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Novo</span>
                    {latestVideo.isPremium && (
                      <span className="bg-amber-500 text-white text-[9px] md:text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                        <Crown size={12} className="fill-current" /> Premium
                      </span>
                    )}
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">{latestVideo.category}</span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-white mb-6 leading-tight max-w-2xl">{latestVideo.title}</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <button className="flex items-center gap-3 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black hover:bg-emerald-50 transition-all text-sm md:text-base">
                      {latestVideo.isPremium && !isPremium ? <><Lock size={20} /> Upgrade Necessário</> : <><Play size={20} className="fill-current" /> Assistir Agora</>}
                    </button>
                    {!latestVideo.isPremium || isPremium ? (
                      <span className="flex items-center gap-2 text-white/80 font-bold text-sm">
                        <Clock size={18} /> {latestVideo.duration}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Recommendations Grid */}
          <section className="relative">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">Para você hoje</h2>
              <button
                onClick={() => onNavigate('recipes')}
                className="flex items-center gap-2 text-sm font-black text-emerald-500 hover:text-emerald-600 transition-all"
              >
                Ver tudo <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {recommendations.map((item: any, i) => {
                const locked = !isPremium && (item.type === 'recipe' || item.isPremium);
                return (
                  <div
                    key={i}
                    onClick={() => handleRecClick(item)}
                    className={`flex items-center gap-4 md:gap-5 bg-white dark:bg-slate-800 p-4 md:p-5 rounded-[28px] md:rounded-[32px] border border-gray-100 dark:border-slate-700 hover:border-emerald-200 cursor-pointer transition-all hover:shadow-xl group relative overflow-hidden ${locked ? 'opacity-80' : ''}`}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.image || item.thumbnail} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${locked ? 'blur-[2px] grayscale' : ''}`} />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">{item.category}</span>
                      <h4 className="font-black text-gray-900 dark:text-white truncate text-sm md:text-base">{item.name || item.title}</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] md:text-xs text-gray-400 font-bold flex items-center gap-1 mt-1">
                          {item.type === 'video' ? <><Play size={10} /> Aula</> : <><Utensils size={10} /> Receita</>}
                        </p>
                        {locked && <Lock size={12} className="text-amber-500 ml-2" />}
                      </div>
                    </div>
                    {locked && (
                      <div className="absolute inset-0 bg-white/10 dark:bg-slate-900/10 pointer-events-none"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar Activity History */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm transition-colors flex flex-col h-[500px]">
            <div className="p-4 md:p-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/30 dark:bg-slate-700/30">
              <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                <History size={18} className="text-emerald-500" /> Histórico
              </h3>
              <button
                onClick={handleRefreshActivities}
                disabled={isRefreshing}
                className={`p-2 text-gray-400 hover:text-emerald-500 transition-all ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}
                title="Atualizar histórico"
              >
                <RefreshCcw size={16} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
              {user.history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-3">
                    <History className="text-gray-200 dark:text-gray-600" size={24} />
                  </div>
                  <p className="text-xs text-gray-400 font-bold italic">Nenhuma atividade recente.</p>
                </div>
              ) : (
                user.history.map((activity, i) => (
                  <div
                    key={activity.id}
                    className="group"
                    onClick={() => {
                      if (activity.type === 'view_video' || activity.type === 'video') {
                        const v = videos.find(vid => vid.id === activity.contentId);
                        if (v) onOpenVideo(v);
                      } else if (activity.type === 'view_recipe' || activity.type === 'recipe') {
                        const r = recipes.find(rec => rec.id === activity.contentId);
                        if (r) onOpenRecipe(r);
                      }
                    }}
                  >
                    <div className="flex gap-4 cursor-pointer p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${activity.type.includes('video') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' :
                        activity.type.includes('recipe') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' :
                          activity.type === 'favorite' ? 'bg-red-50 dark:bg-red-900/10 text-red-500' :
                            'bg-gray-50 dark:bg-slate-700 text-gray-400'
                        }`}>
                        {activity.type.includes('video') ? <Play size={18} /> :
                          activity.type.includes('recipe') ? <Utensils size={18} /> :
                            activity.type === 'favorite' ? <Heart size={18} className="fill-current" /> :
                              <TrendingUp size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-700 dark:text-slate-200 truncate group-hover:text-emerald-500 transition-colors">{activity.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-all">
              <Sparkles size={100} />
            </div>
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">Suporte Prioritário</h4>
              <p className="text-sm font-bold text-indigo-100/80 mb-6 leading-relaxed">Dúvidas sobre sua dieta? Nossa equipe está pronta para te ajudar agora.</p>
              <button
                onClick={() => onOpenChat && onOpenChat()}
                className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-lg hover:bg-indigo-50 transition-all"
              >
                Falar com Especialista
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
