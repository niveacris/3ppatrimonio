import React from 'react';
import { CheckCircle2, AlertCircle, Building, Layers, ShieldCheck, Scale, ArrowRight } from 'lucide-react';

interface WealthStrategyProps {
  onOpenForm: () => void;
}

export const WealthStrategy: React.FC<WealthStrategyProps> = ({ onOpenForm }) => {
  const possibilities = [
    'Aquisição de imóveis para uso próprio;',
    'Compra de imóveis para locação e renda passiva;',
    'Planejamento estruturado com múltiplas cotas;',
    'União de cartas de crédito, quando permitida pela administradora;',
    'Aquisição de bens planejada em momentos diferentes;',
    'Quitação de financiamento bancário elegível;',
    'Transferência de cota, conforme as regras aplicáveis;',
    'Estruturação patrimonial de médio e longo prazo.'
  ];

  return (
    <section id="estrategia" className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text & Bullets */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              PARA QUEM PENSA NO MÉDIO E LONGO PRAZO
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Consórcio como Estratégia Patrimonial
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              O consórcio pode ser mais do que uma forma de comprar. Quando utilizado de maneira planejada, o consórcio pode fazer parte de uma estratégia sólida para aquisição de imóveis, diversificação e formação patrimonial.
            </p>

            <p className="text-xs sm:text-sm text-amber-400/90 font-medium">
              Dependendo do perfil e dos objetivos do cliente, poderão ser avaliadas diferentes possibilidades:
            </p>

            {/* Bullets grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {possibilities.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl hover:border-amber-500/30 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>

            {/* Disclaimer / Aviso */}
            <div className="bg-slate-950/90 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3 mt-6">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                  Aviso Importante
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Todas as possibilidades dependem das regras da administradora, das condições contratuais e da análise individual de cada operação.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenForm}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>Avaliar Estratégia Para Seu Perfil</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Visual Box */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border border-slate-800 p-8 rounded-3xl space-y-6 relative overflow-hidden shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Building className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold" style={{ color: '#edcb37' }}>
                Inteligência Financeira x Financiamento Tradicional
              </h3>

              <p className="text-xs leading-relaxed" style={{ color: '#f7f8fb' }}>
                Em um financiamento imobiliário tradicional, os juros compostos ao longo de 30 anos podem multiplicar o valor do bem em até 3 vezes.
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Financiamento Bancário:</span>
                  <span className="text-red-400 font-bold">Juros de até 10-12% a.a. + TR</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/40 flex justify-between items-center text-xs">
                  <span className="text-slate-200 font-semibold">Consórcio 3P Patrimônio:</span>
                  <span className="text-amber-400 font-bold">Taxa de Adm. Diluída (0% Juros)</span>
                </div>
              </div>

              <p className="text-[11px] italic border-t border-slate-850 pt-3" style={{ color: '#b3c3da' }}>
                *O consórcio requer planejamento prévio de prazos ou lances. Fale conosco para simular a diferença real.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
