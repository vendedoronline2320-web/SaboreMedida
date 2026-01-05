
import React from 'react';
import { User, VideoLesson, Recipe } from '../types';
import { Play, Utensils, Clock, TrendingUp, History, Sparkles, Flame, Trophy } from 'lucide-react';

interface HomeViewProps {
  user: User;
  videos: VideoLesson[];
  recipes: Recipe[];
  onOpenVideo: (video: VideoLesson) => void;
  onOpenRecipe: (recipe: Recipe) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ user, videos, recipes, onOpenVideo, onOpenRecipe }) => {
  // Real dynamic sorting for the latest content
  const latestVideo = [...videos].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
  const videosCount = user.history.filter(h => h.type === 'video').length;

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
      </header>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Objetivo', value: user.profile.goal === 'perder-peso' ? 'Secar' : 'Saúde', icon: Trophy, color: 'bg-indigo-600 shadow-indigo-100 dark:shadow-indigo-900/20', text: 'text-white' },
          { label: 'Peso Atual', value: `${user.profile.weight || '--'} kg`, icon: TrendingUp, color: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700', text: 'text-gray-900 dark:text-white' },
          { label: 'Aulas Vistas', value: videosCount.toString(), icon: Play, color: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700', text: 'text-gray-900 dark:text-white' },
          { label: 'Favoritos', value: user.favorites.length.toString(), icon: Sparkles, color: 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700', text: 'text-gray-900 dark:text-white' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-8 rounded-[40px] shadow-xl flex flex-col justify-between h-48 border transition-all hover:-translate-y-1`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.text === 'text-white' ? 'bg-white/20' : 'bg-gray-50 dark:bg-slate-700 text-emerald-500'}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-1 ${stat.text === 'text-white' ? 'opacity-70' : 'text-gray-400 dark:text-gray-500'}`}>{stat.label}</p>
              <p className={`text-3xl font-black ${stat.text}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-12">
          {/* Main Hero Highlight */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 transition-colors">
              <Sparkles size={24} className="text-emerald-500" /> Destaque Exclusivo
            </h2>
            {latestVideo && (
              <div
                onClick={() => onOpenVideo(latestVideo)}
                className="group relative h-[420px] rounded-[48px] overflow-hidden cursor-pointer shadow-2xl shadow-emerald-900/10"
              >
                <img src={latestVideo.thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-12 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Lançamento</span>
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Premium</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight max-w-2xl">{latestVideo.title}</h3>
                  <div className="flex items-center gap-8 text-white/70 font-bold text-sm">
                    <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl"><Clock size={18} /> {latestVideo.duration}</span>
                    <button className="flex items-center gap-3 bg-white text-emerald-600 px-8 py-3 rounded-2xl font-black group-hover:bg-emerald-50 transition-all">
                      <Play size={20} className="fill-current" /> Assistir Agora
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Quick Access Grid */}
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">Recomendados para Você</h2>
              <button className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Ver tudo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recipes.slice(0, 4).map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => onOpenRecipe(recipe)}
                  className="flex items-center gap-5 bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900 cursor-pointer transition-all hover:shadow-2xl shadow-emerald-900/5 group"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md shrink-0">
                    <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest block mb-1">{recipe.category}</span>
                    <h4 className="font-black text-gray-900 dark:text-white text-lg leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{recipe.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Activity */}
        <aside className="space-y-12">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[48px] border border-gray-50 dark:border-slate-700 shadow-sm transition-colors">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-10 flex items-center gap-3 transition-colors">
              <History size={22} className="text-gray-300 dark:text-gray-500" /> Atividade Recente
            </h2>
            <div className="space-y-10">
              {user.history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="text-gray-100 dark:text-slate-700 mx-auto mb-4" size={48} />
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-bold px-4">Explore as receitas para ver seu histórico aqui.</p>
                </div>
              ) : (
                user.history.map(activity => (
                  <div
                    key={activity.id}
                    className="flex gap-5 group cursor-pointer relative"
                    onClick={() => {
                      if (activity.type === 'video') {
                        const v = videos.find(v => v.id === activity.contentId);
                        if (v) onOpenVideo(v);
                      } else {
                        const r = recipes.find(r => r.id === activity.contentId);
                        if (r) onOpenRecipe(r);
                      }
                    }}
                  >
                    <div className={`w-12 h-12 rounded-[18px] flex-shrink-0 flex items-center justify-center transition-all ${activity.type === 'video' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                      {activity.type === 'video' ? <Play size={20} className="fill-current" /> : <Utensils size={20} />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors pr-4">{activity.title}</h4>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest">{formatDate(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#0f172a] p-10 rounded-[48px] text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <h3 className="text-xl font-black mb-4">Acesso Premium VIP</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Você está no nível mais alto de nossa plataforma. Suporte 24h ativo.</p>
            <div className="w-full h-2 bg-white/10 rounded-full mb-8 relative">
              <div className="w-[100%] h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Status: Vitalício</span>
              <Sparkles className="text-emerald-500 animate-pulse" size={20} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomeView;
