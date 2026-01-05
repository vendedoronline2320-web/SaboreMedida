
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { Clock, ChefHat, ArrowLeft, Heart, Plus, X, Save, Trash, Image as ImageIcon } from 'lucide-react';
import { db } from '../services/database';

interface RecipesViewProps {
  recipes: Recipe[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  externalSelection?: string;
  onSelectionHandled?: () => void;
  isAdmin?: boolean;
  onUpdateRecipes?: (recipes: Recipe[]) => void;
}

const RecipesView: React.FC<RecipesViewProps> = ({ recipes, favorites, onToggleFavorite, externalSelection, onSelectionHandled, isAdmin, onUpdateRecipes }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    category: '',
    description: '',
    time: '',
    image: '',
    ingredients: [''],
    instructions: ['']
  });

  useEffect(() => {
    if (externalSelection) {
      const found = recipes.find(r => r.id === externalSelection);
      if (found) {
        setSelectedRecipe(found);
      }
      onSelectionHandled?.();
    }
  }, [externalSelection, recipes]);

  const handleSelect = (recipe: Recipe) => {
    db.addToHistory('recipe', recipe.id, recipe.name);
    setSelectedRecipe(recipe);
  };

  const handleAddIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), '']
    }));
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...(newRecipe.ingredients || [])];
    newIngredients[index] = value;
    setNewRecipe(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...(newRecipe.ingredients || [])].filter((_, i) => i !== index);
    setNewRecipe(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleAddInstruction = () => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), '']
    }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...(newRecipe.instructions || [])];
    newInstructions[index] = value;
    setNewRecipe(prev => ({ ...prev, instructions: newInstructions }));
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = [...(newRecipe.instructions || [])].filter((_, i) => i !== index);
    setNewRecipe(prev => ({ ...prev, instructions: newInstructions }));
  };

  const handleSaveRecipe = () => {
    if (!newRecipe.name || !newRecipe.category || !newRecipe.image) {
      alert('Por favor, preencha os campos obrigatórios (Título, Categoria, Imagem).');
      return;
    }

    const recipeToSave: Recipe = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRecipe.name || '',
      category: newRecipe.category || '',
      description: newRecipe.description || '',
      image: newRecipe.image || '',
      ingredients: (newRecipe.ingredients || []).filter(i => i.trim() !== ''),
      instructions: (newRecipe.instructions || []).filter(i => i.trim() !== ''),
      time: newRecipe.time || '30 min'
    };

    db.saveRecipe(recipeToSave);
    if (onUpdateRecipes) {
      onUpdateRecipes(db.getRecipes());
    }
    setIsAddModalOpen(false);
    setNewRecipe({
      name: '',
      category: '',
      description: '',
      time: '',
      image: '',
      ingredients: [''],
      instructions: ['']
    });
  };

  const categories = Array.from(new Set(recipes.map(r => r.category)));

  if (selectedRecipe) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 font-bold transition-all"
        >
          <ArrowLeft size={20} /> Voltar para receitas
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors">
          <img src={selectedRecipe.image} className="w-full h-80 object-cover" alt={selectedRecipe.name} />
          <div className="p-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full mb-3 inline-block">
                  {selectedRecipe.category}
                </span>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{selectedRecipe.name}</h1>
              </div>
              <button
                onClick={() => onToggleFavorite(selectedRecipe.id)}
                className={`p-3 rounded-2xl transition-all ${favorites.includes(selectedRecipe.id)
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-400 hover:text-red-500'
                  }`}
              >
                <Heart size={24} className={favorites.includes(selectedRecipe.id) ? "fill-current" : ""} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-lg mb-10 leading-relaxed">{selectedRecipe.description}</p>

            {(selectedRecipe.time) && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold mb-8">
                <Clock size={20} className="text-emerald-500" />
                {selectedRecipe.time}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ChefHat className="text-emerald-500" /> Ingredientes
                </h3>
                <ul className="space-y-3">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="text-emerald-500" /> Modo de Preparo
                </h3>
                <div className="space-y-4">
                  {selectedRecipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{step}</p>
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
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Nossas Receitas</h3>
          <p className="text-gray-500 dark:text-gray-400">Descubra novos sabores para o seu dia a dia.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:-translate-y-1"
          >
            <Plus size={20} />
            Adicionar Receita
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => handleSelect(recipe)}
            className="group bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative h-56 overflow-hidden">
              <img src={recipe.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={recipe.name} />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 shadow-sm">
                  {recipe.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {recipe.name}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe.id);
                  }}
                  className={`p-2 rounded-xl transition-all ${favorites.includes(recipe.id) ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'
                    }`}
                >
                  <Heart size={20} className={favorites.includes(recipe.id) ? "fill-current" : ""} />
                </button>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{recipe.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500">
                  <Clock size={14} /> {recipe.time || '25 min'}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver receita <ArrowLeft size={16} className="rotate-180" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in border border-gray-100 dark:border-slate-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-700 p-6 flex justify-between items-center z-10 transition-colors">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">Nova Receita</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Título da Receita</label>
                  <input
                    type="text"
                    value={newRecipe.name}
                    onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 outline-none transition-all font-medium"
                    placeholder="Ex: Bolo de Cenoura Fit"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Categoria</label>
                  <select
                    value={newRecipe.category}
                    onChange={e => setNewRecipe({ ...newRecipe, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 outline-none transition-all font-medium"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Descrição Curta</label>
                <textarea
                  value={newRecipe.description}
                  onChange={e => setNewRecipe({ ...newRecipe, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 outline-none transition-all font-medium min-h-[80px]"
                  placeholder="Uma breve descrição do prato..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tempo (ex: 30 min)</label>
                  <input
                    type="text"
                    value={newRecipe.time || ''}
                    onChange={e => setNewRecipe({ ...newRecipe, time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 outline-none transition-all font-medium"
                    placeholder="Ex: 45 min"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">URL da Imagem</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRecipe.image}
                      onChange={e => setNewRecipe({ ...newRecipe, image: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 outline-none transition-all font-medium"
                      placeholder="https://..."
                    />
                    {newRecipe.image && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-600 overflow-hidden flex-shrink-0">
                        <img src={newRecipe.image} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex justify-between">
                  Ingredientes
                  <button onClick={handleAddIngredient} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">+ Adicionar</button>
                </label>
                {newRecipe.ingredients?.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={ing}
                      onChange={e => handleIngredientChange(i, e.target.value)}
                      className="flex-grow px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 outline-none text-sm"
                      placeholder={`Ingrediente ${i + 1}`}
                    />
                    <button onClick={() => handleRemoveIngredient(i)} className="text-red-400 hover:text-red-600 p-2"><Trash size={18} /></button>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex justify-between">
                  Modo de Preparo
                  <button onClick={handleAddInstruction} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">+ Adicionar Passo</button>
                </label>
                {newRecipe.instructions?.map((inst, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="mt-2 text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                    <textarea
                      value={inst}
                      onChange={e => handleInstructionChange(i, e.target.value)}
                      className="flex-grow px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-emerald-500 outline-none text-sm min-h-[60px]"
                      placeholder={`Passo ${i + 1}`}
                    />
                    <button onClick={() => handleRemoveInstruction(i)} className="text-red-400 hover:text-red-600 p-2 mt-1"><Trash size={18} /></button>
                  </div>
                ))}
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 flex justify-end gap-3 transition-colors">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRecipe}
                className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all flex items-center gap-2"
              >
                <Save size={20} />
                Salvar Receita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesView;
