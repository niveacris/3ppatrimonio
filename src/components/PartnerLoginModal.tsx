import React, { useState } from 'react';
import { X, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, User, Key, KeyRound, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface PartnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (partnerName: string, partnerEmail: string) => void;
}

export const PartnerLoginModal: React.FC<PartnerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickFill = (partnerEmail: string, name: string) => {
    setEmail(partnerEmail);
    setPassword('3p@2026');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Simulate authentication check
    setTimeout(() => {
      setLoading(false);
      if (password === '3p@2026' || password === '3ppatrimonio' || password === '123456') {
        let name = 'Sócio 3P';
        if (email.includes('socio1') || email.includes('comercial')) name = 'Sócio - Gestão Comercial';
        else if (email.includes('socio2') || email.includes('estrategia')) name = 'Sócio - Planejamento Patrimonial';
        else if (email.includes('socio3') || email.includes('relacionamento')) name = 'Sócio - Atendimento VIP';

        setSuccessMsg('Acesso autorizado! Carregando painel de movimentações...');
        setTimeout(() => {
          onLoginSuccess(name, email || 'socio@3ppatrimonio.com.br');
          onClose();
        }, 800);
      } else {
        setErrorMsg('Senha incorreta. Utilize a senha demonstrativa "3p@2026" ou clique nos botões de acesso rápido.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/80 hover:bg-slate-800 rounded-full transition-all border border-slate-800"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with 3P Seal */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto">
            <BrandLogo variant="badge_3p" size="xl" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30">
              ÁREA RESTRITA DOS SÓCIOS
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-2">
              Acesso à Movimentação de Dados
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Informe suas credenciais para visualizar e gerenciar as solicitações de análise patrimonial.
            </p>
          </div>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Acesso Rápido de Teste (Sócios):</span>
            </span>
            <span className="text-slate-500 font-mono text-[10px]">Senha: 3p@2026</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickFill('socio1@3ppatrimonio.com.br', 'Sócio 1')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 py-1.5 px-2 rounded-xl transition-all text-center truncate font-medium"
            >
              Sócio 1
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('socio2@3ppatrimonio.com.br', 'Sócio 2')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 py-1.5 px-2 rounded-xl transition-all text-center truncate font-medium"
            >
              Sócio 2
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('socio3@3ppatrimonio.com.br', 'Sócio 3')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 py-1.5 px-2 rounded-xl transition-all text-center truncate font-medium"
            >
              Sócio 3
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-2xl text-xs font-semibold flex items-start gap-2">
              <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              E-mail ou Usuário do Sócio
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="socio@3ppatrimonio.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Senha de Acesso
              </label>
              <span className="text-[10px] text-amber-400 font-medium cursor-pointer hover:underline" onClick={() => alert('Dica: Utilize a senha padrão "3p@2026" ou selecione um dos sócios no topo.')}>
                Esqueceu a senha?
              </span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-600 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-xs text-slate-500 hover:text-slate-300 font-medium"
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>AUTENTICANDO...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>ACESSAR PAINEL DOS SÓCIOS</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500">
          <p>3P Patrimônio • Sistema de Gestão Interna de Informações</p>
        </div>

      </div>
    </div>
  );
};
