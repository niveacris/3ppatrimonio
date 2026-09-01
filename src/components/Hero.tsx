import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Play, Users, Building2, Check, Sparkles, Volume2, X, Target, Percent } from 'lucide-react';
import pilaresTransparente from '../assets/images/3pilares_transparente.png';

interface HeroProps {
  onOpenForm: () => void;
  isCompactHero: boolean;
  foundersPhotoUrl: string;
  heroBannerUrl: string;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenForm,
  isCompactHero,
  foundersPhotoUrl,
  heroBannerUrl
}) => {
  const [showVideoScriptModal, setShowVideoScriptModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const videoScriptText = `Olá! Nós somos a 3P Patrimônio. Atuamos com consultoria e intermediação de consórcios para pessoas, famílias, profissionais e investidores que desejam planejar a aquisição de imóveis, veículos ou estruturar a construção de patrimônio.\n\nNosso atendimento começa pela compreensão dos seus objetivos. Antes de apresentar créditos ou parcelas, analisamos seu momento, o prazo disponível e sua capacidade financeira.\n\nPreencha o formulário ou fale com nossa equipe pelo WhatsApp para receber uma análise personalizada 100% gratuita e sem compromisso.`;

  const handleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(videoScriptText);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Navegador não possui suporte à síntese de voz nativa.");
    }
  };

  return (
    <section id="inicio" className="relative text-slate-100 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {isCompactHero ? (
          /* COMPACT HERO BENTO (Focused for Mobile / Instagram Traffic) */
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            <div className="col-span-12 lg:col-span-8 bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                  ESTRATÉGIA PATRIMONIAL <br />
                  <span className="text-amber-400">COM CONSÓRCIOS</span>
                </h1>
                
                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
                  Construa patrimônio com planejamento e inteligência. Consultoria personalizada para aquisição de imóveis, veículos e formação patrimonial.
                </p>
              </div>

              <div className="pt-6 space-y-3">
                <button
                  onClick={onOpenForm}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all inline-flex items-center justify-center gap-3 active:scale-95"
                >
                  <span>QUERO UMA ANÁLISE PERSONALIZADA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Atendimento 100% gratuito, transparente e sem compromisso.</span>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative shadow-xl group min-h-[280px]">
              <img
                src={heroBannerUrl}
                alt="Patrimônio e Imóveis de Alto Padrão"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex flex-col justify-end p-6">
                <span className="text-amber-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-950/80 px-2.5 py-1 rounded-md w-fit mb-2">3P Patrimônio</span>
                <p className="text-white font-bold text-sm leading-snug">Planejamento financeiro inteligente para imóveis e bens.</p>
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD BENTO GRID HERO VERSION */
          <div className="grid grid-cols-12 gap-4 sm:gap-6">
            
            {/* Main Hero Bento Tile (Span 8) */}
            <div className="col-span-12 lg:col-span-8 bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 relative overflow-hidden flex flex-col justify-between shadow-2xl">
              {/* Abstract subtle grid pattern overlay */}
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="bento-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="100" height="100" fill="url(#bento-grid)" />
                </svg>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/30">
                  ESTRATÉGIA & CONSÓRCIOS
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  ESTRATÉGIA PATRIMONIAL <br />
                  <span className="text-amber-400">COM CONSÓRCIOS</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
                  Planeje suas conquistas e construa patrimônio com inteligência. Consultoria personalizada para quem deseja adquirir imóveis, veículos ou utilizar o consórcio como ferramenta de planejamento patrimonial.
                </p>

                <p className="text-xs sm:text-sm text-slate-400 border-l-2 border-amber-500/60 pl-3 italic">
                  Na 3P Patrimônio, cada estratégia é desenvolvida de acordo com seus objetivos, seu momento financeiro e seus planos para o futuro.
                </p>
              </div>

              {/* CTAs */}
              <div className="pt-8 space-y-4 relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={onOpenForm}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all inline-flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>QUERO UMA ANÁLISE PERSONALIZADA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowVideoScriptModal(true)}
                    className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold text-xs py-3.5 px-5 rounded-2xl transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Mensagem dos Sócios (Vídeo)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span style={{ color: '#edc32d' }}>Atendimento consultivo 100% gratuito, transparente e sem compromisso.</span>
                </div>
              </div>
            </div>

            {/* Right Media Bento Tile (Span 4) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              {/* Media Bento 1: Founders */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative shadow-xl group flex-1 min-h-[300px]">
                <img
                  src={foundersPhotoUrl}
                  alt="Sócios Fundadores da 3P Patrimônio"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 absolute inset-0"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">3P Patrimônio</span>
                  </div>
                  <h3 className="font-bold leading-snug" style={{ color: '#dc930d', fontSize: '14px' }}>
                    Três sócios. Um propósito em comum.
                  </h3>
                  <p className="text-xs mt-1" style={{ color: '#f5f1ec' }}>
                    Atendimento humano e estratégias sob medida para alavancar seu patrimônio.
                  </p>
                  
                  <button
                    onClick={() => setShowVideoScriptModal(true)}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-white bg-slate-950/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-xl w-fit transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Ver apresentação dos sócios</span>
                  </button>
                </div>
              </div>

              {/* Media Bento 2: Property Icon Box */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Composição Patrimonial</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Imóveis, veículos, máquinas e quitação de financiamentos.</p>
                </div>
              </div>
            </div>

            {/* Bottom Horizontal Bento Metric Cards (Span 12) */}
            <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-md">
                <div>
                  <div className="text-amber-400 font-black text-2xl">100%</div>
                  <div className="text-xs text-slate-400 font-medium">Consultoria Personalizada</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                  <Target className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-md">
                <div>
                  <div className="text-amber-400 font-black text-2xl">3 Pilares</div>
                  <div className="text-xs text-slate-400 font-medium">Estratégia, Parceria e Confiança</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                  <img src={pilaresTransparente} alt="3 Pilares" className="w-[46px] h-[46px] object-contain filter brightness-110" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-md">
                <div>
                  <div className="text-amber-400 font-black text-2xl">0% Juros</div>
                  <div className="text-xs text-slate-400 font-medium">Livre de Juros Bancários</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Video Presentation Script Modal */}
      {showVideoScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 text-left space-y-6 relative shadow-2xl">
            
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                setIsPlayingAudio(false);
                setShowVideoScriptModal(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Play className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Apresentação Institucional 3P Patrimônio</h3>
                <p className="text-xs text-slate-400">Mensagem dos sócios aos futuros clientes</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-850 leading-relaxed font-sans">
              <p className="font-semibold text-amber-300">"Sugestão de fala dos sócios:"</p>
              <p>
                "Olá! Nós somos a <strong>3P Patrimônio</strong>. Atuamos com consultoria e intermediação de consórcios para pessoas, famílias, profissionais e investidores que desejam planejar a aquisição de imóveis, veículos ou estruturar a construção de patrimônio."
              </p>
              <p>
                "Nosso atendimento começa pela compreensão dos seus objetivos. Antes de apresentar créditos ou parcelas, analisamos seu momento, o prazo disponível e sua capacidade financeira."
              </p>
              <p>
                "Preencha o formulário ou fale com nossa equipe pelo WhatsApp para receber uma análise personalizada 100% gratuita e sem compromisso."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleSpeech}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingAudio ? 'Pausar Áudio da Apresentação' : 'Ouvir Apresentação (Áudio)'}</span>
              </button>

              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsPlayingAudio(false);
                  setShowVideoScriptModal(false);
                  onOpenForm();
                }}
                className="w-full sm:w-auto flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs uppercase px-5 py-2.5 rounded-xl text-center shadow-md shadow-amber-500/20"
              >
                Solicitar Análise Agora
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
