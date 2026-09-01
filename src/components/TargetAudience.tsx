import React from 'react';
import { Check, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';

interface TargetAudienceProps {
  onOpenForm: () => void;
}

export const TargetAudience: React.FC<TargetAudienceProps> = ({ onOpenForm }) => {
  const targetCases = [
    'Comprar o primeiro imóvel com planejamento;',
    'Sair do aluguel e construir patrimônio próprio;',
    'Trocar por um imóvel maior ou em melhor localização;',
    'Adquirir imóveis para gerar renda de locação;',
    'Comprar ou trocar de veículo sem pagar juros bancários;',
    'Renovar a frota da sua empresa com custo previsível;',
    'Adquirir máquinas, caminhões e equipamentos pesados;',
    'Estruturar uma estratégia patrimonial com múltiplas cotas;',
    'Planejar a formação de patrimônio familiar para o futuro;',
    'Comparar consórcio x financiamento tradicional na ponta do lápis;',
    'Avaliar a substituição ou quitação de financiamento bancário;',
    'Organizar uma aquisição programada de médio ou longo prazo.'
  ];

  return (
    <section className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            PÚBLICO-ALVO & OBJETIVOS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Para quem é a consultoria da 3P Patrimônio?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Nosso atendimento especializado pode ajudar você que deseja:
          </p>
        </div>

        {/* 12 Target Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {targetCases.map((item, index) => (
            <div
              key={index}
              onClick={onOpenForm}
              className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-xl flex items-start gap-3 transition-all hover:bg-slate-900/90 cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all font-bold text-xs">
                ✓
              </div>
              <span className="text-xs sm:text-sm text-slate-200 group-hover:text-amber-300 transition-colors leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Transparency Box */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-950 to-amber-950/30 border border-slate-800 p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-1" style={{ color: '#be9f48' }}>
                Transparência Antes da Contratação
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed max-w-2xl" style={{ color: '#5a6e8b' }}>
                O consórcio é uma modalidade de aquisição planejada. Para quem necessita do bem imediatamente, pode ser necessário avaliar outras alternativas. Por isso, nosso trabalho começa com uma análise do objetivo e do prazo de cada cliente.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenForm}
            className="w-full md:w-auto shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <span>Verificar se o Consórcio é Para Mim</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
