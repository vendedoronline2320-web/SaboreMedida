
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { db } from '../services/database';
import { ArrowLeft, MessageCircle, Send, X } from 'lucide-react';

interface HelpChatProps {
    user: User;
    onClose: () => void;
    isFloating?: boolean;
    title?: string;
}

const HelpChat: React.FC<HelpChatProps> = ({ user, onClose, isFloating = false, title }) => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const displayTitle = title || (user.profile.plan === 'premium' ? 'Suporte VIP' : 'Central de Ajuda');

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
        };
        fetchChat();
        interval = setInterval(fetchChat, 3000);
        return () => clearInterval(interval);
    }, [user.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

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
        await db.sendMessage(user.id, text, false);
    };

    return (
        <div className={isFloating
            ? "fixed bottom-24 right-6 z-[100] w-[350px] md:w-[400px] h-[550px] bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden animate-scale-in"
            : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        }>
            {!isFloating && (
                <div className="bg-white dark:bg-slate-800 rounded-[32px] w-full max-w-md h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                    <Header onClose={onClose} title={displayTitle} isFloating={false} />
                    <Messages messages={chatMessages} user={user} scrollRef={scrollRef} />
                    <Input newMessage={newMessage} setNewMessage={setNewMessage} onSend={handleSendMessage} />
                </div>
            )}
            {isFloating && (
                <>
                    <Header onClose={onClose} title={displayTitle} isFloating={true} />
                    <Messages messages={chatMessages} user={user} scrollRef={scrollRef} />
                    <Input newMessage={newMessage} setNewMessage={setNewMessage} onSend={handleSendMessage} />
                </>
            )}
        </div>
    );
};

const Header = ({ onClose, title, isFloating }: { onClose: () => void, title: string, isFloating?: boolean }) => (
    <div className="bg-emerald-600 p-4 md:p-6 flex items-center justify-between text-white shadow-md z-10">
        <div className="flex items-center gap-3">
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-all">
                {isFloating ? <X size={20} /> : <ArrowLeft size={20} />}
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                    <MessageCircle size={20} />
                </div>
                <div>
                    <h3 className="font-black text-sm md:text-base">{title}</h3>
                    <p className="text-emerald-100 text-[10px] md:text-xs font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span> Respondendo agora
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const Messages = ({ messages, user, scrollRef }: { messages: ChatMessage[], user: User, scrollRef: React.RefObject<HTMLDivElement> }) => (
    <div ref={scrollRef} className="flex-grow bg-[#E5DDD5] dark:bg-slate-900 p-4 overflow-y-auto space-y-3">
        <div className="flex justify-center my-4">
            <span className="bg-emerald-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                As mensagens são criptografadas de ponta a ponta.
            </span>
        </div>
        {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-10">
                Olá, <b>{user.profile.name}</b>! <br /> Como podemos te ajudar hoje?
            </div>
        )}
        {messages.map(msg => (
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
);

const Input = ({ newMessage, setNewMessage, onSend }: { newMessage: string, setNewMessage: (s: string) => void, onSend: () => void }) => (
    <div className="bg-gray-100 dark:bg-slate-800 p-3 md:p-4 flex gap-2 border-t border-gray-200 dark:border-slate-700">
        <input
            type="text"
            className="flex-grow rounded-full border-none px-4 py-3 focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 dark:text-white outline-none shadow-sm"
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSend()}
        />
        <button
            onClick={onSend}
            className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-md active:scale-95"
        >
            <Send size={20} className="ml-0.5" />
        </button>
    </div>
);

export default HelpChat;
