import React from 'react';
import { X, Sparkles, ArrowUp } from 'lucide-react';

interface RevealedSectionWrapperProps {
  children: React.ReactNode;
  sectionName: string;
  onDismiss: () => void;
  onScrollToTop?: () => void;
}

export const RevealedSectionWrapper: React.FC<RevealedSectionWrapperProps> = ({
  children,
  sectionName,
  onDismiss,
  onScrollToTop,
}) => {
  return (
    <div className="relative group transition-opacity duration-300">
      {/* Top Banner Control for the Revealed Section */}
      <div className="bg-slate-950/90 border-t border-b border-slate-800/80 px-4 sm:px-6 py-2 backdrop-blur-md sticky top-24 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              {sectionName}
            </span>
            <span className="text-slate-500 hidden sm:inline">• Ativado via navegação</span>
          </div>

          <div className="flex items-center gap-2">
            {onScrollToTop && (
              <button
                onClick={onScrollToTop}
                className="text-slate-400 hover:text-white text-[11px] px-2 py-1 rounded hover:bg-slate-800 flex items-center gap-1 transition-colors"
                title="Voltar ao início"
              >
                <ArrowUp className="w-3 h-3" />
                <span className="hidden sm:inline">Topo</span>
              </button>
            )}
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-red-400 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/30 flex items-center gap-1.5 transition-colors"
              title="Ocultar esta seção e voltar ao modo essencial"
            >
              <X className="w-3 h-3 text-red-400" />
              <span>Ocultar seção</span>
            </button>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};
