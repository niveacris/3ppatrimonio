import React, { useState } from 'react';
import { Shield, Phone, Mail, Instagram, MessageSquare, ExternalLink, Scale } from 'lucide-react';
import { PrivacyTermsModal } from './PrivacyTermsModal';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onOpenForm: () => void;
  onOpenInstagramStudio?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenForm, onOpenInstagramStudio }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5511996876748?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20a%20consultoria%20da%203P%20Patrimônio.', '_blank');
  };

  const handleInstagramClick = () => {
    window.open('https://instagram.com/3ppatrimonio', '_blank');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
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
                className="flex items-center gap-2.5 text-slate-300 hover:text-emerald-400 transition-colors"
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
                className="flex items-center gap-2.5 text-slate-300 hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Instagram: @3ppatrimonio</span>
              </button>
            </div>
          </div>

          {/* Col 3: Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Navegação e Legal
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
              {onOpenInstagramStudio && (
                <button
                  onClick={onOpenInstagramStudio}
                  className="text-left text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>Estúdio Instagram & Canva</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Legal Disclaimer Notice */}
        <div className="bg-slate-900/80 border border-slate-850 p-6 rounded-2xl space-y-2 text-xs text-slate-400 leading-relaxed">
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
