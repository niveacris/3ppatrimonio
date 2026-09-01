import React from 'react';
import { Layers, ArrowRightLeft, ShieldAlert, Sparkles, Check, Info } from 'lucide-react';

interface MultiQuotaStrategyProps {
  onOpenForm: () => void;
}

export const MultiQuotaStrategy: React.FC<MultiQuotaStrategyProps> = ({ onOpenForm }) => {
  const benefits = [
    'Maior flexibilidade para utilização dos créditos;',
    'Contemplações graduais em momentos diferentes;',
    'Possibilidade de destinar cada cota a uma finalidade distinta;',
    'Diversificação do risco entre grupos e cotas;',
    'Planejamento escalonado para aquisição de imóveis;',
    'Possibilidade de união das cartas para um único bem, quando autorizada pela administradora.'
  ];

  return (
    <section className="py-20 bg-slate-950 text-slate-100 border-b border-slate-850 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            FLEXIBILIDADE PARA DIFERENTES OBJETIVOS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Estratégia com Múltiplas Cotas
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Fracionar o crédito pode trazer mais agilidade, liquidez e opções estratégicas ao seu plano.
          </p>
        </div>

        {/* Visual Example: 1x 500k vs 5x 100k */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Concentrated Single Quota */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Estrutura Convencional
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                1x
              </div>
              <div>
                <div className="text-xl font-black text-white">1 Cota de R$ 500.000</div>
                <div className="text-xs text-slate-400">Todo o crédito concentrado numa única cota</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exige aguardar a contemplação total do valor de uma só vez para iniciar qualquer movimentação patrimonial.
            </p>
          </div>

          {/* Multi Quota Strategy */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/50 border border-amber-500/50 p-6 rounded-2xl relative shadow-xl">
            <div className="absolute top-4 right-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Recomendado em Consultoria
            </div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Estrutura Inteligente 3P Patrimônio
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                5x
              </div>
              <div>
                <div className="text-xl font-black text-amber-300">5 Cotas de R$ 100.000</div>
                <div className="text-xs" style={{ color: '#7d93b5' }}>Mesmo total de R$ 500.000 divididos estrategicamente</div>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#a8b8cf' }}>
              Permite contemplações parciais, lances em momentos oportunos e flexibilidade total de uso para cada parcela contemplada.
            </p>
          </div>

        </div>

        {/* Benefits Grid */}
        <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Principais vantagens de diversificar em múltiplas cotas:</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl flex items-start gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </div>
                <span className="text-xs sm:text-sm text-slate-300 leading-snug">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Important Info Notice */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-start gap-3.5 mt-6">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white block mb-0.5">
                Informação importante sobre capacidade financeira:
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                A contratação de múltiplas cotas também representa múltiplos compromissos mensais. A estratégia deve ser estritamente compatível com a capacidade financeira do cliente e não oferece garantia de contemplação em prazo determinado.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onOpenForm}
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Simular Estruturação de Múltiplas Cotas
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
