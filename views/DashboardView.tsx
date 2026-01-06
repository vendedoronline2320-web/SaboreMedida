
import React, { useState } from 'react';
import { User, DashboardSection, VideoLesson, Recipe, Notification } from '../types';
import { LayoutDashboard, Utensils, PlayCircle, Heart, User as UserIcon, Settings, LogOut, Search, Bell, ShieldAlert, X, Menu, Sun, Moon, Lock, MessageCircle, Star, Sparkles, Rocket } from 'lucide-react';
import HelpChat from './HelpChat';
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
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Poll for admin messages count and user data
  React.useEffect(() => {
    const updateCount = async () => {
      if (user.profile.isAdmin) {
        const count = await db.getDailyMessageCount();
        setAdminMessageCount(count);
      }
      const updatedUser = await db.getCurrentUser();
      if (updatedUser) setUser(updatedUser);
    };
    updateCount();
    const interval = setInterval(updateCount, 15000);
    return () => clearInterval(interval);
  }, [user.profile.isAdmin, setUser]);

  const menuItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Início', feature: 'any' },
    { id: 'recipes', icon: Utensils, label: 'Receitas', feature: 'recipes' },
    { id: 'videos', icon: PlayCircle, label: 'Vídeo Aulas', feature: 'videos' },
    { id: 'favorites', icon: Heart, label: 'Favoritos', feature: 'premium_only' },
    { id: 'profile', icon: UserIcon, label: 'Meu Perfil', feature: 'profile' },
    { id: 'settings', icon: Settings, label: 'Configurações', feature: 'settings' },
  ];

  const trialExpirationTime = user.profile.trialExpiresAt || 0;
  const isTrialActive = user.profile.plan === 'free_trial' && trialExpirationTime > Date.now();
  const isTrialExpired = user.profile.plan === 'free_trial' && trialExpirationTime > 0 && Date.now() > trialExpirationTime;

  const hasFeatureAccess = (feature: string) => {
    if (user.profile.isAdmin) return true;
    if (feature === 'any' || feature === 'profile' || feature === 'settings') return true;

    // Free Trial has access to EVERYTHING if NOT expired
    if (user.profile.plan === 'free_trial') {
      return isTrialActive;
    }

    if (user.profile.plan === 'premium') return true;

    if (user.profile.plan === 'essential') {
      // Essential (Plano 10) only has access to VIDEOS (common ones) and Home
      return feature === 'videos';
    }
    return false;
  };

  const checkContentAccess = async (type: 'video' | 'recipe', content: VideoLesson | Recipe) => {
    const res = await db.checkPlanAccess(type, user, content);
    if (!res.hasAccess) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const unreadCount = user.notifications.filter(n => !n.read).length;

  const handleReadNotification = async (notification: Notification) => {
    // If not clickable for their plan
    if (user.profile.plan === 'essential' && notification.link && (notification.link.includes('recipes') || notification.link.includes('videos?id='))) {
      // Find the video and check if it is premium
      if (notification.link.includes('videos?id=')) {
        const id = notification.link.split('=')[1];
        const v = videos.find(vid => vid.id === id);
        if (v?.isPremium) {
          setShowUpgradeModal(true);
          return;
        }
      } else if (notification.link.includes('recipes')) {
        setShowUpgradeModal(true);
        return;
      }
    }

    if (notification.link) {
      if (notification.link === '/chat') {
        setShowFloatingChat(true);
      } else if (notification.link === '/admin/support') {
        setActiveSection('admin');
      } else if (notification.link.includes('videos?id=')) {
        const id = notification.link.split('=')[1];
        const v = videos.find(vid => vid.id === id);
        if (v) handleOpenVideo(v);
      } else if (notification.link.includes('recipes?id=')) {
        const id = notification.link.split('=')[1];
        const r = recipes.find(rec => rec.id === id);
        if (r) handleOpenRecipe(r);
      }
    }

    if (!notification.read) {
      const newNotifications = await db.markNotificationAsRead(notification.id);
      if (newNotifications) {
        setUser({ ...user, notifications: newNotifications });
      }
    }
    setShowNotifications(false);
  };

  const toggleDarkMode = async () => {
    const newVal = !user.profile.darkMode;
    await db.updateProfile({ darkMode: newVal });
    setUser({
      ...user,
      profile: { ...user.profile, darkMode: newVal }
    });
  };

  const handleOpenVideo = async (video: VideoLesson) => {
    const access = await checkContentAccess('video', video);
    if (!access) return;

    await db.addToHistory('video', video.id, video.title);
    const updatedUser = await db.getCurrentUser();
    if (updatedUser) setUser(updatedUser);
    setTargetContent({ type: 'video', id: video.id });
    setActiveSection('videos');
    setIsMobileMenuOpen(false);
  };

  const handleOpenRecipe = async (recipe: Recipe) => {
    const access = await checkContentAccess('recipe', recipe);
    if (!access) return;

    await db.addToHistory('recipe', recipe.id, recipe.name);
    const updatedUser = await db.getCurrentUser();
    if (updatedUser) setUser(updatedUser);
    setTargetContent({ type: 'recipe', id: recipe.id });
    setActiveSection('recipes');
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (section: string) => {
    if (section === 'admin' && !user.profile.isAdmin) return;

    if (section === 'admin') {
      setActiveSection('admin');
      setIsMobileMenuOpen(false);
      return;
    }

    const item = menuItems.find(m => m.id === section);
    if (!item) return;

    if (hasFeatureAccess(item.feature)) {
      setActiveSection(section as DashboardSection);
      setIsMobileMenuOpen(false);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <HomeView
            user={user}
            videos={videos}
            recipes={recipes}
            onOpenVideo={handleOpenVideo}
            onOpenRecipe={handleOpenRecipe}
            onNavigate={handleNavigate}
            onNotificationClick={handleReadNotification}
            onRequireUpgrade={() => setShowUpgradeModal(true)}
            onOpenChat={() => setShowFloatingChat(true)}
            setUser={setUser}
          />
        );
      case 'recipes':
        return (
          <RecipesView
            user={user}
            recipes={recipes}
            favorites={user.favorites}
            onToggleFavorite={onToggleFavorite}
            externalSelection={targetContent?.type === 'recipe' ? targetContent.id : undefined}
            onSelectionHandled={() => setTargetContent(null)}
            onRequireUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case 'videos':
        return (
          <VideoLessonsView
            user={user}
            videos={videos}
            favorites={user.favorites}
            onToggleFavorite={onToggleFavorite}
            externalSelection={targetContent?.type === 'video' ? targetContent.id : undefined}
            onSelectionHandled={() => setTargetContent(null)}
            onRequireUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case 'favorites':
        return (
          <FavoritesView
            user={user}
            videos={videos}
            recipes={recipes}
            favorites={user.favorites}
            onToggleFavorite={onToggleFavorite}
            onOpenVideo={handleOpenVideo}
            onOpenRecipe={handleOpenRecipe}
          />
        );
      case 'profile':
        return <ProfileView user={user} setUser={setUser} onLogout={onLogout} />;
      case 'settings':
        return <SettingsView user={user} setUser={setUser} onLogout={onLogout} onNavigate={handleNavigate} />;
      case 'admin':
        return (
          <AdminPanel
            videos={videos}
            recipes={recipes}
            onUpdateVideos={onUpdateVideos}
            onUpdateRecipes={onUpdateRecipes}
          />
        );
      default:
        return <HomeView user={user} videos={videos} recipes={recipes} onOpenVideo={handleOpenVideo} onOpenRecipe={handleOpenRecipe} onNavigate={handleNavigate} onNotificationClick={handleReadNotification} onRequireUpgrade={() => setShowUpgradeModal(true)} onOpenChat={() => setShowFloatingChat(true)} setUser={setUser} />;
    }
  };

  const UpgradeModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-[48px] w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-all">
          <X size={24} />
        </button>
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce-slow">
            <Rocket size={40} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Acesso Bloqueado</h3>
          <p className="text-gray-500 dark:text-gray-400 font-bold mb-10 leading-relaxed text-lg px-4">
            Você encontrou um conteúdo <span className="text-emerald-500">Exclusivo Premium</span>. Faça o upgrade agora para desbloquear receitas, aulas VIP e suporte ilimitado!
          </p>
          <div className="space-y-4">
            <a
              href="https://pay.cakto.com.br/yo5n39h_711365"
              className="block w-full py-5 bg-emerald-500 text-white font-black rounded-3xl shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 hover:scale-105 transition-all text-xl"
            >
              Desbloquear Agora (R$ 29,90)
            </a>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full py-5 bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-gray-500 font-black rounded-3xl hover:text-gray-600 transition-all"
            >
              Continuar como Grátis
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 mb-12 md:mb-16">
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg">S</div>
        <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white transition-colors">Sabor<span className="text-emerald-500">e</span>Medida</span>
      </div>

      <nav className="flex-grow space-y-2 md:space-y-3">
        {menuItems.map((item) => {
          const locked = !hasFeatureAccess(item.feature);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl md:rounded-3xl font-extrabold transition-all duration-300 ${activeSection === item.id
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
                } ${locked ? 'opacity-60 grayscale' : ''}`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} />
                {item.label}
              </div>
              {locked && <Lock size={16} className="text-gray-300 dark:text-gray-600" />}
            </button>
          );
        })}

        {user.profile.isAdmin && (
          <div className="pt-8 mt-8 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={() => handleNavigate('admin')}
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
      {showUpgradeModal && <UpgradeModal />}

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm md:hidden"
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
            className="w-full max-w-sm h-full bg-white dark:bg-slate-800 shadow-2xl p-6 md:p-8 animate-fade-in flex flex-col transition-colors"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Notificações</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
              {user.notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-10">
                  <Bell className="text-gray-100 dark:text-slate-600 mb-4" size={64} />
                  <p className="text-gray-400 dark:text-slate-500 font-medium">Tudo limpo por aqui.</p>
                </div>
              ) : (
                user.notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleReadNotification(n)}
                    className={`p-5 md:p-6 rounded-[24px] md:rounded-[28px] border transition-all cursor-pointer ${n.read
                      ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 transparency-80'
                      : 'bg-emerald-50 dark:bg-slate-700/50 border-emerald-100 dark:border-emerald-900/30 shadow-sm'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-bold text-sm ${n.read ? 'text-gray-900 dark:text-white' : 'text-emerald-800 dark:text-emerald-400'}`}>{n.title}</h4>
                      {!n.read && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
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
        <header className="bg-white dark:bg-slate-800 border-b border-gray-50 dark:border-slate-700 h-20 md:h-24 flex items-center justify-between px-4 md:px-10 flex-shrink-0 z-40 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white truncate">
              {activeSection === 'admin' ? 'Painel Admin' : menuItems.find(m => m.id === activeSection)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Theme Toggle Button */}
            <div
              onClick={toggleDarkMode}
              className={`w-12 h-7 md:w-16 md:h-9 rounded-full relative transition-all cursor-pointer flex items-center p-1 ${user.profile.darkMode ? 'bg-slate-700' : 'bg-[#e2e8f0]'}`}
            >
              <div
                className={`w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${user.profile.darkMode ? 'translate-x-[20px] md:translate-x-[28px] bg-slate-100 text-slate-900' : 'translate-x-0 bg-[#001c3d] text-white'}`}
              >
                {user.profile.darkMode ? <Moon size={12} /> : <Sun size={12} />}
              </div>
            </div>

            <button
              onClick={() => setShowNotifications(true)}
              className="relative text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl"
            >
              <Bell size={24} className="dark:text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 animate-bounce-slow">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 md:gap-4 pl-0 md:pl-6 cursor-pointer group" onClick={() => setActiveSection('profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{user.profile.name.split(' ')[0]}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-0.5">{user.profile.plan === 'premium' ? 'Premium' : user.profile.plan === 'essential' ? 'Essencial' : 'Teste'}</p>
              </div>
              {user.profile.avatar ? (
                <img src={user.profile.avatar} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-transparent group-hover:border-emerald-500 transition-all object-cover shadow-sm" alt="Avatar" />
              ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#dce1e8] dark:bg-slate-700 border-2 border-transparent group-hover:border-emerald-500 shadow-sm transition-all flex items-center justify-center">
                  <UserIcon size={20} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-10 bg-[#f8fafc] dark:bg-slate-900 transition-colors relative">
          {isTrialExpired && (
            <div className="absolute inset-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 md:p-12 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-[32px] flex items-center justify-center mb-8">
                <Lock size={48} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 leading-tight">Seu Período de Teste Expirou</h2>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-lg mb-12">Esperamos que tenha gostado do Sabor e Medida! Para continuar acessando os conteúdos exclusivos, escolha um plano.</p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-md">
                <a href="https://pay.cakto.com.br/yo5n39h_711365" className="flex-1 px-8 py-5 bg-emerald-500 text-white font-black rounded-3xl shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all text-center">Assinar Agora</a>
                <button onClick={onLogout} className="flex-1 px-8 py-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-black rounded-3xl border border-gray-100 dark:border-slate-700 hover:bg-gray-50 transition-all">Sair</button>
              </div>
            </div>
          )}
          {renderSection()}

          {/* Floating Support Bubble */}
          {(user.profile.isAdmin || user.profile.plan !== 'free_trial' || isTrialActive) && (
            <>
              <button
                onClick={() => setShowFloatingChat(!showFloatingChat)}
                className={`fixed bottom-6 right-6 w-14 h-14 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 animate-bounce-slow ${(user.profile.plan === 'premium' || user.profile.isAdmin || isTrialActive) ? 'bg-indigo-600' : 'bg-emerald-500'
                  }`}
              >
                {showFloatingChat ? <X size={24} /> : <MessageCircle size={24} />}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${(user.profile.plan === 'premium' || user.profile.isAdmin || isTrialActive) ? 'bg-indigo-400' : 'bg-emerald-500'}`}></span>
                </span>
              </button>

              {showFloatingChat && (
                <HelpChat user={user} onClose={() => setShowFloatingChat(false)} isFloating={true} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardView;
