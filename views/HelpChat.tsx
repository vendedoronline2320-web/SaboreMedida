
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { db } from '../services/database';
import { ArrowLeft, MessageCircle, Send, X, Shield, Zap, Info } from 'lucide-react';

interface HelpChatProps {
    user: User;
    onClose: () => void;
    isFloating?: boolean;
    title?: string;
}

const HelpChat: React.FC<HelpChatProps> = ({ user, onClose, isFloating = false, title }) => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [supportType, setSupportType] = useState<'comum' | 'prioritario' | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const isPremium = user.profile.plan === 'premium' || user.profile.isAdmin;
    const activeColor = supportType === 'prioritario' ? 'bg-indigo-600' : 'bg-emerald-600';
    const activeColorText = supportType === 'prioritario' ? 'text-indigo-600' : 'text-emerald-600';
    const activeBgLight = supportType === 'prioritario' ? 'bg-indigo-50' : 'bg-emerald-50';

    const displayTitle = title || (supportType === 'prioritario' ? 'Suporte Prioritário' : 'Suporte Comum');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        const fetchChat = async () => {
            const msgs = await db.getChatMessages(user.id);
            setChatMessages(msgs);

            // Mark as read if any unread messages from admin
            const hasUnread = msgs.some(m => m.isAdmin && !m.isRead);
            if (hasUnread) {
                await db.markChatAsRead(user.id, false);
            }

            // If there are already messages, we can guess the type or just let it be
            if (msgs.length > 0 && !supportType) {
                // If user has premium, default to priority if they have history
                if (isPremium) setSupportType('prioritario');
                else setSupportType('comum');
            }
        };
        fetchChat();
        interval = setInterval(fetchChat, 3000);
        return () => clearInterval(interval);
    }, [user.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages, supportType]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        const text = newMessage;
        setNewMessage('');

        // Optimistic update
        const tempMsg: ChatMessage = {
            id: Date.now().toString(),
            senderId: user.id,
            text,
            timestamp: Date.now(),
            isAdmin: false,
            isRead: false
        };
        setChatMessages(prev => [...prev, tempMsg]);
        await db.sendMessage(user.id, `[TIPO: ${supportType?.toUpperCase()}] ${text}`, false);
    };

    const renderSelection = () => (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6 animate-fade-in">
            <div className={`w-20 h-20 ${isPremium ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'} rounded-full flex items-center justify-center mb-4`}>
                <MessageCircle size={40} />
            </div>
            <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Como podemos ajudar?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Escolha o tipo de suporte que deseja iniciar.</p>
            </div>

            <div className="w-full space-y-4">
                <button
                    onClick={() => setSupportType('comum')}
                    className="w-full p-5 bg-white dark:bg-slate-700 border-2 border-emerald-100 dark:border-slate-600 hover:border-emerald-500 rounded-3xl flex items-center gap-4 transition-all group"
                >
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Info size={24} />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-gray-900 dark:text-white text-sm">Suporte Comum</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dúvidas gerais</p>
                    </div>
                </button>

                <button
                    onClick={() => setSupportType('prioritario')}
                    className={`w-full p-5 bg-white dark:bg-slate-700 border-2 ${isPremium ? 'border-indigo-100 hover:border-indigo-500' : 'border-gray-100 opacity-60 cursor-not-allowed'} rounded-3xl flex items-center gap-4 transition-all group relative overflow-hidden`}
                    disabled={!isPremium}
                >
                    {!isPremium && <div className="absolute inset-0 bg-gray-50/50 dark:bg-slate-900/50 z-10"></div>}
                    <div className={`w-12 h-12 ${isPremium ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500' : 'bg-gray-100 text-gray-400'} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Zap size={24} className="fill-current" />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            Suporte Prioritário
                            {isPremium ? <Shield size={14} className="text-indigo-500" /> : <Shield size={14} className="text-gray-400" />}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Acesso VIP • Dietas</p>
                    </div>
                    {!isPremium && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Premium</span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className={isFloating
            ? "fixed bottom-24 right-6 z-[120] w-[350px] md:w-[400px] h-[550px] bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden animate-scale-in"
            : "fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        }>
            {!isFloating && (
                <div className="bg-white dark:bg-slate-800 rounded-[32px] w-full max-w-md h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                    <Header onClose={onClose} title={displayTitle} isFloating={false} bgColor={activeColor} onBack={supportType ? () => setSupportType(null) : undefined} />
                    {!supportType ? renderSelection() : (
                        <>
                            <Messages messages={chatMessages} user={user} scrollRef={scrollRef} activeColor={activeColor} activeColorText={activeColorText} />
                            <Input newMessage={newMessage} setNewMessage={setNewMessage} onSend={handleSendMessage} activeColor={activeColor} />
                        </>
                    )}
                </div>
            )}
            {isFloating && (
                <>
                    <Header onClose={onClose} title={displayTitle} isFloating={true} bgColor={activeColor} onBack={supportType ? () => setSupportType(null) : undefined} />
                    {!supportType ? renderSelection() : (
                        <>
                            <Messages messages={chatMessages} user={user} scrollRef={scrollRef} activeColor={activeColor} activeColorText={activeColorText} />
                            <Input newMessage={newMessage} setNewMessage={setNewMessage} onSend={handleSendMessage} activeColor={activeColor} />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const Header = ({ onClose, title, isFloating, bgColor, onBack }: { onClose: () => void, title: string, isFloating?: boolean, bgColor: string, onBack?: () => void }) => (
    <div className={`${bgColor} p-4 md:p-6 flex items-center justify-between text-white shadow-md z-10 transition-colors duration-500`}>
        <div className="flex items-center gap-3">
            {onBack ? (
                <button onClick={onBack} className="hover:bg-white/20 p-2 rounded-full transition-all">
                    <ArrowLeft size={20} />
                </button>
            ) : (
                <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-all">
                    {isFloating ? <X size={20} /> : <ArrowLeft size={20} />}
                </button>
            )}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                    <MessageCircle size={20} />
                </div>
                <div>
                    <h3 className="font-black text-sm md:text-base">{title}</h3>
                    <p className="text-white/70 text-[10px] md:text-xs font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></span> Respondendo agora
                    </p>
                </div>
            </div>
        </div>
        {onBack && (
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-all">
                <X size={20} />
            </button>
        )}
    </div>
);

const Messages = ({ messages, user, scrollRef, activeColor, activeColorText }: { messages: ChatMessage[], user: User, scrollRef: React.RefObject<HTMLDivElement>, activeColor: string, activeColorText: string }) => (
    <div ref={scrollRef} className="flex-grow bg-[#f8fafc] dark:bg-slate-900 p-4 overflow-y-auto space-y-3">
        <div className="flex justify-center my-4">
            <span className={`bg-white dark:bg-slate-800 ${activeColorText} text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-gray-100 dark:border-slate-700`}>
                As mensagens são criptografadas.
            </span>
        </div>
        {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-10 px-6">
                Olá, <b>{user.profile.name.split(' ')[0]}</b>! <br /> Como podemos te ajudar com nosso suporte?
            </div>
        )}
        {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm font-medium ${!msg.isAdmin
                    ? `${activeColor} text-white rounded-tr-none`
                    : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white rounded-tl-none'
                    }`}>
                    <p>{msg.text.replace(/^\[TIPO: [A-Z]+\] /, '')}</p>
                    <p className={`text-[9px] mt-1 text-right ${!msg.isAdmin ? 'opacity-70' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        ))}
    </div>
);

const Input = ({ newMessage, setNewMessage, onSend, activeColor }: { newMessage: string, setNewMessage: (s: string) => void, onSend: () => void, activeColor: string }) => (
    <div className="bg-white dark:bg-slate-800 p-3 md:p-4 flex gap-2 border-t border-gray-100 dark:border-slate-700 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <input
            type="text"
            className="flex-grow rounded-2xl border-none px-4 py-3 focus:ring-2 focus:ring-emerald-500 bg-gray-50 dark:bg-slate-700 dark:text-white outline-none shadow-inner"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
        />
        <button
            onClick={onSend}
            className={`p-3 ${activeColor} text-white rounded-2xl hover:brightness-110 transition-all shadow-md active:scale-95`}
        >
            <Send size={20} className="ml-0.5" />
        </button>
    </div>
);

export default HelpChat;
