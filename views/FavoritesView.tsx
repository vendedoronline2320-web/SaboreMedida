
import React from 'react';
import { User, Recipe, VideoLesson } from '../types';
import { Heart, Play, Utensils, ArrowRight } from 'lucide-react';

interface FavoritesViewProps {
  user: User;
  recipes: Recipe[];
  videos: VideoLesson[];
  onToggleFavorite: (id: string) => void;
  onOpenVideo: (video: VideoLesson) => void;
  onOpenRecipe: (recipe: Recipe) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ user, recipes, videos, onToggleFavorite, onOpenVideo, onOpenRecipe }) => {
  const favoriteRecipes = recipes.filter(r => user.favorites.includes(r.id));
  const favoriteVideos = videos.filter(v => user.favorites.includes(v.id));

  if (user.favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 mb-8 animate-pulse transition-colors">
          <Heart size={48} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Nada por aqui ainda</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm transition-colors">Você ainda não salvou nenhuma receita ou aula. Clique no coração para guardar seus favoritos!</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-12">
      {favoriteRecipes.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <Heart size={20} className="text-red-500 dark:text-red-400 fill-current" /> Receitas Favoritas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteRecipes.map(recipe => (
              <div
                key={recipe.id}
                className="group bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden p-4 flex gap-4 items-center hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => onOpenRecipe(recipe)}
              >
                <img src={recipe.image} className="w-20 h-20 rounded-2xl object-cover" />
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{recipe.name}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">{recipe.category}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(recipe.id);
                    }}
                    className="text-red-500 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <Heart size={18} className="fill-current" />
                  </button>
                  <ArrowRight size={16} className="text-gray-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {favoriteVideos.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <Heart size={20} className="text-red-500 dark:text-red-400 fill-current" /> Aulas Favoritas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteVideos.map(video => (
              <div
                key={video.id}
                className="group bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden p-4 flex gap-4 items-center hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => onOpenVideo(video)}
              >
                <img src={video.thumbnail} className="w-20 h-20 rounded-2xl object-cover" />
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{video.title}</h4>
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-widest">{video.duration}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(video.id);
                    }}
                    className="text-red-500 dark:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  >
                    <Heart size={18} className="fill-current" />
                  </button>
                  <Play size={16} className="text-gray-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FavoritesView;
