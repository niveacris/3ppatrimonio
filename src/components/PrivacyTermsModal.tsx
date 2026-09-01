import React from 'react';
import { X, Shield, Lock } from 'lucide-react';

interface PrivacyTermsModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-left space-y-6 relative max-h-[85vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {type === 'privacy' ? 'Política de Privacidade - 3P Patrimônio' : 'Termos de Uso - 3P Patrimônio'}
            </h3>
            <p className="text-xs text-slate-400">Conformidade com a LGPD (Lei Geral de Proteção de Dados)</p>
          </div>
        </div>

        {type === 'privacy' ? (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            <p>
              A <strong>3P Patrimônio Consultoria e Intermediação de Consórcios</strong> tem o compromisso de respeitar a sua privacidade e proteger os dados pessoais fornecidos em nosso site e formulários de atendimento.
            </p>
            
            <h4 className="font-bold text-amber-300">1. Coleta e Finalidade dos Dados</h4>
            <p>
              Coletamos informações como Nome Completo, WhatsApp, E-mail, Objetivos Financeiros e faixas de crédito pretendidas unicamente para responder à sua solicitação de análise de consórcio e prestar consultoria personalizada.
            </p>

            <h4 className="font-bold text-amber-300">2. Compartilhamento Seguro</h4>
            <p>
              Seus dados não são vendidos, alugados ou repassados a terceiros não autorizados. Podem ser utilizados internamente pelos consultores da 3P Patrimônio e processados em administradoras parceiras autorizadas caso você decida avançar na contratação.
            </p>

            <h4 className="font-bold text-amber-300">3. Seus Direitos (LGPD)</h4>
            <p>
              Você pode solicitar a alteração, correção ou exclusão definitiva dos seus dados de nosso cadastro a qualquer momento, entrando em contato através do e-mail oficial de atendimento.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            <p>
              Ao utilizar este site e solicitar simulações ou análises à 3P Patrimônio, você concorda com os seguintes termos:
            </p>

            <h4 className="font-bold text-amber-300">1. Caráter Informativo e Consultivo</h4>
            <p>
              A 3P Patrimônio atua na consultoria e intermediação de consórcios. As simulações e projeções apresentadas possuem caráter estritamente informativo e não representam promessa ou garantia de contemplação prévia.
            </p>

            <h4 className="font-bold text-amber-300">2. Regras das Administradoras</h4>
            <p>
              Todas as condições contratuais, reajustes, taxas de administração, taxas de fundo de reserva e liberações de crédito estão sujeitas às regras específicas de cada administradora autorizada pelo Banco Central do Brasil.
            </p>

            <h4 className="font-bold text-amber-300">3. Contemplação</h4>
            <p>
              A contemplação no consórcio ocorre por sorteio ou por oferta de lance durante as assembleias oficiais do grupo contratado.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
          >
            Entendido e Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
