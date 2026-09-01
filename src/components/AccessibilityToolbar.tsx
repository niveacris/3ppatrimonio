import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon,
  Contrast, 
  Volume2, 
  VolumeX, 
  Type, 
  RotateCcw, 
  X, 
  Maximize2,
  Minimize2,
  Sparkles,
  MousePointer,
  Check,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useTheme } from '../utils/theme';

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // States
  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('3p_a11y_fontsize') || 100);
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('3p_a11y_highcontrast') === 'true';
  });
  const [grayscale, setGrayscale] = useState<boolean>(() => {
    return localStorage.getItem('3p_a11y_grayscale') === 'true';
  });
  const [invertColors, setInvertColors] = useState<boolean>(() => {
    return localStorage.getItem('3p_a11y_invert') === 'true';
  });
  const [readableFont, setReadableFont] = useState<boolean>(() => {
    return localStorage.getItem('3p_a11y_readablefont') === 'true';
  });
  const [highlightLinks, setHighlightLinks] = useState<boolean>(() => {
    return localStorage.getItem('3p_a11y_highlightlinks') === 'true';
  });
  const [readingLine, setReadingLine] = useState<boolean>(() => {
    return localStorage.getItem('3p_a11y_readingline') === 'true';
  });
  const [readingGuideY, setReadingGuideY] = useState(0);
  const [isReadingText, setIsReadingText] = useState(false);
  const [vLibrasActive, setVLibrasActive] = useState<boolean>(() => {
    return localStorage.getItem('3p_a11y_vlibras') === 'true';
  });

  // Track cursor for reading line
  useEffect(() => {
    if (!readingLine) return;
    const handleMouseMove = (e: MouseEvent) => {
      setReadingGuideY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingLine]);

  // Apply styles to document element / body
  useEffect(() => {
    const root = document.documentElement;

    // Font size scaling
    root.style.fontSize = fontSize === 100 ? '' : `${fontSize}%`;
    localStorage.setItem('3p_a11y_fontsize', fontSize.toString());

    // High contrast
    if (highContrast) {
      root.classList.add('a11y-high-contrast');
    } else {
      root.classList.remove('a11y-high-contrast');
    }
    localStorage.setItem('3p_a11y_highcontrast', highContrast.toString());

    // Grayscale
    if (grayscale) {
      root.classList.add('a11y-grayscale');
    } else {
      root.classList.remove('a11y-grayscale');
    }
    localStorage.setItem('3p_a11y_grayscale', grayscale.toString());

    // Invert
    if (invertColors) {
      root.classList.add('a11y-invert');
    } else {
      root.classList.remove('a11y-invert');
    }
    localStorage.setItem('3p_a11y_invert', invertColors.toString());

    // Readable font
    if (readableFont) {
      root.classList.add('a11y-readable-font');
    } else {
      root.classList.remove('a11y-readable-font');
    }
    localStorage.setItem('3p_a11y_readablefont', readableFont.toString());

    // Highlight links
    if (highlightLinks) {
      root.classList.add('a11y-highlight-links');
    } else {
      root.classList.remove('a11y-highlight-links');
    }
    localStorage.setItem('3p_a11y_highlightlinks', highlightLinks.toString());

    localStorage.setItem('3p_a11y_readingline', readingLine.toString());
  }, [fontSize, highContrast, grayscale, invertColors, readableFont, highlightLinks, readingLine]);

  // Load VLibras widget script dynamically if enabled
  useEffect(() => {
    if (vLibrasActive) {
      if (!document.getElementById('vlibras-script')) {
        const script = document.createElement('script');
        script.id = 'vlibras-script';
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.async = true;
        script.onload = () => {
          // @ts-ignore
          if (window.VLibras) {
            // @ts-ignore
            new window.VLibras.Widget('https://vlibras.gov.br/app');
          }
        };
        document.body.appendChild(script);
      }
    }
    localStorage.setItem('3p_a11y_vlibras', vLibrasActive.toString());
  }, [vLibrasActive]);

  // Read selected text using SpeechSynthesis
  const handleReadSelection = () => {
    if ('speechSynthesis' in window) {
      if (isReadingText) {
        window.speechSynthesis.cancel();
        setIsReadingText(false);
        return;
      }

      const selection = window.getSelection()?.toString();
      const textToRead = selection && selection.trim().length > 0 
        ? selection 
        : 'Para ouvir qualquer trecho do site, selecione o texto desejado com o mouse e clique no botão de leitura de voz.';

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;

      utterance.onend = () => setIsReadingText(false);
      utterance.onerror = () => setIsReadingText(false);

      setIsReadingText(true);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Seu navegador não suporta a síntese de voz.');
    }
  };

  const handleReset = () => {
    setFontSize(100);
    setHighContrast(false);
    setGrayscale(false);
    setInvertColors(false);
    setReadableFont(false);
    setHighlightLinks(false);
    setReadingLine(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReadingText(false);
    }
  };

  const hasActiveSettings = 
    fontSize !== 100 || 
    highContrast || 
    grayscale || 
    invertColors || 
    readableFont || 
    highlightLinks || 
    readingLine;

  return (
    <>
      {/* Reading Guide Ruler Line */}
      {readingLine && (
        <div 
          className="fixed left-0 right-0 h-10 bg-amber-400/20 border-y-2 border-amber-400 pointer-events-none z-50 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-75"
          style={{ top: `${readingGuideY - 20}px` }}
          aria-hidden="true"
        />
      )}

      {/* VLibras HTML Structure */}
      {vLibrasActive && (
        <div className="enabled">
          <div className="vw-access-button tria" style={{ top: '20%' }} />
          <div className="vw-plugin-wrapper" style={{ top: '20%' }}>
            <div className="vw-plugin-top-wrapper" />
          </div>
        </div>
      )}

      {/* Floating Accessibility Toggle Button */}
      <div className="fixed top-24 right-4 z-40 hidden sm:block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-2 p-3 rounded-full shadow-2xl transition-all duration-300 ${
            hasActiveSettings 
              ? 'bg-amber-400 text-slate-950 font-black ring-4 ring-amber-300/50 scale-105' 
              : 'bg-slate-900/90 text-amber-400 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400'
          }`}
          aria-label="Abrir Painel de Acessibilidade"
          title="Recursos de Acessibilidade (Aumentar texto, alto contraste, leitor de voz)"
          aria-expanded={isOpen}
        >
          <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold uppercase tracking-wider hidden group-hover:inline pr-1 transition-all">
            Acessibilidade
          </span>
          {hasActiveSettings && (
            <span className="w-2.5 h-2.5 bg-slate-950 rounded-full animate-ping" />
          )}
        </button>
      </div>

      {/* Mobile Accessibility Button */}
      <div className="fixed top-20 right-3 z-40 sm:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2.5 rounded-full shadow-xl transition-all ${
            hasActiveSettings 
              ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' 
              : 'bg-slate-900/95 text-amber-400 border border-slate-700'
          }`}
          aria-label="Abrir Opções de Acessibilidade"
          title="Acessibilidade"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Accessibility Drawer / Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-modal-title"
        >
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h2 id="a11y-modal-title" className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                    Acessibilidade da Página
                  </h2>
                  <p className="text-xs text-slate-400">Ajuste a visualização para sua melhor experiência</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Fechar painel de acessibilidade"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-slate-200">
              
              {/* Tema Escuro / Claro */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    Tema de Cores ({theme === 'dark' ? 'Escuro' : 'Claro'})
                  </label>
                  <span className="text-xs text-slate-400">Aparência do site</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Tema Escuro</span>
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      theme === 'light'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Tema Claro</span>
                  </button>
                </div>
              </div>

              {/* Tamanho da Fonte */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Tamanho do Texto ({fontSize}%)
                  </label>
                  <span className="text-xs text-slate-400">Atalho rápido</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 115, 130, 150].map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                        fontSize === size 
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {size === 100 ? 'Normal' : `+${size - 100}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ajustes Visuais e Contraste */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Ajustes Visuais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Alto Contraste */}
                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      highContrast 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Contrast className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold">Alto Contraste</div>
                        <div className="text-[10px] opacity-75">Fundo escuro e amarelo</div>
                      </div>
                    </div>
                    {highContrast && <Check className="w-4 h-4" />}
                  </button>

                  {/* Tons de Cinza */}
                  <button
                    onClick={() => setGrayscale(!grayscale)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      grayscale 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold">Escala de Cinza</div>
                        <div className="text-[10px] opacity-75">Monocromático</div>
                      </div>
                    </div>
                    {grayscale && <Check className="w-4 h-4" />}
                  </button>

                  {/* Fonte Legível */}
                  <button
                    onClick={() => setReadableFont(!readableFont)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      readableFont 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Type className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold">Fonte Sem Serifa</div>
                        <div className="text-[10px] opacity-75">Leitura simplificada</div>
                      </div>
                    </div>
                    {readableFont && <Check className="w-4 h-4" />}
                  </button>

                  {/* Destacar Links */}
                  <button
                    onClick={() => setHighlightLinks(!highlightLinks)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      highlightLinks 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MousePointer className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold">Destacar Links</div>
                        <div className="text-[10px] opacity-75">Sublinhar clicáveis</div>
                      </div>
                    </div>
                    {highlightLinks && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Ferramentas de Leitura & Auxílio */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Ferramentas de Leitura
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Régua de Leitura */}
                  <button
                    onClick={() => setReadingLine(!readingLine)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      readingLine 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Maximize2 className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-bold">Régua de Leitura</div>
                        <div className="text-[10px] opacity-75">Linha guia de foco</div>
                      </div>
                    </div>
                    {readingLine && <Check className="w-4 h-4" />}
                  </button>

                  {/* Leitor de Voz */}
                  <button
                    onClick={handleReadSelection}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isReadingText 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold animate-pulse' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isReadingText ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
                      <div>
                        <div className="text-xs font-bold">{isReadingText ? 'Parar Leitura' : 'Ouvir Texto'}</div>
                        <div className="text-[10px] opacity-75">Lê seleção atual</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* VLibras Widget Toggle */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs">
                    🤟
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">Tradutor de Libras (VLibras)</div>
                    <div className="text-[10px] text-slate-400">Ativar intérprete de Libras na tela</div>
                  </div>
                </div>
                <button
                  onClick={() => setVLibrasActive(!vLibrasActive)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    vLibrasActive 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {vLibrasActive ? 'Ativado' : 'Ativar'}
                </button>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Redefinir Padrão
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md"
              >
                Concluído
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
