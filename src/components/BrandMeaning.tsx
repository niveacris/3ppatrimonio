import React, { useState } from 'react';
import { Compass, Landmark, Handshake, Target, ShieldCheck, Sparkles } from 'lucide-react';
import participacaoImg from '../assets/images/participacao_24x24.png';

interface PillarItem {
  title: string;
  letter: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  imageSrc?: string;
  color: string;
}

export const BrandMeaning: React.FC = () => {
  const [activePillarSet, setActivePillarSet] = useState<'p1' | 'p2'>('p1');

  const pillarsSet1: PillarItem[] = [
    {
      title: 'Planejamento',
      letter: 'P1',
      description: 'Cada decisão começa pela compreensão dos objetivos e da capacidade financeira do cliente.',
      icon: Compass,
      color: 'from-amber-500/20 to-amber-600/5'
    },
    {
      title: 'Patrimônio',
      letter: 'P2',
      description: 'O consórcio pode ser utilizado para aquisição de bens e construção patrimonial ao longo do tempo.',
      icon: Landmark,
      color: 'from-amber-500/20 to-amber-600/5'
    },
    {
      title: 'Parceria',
      letter: 'P3',
      description: 'Acompanhamos o cliente antes, durante e depois da contratação em toda a sua jornada.',
      icon: Handshake,
      color: 'from-amber-500/20 to-amber-600/5'
    }
  ];

  const pillarsSet2: PillarItem[] = [
    {
      title: 'Estratégia',
      letter: '1º',
      description: 'Soluções desenhadas analiticamente para prazos e parcelas realistas.',
      icon: Target,
      color: 'from-blue-500/20 to-blue-600/5'
    },
    {
      title: 'Participação',
      letter: '2º',
      description: 'Presença constante e orientação contínua nas contemplações e assembleias.',
      icon: Handshake,
      imageSrc: participacaoImg,
      color: 'from-blue-500/20 to-blue-600/5'
    },
    {
      title: 'Confiança',
      letter: '3º',
      description: 'Transparência total sobre custos, taxas e regulamentos contratuais.',
      icon: ShieldCheck,
      color: 'from-blue-500/20 to-blue-600/5'
    }
  ];

  const currentPillars = activePillarSet === 'p1' ? pillarsSet1 : pillarsSet2;

  return (
    <section className="py-20 bg-slate-900/60 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            SIGNIFICADO DA MARCA
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Por que 3P Patrimônio?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            A 3P Patrimônio representa a união de <strong>três sócios</strong>, <strong>três experiências</strong> e um <strong>propósito em comum</strong>.
          </p>

          {/* Toggle Pillars View Option */}
          <div className="pt-2 flex justify-center">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl inline-flex gap-1 text-xs">
              <button
                onClick={() => setActivePillarSet('p1')}
                className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                  activePillarSet === 'p1'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Planejamento • Patrimônio • Parceria
              </button>
              <button
                onClick={() => setActivePillarSet('p2')}
                className={`px-4 py-1.5 rounded-lg font-semibold transition-all ${
                  activePillarSet === 'p2'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Estratégia • Participação • Confiança
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 p-8 rounded-3xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                <div className={`absolute top-0 right-0 w-36 h-36 rounded-bl-full bg-gradient-to-br ${p.color} pointer-events-none`} />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 font-extrabold text-xl shadow-inner p-2.5">
                      {p.imageSrc ? (
                        <div
                          role="img"
                          aria-label={p.title}
                          className="w-7 h-7 bg-current"
                          style={{
                            WebkitMaskImage: `url(${p.imageSrc})`,
                            maskImage: `url(${p.imageSrc})`,
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                          }}
                        />
                      ) : (
                        <Icon className="w-7 h-7" />
                      )}
                    </div>
                    <span className="text-3xl font-black text-slate-800 font-mono">
                      {p.letter}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-850 flex items-center gap-2 text-[11px] text-amber-400/90 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pilar essencial da 3P Patrimônio</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
