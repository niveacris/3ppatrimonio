import React, { useState } from 'react';
import { 
  Mail, 
  Instagram, 
  MessageSquare, 
  Lock, 
  LayoutDashboard, 
  LogOut, 
  Globe
} from 'lucide-react';
import { PrivacyTermsModal } from './PrivacyTermsModal';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenForm: () => void;
  onNavigate?: (href: string) => void;
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
  onNavigate,
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
            <a
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const element = document.getElementById('inicio');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-block group cursor-pointer focus:outline-none"
              aria-label="3P Patrimônio - Voltar ao topo"
              title="3P Patrimônio - Voltar ao topo"
            >
              <BrandLogo variant="footer" size="lg" />
            </a>

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
                onClick={() => onNavigate ? onNavigate('#sobre-nos') : document.getElementById('sobre-nos')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • Quem Somos
              </button>
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
              <button
                onClick={() => onNavigate ? onNavigate('#como-funciona') : document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • Como Funciona
              </button>
              <button
                onClick={() => onNavigate ? onNavigate('#solucoes') : document.getElementById('solucoes')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • Soluções Patrimoniais
              </button>
              <button
                onClick={() => onNavigate ? onNavigate('#simulador') : document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • Simulador Interativo
              </button>
              <button
                onClick={() => onNavigate ? onNavigate('#ebook') : document.getElementById('ebook')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • E-book Gratuito
              </button>
              <button
                onClick={() => onNavigate ? onNavigate('#duvidas') : document.getElementById('duvidas')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • Dúvidas Frequentes
              </button>
              <button
                onClick={onOpenForm}
                className="text-left text-slate-400 hover:text-amber-400 transition-colors"
              >
                • Falar com Consultor
              </button>
            </div>
          </div>

        </div>

        {/* Área Administrativa Discreta dos Sócios */}
        {partnerUser?.loggedIn ? (
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Painel do Sócio:</span>
                  <span className="text-xs text-amber-400 font-medium">{partnerUser.name}</span>
                </div>
              </div>

              {onLogoutPartner && (
                <button
                  onClick={onLogoutPartner}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 rounded-lg text-xs transition-colors"
                  title="Sair da sessão"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={onOpenCRM}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-white transition-all text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Painel CRM</span>
                </span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full font-mono">
                  {leadCount}
                </span>
              </button>

              <button
                onClick={onOpenInstagramStudio}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-pink-500/50 text-slate-200 hover:text-white transition-all text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Passos para o Instagram</span>
                </span>
              </button>

              <button
                onClick={onOpenWPExport}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-slate-200 hover:text-white transition-all text-xs font-bold"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Exportar Hostinger</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end pt-1">
            <button
              onClick={onOpenPartnerLogin}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700"
              title="Acesso Restrito aos Sócios"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Login dos Sócios</span>
            </button>
          </div>
        )}

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
