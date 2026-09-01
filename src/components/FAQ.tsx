import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search, Sparkles } from 'lucide-react';
import { FAQItem } from '../types';

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      question: '1. O que é um consórcio?',
      answer: 'O consórcio é uma modalidade de aquisição planejada de bens ou serviços. Os participantes formam um grupo administrado por uma empresa autorizada pelo Banco Central e contribuem mensalmente para a formação de um fundo comum. Ao longo do grupo, os consorciados podem ser contemplados por sorteio ou lance, conforme as regras previstas no contrato.'
    },
    {
      id: 'faq-2',
      question: '2. O consórcio tem juros?',
      answer: 'Não. O consórcio não possui juros remuneratórios como um financiamento tradicional. O consorciado paga taxa de administração e, quando previstos no contrato, outros encargos, como fundo de reserva e seguro. O crédito e as parcelas também podem ser reajustados conforme o critério previsto contratualmente.'
    },
    {
      id: 'faq-3',
      question: '3. O que é contemplação e como funciona?',
      answer: 'A contemplação é o momento em que o consorciado passa a ter o direito de utilizar a carta de crédito, desde que cumpra as exigências da administradora.\nEla ocorre principalmente de duas formas:\n• Sorteio: os participantes elegíveis concorrem nas assembleias.\n• Lance: o consorciado oferece a antecipação de determinado valor ou parcelas, conforme as regras do grupo.'
    },
    {
      id: 'faq-4',
      question: '4. Existe garantia de contemplação?',
      answer: 'Não. Não é possível garantir previamente em qual mês uma determinada cota será contemplada por sorteio. Também não é possível garantir que determinado lance será vencedor. É possível analisar as características e o histórico do grupo, mas a contemplação sempre depende das regras aplicáveis e dos resultados das assembleias.'
    },
    {
      id: 'faq-5',
      question: '5. Existe análise de crédito no consórcio?',
      answer: 'Sim. A contemplação não significa liberação automática do crédito. Para utilização da carta, a administradora poderá analisar renda, capacidade de pagamento, situação cadastral, documentação e garantias, conforme suas regras. Por isso, a aprovação da utilização do crédito não pode ser garantida antecipadamente.'
    },
    {
      id: 'faq-6',
      question: '6. Posso vender uma carta contemplada?',
      answer: 'Sim. A transferência de uma cota contemplada pode ser realizada desde que sejam atendidas as regras da administradora e o novo titular seja aprovado nos procedimentos exigidos. O valor da negociação é definido entre comprador e vendedor e pode incluir ágio. A venda, porém, depende das condições de mercado, da existência de comprador e da aprovação da administradora. Portanto, não existe garantia de venda imediata ou de lucro.'
    }
  ];

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="duvidas" className="py-20 bg-slate-900/60 text-slate-100 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/30">
            TRANSPARÊNCIA TOTAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Perguntas Frequentes
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Esclareça suas dúvidas sobre o funcionamento do consórcio e o atendimento da 3P Patrimônio.
          </p>
        </div>

        {/* Search input */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Pesquisar por dúvida (ex: juros, lance, contemplação)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-bold text-sm sm:text-base text-white hover:text-amber-300 transition-colors">
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center shrink-0 text-amber-400 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-amber-500/20' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-3 text-xs sm:text-sm text-slate-300 border-t border-slate-850 leading-relaxed font-sans bg-slate-950/40 whitespace-pre-line space-y-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              Nenhuma pergunta encontrada com o termo "{searchTerm}".
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
