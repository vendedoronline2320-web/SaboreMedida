import React, { useState, useEffect } from 'react';
import { ViewType, User, VideoLesson, Recipe } from './types';
import LandingPage from './views/LandingPage';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import { db } from './services/database';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isRegisteringMode, setIsRegisteringMode] = useState(false);

  useEffect(() => {
    const version = '3.3.0';
    console.log(`--- SISTEMA ATUALIZADO v${version} ---`);
    // alert(`Sistema Atualizado para v${version}`); // Opcional, mas vamos usar o console primeiro
    const initApp = async () => {
      try {
        const loggedUser = await db.getCurrentUser();
        if (loggedUser) {
          setUser(loggedUser);
          setView('dashboard');
        }
      } catch (err) {
        console.error('Erro na inicialização automática:', err);
      }

      try {
        const [v, r] = await Promise.all([db.getVideos(), db.getRecipes()]);
        setVideos(v);
        setRecipes(r);
      } catch (err) {
        console.error('Erro ao carregar conteúdos:', err);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (user?.profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  const handleLogin = async (email: string, password?: string, name?: string, isRegistering?: boolean) => {
    try {
      let loggedUser: User;
      if (isRegistering && name) {
        loggedUser = await db.signUp(email, name, password);
      } else {
        loggedUser = await db.login(email, password);
      }
      setUser(loggedUser);
      setView('dashboard');
    } catch (error: any) {
      console.error('Erro no handleLogin:', error);
      alert(error.message || 'Erro inesperado na autenticação');
    }
  };

  const handleLogout = async () => {
    await db.logout();
    setUser(null);
    setView('landing');
  };

  const handleToggleFavorite = async (id: string) => {
    if (!user) return;
    const type = videos.find(v => v.id === id) ? 'video' : 'recipe';
    const newFavorites = await db.toggleFavorite(id, type);
    setUser({ ...user, favorites: newFavorites });
  };

  const handleUpdateVideos = (updatedVideos: VideoLesson[]) => {
    setVideos(updatedVideos);
  };

  const handleUpdateRecipes = (updatedRecipes: Recipe[]) => {
    setRecipes(updatedRecipes);
  };

  
        />
      )}

      {view === 'login' && (
        <LoginView
          onLogin={handleLogin}
          onBack={() => setView('landing')}
          initialRegistering={isRegisteringMode}
        />
      )}

      {view === 'dashboard' && user && (
        <DashboardView
          user={user}
          videos={videos}
          recipes={recipes}
          onToggleFavorite={handleToggleFavorite}
          onUpdateVideos={handleUpdateVideos}
          onUpdateRecipes={handleUpdateRecipes}
          onLogout={handleLogout}
          setUser={setUser}
        />
      )}
    </div>
  );
};

export default App;
