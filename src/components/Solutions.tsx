import React from 'react';
import { Home, Car, TrendingUp, Truck, RefreshCw, Sliders, ArrowUpRight } from 'lucide-react';

interface SolutionsProps {
  onSelectSolution: (solutionTitle: string) => void;
}

export const Solutions: React.FC<SolutionsProps> = ({ onSelectSolution }) => {
  const solutionsList = [
    {
      id: 'imoveis',
      title: 'Imóveis',
      description: 'Planeje a aquisição da casa própria, de um imóvel comercial ou de uma propriedade destinada à formação patrimonial.',
      icon: Home,
      tag: 'Alta Procura',
      emoji: '🏠'
    },
    {
      id: 'veiculos',
      title: 'Veículos',
      description: 'Estruture a compra ou a troca do seu veículo de forma planejada, avaliando prazos, parcelas e possibilidades de contemplação.',
      icon: Car,
      tag: 'Flexível',
      emoji: '🚗'
    },
    {
      id: 'patrimonio',
      title: 'Formação patrimonial',
      description: 'Conheça estratégias que utilizam o consórcio imobiliário como ferramenta de planejamento e construção patrimonial.',
      icon: TrendingUp,
      tag: 'Investimento',
      emoji: '📈'
    },
    {
      id: 'pesados',
      title: 'Máquinas e veículos pesados',
      description: 'Soluções para empresas, produtores, transportadores e profissionais que desejam adquirir máquinas, caminhões e equipamentos.',
      icon: Truck,
      tag: 'Empresarial & Agro',
      emoji: '🚜'
    },
    {
      id: 'financiamento',
      title: 'Substituição de financiamento',
      description: 'Avalie a possibilidade de utilizar o consórcio para substituir ou quitar um financiamento, conforme as regras da administradora.',
      icon: RefreshCw,
      tag: 'Economia de Juros',
      emoji: '🔄'
    },
    {
      id: 'personalizado',
      title: 'Planejamento personalizado',
      description: 'Escolha créditos, parcelas e prazos compatíveis com seus objetivos e com sua capacidade financeira.',
      icon: Sliders,
      tag: 'Sob Medida',
      emoji: '🎯'
    },
  ];

  return (
    <section id="solucoes" className="py-16 sm:py-20 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header Bento Tile */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center max-w-4xl mx-auto space-y-3 shadow-xl">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30">
            PLANEJAMENTO PARA DIFERENTES OBJETIVOS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Principais Soluções em Consórcio
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Mais do que adquirir bens, é sobre construir o futuro com inteligência e previsibilidade financeira.
          </p>
        </div>

        {/* Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {solutionsList.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.id}
                onClick={() => onSelectSolution(sol.title)}
                className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 uppercase tracking-wider">
                      {sol.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white group-hover:text-amber-400 transition-colors mb-2">
                    {sol.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {sol.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-850 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>Simular esta solução</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
