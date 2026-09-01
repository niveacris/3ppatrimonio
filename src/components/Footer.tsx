import React, { useState } from 'react';
import { 
  Shield, 
  Phone, 
  Mail, 
  Instagram, 
  MessageSquare, 
  ExternalLink, 
  Scale, 
  Lock, 
  LayoutDashboard, 
  UserCheck, 
  LogOut, 
  Globe,
  Sparkles,
  Layers
} from 'lucide-react';
import { PrivacyTermsModal } from './PrivacyTermsModal';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenForm: () => void;
  onOpenCRM?: () => void;
  onOpenPartnerLogin?: () => void;
  onOpenInstagramStudio?: () => void;
  onOpenWPExport?: () => void;
  partnerUser?: { loggedIn: boolean; name: string; email: string } | null;
  onLogoutPartner?: () => void;
  leadCount?: number;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenForm, 
  onOpenCRM,
  onOpenPartnerLogin,
  onOpenInstagramStudio,
  onOpenWPExport,
  partnerUser,
  onLogoutPartner,
  leadCount = 0
}) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5511996876748?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20a%20consultoria%20da%203P%20Patrimônio.', '_blank');
  };

  const handleInstagramClick = () => {
    window.open('https://instagram.com/3ppatrimonio', '_blank');
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-900">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <BrandLogo variant="footer" size="lg" />

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              3P Patrimônio Consultoria e intermediação de consórcios para aquisição de bens e planejamento patrimonial inteligente.
            </p>

            <div className="space-y-1 text-xs text-slate-500 pt-1 font-mono">
              <p>Razão Social: 3P Patrimônio Consultoria e Intermediação LTDA</p>
              <p>CNPJ: 68.039.412/0001-79</p>
            </div>
          </div>

          {/* Col 2: Direct Contact */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Canais de Atendimento
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2.5 text-slate-300 hover:text-emerald-400 transition-colors text-left"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: (11) 99687-6748</span>
              </button>

              <a
                href="mailto:contato@3ppatrimonio.com.br"
                className="flex items-center gap-2.5 text-slate-300 hover:text-amber-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>E-mail: contato@3ppatrimonio.com.br</span>
              </a>

              <button
                onClick={handleInstagramClick}
                className="flex items-center gap-2.5 text-slate-300 hover:text-pink-400 transition-colors text-left"
              >
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Instagram: @3ppatrimonio</span>
              </button>
            </div>
          </div>

          {/* Col 3: Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Navegação e Institucional
            </h4>
            <div className="flex flex-col space-y-2 text-xs">
              <button
                onClick={() => setModalType('privacy')}
                className="text-left text-slate-400 hover:text-white transition-colors"
              >
                • Política de Privacidade
              </button>
              <button
                onClick={() => setModalType('terms')}
                className="text-left text-slate-400 hover:text-white transition-colors"
              >
                • Termos de Uso
              </button>
              <a
                href="#ebook"
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • E-book Gratuito
              </a>
              <button
                onClick={onOpenForm}
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • Falar com Consultor
              </button>
            </div>
          </div>

        </div>

        {/* Administrative & Management Area (Área Administrativa no Rodapé) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Área Administrativa & Gestão
                </h4>
                <p className="text-[11px] text-slate-400">
                  Acesso restrito para sócios, consultores e gestão da 3P Patrimônio
                </p>
              </div>
            </div>

            {partnerUser?.loggedIn && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-300 font-bold">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sócio autenticado: {partnerUser.name}</span>
                {onLogoutPartner && (
                  <button
                    onClick={onLogoutPartner}
                    className="ml-2 p-1 hover:bg-emerald-500/20 text-slate-400 hover:text-red-400 rounded transition-colors"
                    title="Desconectar da Área do Sócio"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Login do Sócio */}
            <button
              onClick={onOpenPartnerLogin}
              className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white transition-all text-xs font-bold group"
            >
              <span className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>{partnerUser?.loggedIn ? 'Perfil do Sócio' : 'Login dos Sócios'}</span>
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-mono">
                {partnerUser?.loggedIn ? 'Ativo' : 'Acessar'}
              </span>
            </button>

            {/* 2. Painel CRM de Leads */}
            <button
              onClick={onOpenCRM}
              className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white transition-all text-xs font-bold group"
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Painel CRM Leads</span>
              </span>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full font-mono">
                {leadCount} leads
              </span>
            </button>

            {/* 3. Estúdio Instagram & Canva */}
            <button
              onClick={onOpenInstagramStudio}
              className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-pink-500/50 text-slate-200 hover:text-white transition-all text-xs font-bold group"
            >
              <span className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                <span>Instagram & Canva</span>
              </span>
              <span className="text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md font-mono">
                Criativos
              </span>
            </button>

            {/* 4. Exportação WordPress & Hostinger */}
            <button
              onClick={onOpenWPExport}
              className="flex items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 text-slate-200 hover:text-white transition-all text-xs font-bold group"
            >
              <span className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Exportar Hostinger / WP</span>
              </span>
              <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md font-mono">
                Deploy
              </span>
            </button>
          </div>
        </div>

        {/* Legal Disclaimer Notice */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-2 text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
            Aviso Legal Regulatório:
          </span>
          <p>
            A 3P Patrimônio atua na consultoria e intermediação de consórcios. As condições dos produtos estão sujeitas à disponibilidade dos grupos, às regras contratuais, aos reajustes, à análise cadastral e às políticas da administradora. A contemplação ocorre por sorteio ou lance e não pode ser garantida em prazo determinado. As simulações possuem caráter informativo e não representam promessa de contemplação, rentabilidade, venda de cota ou resultado financeiro.
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-slate-900 pt-6">
          <p>© {new Date().getFullYear()} 3P Patrimônio Consultoria. Todos os direitos reservados.</p>
          <p>Estratégia, Parceria e Confiança para Construir Patrimônio.</p>
        </div>

      </div>

      {/* Legal Modal */}
      <PrivacyTermsModal type={modalType} onClose={() => setModalType(null)} />
    </footer>
  );
};
