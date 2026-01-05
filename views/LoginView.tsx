import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '../services/database';

interface LoginViewProps {
  onLogin: (email: string, password?: string, name?: string, isRegistering?: boolean) => Promise<void>;
  onBack: () => void;
  initialRegistering?: boolean;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onBack, initialRegistering }) => {
  const [isRegistering, setIsRegistering] = useState(initialRegistering || false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    setIsRegistering(initialRegistering || false);
  }, [initialRegistering]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && (isForgot || password)) {
      setIsLoading(true);
      try {
        await onLogin(email, password, isRegistering ? name : undefined, isRegistering);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Por favor, informe seu e-mail para recuperar a senha.');
      return;
    }

    try {
      setIsLoading(true);
      await db.resetPassword(email);
      setResetSent(true);
    } catch (error: any) {
      alert(error.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        <button
          onClick={onBack}
          className="absolute -top-12 left-0 text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={20} />
          Voltar para o início
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-xl shadow-emerald-200">S</div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {isForgot ? 'Recuperar Senha' : (isRegistering ? 'Crie sua conta' : 'Bem-vindo(a)')}
            </h1>
            <p className="text-gray-500">
              {isForgot
                ? 'Informe seu e-mail para receber as instruções.'
                : (isRegistering ? 'Preencha seus dados para começar.' : 'Acesse sua área exclusiva para alunos.')}
            </p>
          </div>

          {isForgot && resetSent ? (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Mail size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">E-mail Enviado!</h3>
              <p className="text-gray-500">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
              <button
                onClick={() => {
                  setIsForgot(false);
                  setResetSent(false);
                }}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all"
              >
                Voltar para o Login
              </button>
            </div>
          ) : isForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">E-mail de Cadastro</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar Link de Recuperação'}
              </button>
              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="w-full py-2 text-gray-500 font-bold hover:text-gray-700 transition-colors"
              >
                Cancelar e Voltar
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {isRegistering && (
                  <div className="space-y-2 animate-fade-in-down">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-bold text-gray-700">Senha</label>
                    {!isRegistering && (
                      <button
                        type="button"
                        onClick={() => setIsForgot(true)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Criar Conta Grátis' : 'Entrar na Plataforma')}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-gray-500 text-sm">
                  {isRegistering ? 'Já tem uma conta?' : 'Ainda não é membro?'}
                </p>
                <button
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  {isRegistering ? 'Fazer Login' : 'Cadastre-se agora'}
                </button>
              </div>
              <div className="mt-4 text-center font-bold text-emerald-600">VERSÃO 3.3.0</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginView;
