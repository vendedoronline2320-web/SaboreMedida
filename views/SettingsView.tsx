
import React, { useState, useEffect } from 'react';
import { User, ChatMessage } from '../types';
import { db } from '../services/database';
import { Bell, Shield, Moon, Sun, LogOut, ChevronRight, HelpCircle, CreditCard, RotateCcw, Lock, MessageCircle, ArrowLeft, Send, X, User as UserIcon } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  const [requestingRefund, setRequestingRefund] = useState(false);
  const [isDark, setIsDark] = useState(user.profile.darkMode ?? false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.profile.notificationsEnabled ?? true);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });

  // Chat Modal
  const [showHelpChat, setShowHelpChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Apply dark mode on mount if set
  useEffect(() => {
    if (user.profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.profile.darkMode]);

  // Poll chat messages when open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchChat = async () => {
      const msgs = await db.getChatMessages(user.id);
      setChatMessages(msgs);
    };
    if (showHelpChat) {
      fetchChat();
      interval = setInterval(fetchChat, 3000);
    }
    return () => clearInterval(interval);
  }, [showHelpChat, user.id]);

  const toggleDarkMode = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await db.updateProfile({ darkMode: newVal });
    if (newVal) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const text = newMessage;
    setNewMessage('');
    await db.sendMessage(user.id, text, false);
    const updated = await db.getChatMessages(user.id);
    setChatMessages(updated);

    // Simulate support reply if chat is empty (first message)
    if (updated.length === 1) {
      setTimeout(async () => {
        await db.sendMessage(user.id, "Olá! Bem-vindo ao suporte. Em que posso ajudar?", true);
        const msgs = await db.getChatMessages(user.id);
        setChatMessages(msgs);
      }, 1500);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8 md:space-y-12 pb-24 md:pb-20 px-4 md:px-0">
      <div className="bg-white dark:bg-slate-800 rounded-[32px] md:rounded-[48px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden divide-y divide-gray-50 dark:divide-slate-700 transition-colors">
        <div className="p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 md:mb-10">Configurações da Conta</h3>

          <div className="space-y-4 md:space-y-6">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-6 md:p-8 rounded-[32px] bg-gray-50/30 dark:bg-slate-700/30 border border-transparent hover:border-gray-100 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <Bell size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white text-base md:text-lg">Notificações Push</h4>
                  <p className="text-sm text-gray-400 dark:text-gray-400 font-medium max-w-[200px] md:max-w-md leading-tight md:leading-normal">Receba alertas sobre novas aulas e receitas.</p>
                </div>
              </div>
              <div
                onClick={toggleNotifications}
                className={`w-12 h-6 md:w-14 md:h-7 rounded-full relative transition-all cursor-pointer ${notificationsEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-none' : 'bg-gray-200 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all ${notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            {/* Account Security */}
            <div
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center justify-between p-6 md:p-8 rounded-[32px] bg-gray-50/30 dark:bg-slate-700/30 border border-transparent hover:border-gray-100 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white text-base md:text-lg">Segurança da Conta</h4>
                  <p className="text-sm text-gray-400 dark:text-gray-400 font-medium max-w-[200px] md:max-w-md leading-tight md:leading-normal">Troque sua senha de acesso.</p>
                </div>
              </div>
              <ChevronRight className="text-gray-300 dark:text-slate-500" />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-6 md:p-8 rounded-[32px] bg-gray-50/30 dark:bg-slate-700/30 border border-transparent hover:border-gray-100 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all group">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-sm">
                  {isDark ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white text-base md:text-lg">Modo Escuro</h4>
                  <p className="text-sm text-gray-400 dark:text-gray-400 font-medium max-w-[200px] md:max-w-md leading-tight md:leading-normal">Altere a aparência do aplicativo.</p>
                </div>
              </div>
              <div
                onClick={toggleDarkMode}
                className={`w-12 h-6 md:w-14 md:h-7 rounded-full relative transition-all cursor-pointer ${isDark ? 'bg-emerald-500 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' : 'bg-gray-200 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-all ${isDark ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

          </div>
        </div>

        <div className="p-8 md:p-12 bg-gray-50/20 dark:bg-slate-800">
          <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-6 md:mb-8 flex items-center gap-3">
            <CreditCard className="text-gray-400" /> Assinatura e Pagamentos
          </h3>
          <div className="bg-white dark:bg-slate-700 p-8 md:p-10 rounded-[40px] border border-gray-100 dark:border-slate-600 mb-8 md:mb-10 shadow-sm relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 p-6 md:p-8">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-all">
                <Trophy size={28} className="fill-current" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.3em] mb-2">Seu Plano Atual</p>
              <h4 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">Acesso Premium VIP</h4>
              <p className="text-gray-400 dark:text-gray-400 font-bold text-sm mb-8">Status: Vitalício (Ativado em 2026)</p>

              <button
                onClick={handleRefund}
                disabled={requestingRefund}
                className="flex items-center gap-3 text-sm font-black text-red-400 hover:text-red-600 transition-all px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 -ml-4"
              >
                <RotateCcw size={18} /> {requestingRefund ? 'Processando Solicitação...' : 'Solicitar Reembolso (Garantia de 7 dias)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <button
              onClick={() => setShowHelpChat(true)}
              className="flex items-center justify-between p-6 md:p-8 rounded-[32px] bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 hover:border-emerald-200 hover:shadow-xl transition-all text-left group"
            >
              <div className="flex items-center gap-5">
                <HelpCircle className="text-gray-300 dark:text-slate-400 group-hover:text-emerald-500 transition-all" />
                <span className="font-black text-gray-700 dark:text-white">Central de Ajuda</span>
              </div>
              <ChevronRight className="text-gray-200 dark:text-slate-500 group-hover:text-emerald-500" size={20} />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center justify-between p-6 md:p-8 rounded-[32px] bg-white dark:bg-slate-700 border border-red-50 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 transition-all text-left group"
            >
              <div className="flex items-center gap-5">
                <LogOut className="text-red-300 group-hover:text-red-500 transition-all" />
                <span className="font-black text-red-400 group-hover:text-red-600">Sair da Plataforma</span>
              </div>
              <ChevronRight className="text-red-200" size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-center text-gray-300 dark:text-slate-600 font-bold text-xs uppercase tracking-widest">
        <Shield size={14} /> Ambiente Seguro e Criptografado
      </div>

      {/* MODAL CHANGE PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-[32px] w-full max-w-md shadow-2xl animate-scale-in overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock className="text-emerald-500" /> Alterar Senha
                </h3>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Senha Atual</label>
                  <input
                    type="password"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    value={passForm.current}
                    onChange={e => setPassForm({ ...passForm, current: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-xl px-4 py-3 font-bold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    value={passForm.new}
                    onChange={e => setPassForm({ ...passForm, new: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 block">Confirmar Nova Senha</label>
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

      {/* MODAL HELP CHAT */}
      {showHelpChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowHelpChat(false)}>
          <div
            className="bg-white dark:bg-slate-800 md:rounded-[32px] w-full max-w-lg h-full md:h-[80vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 md:p-6 flex items-center justify-between text-white shadow-md z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowHelpChat(false)} className="hover:bg-white/20 p-2 rounded-full transition-all">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm md:text-base">Suporte Sabor e Medida</h3>
                    <p className="text-emerald-100 text-xs font-medium flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span> Online agora
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow bg-[#E5DDD5] dark:bg-slate-900 p-4 overflow-y-auto space-y-3">
              <div className="flex justify-center my-4">
                <span className="bg-emerald-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                  As mensagens são criptografadas de ponta a ponta.
                </span>
              </div>
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-10">
                  Olá, <b>{user.profile.name}</b>! <br /> Como podemos te ajudar hoje?
                </div>
              )}
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm font-medium ${!msg.isAdmin
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white rounded-tl-none'
                    }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[9px] mt-1 text-right ${!msg.isAdmin ? 'text-emerald-200' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="bg-gray-100 dark:bg-slate-800 p-3 md:p-4 flex gap-2">
              <input
                type="text"
                className="flex-grow rounded-full border-none px-4 py-3 focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 dark:text-white outline-none shadow-sm"
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                <Send size={20} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Internal icon for Trophy
const Trophy = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export default SettingsView;
