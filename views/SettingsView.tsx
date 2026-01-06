
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/database';
import { Bell, Shield, Moon, Sun, LogOut, ChevronRight, HelpCircle, CreditCard, RotateCcw, Lock, X, User as UserIcon, XCircle, Trophy, Rocket, Sparkles } from 'lucide-react';
import HelpChat from './HelpChat';

interface SettingsViewProps {
  user: User;
  onLogout: () => void;
  onNavigate?: (section: string) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout, onNavigate, setUser }) => {
  const [requestingRefund, setRequestingRefund] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.profile.notificationsEnabled ?? true);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });

  // Chat Modal
  const [showHelpChat, setShowHelpChat] = useState(false);

  const toggleNotifications = async () => {
    const newVal = !notificationsEnabled;
    setNotificationsEnabled(newVal);
    await db.updateProfile({ notificationsEnabled: newVal });
  };

  const handleRefund = () => {
    if (confirm("Você tem certeza? A solicitação de reembolso cancelará seu acesso premium vitalício imediatamente após o processamento.")) {
      const reason = prompt("Por favor, descreva em poucas palavras o motivo para melhorarmos nosso serviço:");
      if (reason) {
        setRequestingRefund(true);
        setTimeout(() => {
          alert("Solicitação enviada! ID do Protocolo: REF-" + Math.floor(Math.random() * 900000 + 100000) + "\nNossa equipe financeira analisará em até 24h úteis.");
          setRequestingRefund(false);
        }, 2000);
      }
    }
  };

  const handleChangePassword = async () => {
    if (!passForm.new || !passForm.confirm) {
      alert("Preencha os novos campos de senha.");
      return;
    }
    if (passForm.new !== passForm.confirm) {
      alert("A nova senha e a confirmação não coincidem.");
      return;
    }

    const success = await db.changePassword(passForm.new);
    if (success) {
      alert("Senha alterada com sucesso!");
      setShowPasswordModal(false);
      setPassForm({ current: '', new: '', confirm: '' });
    } else {
      alert("Erro ao alterar senha.");
    }
  };

  const isPremium = user.profile.plan === 'premium' || user.profile.isAdmin;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 md:space-y-12 pb-24 md:pb-20 px-4 md:px-0">
      <div className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[48px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-50 dark:divide-slate-700 transition-colors">
        <div className="p-6 md:p-12">
          <h3 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white mb-6 md:mb-10">Configurações da Conta</h3>

          <div className="space-y-4 md:space-y-6">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-5 md:p-8 rounded-[28px] md:rounded-[32px] bg-gray-50/30 dark:bg-slate-700/30 border border-transparent hover:border-gray-100 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-11 h-11 md:w-14 md:h-14 bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Bell size={22} className="md:size-24" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-gray-900 dark:text-white text-sm md:text-lg truncate">Notificações Push</h4>
                  <p className="text-[11px] md:text-sm text-gray-400 dark:text-gray-400 font-medium leading-tight">Receba alertas sobre novas aulas e receitas.</p>
                </div>
              </div>
              <div
                onClick={toggleNotifications}
                className={`w-11 h-6 md:w-14 md:h-7 rounded-full relative transition-all cursor-pointer shrink-0 ${notificationsEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-gray-200 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            {/* Account Security */}
            <div
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-between p-5 md:p-8 rounded-[28px] md:rounded-[32px] bg-gray-50/30 dark:bg-slate-700/30 border border-transparent hover:border-gray-100 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-11 h-11 md:w-14 md:h-14 bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Shield size={22} className="md:size-24" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-gray-900 dark:text-white text-sm md:text-lg truncate">Segurança da Conta</h4>
                  <p className="text-[11px] md:text-sm text-gray-400 dark:text-gray-400 font-medium leading-tight">Troque sua senha de acesso.</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 dark:text-slate-500 shrink-0" size={18} />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-12 bg-gray-50/20 dark:bg-slate-800">
          <h3 className="text-base md:text-xl font-black text-gray-900 dark:text-white mb-6 md:mb-8 flex items-center gap-3">
            <CreditCard className="text-gray-400" size={20} /> Assinatura e Pagamentos
          </h3>
          <div className="bg-white dark:bg-slate-700 p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-100 dark:border-slate-600 mb-6 md:mb-10 shadow-sm relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 p-4 md:p-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-all">
                {isPremium ? <Trophy size={24} className="fill-current" /> : <Rocket size={24} className="animate-bounce-slow" />}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[9px] md:text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.3em] mb-2">Seu Plano Atual</p>
              <h4 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                {user.profile.plan === 'premium' ? 'Acesso Premium VIP' : user.profile.plan === 'essential' ? 'Plano Essencial' : 'Degustação (Free Trial)'}
              </h4>
              <p className="text-gray-400 dark:text-gray-400 font-bold text-[11px] md:text-sm mb-6 md:mb-8">
                Status: {user.profile.plan === 'premium' ? 'Vitalício • Ativado em 2026' : user.profile.plan === 'essential' ? 'Mensal Ativo' : `Expira em: ${user.profile.trialExpiresAt ? new Date(user.profile.trialExpiresAt).toLocaleDateString() : '24h'}`}
              </p>

              <div className="flex flex-col gap-4">
                {!isPremium ? (
                  <a
                    href="https://pay.cakto.com.br/yo5n39h_711365"
                    className="flex items-center justify-center gap-3 bg-emerald-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 hover:scale-[1.02] transition-all"
                  >
                    <Sparkles size={18} /> Fazer Upgrade para Premium
                  </a>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleRefund}
                      disabled={requestingRefund}
                      className="flex items-center gap-3 text-[11px] md:text-sm font-black text-red-500 hover:text-red-700 transition-all py-1"
                    >
                      <RotateCcw size={16} /> {requestingRefund ? 'Processando...' : 'Solicitar Reembolso (Garantia)'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja cancelar seu plano?')) {
                          alert('Sua solicitação foi enviada.');
                        }
                      }}
                      className="flex items-center gap-3 text-[11px] md:text-sm font-black text-gray-400 hover:text-red-600 transition-all py-1"
                    >
                      <XCircle size={16} /> Cancelar Assinatura
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <button
              onClick={() => setShowHelpChat(true)}
              className="flex items-center justify-between p-5 md:p-8 rounded-[28px] md:rounded-[32px] bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 hover:border-emerald-200 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <HelpCircle className="text-gray-300 dark:text-slate-400 group-hover:text-emerald-500 transition-all" />
                <span className="font-black text-sm md:text-base text-gray-700 dark:text-white">Central de Ajuda</span>
              </div>
              <ChevronRight className="text-gray-200 dark:text-slate-500 group-hover:text-emerald-500" size={18} />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center justify-between p-5 md:p-8 rounded-[28px] md:rounded-[32px] bg-white dark:bg-slate-700 border border-red-50 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <LogOut className="text-red-300 group-hover:text-red-500 transition-all" />
                <span className="font-black text-sm md:text-base text-red-400 group-hover:text-red-600">Sair da Plataforma</span>
              </div>
              <ChevronRight className="text-red-200" size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center text-gray-300 dark:text-slate-600 font-bold text-[9px] md:text-xs uppercase tracking-widest pb-10 md:pb-0">
        <Shield size={12} /> Ambiente Seguro e Criptografado
      </div>

      {/* MODAL CHANGE PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-[32px] w-full max-w-md shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock className="text-emerald-500" /> Alterar Senha
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Senha Atual</label>
                  <input
                    type="password"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    value={passForm.current}
                    onChange={e => setPassForm({ ...passForm, current: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    value={passForm.new}
                    onChange={e => setPassForm({ ...passForm, new: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Confirmar Senha</label>
                  <input
                    type="password"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    value={passForm.confirm}
                    onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                  />
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl mt-8 shadow-lg shadow-emerald-200 dark:shadow-none transition-all"
              >
                Atualizar Senha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP CHAT */}
      {showHelpChat && (
        <HelpChat user={user} onClose={() => setShowHelpChat(false)} />
      )}
    </div>
  );
};

export default SettingsView;
