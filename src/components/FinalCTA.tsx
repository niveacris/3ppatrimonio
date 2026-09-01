import React from 'react';
import { ArrowRight, Users, Target, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

interface FinalCTAProps {
  onOpenForm: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenForm }) => {
  const elements = [
    { title: 'Atendimento humanizado', icon: Users },
    { title: 'Estratégias personalizadas', icon: Target },
    { title: 'Segurança e transparência', icon: ShieldCheck },
    { title: 'Acompanhamento consultivo', icon: HeartHandshake },
  ];

  return (
    <section className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
            CONSTRUA SEU FUTURO HOJE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            SUA PRÓXIMA CONQUISTA COMEÇA COM PLANEJAMENTO.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Converse com a 3P Patrimônio. Descubra quais possibilidades de consórcio são compatíveis com seus objetivos, seu prazo e sua capacidade financeira.
          </p>
        </div>

        {/* CTA Button & Microcopy */}
        <div className="space-y-3">
          <button
            onClick={onOpenForm}
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm uppercase tracking-wider px-10 py-4.5 rounded-2xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all inline-flex items-center gap-3 active:scale-95 transform hover:-translate-y-0.5"
          >
            <PhoneCall className="w-5 h-5" />
            <span>QUERO FALAR COM UM CONSULTOR</span>
          </button>
          <div className="text-xs text-amber-300/90 font-medium">
            Atendimento personalizado, 100% gratuito e sem compromisso.
          </div>
        </div>

        {/* 4 Value badges below button */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto">
          {elements.map((el) => {
            const Icon = el.icon;
            return (
              <div
                key={el.title}
                className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-200"
              >
                <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{el.title}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
