
import React, { useState, useEffect } from 'react';
import { Recipe, User } from '../types';
import { Clock, ChefHat, ArrowLeft, Heart, Plus, X, Save, Trash, Image as ImageIcon, Lock, Star } from 'lucide-react';
import { db } from '../services/database';

interface RecipesViewProps {
  user: User;
  recipes: Recipe[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onRequireUpgrade?: () => void;
  externalSelection?: string;
  onSelectionHandled?: () => void;
  isAdmin?: boolean;
  onUpdateRecipes?: (recipes: Recipe[]) => void;
}

const RecipesView: React.FC<RecipesViewProps> = ({ user, recipes, favorites, onToggleFavorite, onRequireUpgrade, externalSelection, onSelectionHandled, isAdmin, onUpdateRecipes }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (externalSelection) {
      const found = recipes.find(r => r.id === externalSelection);
      if (found) {
        handleSelect(found);
      }
      onSelectionHandled?.();
    }
  }, [externalSelection, recipes]);

  const handleSelect = async (recipe: Recipe) => {
    const access = await db.checkPlanAccess('recipe', user, recipe);
    if (!access.hasAccess) {
      if (onRequireUpgrade) onRequireUpgrade();
      else alert('Esta funcionalidade é exclusiva para assinantes Premium.');
      return;
    }

    db.addToHistory('recipe', recipe.id, recipe.name);
    setSelectedRecipe(recipe);
  };

  const categories = Array.from(new Set(recipes.map(r => r.category)));

  if (selectedRecipe) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto px-4 md:px-0">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 font-bold transition-all"
        >
          <ArrowLeft size={20} /> Voltar para receitas
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors">
          <img src={selectedRecipe.image} className="w-full h-80 object-cover" alt={selectedRecipe.name} />
          <div className="p-6 md:p-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full mb-3 inline-block">
                  {selectedRecipe.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">{selectedRecipe.name}</h1>
              </div>
              <button
                onClick={() => {
                  if (user.profile.plan === 'essential') {
                    if (onRequireUpgrade) onRequireUpgrade();
                    else alert('Favoritos é uma funcionalidade Premium.');
                    return;
                  }
                  onToggleFavorite(selectedRecipe.id);
                }}
                className={`p-3 rounded-2xl transition-all relative ${favorites.includes(selectedRecipe.id)
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-red-500'
                  }`}
              >
                <Heart size={24} className={favorites.includes(selectedRecipe.id) ? "fill-current" : ""} />
                {user.profile.plan === 'essential' && (
                  <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-gray-100 dark:border-slate-600">
                    <Lock size={12} className="text-amber-500" />
                  </div>
                )}
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-lg mb-10 leading-relaxed font-medium">{selectedRecipe.description}</p>

            {(selectedRecipe.time) && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-black mb-8">
                <Clock size={20} className="text-emerald-500" />
                {selectedRecipe.time}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <ChefHat className="text-emerald-500" /> Ingredientes
                </h3>
                <ul className="space-y-4">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-bold">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/30 border border-emerald-500"></div>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Clock className="text-emerald-500" /> Modo de Preparo
                </h3>
                <div className="space-y-6">
                  {selectedRecipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                        {i + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24 px-4 md:px-0">
      <div className="mb-14">
        <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 transition-colors">Receitas Saudáveis</h3>
        <p className="text-lg text-gray-400 dark:text-gray-500 font-medium transition-colors">Emagreça com prazer através das nossas receitas exclusivas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {recipes.map((recipe) => {
          const isTrialActive = user.profile.plan === 'free_trial' && (user.profile.trialExpiresAt || 0) > Date.now();
          const locked = user.profile.plan === 'essential' && !user.profile.isAdmin && !isTrialActive;

          return (
            <div
              key={recipe.id}
              onClick={() => handleSelect(recipe)}
              className="group bg-white dark:bg-slate-800 rounded-[44px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden">
                <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={recipe.name} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-all duration-300">
                    {locked ? <Lock size={24} /> : <ChefHat size={24} />}
                  </div>
                </div>
                {locked && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/95 p-4 rounded-3xl shadow-2xl flex flex-col items-center gap-2">
                      <Lock className="text-amber-500" size={32} />
                      <span className="text-[10px] font-black text-gray-900 uppercase">Acesso Premium</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-5 left-5">
                  <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">{recipe.category}</span>
                </div>
              </div>
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">{recipe.name}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user.profile.plan === 'essential') {
                        if (onRequireUpgrade) onRequireUpgrade();
                        else alert('Favoritos é uma funcionalidade Premium.');
                        return;
                      }
                      onToggleFavorite(recipe.id);
                    }}
                    className={`p-2.5 rounded-xl transition-all ${favorites.includes(recipe.id) ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                  >
                    <Heart size={22} className={favorites.includes(recipe.id) ? "fill-current" : ""} />
                  </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6 line-clamp-2 italic leading-relaxed">{recipe.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-slate-700 transition-colors">
                  <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                    <Clock size={16} /> {recipe.time}
                  </div>
                  <div className={`font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all ${locked ? 'text-gray-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    Ver Receita <ArrowLeft className="rotate-180" size={18} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecipesView;
