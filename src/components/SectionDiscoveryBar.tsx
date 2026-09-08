import React from 'react';
import { 
  Sparkles, 
  Workflow, 
  Layers, 
  BookOpen, 
  Calculator, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff,
  Check
} from 'lucide-react';

interface SectionDiscoveryBarProps {
  revealedSections: {
    process: boolean;
    solutions: boolean;
    ebook: boolean;
    simulator: boolean;
    faq: boolean;
  };
  showAllSections: boolean;
  onToggleSection: (key: 'process' | 'solutions' | 'ebook' | 'simulator' | 'faq', targetId: string) => void;
  onToggleAll: () => void;
  onOpenForm: () => void;
}

export const SectionDiscoveryBar: React.FC<SectionDiscoveryBarProps> = ({
  revealedSections,
  showAllSections,
  onToggleSection,
  onToggleAll,
  onOpenForm,
}) => {
  const activeCount = showAllSections 
    ? 5 
    : Object.values(revealedSections).filter(Boolean).length;

  const modules = [
    {
      key: 'process' as const,
      id: 'como-funciona',
      name: 'Como Funciona',
      description: 'Etapas de contratação e contemplação',
      icon: Workflow,
    },
    {
      key: 'solutions' as const,
      id: 'solucoes',
      name: 'Soluções & Estratégias',
      description: 'Imóveis, veículos e formação patrimonial',
      icon: Layers,
    },
    {
      key: 'ebook' as const,
      id: 'ebook',
      name: 'E-book Gratuito',
      description: 'Guia completo de consórcio inteligente',
      icon: BookOpen,
    },
    {
      key: 'simulator' as const,
      id: 'simulador',
      name: 'Simulador Interativo',
      description: 'Cálculo de créditos e prazos estimados',
      icon: Calculator,
    },
    {
      key: 'faq' as const,
      id: 'duvidas',
      name: 'Dúvidas Frequentes',
      description: 'Perguntas e respostas essenciais',
      icon: HelpCircle,
    },
  ];

  return (
    <section className="py-10 bg-slate-950/80 border-y border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Sparkles className="w-3 h-3" />
                Módulos Sob Demanda
              </span>
              {activeCount > 0 && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {activeCount} de 5 abertos
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Deseja explorar ferramentas antes de simular?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Para uma navegação mais rápida, mantemos a página limpa e direta. Clique em qualquer módulo abaixo ou use o menu superior para expandir os recursos que deseja consultar.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleAll}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                showAllSections || activeCount === 5
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {showAllSections || activeCount === 5 ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Modo Essencial (Recolher)</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Expandir Todos os Módulos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {modules.map((mod) => {
            const isRevealed = showAllSections || revealedSections[mod.key];
            const Icon = mod.icon;

            return (
              <button
                key={mod.key}
                onClick={() => onToggleSection(mod.key, mod.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative group flex flex-col justify-between gap-3 ${
                  isRevealed
                    ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-lg shadow-amber-500/5'
                    : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-lg ${isRevealed ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400 group-hover:bg-slate-700'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isRevealed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      <Check className="w-3 h-3" /> Aberto
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-400 flex items-center gap-0.5">
                      Abrir <ChevronDown className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    {mod.name}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {mod.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
