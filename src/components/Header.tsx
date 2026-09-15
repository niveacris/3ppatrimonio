import React, { useState } from 'react';
import { PhoneCall, Menu, X, Sun, Moon, LayoutDashboard, Lock, UserCheck, LogOut } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useTheme } from '../utils/theme';

interface HeaderProps {
  onOpenForm: () => void;
  onToggleCompactHero?: () => void;
  isCompactHero?: boolean;
  onNavigate?: (href: string) => void;
  revealedSections?: {
    about: boolean;
    process: boolean;
    solutions: boolean;
    ebook: boolean;
    simulator: boolean;
    faq: boolean;
  };
  showAllSections?: boolean;
  partnerUser?: { loggedIn: boolean; name: string; email: string } | null;
  onOpenCRM?: () => void;
  onOpenPartnerLogin?: () => void;
  onLogoutPartner?: () => void;
  leadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenForm,
  onNavigate,
  revealedSections,
  showAllSections,
  partnerUser,
  onOpenCRM,
  onOpenPartnerLogin,
  onLogoutPartner,
  leadCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Início', href: '#inicio', isPermanent: true },
    { name: 'Quem somos', href: '#sobre-nos', key: 'about' as const },
    { name: 'Como funciona', href: '#como-funciona', key: 'process' as const },
    { name: 'Soluções', href: '#solucoes', key: 'solutions' as const },
    { name: 'E-book', href: '#ebook', key: 'ebook' as const },
    { name: 'Simulador', href: '#simulador', key: 'simulator' as const },
    { name: 'Dúvidas', href: '#duvidas', key: 'faq' as const },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-2 z-40 px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-200">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-4 sm:px-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between h-20 sm:h-24 py-2">
          
          {/* Logo 3P Patrimônio */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const element = document.getElementById('inicio');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-3 group py-1 cursor-pointer focus:outline-none"
            aria-label="3P Patrimônio - Voltar ao início"
            title="3P Patrimônio - Voltar ao topo"
          >
            <BrandLogo variant="horizontal" size="md" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-3 text-xs font-semibold">
            {navLinks.map((link) => {
              const isRevealed = link.key && (showAllSections || revealedSections?.[link.key]);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    theme === 'light'
                      ? 'text-slate-700 hover:text-amber-800 hover:bg-amber-500/15 font-bold'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <span>{link.name}</span>
                  {isRevealed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Módulo aberto" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">

            {/* Painel CRM para Sócio Conectado */}
            {partnerUser?.loggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenCRM}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95 border border-amber-400"
                  title="Abrir Painel CRM dos Sócios"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-950" />
                  <span>Painel CRM</span>
                  {typeof leadCount === 'number' && (
                    <span className="bg-slate-950 text-amber-400 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full">
                      {leadCount}
                    </span>
                  )}
                </button>

                {onLogoutPartner && (
                  <button
                    onClick={onLogoutPartner}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-colors text-xs"
                    title="Sair da sessão do Sócio"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenPartnerLogin}
                className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-semibold px-2.5 py-2 rounded-xl hover:bg-slate-800/60 transition-colors"
                title="Acesso dos Sócios"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Área dos Sócios</span>
              </button>
            )}
            
            {/* Theme Toggle (Claro / Escuro) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-amber-400 hover:bg-slate-800/80 transition-all flex items-center gap-1.5 text-xs font-bold"
              title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
              aria-label={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-500" />}
              <span className="hidden xl:inline">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
            </button>

            {/* Main CTA */}
            <button
              onClick={onOpenForm}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-4 sm:px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Fale com Consultor</span>
            </button>
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex lg:hidden items-center gap-2">
            {partnerUser?.loggedIn && (
              <button
                onClick={onOpenCRM}
                className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold flex items-center gap-1 text-xs"
                title="Abrir CRM"
              >
                <LayoutDashboard className="w-4 h-4" />
                {typeof leadCount === 'number' && (
                  <span className="text-[10px] font-mono">{leadCount}</span>
                )}
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-400"
              title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
              aria-label="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className={`lg:hidden mt-2 border rounded-2xl p-4 space-y-4 shadow-2xl ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isRevealed = link.key && (showAllSections || revealedSections?.[link.key]);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`py-3 px-3.5 rounded-xl border-b text-sm font-semibold flex items-center justify-between transition-colors ${
                    theme === 'light'
                      ? 'text-slate-700 hover:text-amber-800 hover:bg-amber-500/15 border-slate-200/80'
                      : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 border-slate-800/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.name}
                    {isRevealed && (
                      <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold">
                        Aberto
                      </span>
                    )}
                  </span>
                  <span className={`text-xs ${theme === 'light' ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>→</span>
                </a>
              );
            })}
          </nav>

          {/* Seção dos Sócios no Mobile Menu */}
          {partnerUser?.loggedIn ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span className="truncate">{partnerUser.name}</span>
                </span>
                {onLogoutPartner && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogoutPartner();
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCRM?.();
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Acessar Painel CRM ({leadCount ?? 0})</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPartnerLogin?.();
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-amber-400 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acesso dos Sócios / CRM</span>
            </button>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenForm();
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Fale com um Consultor</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
