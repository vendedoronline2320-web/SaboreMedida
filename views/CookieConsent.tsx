
import React, { useEffect } from 'react';
import { ShieldCheck, Cookie } from 'lucide-react';
import { initPixel, pageView } from '../utils/pixel';

interface CookieConsentProps {
    onAccept: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
    useEffect(() => {
        initPixel();
        pageView();
    }, []);

    const handleChoice = (allowed: boolean) => {
        localStorage.setItem('cookies-consent-given', 'true');
        localStorage.setItem('cookies-allowed', String(allowed));

        // For compatibility with current App.tsx logic which waits for 'cookies-accepted'
        localStorage.setItem('cookies-accepted', 'true');

        onAccept();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-fade-in">
                <div className="p-8 md:p-12 text-center">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <Cookie size={40} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Privacidade e Cookies</h1>

                    <p className="text-gray-500 leading-relaxed mb-10 text-sm md:text-base">
                        Usamos cookies para melhorar sua experiência, personalizar conteúdo e analisar tráfego.
                        Ao continuar, você concorda com o uso de cookies conforme nossa política de privacidade.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleChoice(true)}
                            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-base"
                        >
                            Aceitar cookies
                        </button>

                        <button
                            onClick={() => handleChoice(false)}
                            className="w-full py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl hover:text-gray-600 hover:bg-gray-100 active:scale-[0.98] transition-all text-base"
                        >
                            Recusar cookies
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 flex items-center justify-center gap-2 border-t border-gray-100">
                    <ShieldCheck size={16} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navegação 100% Segura</span>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
