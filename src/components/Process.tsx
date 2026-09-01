import React from 'react';
import { Target, Search, FileText, AlertTriangle, HeartHandshake, ShieldCheck, ArrowRight } from 'lucide-react';

interface ProcessProps {
  onOpenForm: () => void;
}

export const Process: React.FC<ProcessProps> = ({ onOpenForm }) => {
  const steps = [
    {
      number: '01',
      title: 'Conhecemos seus objetivos',
      description: 'Conversamos para compreender o que você deseja adquirir, o valor necessário, o prazo disponível e sua capacidade mensal de pagamento.',
      icon: Target,
    },
    {
      number: '02',
      title: 'Avaliamos as possibilidades',
      description: 'Analisamos produtos, grupos, valores de crédito, prazos, parcelas, custos e formas de contemplação.',
      icon: Search,
    },
    {
      number: '03',
      title: 'Desenvolvemos uma estratégia',
      description: 'Apresentamos uma solução personalizada e compatível com o seu perfil financeiro e seus planos.',
      icon: FileText,
    },
    {
      number: '04',
      title: 'Explicamos custos e riscos',
      description: 'Você recebe informações claras sobre taxa de administração, reajustes, contemplação, análise de crédito e condições contratuais.',
      icon: AlertTriangle,
    },
    {
      number: '05',
      title: 'Acompanhamos sua jornada',
      description: 'Nosso relacionamento não termina na contratação. A equipe permanece disponível para orientações durante sua participação no consórcio.',
      icon: HeartHandshake,
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-slate-950 text-slate-100 border-b border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            ATENDIMENTO CONSULTIVO
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Como funciona o atendimento
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Uma estratégia construída sob medida para o seu momento financeiro.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={st.number}
                className="relative bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-amber-500/30 group-hover:text-amber-400 transition-colors font-mono">
                      {st.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 leading-snug">
                    {st.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-850 text-[10px] text-slate-500 font-medium">
                  Etapa {idx + 1} de 5
                </div>
              </div>
            );
          })}
        </div>

        {/* Complementary Callout */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-1" style={{ color: '#f1f3f7' }}>Estratégias Únicas para Pessoas Únicas</h4>
              <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: '#f1f3f7' }}>
                Não oferecemos a mesma solução para todas as pessoas. Cada planejamento deve considerar os objetivos, os prazos e a capacidade financeira de cada cliente.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenForm}
            className="w-full md:w-auto shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <span>Iniciar Atendimento</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
