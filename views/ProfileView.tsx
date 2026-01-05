
import React, { useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { db } from '../services/database';
import { Save, User as UserIcon, Camera, Target, Scale, Heart } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, setUser }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>(user.profile);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate statistics
  const recipesViewedCount = user.history.filter(h => h.type === 'recipe').length;

  // Calculate Evolution
  const startW = parseFloat(user.profile.startWeight || formData.weight || '0');
  const currentW = parseFloat(formData.weight || '0');
  const evolution = startW && currentW ? (currentW - startW).toFixed(1) : '0';
  const evolutionSign = parseFloat(evolution) > 0 ? '+' : '';

  // Initialize startWeight if not present
  useEffect(() => {
    if (!user.profile.startWeight && user.profile.weight) {
      db.updateProfile({ startWeight: user.profile.weight });
      setUser(prev => prev ? ({ ...prev, profile: { ...prev.profile, startWeight: user.profile.weight } }) : null);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // If startWeight is undefined, set it to the current weight being saved
    const updates = { ...formData };
    if (!user.profile.startWeight && formData.weight) {
      updates.startWeight = formData.weight;
    }

    await db.updateProfile(updates);
    setUser(prev => prev ? ({ ...prev, profile: { ...prev.profile, ...updates } }) : null);
    setIsSaving(false);
    alert('Perfil atualizado com sucesso!');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-[40px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="h-32 gradient-primary"></div>
        <div className="px-10 pb-10 -mt-12">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
            <div className="relative group">
              <img src={user.profile.avatar} className="w-32 h-32 rounded-[32px] border-4 border-white dark:border-slate-800 shadow-xl object-cover transition-colors" />
              <button className="absolute inset-0 bg-black/40 rounded-[32px] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                <Camera size={24} />
              </button>
            </div>
            <div className="flex-grow pb-2">
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{user.profile.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{user.profile.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Objetivo Principal</label>
                <select
                  value={formData.goal || ''}
                  onChange={e => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 outline-none transition-all"
                >
                  <option value="">Selecione um objetivo</option>
                  <option value="perder-peso">Perder Peso</option>
                  <option value="ganhar-massa">Manutenção e Saúde</option>
                  <option value="definir">Definição Muscular</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Peso Atual (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.weight || ''}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900/30 outline-none transition-all"
                    placeholder="Ex: 75"
                  />
                </div>
              </div>
              <div className="pt-7">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 dark:hover:bg-emerald-500 hover:shadow-emerald-200 dark:hover:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : <><Save size={20} /> Salvar Alterações</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Meta de 2026 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <Target size={24} />
          </div>
          <div className="flex-grow">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Meta de 2026</p>
            <div className="relative">
              <input
                type="text"
                value={formData.targetWeight || ''}
                onChange={e => setFormData({ ...formData, targetWeight: e.target.value })}
                className="text-xl font-extrabold text-gray-900 dark:text-white w-full bg-transparent outline-none placeholder-gray-300 dark:placeholder-gray-600 focus:underline"
                placeholder="Ex: 70kg"
              />
            </div>
          </div>
        </div>

        {/* Receitas Vistas */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Receitas Vistas</p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">{recipesViewedCount}</p>
          </div>
        </div>

        {/* Evolução */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <Scale size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Evolução</p>
            <p className={`text-xl font-extrabold ${parseFloat(evolution) > 0 ? 'text-red-500 dark:text-red-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
              {evolutionSign}{evolution}kg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
