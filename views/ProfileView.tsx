
import React, { useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { db } from '../services/database';
import { Save, User as UserIcon, Camera, Target, Scale, Heart, Edit2 } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, setUser }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>(user.profile);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate statistics
  const recipesViewedCount = user.history.filter(h => h.type === 'view_recipe').length;

  // Calculate Evolution REAL
  // Evolution = Current Weight - Starting Weight
  const startW = parseFloat(user.profile.startWeight || user.profile.weight || '0');
  const currentW = parseFloat(formData.weight || '0');
  const evolutionValue = startW > 0 ? (currentW - startW) : 0;
  const evolution = evolutionValue.toFixed(1);
  const evolutionSign = evolutionValue > 0 ? '+' : '';

  // Initialize startWeight if not present (only once)
  useEffect(() => {
    if (!user.profile.startWeight && user.profile.weight) {
      db.updateProfile({ startWeight: user.profile.weight });
      setUser(prev => prev ? ({ ...prev, profile: { ...prev.profile, startWeight: user.profile.weight } }) : null);
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const updates = { ...formData };

    // If user is changing their weight for the first time, ensure startWeight is set
    if (!user.profile.startWeight && formData.weight) {
      updates.startWeight = formData.weight;
    }

    await db.updateProfile(updates);
    const updatedUser = await db.getCurrentUser();
    if (updatedUser) {
      setUser(updatedUser);
      setFormData(updatedUser.profile);
    }
    setIsSaving(false);
    alert('Perfil atualizado com sucesso!');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const publicUrl = await db.uploadFile(file, 'avatars');
      await db.updateProfile({ avatar: publicUrl });
      const updatedUser = await db.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
        setFormData(updatedUser.profile);
      }
      alert('Foto de perfil atualizada!');
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 md:space-y-8 pb-20 px-4 md:px-0">
      <div className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="h-24 md:h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
        <div className="px-6 md:px-10 pb-8 md:pb-10 -mt-10 md:-mt-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-6 mb-8 md:mb-10">
            <div className="relative group">
              <input
                type="file"
                id="avatar-upload-input"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
              {user.profile.avatar ? (
                <img src={user.profile.avatar} className="w-28 h-28 md:w-32 md:h-32 rounded-[28px] md:rounded-[32px] border-4 border-white dark:border-slate-800 shadow-xl object-cover transition-colors" />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-[28px] md:rounded-[32px] border-4 border-white dark:border-slate-800 bg-gray-200 dark:bg-slate-700 shadow-xl transition-colors flex items-center justify-center">
                  <UserIcon size={40} className="text-gray-400 md:size-12" />
                </div>
              )}
              <label
                htmlFor="avatar-upload-input"
                className="absolute inset-0 bg-black/40 rounded-[28px] md:rounded-[32px] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <Camera size={24} />
              </label>
            </div>
            <div className="flex-grow pb-2 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{user.profile.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm md:text-base">{user.profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-black text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 md:py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 outline-none font-bold transition-all"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-black text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Objetivo Principal</label>
                <select
                  value={formData.goal || ''}
                  onChange={e => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-5 py-3 md:py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 outline-none font-bold transition-all"
                >
                  <option value="">Selecione um objetivo</option>
                  <option value="perder-peso">Perder Peso</option>
                  <option value="ganhar-massa">Manutenção e Saúde</option>
                  <option value="definir">Definição Muscular</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-black text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">Peso Atual (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.weight || ''}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full pl-14 pr-5 py-3 md:py-4 rounded-2xl bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-900 dark:text-white focus:border-emerald-500 outline-none font-bold transition-all"
                    placeholder="Ex: 75"
                  />
                </div>
              </div>
              <div className="pt-2 md:pt-7">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-4 md:py-5 rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar Alterações</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[28px] md:rounded-[32px] border border-gray-100 dark:border-slate-700 flex items-center gap-4 md:gap-5 transition-colors shadow-sm">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Target size={24} className="md:size-28" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Meta de 2026</p>
              <Edit2 size={10} className="text-gray-300 dark:text-gray-600" />
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.targetWeight || ''}
                onChange={e => setFormData({ ...formData, targetWeight: e.target.value })}
                className="text-xl md:text-2xl font-black text-gray-900 dark:text-white w-full bg-transparent outline-none placeholder-gray-200 dark:placeholder-gray-700 focus:text-emerald-600 dark:focus:text-emerald-400"
                placeholder="Ex: 70kg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[28px] md:rounded-[32px] border border-gray-100 dark:border-slate-700 flex items-center gap-4 md:gap-5 transition-colors shadow-sm">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 shrink-0">
            <Heart size={24} className="md:size-28" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Receitas Vistas</p>
            <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{recipesViewedCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[28px] md:rounded-[32px] border border-gray-100 dark:border-slate-700 flex items-center gap-4 md:gap-5 transition-colors shadow-sm">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Scale size={24} className="md:size-28" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Evolução</p>
            <p className={`text-xl md:text-2xl font-black ${evolutionValue > 0 ? 'text-red-500' : evolutionValue < 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
              {evolutionSign}{evolution}kg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple loader icon since we removed it from lucide imports above or it might be missing
const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default ProfileView;
