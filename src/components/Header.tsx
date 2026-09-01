import React, { useState } from 'react';
import { Shield, PhoneCall, LayoutDashboard, Menu, X, MessageSquare, CheckCircle, Lock, UserCheck, Globe, LogOut, Sun, Moon, Instagram, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useTheme } from '../utils/theme';

interface HeaderProps {
  onOpenForm: () => void;
  onOpenCRM: () => void;
  onOpenPartnerLogin: () => void;
  onOpenWPExport: () => void;
  onOpenInstagramStudio: () => void;
  onToggleCompactHero: () => void;
  isCompactHero: boolean;
  leadCount: number;
  partnerUser: { loggedIn: boolean; name: string; email: string } | null;
  onLogoutPartner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenForm,
  onOpenCRM,
  onOpenPartnerLogin,
  onOpenWPExport,
  onOpenInstagramStudio,
  onToggleCompactHero,
  isCompactHero,
  leadCount,
  partnerUser,
  onLogoutPartner
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Início', href: '#inicio' },
    { name: 'Sobre nós', href: '#sobre-nos' },
    { name: 'Como funciona', href: '#como-funciona' },
    { name: 'Soluções', href: '#solucoes' },
    { name: 'E-book', href: '#ebook' },
    { name: 'Simulador', href: '#simulador' },
    { name: 'Dúvidas', href: '#duvidas' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-2 z-40 px-3 sm:px-6 max-w-7xl mx-auto transition-all duration-200">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl px-4 sm:px-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between h-20 sm:h-24 py-2">
          
          {/* Logo 3P Patrimônio */}
          <a href="#inicio" className="flex items-center gap-3 group py-1">
            <BrandLogo variant="horizontal" size="md" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-slate-300 hover:text-amber-400 transition-colors duration-150 py-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            
            {/* Theme Toggle (Claro / Escuro) */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-amber-400 hover:bg-slate-800/80 transition-all flex items-center gap-1.5 text-xs font-bold"
              title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
              aria-label={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-500" />}
              <span className="hidden xl:inline">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
            </button>

            {/* Partner Login or Sócio Status */}
            {partnerUser?.loggedIn ? (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs text-amber-300 font-bold">
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[110px]">{partnerUser.name}</span>
                <button
                  onClick={onLogoutPartner}
                  className="ml-1 p-1 hover:bg-amber-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                  title="Sair do Login do Sócio"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenPartnerLogin}
                className="text-xs bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 font-bold"
                title="Área do Sócio - Login e Senha"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Login Sócios</span>
              </button>
            )}

            {/* Instagram & Canva Brand Studio */}
            <button
              onClick={onOpenInstagramStudio}
              className="text-xs bg-slate-950 border border-slate-800 hover:border-pink-500/50 text-slate-300 hover:text-pink-400 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 font-bold"
              title="Estúdio Instagram & Kit de Marca Canva"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden xl:inline">Instagram & Canva</span>
              <span className="xl:hidden">Canva</span>
            </button>

            {/* Admin CRM Drawer Access */}
            <button
              onClick={onOpenCRM}
              className="relative text-xs bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 font-bold"
              title="Abrir Painel de Gestão de Leads e Movimentações"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Painel CRM</span>
              {leadCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                  {leadCount}
                </span>
              )}
            </button>

            {/* Main CTA */}
            <button
              onClick={onOpenForm}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 transform active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Fale com Consultor</span>
            </button>
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400"
              title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
              aria-label="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenPartnerLogin}
              className="text-xs bg-slate-950 border border-slate-800 p-2 rounded-xl text-amber-400"
              title="Login do Sócio"
            >
              <Lock className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenCRM}
              className="relative text-xs bg-slate-950 border border-slate-800 p-2 rounded-xl text-amber-400"
              title="Abrir CRM"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-2xl">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-slate-300 hover:text-amber-400 py-2 border-b border-slate-800/80 text-sm font-semibold flex items-center justify-between"
              >
                <span>{link.name}</span>
                <span className="text-xs text-slate-500">→</span>
              </a>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInstagramStudio();
              }}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-300 flex items-center justify-between font-bold"
            >
              <span className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Estúdio Instagram & Canva</span>
              </span>
              <span>Abrir →</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPartnerLogin();
              }}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center justify-between font-bold"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Login dos Sócios</span>
              </span>
              <span>{partnerUser?.loggedIn ? partnerUser.name : 'Acessar'}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenForm();
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
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
