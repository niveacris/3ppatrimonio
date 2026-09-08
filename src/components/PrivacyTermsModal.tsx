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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 text-left space-y-6 relative max-h-[85vh] overflow-y-auto">
        
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
          <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pr-1">
            {/* 1. Introdução */}
            <section className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">1. Introdução</h4>
              <p>
                A <strong>3P Patrimônio</strong> valoriza a privacidade e a segurança das informações de seus clientes, potenciais clientes, parceiros e visitantes.
              </p>
              <p>
                Esta Política de Privacidade tem por objetivo informar, de forma clara e transparente, como os dados pessoais fornecidos por meio de nossos sites, landing pages, formulários, redes sociais, anúncios, WhatsApp e demais canais de atendimento poderão ser coletados, utilizados, armazenados e protegidos.
              </p>
              <p>
                O tratamento de dados pessoais será realizado em conformidade com a legislação aplicável, especialmente a Lei nº 13.709/2018 - Lei Geral de Proteção de Dados Pessoais (LGPD).
              </p>
            </section>

            {/* 2. Quem somos */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">2. Quem somos</h4>
              <p>
                A 3P Patrimônio atua na consultoria e intermediação de consórcios, oferecendo atendimento personalizado para pessoas interessadas em aquisição de imóveis, veículos, máquinas, equipamentos e planejamento patrimonial.
              </p>
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-1 text-xs">
                <p><strong className="text-slate-200">Razão social:</strong> 3P PATRIMÔNIO LTDA</p>
                <p><strong className="text-slate-200">Nome comercial:</strong> 3P PATRIMÔNIO</p>
                <p><strong className="text-slate-200">CNPJ:</strong> 68.039.412/0001-79</p>
                <p><strong className="text-slate-200">E-mail de contato:</strong> <a href="mailto:contato@3ppatrimonio.com.br" className="text-amber-400 hover:underline">contato@3ppatrimonio.com.br</a></p>
                <p><strong className="text-slate-200">WhatsApp:</strong> <a href="https://wa.me/5511996876748" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">(11) 99687-6748</a></p>
              </div>
            </section>

            {/* 3. Quais dados poderão ser coletados */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">3. Quais dados poderão ser coletados</h4>
              <p>Durante sua interação com a 3P Patrimônio, poderão ser coletados dados como:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Nome completo;</li>
                <li>Número de telefone e WhatsApp;</li>
                <li>Endereço de e-mail;</li>
                <li>Cidade e Estado;</li>
                <li>Objetivo de aquisição;</li>
                <li>Tipo de bem de interesse;</li>
                <li>Valor aproximado de crédito pretendido;</li>
                <li>Valor aproximado da parcela pretendida;</li>
                <li>Prazo para aquisição;</li>
                <li>Disponibilidade de recursos para lance;</li>
                <li>Informações fornecidas espontaneamente durante o atendimento;</li>
                <li>Dados técnicos de navegação, como endereço IP, tipo de dispositivo, navegador, páginas acessadas e origem do acesso.</li>
              </ul>
              <p className="pt-1">
                Não solicitamos, por meio dos formulários iniciais de publicidade, dados pessoais desnecessários para o atendimento.
              </p>
              <p className="text-xs text-slate-400">
                Documentos e informações adicionais poderão ser solicitados posteriormente, quando necessários para elaboração de propostas, análise cadastral, contratação ou procedimentos exigidos pelas administradoras de consórcio.
              </p>
            </section>

            {/* 4. Como os dados são coletados */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">4. Como os dados são coletados</h4>
              <p>Os dados pessoais poderão ser coletados por meio de:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Formulários disponíveis em nossos sites e landing pages;</li>
                <li>Formulários de anúncios em plataformas como Meta, Facebook e Instagram;</li>
                <li>WhatsApp;</li>
                <li>Telefone;</li>
                <li>E-mail;</li>
                <li>Redes sociais;</li>
                <li>Atendimento presencial ou por videoconferência;</li>
                <li>Ferramentas de CRM;</li>
                <li>Cookies e tecnologias semelhantes utilizadas em nossos sites.</li>
              </ul>
            </section>

            {/* 5. Para quais finalidades utilizamos seus dados */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">5. Para quais finalidades utilizamos seus dados</h4>
              <p>Os dados pessoais poderão ser utilizados para:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Entrar em contato com o interessado;</li>
                <li>Identificar suas necessidades e objetivos;</li>
                <li>Prestar atendimento comercial e consultivo;</li>
                <li>Elaborar simulações de consórcio;</li>
                <li>Apresentar produtos e estratégias compatíveis com o perfil informado;</li>
                <li>Agendar reuniões;</li>
                <li>Enviar informações solicitadas pelo próprio usuário;</li>
                <li>Realizar acompanhamento comercial;</li>
                <li>Manter histórico de relacionamento;</li>
                <li>Realizar procedimentos relacionados à contratação;</li>
                <li>Cumprir obrigações legais, regulatórias e contratuais;</li>
                <li>Melhorar nossos serviços e nossos canais de atendimento;</li>
                <li>Avaliar a eficiência de campanhas publicitárias;</li>
                <li>Enviar comunicações relacionadas aos serviços da 3P Patrimônio, respeitados os direitos do titular.</li>
              </ul>
            </section>

            {/* 6. Contato por WhatsApp, telefone e e-mail */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">6. Contato por WhatsApp, telefone e e-mail</h4>
              <p>
                Ao preencher um formulário ou solicitar atendimento por nossos canais, o usuário poderá autorizar a 3P Patrimônio a entrar em contato por:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>WhatsApp;</li>
                <li>Telefone;</li>
                <li>E-mail.</li>
              </ul>
              <p>
                O contato terá como finalidade responder à solicitação realizada, apresentar informações sobre produtos e serviços ou dar continuidade ao atendimento iniciado pelo próprio interessado.
              </p>
              <p className="text-xs text-amber-300/90 font-medium">
                O usuário poderá solicitar a interrupção das comunicações a qualquer momento.
              </p>
            </section>

            {/* 7. Compartilhamento de dados */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">7. Compartilhamento de dados</h4>
              <p>
                A 3P Patrimônio poderá compartilhar dados pessoais somente quando necessário para a prestação dos serviços ou cumprimento de obrigações.
              </p>
              <p>O compartilhamento poderá ocorrer, por exemplo, com:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Administradoras de consórcio;</li>
                <li>Corretoras e parceiros comerciais envolvidos na operação;</li>
                <li>Plataformas de CRM;</li>
                <li>Prestadores de serviços de tecnologia;</li>
                <li>Plataformas de hospedagem;</li>
                <li>Serviços de comunicação e atendimento;</li>
                <li>Plataformas de publicidade e análise de desempenho;</li>
                <li>Autoridades públicas, quando houver obrigação legal ou determinação competente.</li>
              </ul>
              <p className="font-semibold text-slate-200 pt-1">
                A 3P Patrimônio não comercializa dados pessoais de seus clientes ou potenciais clientes.
              </p>
            </section>

            {/* 8. Plataformas de publicidade */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">8. Plataformas de publicidade</h4>
              <p>
                A 3P Patrimônio poderá utilizar plataformas de publicidade digital, como Facebook, Instagram, Meta Ads, Google Ads e outras ferramentas semelhantes.
              </p>
              <p>Essas plataformas poderão utilizar cookies, pixels ou tecnologias equivalentes para:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Medir o desempenho das campanhas;</li>
                <li>Identificar a origem dos acessos;</li>
                <li>Criar públicos de publicidade;</li>
                <li>Realizar remarketing;</li>
                <li>Melhorar a relevância dos anúncios.</li>
              </ul>
              <p className="text-xs text-slate-400">
                O tratamento realizado diretamente por essas plataformas também estará sujeito às respectivas políticas de privacidade de cada empresa.
              </p>
            </section>

            {/* 9. Cookies */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">9. Cookies</h4>
              <p>
                Nosso site poderá utilizar cookies e tecnologias semelhantes para melhorar a experiência de navegação, analisar o desempenho das páginas e mensurar campanhas publicitárias.
              </p>
              <p>Cookies são pequenos arquivos armazenados no dispositivo do usuário. Eles poderão ser utilizados para:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Funcionamento técnico do site;</li>
                <li>Análise de tráfego;</li>
                <li>Medição de conversões;</li>
                <li>Identificação da origem dos visitantes;</li>
                <li>Personalização de conteúdo e publicidade.</li>
              </ul>
              <p className="text-xs text-slate-400">
                Quando aplicável, o usuário poderá gerenciar suas preferências por meio do navegador ou das ferramentas disponibilizadas no próprio site.
              </p>
            </section>

            {/* 10. Armazenamento e segurança dos dados */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">10. Armazenamento e segurança dos dados</h4>
              <p>A 3P Patrimônio adota medidas razoáveis de segurança para proteger os dados pessoais contra:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Acesso não autorizado;</li>
                <li>Perda;</li>
                <li>Alteração;</li>
                <li>Divulgação indevida;</li>
                <li>Uso inadequado;</li>
                <li>Destruição acidental ou ilícita.</li>
              </ul>
              <p>
                Os dados serão mantidos somente pelo período necessário para atender às finalidades para as quais foram coletados, cumprir obrigações legais ou preservar direitos.
              </p>
            </section>

            {/* 11. Direitos do titular dos dados */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">11. Direitos do titular dos dados</h4>
              <p>Nos termos da LGPD, o titular poderá solicitar, quando aplicável:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Confirmação da existência de tratamento de seus dados;</li>
                <li>Acesso aos dados pessoais;</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>Informação sobre compartilhamento;</li>
                <li>Exclusão ou anonimização de dados, quando cabível;</li>
                <li>Revogação do consentimento;</li>
                <li>Informações sobre o tratamento realizado;</li>
                <li>Oposição ao tratamento, nas hipóteses previstas em lei.</li>
              </ul>
              <p className="pt-1">
                As solicitações poderão ser encaminhadas pelo e-mail:{' '}
                <a href="mailto:contato@3ppatrimonio.com.br" className="text-amber-400 font-semibold underline">
                  contato@3ppatrimonio.com.br
                </a>
              </p>
            </section>

            {/* 12. Revogação do consentimento */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">12. Revogação do consentimento</h4>
              <p>
                Quando o tratamento estiver baseado em consentimento, o usuário poderá revogá-lo a qualquer momento.
              </p>
              <p>
                A revogação não afetará a legalidade dos tratamentos realizados anteriormente.
              </p>
              <p className="text-xs text-slate-400">
                O usuário também poderá solicitar que não sejam mais realizadas comunicações comerciais por WhatsApp, telefone ou e-mail.
              </p>
            </section>

            {/* 13. Dados fornecidos a administradoras de consórcio */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">13. Dados fornecidos a administradoras de consórcio</h4>
              <p>
                Caso o interessado decida prosseguir com uma contratação, poderão ser solicitados dados e documentos necessários para cadastro, análise de crédito, elaboração de proposta e demais procedimentos exigidos pela administradora de consórcio.
              </p>
              <p className="text-xs text-slate-400">
                Nessas situações, a administradora poderá atuar como agente de tratamento independente, de acordo com suas próprias políticas de privacidade e obrigações legais.
              </p>
            </section>

            {/* 14. Links para sites de terceiros */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">14. Links para sites de terceiros</h4>
              <p>
                Nosso site poderá conter links para sites, plataformas ou serviços de terceiros.
              </p>
              <p>
                A 3P Patrimônio não é responsável pelas práticas de privacidade adotadas por terceiros.
              </p>
              <p className="text-xs text-slate-400">
                Recomendamos que o usuário consulte as respectivas políticas de privacidade antes de fornecer dados pessoais.
              </p>
            </section>

            {/* 15. Menores de idade */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">15. Menores de idade</h4>
              <p>
                Os serviços da 3P Patrimônio são destinados predominantemente a pessoas maiores de 18 anos.
              </p>
              <p className="text-xs text-slate-400">
                Não buscamos intencionalmente coletar dados pessoais de crianças ou adolescentes por meio de nossas campanhas comerciais.
              </p>
            </section>

            {/* 16. Atualizações desta Política */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">16. Atualizações desta Política</h4>
              <p>
                Esta Política de Privacidade poderá ser atualizada periodicamente para refletir alterações legais, tecnológicas ou operacionais.
              </p>
              <p>
                A versão mais atual estará sempre disponível nesta página.
              </p>
              <p className="text-xs text-amber-400/90 font-medium">
                Última atualização: agosto de 2026.
              </p>
            </section>

            {/* 17. Contato */}
            <section className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-sm sm:text-base font-bold text-amber-400">17. Contato</h4>
              <p>
                Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais, entre em contato:
              </p>
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-1 text-xs">
                <p className="font-bold text-white">3P Patrimônio</p>
                <p><strong className="text-slate-200">E-mail:</strong> <a href="mailto:contato@3ppatrimonio.com.br" className="text-amber-400 hover:underline">contato@3ppatrimonio.com.br</a></p>
                <p><strong className="text-slate-200">WhatsApp:</strong> <a href="https://wa.me/5511996876748" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">(11) 99687-6748</a></p>
                <p><strong className="text-slate-200">CNPJ:</strong> 68.039.412/0001-79</p>
              </div>
            </section>
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
