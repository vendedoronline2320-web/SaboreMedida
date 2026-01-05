
import React, { useState } from 'react';
import { ChevronRight, CheckCircle, Play, Star, ShieldCheck, ArrowRight, Sparkles, Menu, X } from 'lucide-react';
import { TESTIMONIALS, FAQS } from '../constants';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo Left */}
            {/* Logo Left */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-200 group-hover:rotate-6 transition-transform duration-300 text-xl pb-1">
                s
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-800">
                Sabor <span className="text-emerald-500">&</span> Medida
              </span>
            </div>

            {/* Nav Center */}
            <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center space-x-10">
              {[
                { label: 'Benefícios', id: 'benefícios' },
                { label: 'Diferencial', id: 'método' },
                { label: 'FAQ', id: 'faq' },
                { label: 'Planos', id: 'preços' }
              ].map((item) => (
                <a
                  key={item.label}
                  href={`#${item.id}`}
                  className="text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            {/* CTA Right */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={onLogin}
                  className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-all px-4"
                >
                  Entrar
                </button>
                <button
                  onClick={onStart}
                  className="hover-scale bg-emerald-500 text-white px-7 py-3 rounded-full text-sm font-bold premium-shadow hover:bg-emerald-600 transition-all"
                >
                  Começar Grátis
                </button>
              </div>

              {/* Mobile Menu Icon */}
              <button
                className="md:hidden text-slate-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl z-50 animate-fade-in-down">
            {[
              { label: 'Benefícios', id: 'benefícios' },
              { label: 'Diferencial', id: 'método' },
              { label: 'FAQ', id: 'faq' },
              { label: 'Planos', id: 'preços' }
            ].map((item) => (
              <a
                key={item.label}
                href={`#${item.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold text-slate-700 py-2 border-b border-slate-50"
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogin();
                }}
                className="w-full py-3 rounded-xl border border-slate-200 font-bold text-slate-900"
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStart();
                }}
                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-200"
              >
                Começar Grátis
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 bg-gradient-to-b from-emerald-50/30 to-white overflow-hidden">
        <div className="max-w-5xl mx-auto text-center animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium mb-8">
            <Sparkles size={14} />
            ✨ Novo método de emagrecimento
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-7xl font-[800] text-[#0f172a] leading-tight md:leading-[1.1] mb-6 md:mb-8 tracking-tight">
            Receitas para <span className="text-emerald-500">Secar</span> em 2026 <br />
            sem abrir mão do <span className="text-orange-500">sabor</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed font-medium">
            Coma pão, doces e pratos deliciosos do jeito certo, com ingredientes inteligentes que trabalham <strong className="text-slate-600">a favor do seu corpo</strong>.
          </p>

          {/* VSL Placeholder */}
          <div className="relative max-w-4xl mx-auto mb-8 md:mb-14 rounded-2xl md:rounded-[32px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border-4 md:border-[8px] border-white aspect-video bg-slate-900 group cursor-pointer hover:border-emerald-50 transition-colors duration-500">
            <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="Video Placeholder" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Play className="fill-current ml-1 md:hidden" size={24} />
                <Play className="fill-current ml-1 hidden md:block" size={36} />
              </div>
              <p className="text-white mt-4 md:mt-6 font-bold text-xs md:text-sm uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-opacity">Assista a apresentação</p>
            </div>
          </div>

          <button
            onClick={() => document.getElementById('preços')?.scrollIntoView({ behavior: 'smooth' })}
            className="group hover-scale inline-flex items-center justify-center gap-3 bg-orange-500 md:bg-emerald-500 text-white px-8 py-3.5 md:px-12 md:py-5 rounded-xl md:rounded-full text-lg md:text-xl font-extrabold premium-shadow hover:bg-orange-600 md:hover:bg-emerald-600 transition-all w-auto max-w-[90%] md:max-w-none shadow-lg md:shadow-none"
          >
            Quero começar agora
            <ArrowRight size={20} className="md:hidden group-hover:translate-x-1.5 transition-transform" />
            <ArrowRight size={24} className="hidden md:block group-hover:translate-x-1.5 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-8 mt-10 text-slate-400 font-semibold text-sm">
            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-500" /> Acesso Seguro</span>
            <span className="flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500" /> Garantia de 7 dias</span>
          </div>
        </div>
      </section>

      {/* Benefits Section (Image 4 - Por que funciona) */}
      <section id="benefícios" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center animate-appear">
          <span className="text-emerald-500 font-bold tracking-widest text-sm uppercase mb-4 block">POR QUE FUNCIONA</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-16">
            Benefícios que mudam <br /> sua vida
          </h2>

          <div className="space-y-4">
            {[
              "Comer bem sem sofrimento",
              "Nada de dietas restritivas",
              "Receitas simples e inteligentes",
              "Emagrecimento sustentável",
              "Ideal para quem odeia dieta"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl hover:bg-emerald-100/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-200/50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                  <CheckCircle size={16} />
                </div>
                <span className="text-slate-800 font-semibold text-lg text-left">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <ArrowRight className="text-slate-400 rotate-90" size={32} />
          </div>
        </div>
      </section>

      {/* Differential Section (Image 2 & 3 - Isso não é mais do mesmo) */}
      <section id="método" className="py-20 bg-slate-50/50">
        <div className="max-w-3xl mx-auto px-6 text-center animate-appear">
          <span className="text-orange-500 font-bold tracking-widest text-sm uppercase mb-4 block">NOSSO DIFERENCIAL</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-6">
            Isso <span className="text-orange-500">não</span> é mais do <br /> mesmo
          </h2>
          <p className="text-slate-500 text-lg mb-16 max-w-2xl mx-auto">
            Substituição inteligente de ingredientes. Você come o que gosta, mas preparado do jeito certo.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-red-50 border border-red-100 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500 font-bold">✕</div>
              <span className="text-slate-600 font-medium text-lg decoration-slate-400 decoration-1 line-through text-left">
                Dieta restritiva e sem sabor
              </span>
            </div>

            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <CheckCircle size={20} />
              </div>
              <span className="text-slate-800 font-bold text-lg text-left">
                Comida gostosa e inteligente
              </span>
            </div>

            <div className="flex items-center gap-4 bg-red-50 border border-red-100 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500 font-bold">✕</div>
              <span className="text-slate-600 font-medium text-lg decoration-slate-400 decoration-1 line-through text-left">
                Passar fome o dia todo
              </span>
            </div>

            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <CheckCircle size={20} />
              </div>
              <span className="text-slate-800 font-bold text-lg text-left">
                Mudança leve e sustentável
              </span>
            </div>

            <div className="flex items-center gap-4 bg-red-50 border border-red-100 p-5 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500 font-bold">✕</div>
              <span className="text-slate-600 font-medium text-lg decoration-slate-400 decoration-1 line-through text-left">
                Cortar o pão completamente
              </span>
            </div>

            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                <CheckCircle size={20} />
              </div>
              <span className="text-slate-800 font-bold text-lg text-left">
                Comer pão do jeito certo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Comer Pão Section (Image 1) */}
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-gradient-to-r from-emerald-50 to-orange-50 rounded-3xl p-8 md:p-12 text-center border border-slate-100 shadow-sm animate-appear">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-relaxed">
              Comer pão? <span className="text-emerald-500 font-extrabold">SIM!</span>
              <br />
              Comer pão do jeito certo?
              <br />
              <span className="text-orange-500 font-extrabold text-3xl md:text-4xl mt-2 block">MUITO MELHOR!</span>
            </h3>
          </div>
        </div>
      </section>

      {/* Testimonials Section (Resultados Reais - WhatsApp Style) */}
      <section id="testemunhos" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 animate-appear">
          <div className="text-center mb-16">
            <span className="text-emerald-500 font-bold tracking-widest text-sm uppercase mb-4 block">RESULTADOS REAIS</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-6 tracking-tight">O que estão dizendo</h2>
            <p className="text-slate-500 text-lg">Histórias reais de quem já transformou o corpo e a saúde.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">MS</div>
                <div>
                  <span className="font-bold text-slate-900 text-lg block">Maria S.</span>
                  <span className="text-xs text-emerald-500 font-medium">Online agora</span>
                </div>
              </div>

              <div className="space-y-3 font-sans text-[15px]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%] self-start relative">
                  <p className="text-slate-800">Gente, preciso contar uma coisa...</p>
                  <span className="text-[10px] text-slate-400 absolute bottom-1 right-2">09:30</span>
                </div>
                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%] self-start relative">
                  <p className="text-slate-800">Perdi 4kg no primeiro mês só com as receitas! 😍</p>
                  <span className="text-[10px] text-slate-400 absolute bottom-1 right-2">09:31</span>
                </div>
                <div className="bg-[#d9fdd3] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto relative">
                  <p className="text-slate-900">E o melhor: continuo comendo pão todo dia kkk</p>
                  <div className="text-right mt-1 flex justify-end items-center gap-1">
                    <span className="text-[10px] text-slate-500">09:32</span>
                    <CheckCircle size={12} className="text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">AP</div>
                <div>
                  <span className="font-bold text-slate-900 text-lg block">Ana Paula</span>
                  <span className="text-xs text-slate-400 font-medium">Visto por último hoje às 14:10</span>
                </div>
              </div>

              <div className="space-y-3 font-sans text-[15px]">
                <div className="bg-[#d9fdd3] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto relative">
                  <p className="text-slate-900">Amiga, aquela receita do bolo fit é surreal 😱</p>
                  <div className="text-right mt-1 flex justify-end items-center gap-1">
                    <span className="text-[10px] text-slate-500">14:12</span>
                    <CheckCircle size={12} className="text-blue-500" />
                  </div>
                </div>
                <div className="bg-[#d9fdd3] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto relative">
                  <p className="text-slate-900">Meu marido nem percebeu que era saudável 😉</p>
                  <div className="text-right mt-1 flex justify-end items-center gap-1">
                    <span className="text-[10px] text-slate-500">14:13</span>
                    <CheckCircle size={12} className="text-blue-500" />
                  </div>
                </div>
                <div className="bg-[#d9fdd3] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto relative">
                  <p className="text-slate-900">Já emagreci 3kg e ele 2kg kkkkk</p>
                  <div className="text-right mt-1 flex justify-end items-center gap-1">
                    <span className="text-[10px] text-slate-500">14:15</span>
                    <CheckCircle size={12} className="text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">CM</div>
                <div>
                  <span className="font-bold text-slate-900 text-lg block">Carla M.</span>
                  <span className="text-xs text-emerald-500 font-medium">Digitando...</span>
                </div>
              </div>

              <div className="space-y-3 font-sans text-[15px]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%] self-start relative">
                  <p className="text-slate-800">Finalmente algo que funciona pra mim! Já tinha desistido de dieta...</p>
                  <span className="text-[10px] text-slate-400 absolute bottom-1 right-2">18:45</span>
                </div>
                <div className="bg-[#d9fdd3] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto relative">
                  <p className="text-slate-900">Em 6 semanas: -5kg e me sentindo ótima! 💚</p>
                  <div className="text-right mt-1 flex justify-end items-center gap-1">
                    <span className="text-[10px] text-slate-500">18:47</span>
                    <CheckCircle size={12} className="text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">PB</div>
                <div>
                  <span className="font-bold text-slate-900 text-lg block">Patricia B.</span>
                  <span className="text-xs text-slate-400 font-medium">Online há 5 min</span>
                </div>
              </div>
              <div className="space-y-3 font-sans text-[15px]">
                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-slate-100 max-w-[85%] self-start relative">
                  <p className="text-slate-800">Nunca achei que fosse possível emagrecer comendo coisas gostosas 😋</p>
                  <span className="text-[10px] text-slate-400 absolute bottom-1 right-2">16:50</span>
                </div>
                <div className="bg-[#d9fdd3] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto relative">
                  <p className="text-slate-900">-8kg em 3 meses! Recomendo muito! ✨</p>
                  <div className="text-right mt-1 flex justify-end items-center gap-1">
                    <span className="text-[10px] text-slate-500">16:55</span>
                    <CheckCircle size={12} className="text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="preços" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-100 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 animate-appear">
          <div className="text-center mb-24">
            <span className="text-emerald-600 font-black tracking-[0.3em] text-[10px] uppercase mb-4 block">TRANSFORMAÇÃO VITALÍCIA</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Investimento em Você</h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">Escolha o caminho para sua melhor versão em 2026.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-center">
            {/* Plan 1 */}
            <div className="bg-white p-12 rounded-[48px] border border-slate-200 hover:border-emerald-200 transition-all flex flex-col group relative shadow-sm hover:shadow-2xl">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Plano Essencial</h3>
              <p className="text-slate-400 mb-10 font-bold text-sm">As 10 receitas fundamentais.</p>
              <div className="mb-10">
                <span className="text-6xl font-black text-slate-900">R$ 10</span>
                <span className="text-slate-300 font-black ml-1 text-2xl">,00</span>
              </div>
              <ul className="space-y-6 mb-12 flex-grow">
                {["Top 10 Receitas", "Guia de Substituições", "Suporte via E-mail"].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-600 font-bold">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <CheckCircle size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://pay.cakto.com.br/sqpgdf5_711359"
                rel="noopener noreferrer"
                className="w-full py-6 rounded-3xl border-2 border-slate-100 text-slate-900 font-black hover:bg-slate-50 hover:border-slate-200 transition-all text-center block text-lg shadow-sm"
              >
                Selecionar Essencial
              </a>
            </div>

            {/* Plan 2 - DARK MODE PREMIUM */}
            <div className="relative bg-[#0f172a] p-12 rounded-[48px] shadow-[0_48px_80px_-20px_rgba(16,185,129,0.3)] scale-105 z-10 flex flex-col border border-emerald-500/30">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-emerald-500/20 whitespace-nowrap">👑 MAIS COMPRADO</div>

              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-3xl font-black text-white mb-1">Acesso Premium</h3>
                  <p className="text-emerald-400/80 mb-10 font-bold text-sm">O método completo e atualizado.</p>
                </div>
                <Sparkles className="text-emerald-400 animate-pulse" size={28} />
              </div>

              <div className="mb-10">
                <span className="text-6xl font-black text-white">R$ 29</span>
                <span className="text-emerald-400 font-black ml-1 text-2xl">,90</span>
              </div>

              <ul className="space-y-6 mb-12 flex-grow">
                {[
                  "Todas as Receitas + Novas todo mês",
                  "Módulo de Vídeo Aulas Premium",
                  "Área de Favoritos Personalizada",
                  "Suporte Prioritário VIP",
                  "Bônus: Lista de Compras Inteligente"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-200 font-bold">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://pay.cakto.com.br/yo5n39h_711365"
                rel="noopener noreferrer"
                className="hover-scale w-full py-6 rounded-3xl bg-emerald-500 text-white font-black premium-shadow hover:bg-emerald-600 transition-all text-center block text-xl shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)]"
              >
                Garantir Acesso Premium
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Simplified */}
      <section id="faq" className="py-24 bg-white border-t border-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Perguntas e Respostas</h2>
            <p className="text-slate-500 text-lg">Tire suas dúvidas sobre o Sabor e Medida.</p>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <details key={i} className="group border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300 open:shadow-xl open:border-emerald-100">
                <summary className="flex justify-between items-center p-8 cursor-pointer bg-white group-open:bg-emerald-50/30 transition-colors">
                  <span className="font-bold text-lg text-slate-900">{faq.question}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-open:bg-emerald-500 group-open:text-white transition-all">
                    <ChevronRight size={18} className="group-open:rotate-90 transition-transform" />
                  </div>
                </summary>
                <div className="px-8 pb-8 text-slate-500 leading-relaxed font-medium">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div >
      </section >

      {/* Guarantee Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-emerald-50 rounded-[40px] p-12 text-center border border-emerald-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-emerald-500">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-6">Garantia de 7 dias</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Se você não ficar satisfeito com o conteúdo nos primeiros 7 dias, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-slate-700 font-semibold">
              <span className="flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500" /> Reembolso total</span>
              <span className="flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500" /> Sem perguntas</span>
              <span className="flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500" /> Risco zero</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-32 bg-[#fffbf8] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-bold text-sm mb-10">
            <Sparkles size={16} />
            Sua transformação começa aqui
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-[#0f172a] mb-10 leading-[1.1] tracking-tight">
            Pare de sofrer com dietas. <br />
            <span className="text-emerald-500">Comece a viver</span> comendo bem.
          </h2>

          <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-14 leading-relaxed">
            Junte-se a milhares de pessoas que já descobriram como emagrecer sem abrir mão do prazer de comer. Sua melhor versão está a um clique de distância.
          </p>

          <a
            href="https://pay.cakto.com.br/yo5n39h_711365"
            rel="noopener noreferrer"
            className="group hover-scale inline-flex items-center gap-3 bg-orange-600 text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 text-center"
          >
            Quero começar agora
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e1c1a] pt-24 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-6 text-white">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-extrabold text-white">S</div>
                <span className="text-2xl font-bold">Sabor <span className="text-emerald-500">&</span> Medida</span>
              </div>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                Emagreça comendo o que você gosta. Receitas inteligentes para uma vida mais leve.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Links</h4>
              <ul className="space-y-4">
                <li><a href="#benefícios" className="text-slate-400 hover:text-emerald-500 transition-colors">Benefícios</a></li>
                <li><a href="#método" className="text-slate-400 hover:text-emerald-500 transition-colors">Diferencial</a></li>
                <li><a href="#testemunhos" className="text-slate-400 hover:text-emerald-500 transition-colors">Comentários</a></li>
                <li><a href="#preços" className="text-slate-400 hover:text-emerald-500 transition-colors">Planos</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 text-sm">
              © 2026 Sabor e Medida. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              Feito com <span className="text-orange-500">❤</span> para você
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default LandingPage;
