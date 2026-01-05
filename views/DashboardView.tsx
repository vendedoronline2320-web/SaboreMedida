
import React, { useState } from 'react';
import { User, DashboardSection, VideoLesson, Recipe, Notification } from '../types';
import { LayoutDashboard, Utensils, PlayCircle, Heart, User as UserIcon, Settings, LogOut, Search, Bell, ShieldAlert, X, Menu } from 'lucide-react';
import RecipesView from './RecipesView';
import VideoLessonsView from './VideoLessonsView';
import AdminPanel from './AdminPanel';
import FavoritesView from './FavoritesView';
import ProfileView from './ProfileView';
import SettingsView from './SettingsView';
import HomeView from './HomeView';
import { db } from '../services/database';

interface DashboardViewProps {
  user: User;
  videos: VideoLesson[];
  recipes: Recipe[];
  onToggleFavorite: (id: string) => void;
  onUpdateVideos: (videos: VideoLesson[]) => void;
  onUpdateRecipes: (recipes: Recipe[]) => void;
  onLogout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  user, videos, recipes, onToggleFavorite, onUpdateVideos, onUpdateRecipes, onLogout, setUser
}) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [targetContent, setTargetContent] = useState<{ type: 'video' | 'recipe', id: string } | null>(null);
  const [adminMessageCount, setAdminMessageCount] = useState(0);

  // Poll for admin messages count
  React.useEffect(() => {
    if (user.profile.isAdmin) {
      const updateCount = async () => {
        const count = await db.getDailyMessageCount();
        setAdminMessageCount(count);
      };
      updateCount(); // Initial check
      const interval = setInterval(updateCount, 10000); // 10s is enough for Supabase
      return () => clearInterval(interval);
    }
  }, [user.profile.isAdmin]);

  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Início' },
    { id: 'recipes', icon: Utensils, label: 'Receitas' },
    { id: 'videos', icon: PlayCircle, label: 'Vídeo Aulas' },
    { id: 'favorites', icon: Heart, label: 'Favoritos' },
    { id: 'profile', icon: UserIcon, label: 'Meu Perfil' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  const unreadCount = user.notifications.filter(n => !n.read).length;

  const handleReadNotification = async (id: string) => {
    const newNotifications = await db.markNotificationAsRead(id);
    if (newNotifications) {
      setUser({ ...user, notifications: newNotifications });
    }
  };

  const handleOpenVideo = async (video: VideoLesson) => {
    await db.addToHistory('video', video.id, video.title);
    const updatedUser = await db.getCurrentUser();
    if (updatedUser) setUser(updatedUser);
    setTargetContent({ type: 'video', id: video.id });
    setActiveSection('videos');
    setIsMobileMenuOpen(false);
  };

  const handleOpenRecipe = async (recipe: Recipe) => {
    await db.addToHistory('recipe', recipe.id, recipe.name);
    const updatedUser = await db.getCurrentUser();
    if (updatedUser) setUser(updatedUser);
    setTargetContent({ type: 'recipe', id: recipe.id });
    setActiveSection('recipes');
    setIsMobileMenuOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomeView
          user={user}
          videos={videos}
          recipes={recipes}
          onOpenVideo={handleOpenVideo}
          onOpenRecipe={handleOpenRecipe}
        />;
      case 'recipes':
        return <RecipesView
          recipes={recipes}
          favorites={user.favorites}
          onToggleFavorite={onToggleFavorite}
          externalSelection={targetContent?.type === 'recipe' ? targetContent.id : undefined}
          onSelectionHandled={() => setTargetContent(null)}
          isAdmin={user.profile.isAdmin}
          onUpdateRecipes={onUpdateRecipes}
        />;
      case 'videos':
        return <VideoLessonsView
          videos={videos}
          favorites={user.favorites}
          onToggleFavorite={onToggleFavorite}
          externalSelection={targetContent?.type === 'video' ? targetContent.id : undefined}
          onSelectionHandled={() => setTargetContent(null)}
        />;
      case 'favorites':
        return <FavoritesView
          user={user}
          recipes={recipes}
          videos={videos}
          onToggleFavorite={onToggleFavorite}
          onOpenVideo={handleOpenVideo}
          onOpenRecipe={handleOpenRecipe}
        />;
      case 'profile':
        return <ProfileView user={user} setUser={setUser} />;
      case 'settings':
        return <SettingsView user={user} onLogout={onLogout} />;
      case 'admin':
        return user.profile.isAdmin ? <AdminPanel videos={videos} setVideos={onUpdateVideos} recipes={recipes} setRecipes={onUpdateRecipes} dailyMessageCount={adminMessageCount} /> : null;
      default:
        return <HomeView user={user} videos={videos} recipes={recipes} onOpenVideo={handleOpenVideo} onOpenRecipe={handleOpenRecipe} />;
    }
  };

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 mb-16">
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-200 dark:shadow-none">S</div>
        <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Sabor<span className="text-emerald-500">e</span>Medida</span>
      </div>

      <nav className="flex-grow space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setTargetContent(null);
              setActiveSection(item.id as DashboardSection);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-extrabold transition-all duration-300 ${activeSection === item.id
              ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
          >
            <item.icon size={22} />
            {item.label}
          </button>
        ))}

        {user.profile.isAdmin && (
          <div className="pt-8 mt-8 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={() => {
                setActiveSection('admin');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-extrabold transition-all duration-300 relative ${activeSection === 'admin'
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20'
                : 'text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
            >
              <ShieldAlert size={22} />
              Gestão Admin
              {adminMessageCount > 0 && (
                <span className="absolute right-4 bg-red-500 text-white text-[10px] h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-sm">
                  {adminMessageCount}
                </span>
              )}
            </button>
          </div>
        )}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-4 px-6 py-5 rounded-3xl font-extrabold text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all mt-auto"
      >
        <LogOut size={22} />
        Sair
      </button>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden relative transition-colors duration-300">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-white dark:bg-slate-800 p-8 flex flex-col animate-slide-in-left transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <NavContent />
          </div>
        </div>
      )}

      {/* Real Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex justify-end" onClick={() => setShowNotifications(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm h-full bg-white dark:bg-slate-800 shadow-2xl p-8 animate-fade-in flex flex-col transition-colors"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Notificações</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4">
              {user.notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                  <Bell className="text-gray-100 dark:text-slate-600 mb-4" size={64} />
                  <p className="text-gray-400 dark:text-slate-500 font-medium">Tudo limpo por aqui.</p>
                </div>
              ) : (
                user.notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleReadNotification(n.id)}
                    className={`p-6 rounded-[28px] border transition-all cursor-pointer ${n.read
                      ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                      : 'bg-emerald-50 dark:bg-slate-700/50 border-emerald-100 dark:border-emerald-900/30 shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-bold text-sm ${n.read ? 'text-gray-900 dark:text-white' : 'text-emerald-800 dark:text-emerald-400'}`}>{n.title}</h4>
                      {!n.read && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{n.message}</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                      {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-800 border-r border-gray-100 dark:border-slate-700 p-8 transition-colors">
        <NavContent />
      </aside>

      <main className="flex-grow flex flex-col overflow-hidden w-full">
        {/* Header com Hambúrguer Mobile */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-50 dark:border-slate-700 h-24 flex items-center justify-between px-6 md:px-10 flex-shrink-0 z-40 transition-colors">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white truncate">
              {activeSection === 'admin' ? 'Painel Admin' : menuItems.find(m => m.id === activeSection)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-8">
            <button
              onClick={() => setShowNotifications(true)}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all relative ${unreadCount > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <div
              className="flex items-center gap-3 md:gap-4 pl-3 md:pl-6 border-l border-gray-100 dark:border-slate-700 cursor-pointer group"
              onClick={() => setActiveSection('profile')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{user.profile.name.split(' ')[0]}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{user.profile.plan === 'complete' ? 'Premium' : 'Básico'}</p>
              </div>
              <img src={user.profile.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] md:rounded-[18px] border-2 border-transparent group-hover:border-emerald-500 transition-all object-cover shadow-sm" alt="Avatar" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-10 bg-[#f8fafc] dark:bg-slate-900 transition-colors">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default DashboardView;
