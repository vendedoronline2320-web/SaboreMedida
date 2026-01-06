
import React from 'react';
import { User, VideoLesson, Recipe } from '../types';
import { Play, Utensils, Clock, TrendingUp, History, Sparkles, Flame, Trophy, Bell, ChevronRight, Heart, Lock, LogOut } from 'lucide-react';

interface HomeViewProps {
  user: User;
  videos: VideoLesson[];
  recipes: Recipe[];
  onOpenVideo: (video: VideoLesson) => void;
  onOpenRecipe: (recipe: Recipe) => void;
  onNavigate: (section: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ user, videos, recipes, onOpenVideo, onOpenRecipe, onNavigate, onNotificationClick }) => {
  // Sorting latest content
  const latestVideo = [...videos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
  const videosCount = user.history.filter(h => h.type === 'video').length;

  // Recommendations Logic: Category-based
  const recommendations = React.useMemo(() => {
    // 1. Get user interest categories
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

    // 2. Filter items
    const combined = [
      ...recipes.map(r => ({ ...r, type: 'recipe' as const })),
      ...videos.map(v => ({ ...v, type: 'video' as const }))
    ];

    // Priority: items from top categories user hasn't seen much of
    let filtered = combined.filter(item => item.category === topInterest);
    if (filtered.length < 4) {
      filtered = [...filtered, ...combined.filter(item => item.category !== topInterest)];
    }

    return filtered.slice(0, 4);
  }, [recipes, videos, user.history, user.favorites]);

  const hasAccessToRecs = user.profile.plan !== 'free_trial' || user.profile.isAdmin;

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 3600000) return 'Agora pouco';
    if (diff < 86400000) return `Há ${Math.floor(diff / 3600000)}h`;
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(timestamp);
  };

  return (
    <div className="animate-fade-in space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 transition-colors">Bem-vindo, {user.profile.name.split(' ')[0]}! 👋</h1>
          <p className="text-lg text-gray-400 dark:text-gray-500 font-medium transition-colors">Sua jornada para um corpo saudável continua aqui.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-[28px] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-xl flex items-center justify-center">
              <Flame size={20} className="fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sua sequência</p>
              <p className="text-xl font-black text-gray-900 dark:text-white transition-colors">
                {user.profile.streak || 1} Dia{(user.profile.streak || 1) !== 1 ? 's' : ''} Focado
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid xl:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-12">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Objetivo', value: user.profile.goal === 'perder-peso' ? 'Secar' : 'Saúde', icon: Trophy, color: 'bg-indigo-600' },
              { label: 'Peso Atual', value: `${user.profile.weight || '--'} kg`, icon: TrendingUp, color: 'bg-emerald-500' },
              { label: 'Aulas Vistas', value: videosCount.toString(), icon: Play, color: 'bg-blue-500' },
              { label: 'Favoritos', value: user.favorites.length.toString(), icon: Sparkles, color: 'bg-purple-500' }
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} p-6 rounded-[32px] text-white shadow-xl shadow-gray-200 dark:shadow-none`}>
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                  <stat.icon size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Featured Highlight */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <Sparkles size={24} className="text-emerald-500" /> Destaque Exclusivo
            </h2>
            {latestVideo && (
              <div
                onClick={() => onOpenVideo(latestVideo)}
                className="group relative h-[380px] rounded-[48px] overflow-hidden cursor-pointer shadow-2xl"
              >
                <img src={latestVideo.thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-10 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Novo</span>
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{latestVideo.category}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight max-w-2xl">{latestVideo.title}</h3>
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-3 bg-white text-emerald-600 px-8 py-3 rounded-2xl font-black hover:bg-emerald-50 transition-all">
                      <Play size={20} className="fill-current" /> Começar Assistir
                    </button>
                    <span className="flex items-center gap-2 text-white/80 font-bold text-sm">
                      <Clock size={18} /> {latestVideo.duration}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Recommendations Grid */}
          <section className="relative">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Recomendados para Você</h2>
              <button
                onClick={() => onNavigate('recipes')}
                className="flex items-center gap-2 text-sm font-black text-emerald-500 hover:text-emerald-600 transition-all"
              >
                Ver tudo <ChevronRight size={16} />
              </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!hasAccessToRecs ? 'blur-sm grayscale pointer-events-none opacity-40' : ''}`}>
              {recommendations.map((item: any, i) => (
                <div
                  key={i}
                  onClick={() => item.type === 'video' ? onOpenVideo(item) : onOpenRecipe(item)}
                  className="flex items-center gap-5 bg-white dark:bg-slate-800 p-5 rounded-[32px] border border-gray-100 dark:border-slate-700 hover:border-emerald-200 cursor-pointer transition-all hover:shadow-xl group"
                >
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                    <img src={item.image || item.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">{item.category}</span>
                    <h4 className="font-black text-gray-900 dark:text-white truncate">{item.name || item.title}</h4>
                    <p className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-1">
                      {item.type === 'video' ? <><Play size={12} /> Aula</> : <><Utensils size={12} /> Receita</>}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {!hasAccessToRecs && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[40px] border border-gray-100 dark:border-slate-700 shadow-2xl text-center">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={32} />
                  </div>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">Recurso Premium</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-6 max-w-[240px]">Atualize seu plano para receber recomendações inteligentes.</p>
                  <button
                    onClick={() => onNavigate('settings')}
                    className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                  >
                    Ver Planos
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Info Sidebar */}
        <aside className="space-y-8">
          {/* Notifications Panel */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <Bell size={20} className="text-emerald-500" /> Notificações
            </h2>
            <div className="space-y-4">
              {user.notifications.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs font-bold">Sem novas notificações</div>
              ) : (
                user.notifications.slice(0, 3).map(n => (
                  <div
                    key={n.id}
                    onClick={() => onNotificationClick(n)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.read ? 'bg-gray-50 dark:bg-slate-700/50 border-transparent' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 shadow-sm font-bold'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="text-xs text-gray-900 dark:text-white line-clamp-1">{n.title}</h5>
                      {!n.read && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1"></div>}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Panel */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-gray-100 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <History size={20} className="text-gray-400" /> Atividades
            </h2>
            <div className="space-y-6">
              {user.history.length === 0 ? (
                <p className="text-xs text-center text-gray-400 font-bold py-6">Nenhuma atividade registrada.</p>
              ) : (
                user.history.slice(0, 6).map(h => {
                  let Icon = History;
                  let color = 'bg-gray-50 text-gray-400';
                  if (h.type === 'view_video' || h.type === 'video') { Icon = Play; color = 'bg-blue-50 text-blue-500'; }
                  else if (h.type === 'view_recipe' || h.type === 'recipe') { Icon = Utensils; color = 'bg-orange-50 text-orange-500'; }
                  else if (h.type === 'favorite') { Icon = Heart; color = 'bg-red-50 text-red-500'; }
                  else if (h.type === 'login') { Icon = LogOut; color = 'bg-emerald-50 text-emerald-500'; }
                  else if (h.type === 'upload_video') { Icon = TrendingUp; color = 'bg-purple-50 text-purple-500'; }
                  else if (h.type === 'welcome') { Icon = Sparkles; color = 'bg-yellow-50 text-yellow-500'; }

                  return (
                    <div key={h.id} className="flex gap-4 items-start">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2">{h.title}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{formatDate(h.timestamp)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => onNavigate('home')} // Or some activity specific tab
              className="w-full mt-8 py-3 rounded-2xl border border-gray-100 dark:border-slate-700 text-[10px] font-black text-gray-400 hover:bg-gray-50 transition-all"
            >
              LIMPAR HISTÓRICO
            </button>
          </div>

          {/* Plan Card */}
          <div className="bg-[#0f172a] p-8 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
            <h3 className="text-lg font-black mb-3">
              {user.profile.isAdmin ? 'Acesso Administrador' : user.profile.plan === 'premium' ? 'Plano Premium' : 'Plano Grátis'}
            </h3>
            <p className="text-slate-400 text-[11px] font-medium mb-6">
              {user.profile.isAdmin ? 'Você tem controle total sobre os recursos e conteúdos.' : 'Aproveite todos os benefícios do seu acesso atual.'}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                Status: {user.profile.isAdmin ? 'Infinity' : 'Ativo'}
              </span>
              {!user.profile.isAdmin && user.profile.plan !== 'premium' && (
                <button className="bg-emerald-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase">Fazer Upgrade</button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomeView;
