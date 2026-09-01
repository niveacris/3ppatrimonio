import React, { useState, useRef } from 'react';
import { 
  X, Instagram, Copy, Check, Download, Sparkles, Palette, Type, 
  ExternalLink, Layers, Smartphone, Square, Layout, ArrowRight, 
  ChevronLeft, ChevronRight, Share2, CheckCircle2, Bookmark, Flame,
  FileText, Lightbulb, Image as ImageIcon
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import logoCompleto1024 from '../assets/images/logo_completo_1024x768.png';
import logo250 from '../assets/images/logo_250x250.png';
import logoCompleto250 from '../assets/images/logo_completo_250x250.png';
import tresPilaresImg from '../assets/images/3pilares_transparente.png';
import participacaoImg from '../assets/images/participacao_24x24.png';
import foundersPhoto from '../assets/images/successful_partners_1786049278782.jpg';

interface InstagramCanvaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AspectRatioType = 'portrait' | 'square' | 'story';
type TemplateId = 'alavancagem' | 'pilares' | 'comparativo' | 'multicotas' | 'dica_ouro';

interface TemplateData {
  id: TemplateId;
  title: string;
  category: string;
  slides: {
    tag: string;
    headline: string;
    subheadline: string;
    content: React.ReactNode;
    footerText: string;
  }[];
  caption: string;
  hashtags: string[];
}

export const InstagramCanvaModal: React.FC<InstagramCanvaModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'brand_kit' | 'captions' | 'guide'>('studio');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('alavancagem');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('portrait');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const postPreviewRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Official Brand Colors for Canva
  const brandColors = [
    { name: 'Âmbar / Ouro Principal', hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', role: 'Destaques, botões, ícones, números-chave' },
    { name: 'Dourado Escuro / Cobre', hex: '#D97706', rgb: 'rgb(217, 119, 6)', role: 'Gradientes secundários, bordas douradas' },
    { name: 'Dourado Claro / Brilho', hex: '#FEF08A', rgb: 'rgb(254, 240, 138)', role: 'Topos de gradientes e luzes' },
    { name: 'Navy Profundo (Fundo 1)', hex: '#020617', rgb: 'rgb(2, 6, 23)', role: 'Fundo principal de posts e stories' },
    { name: 'Navy Escuro (Fundo 2)', hex: '#0F172A', rgb: 'rgb(15, 23, 42)', role: 'Cartões internos e caixas bento' },
    { name: 'Cinza Titânio (Bordas)', hex: '#1E293B', rgb: 'rgb(30, 41, 59)', role: 'Bordas finas e divisores' },
    { name: 'Branco Puro', hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)', role: 'Títulos principais e textos de alto contraste' },
    { name: 'Cinza Platina', hex: '#94A3B8', rgb: 'rgb(148, 163, 184)', role: 'Textos de apoio, legendas e subtítulos' },
    { name: 'Verde Lucro / Aprovação', hex: '#10B981', rgb: 'rgb(16, 185, 129)', role: 'Resultados positivos e comparativos' },
  ];

  // Official Typography Guide for Canva
  const fontGuide = [
    {
      role: 'Logo & Monograma "3P"',
      canvaFont: 'Georgia (ou Playfair Display / Cinzel)',
      weight: 'Bold / Black (900)',
      usage: 'Monograma serifado clássico que transmite tradição e autoridade patrimonial.'
    },
    {
      role: 'Títulos de Impacto & Números',
      canvaFont: 'Montserrat (ou Inter / Plus Jakarta Sans)',
      weight: 'Extra Bold (800) / Black (900)',
      usage: 'Ganchos principais, títulos de capas, valores em reais e porcentagens.'
    },
    {
      role: 'Subtítulos, Tags & Taglines',
      canvaFont: 'Montserrat (ou Poppins)',
      weight: 'Bold (700) em CAIXA ALTA com espaçamento (Tracking +150 a +250)',
      usage: '"ESTRATÉGIA • PLANEJAMENTO • RESULTADOS", categorias de posts e selos.'
    },
    {
      role: 'Corpo do Texto & Explicações',
      canvaFont: 'Inter (ou Roboto / Arial)',
      weight: 'Regular (400) / Medium (500)',
      usage: 'Parágrafos explicativos, legendas e tópicos detalhados dos carrosséis.'
    }
  ];

  // Templates Content
  const templates: TemplateData[] = [
    {
      id: 'alavancagem',
      title: 'Estratégia de Alavancagem Patrimonial',
      category: 'Educação para Investidores',
      slides: [
        {
          tag: 'ESTRATÉGIA PATRIMONIAL',
          headline: 'Como Comprar R$ 500 Mil em Imóveis Sem Pagar Juros Bancários',
          subheadline: 'O segredo dos grandes investidores para multiplicar patrimônio usando consórcio estruturado.',
          content: (
            <div className="space-y-3">
              <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-xl">
                <p className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">Cenário Tradicional:</p>
                <p className="text-slate-300 text-xs leading-relaxed">No financiamento tradicional, um imóvel de R$ 500k pode custar mais de <strong>R$ 1,4 milhão</strong> ao final do contrato devido aos juros compostos.</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/50 p-3.5 rounded-xl">
                <p className="text-white font-extrabold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Método 3P Patrimônio:
                </p>
                <p className="text-amber-200 text-xs leading-relaxed">Planejamento de cotas com taxa de administração fixa e lance inteligente planejado.</p>
              </div>
            </div>
          ),
          footerText: 'Deslize para ver o comparativo detalhado 👉'
        },
        {
          tag: 'COMPARATIVO REAL',
          headline: 'Financiamento Bancário vs Consórcio Estruturado',
          subheadline: 'Veja a diferença prática no seu bolso em uma operação de R$ 500.000,00:',
          content: (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/80 border border-red-500/30 p-3 rounded-xl space-y-1.5">
                <div className="text-red-400 font-bold uppercase text-[10px] tracking-wider">Financiamento</div>
                <div className="text-slate-400 text-[11px]">Crédito: R$ 500k</div>
                <div className="text-slate-400 text-[11px]">Juros: 10% a 12% a.a.</div>
                <div className="text-red-300 font-bold text-xs pt-1 border-t border-slate-800">Total: ~R$ 1.450.000</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/50 p-3 rounded-xl space-y-1.5">
                <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">Consórcio 3P</div>
                <div className="text-slate-300 text-[11px]">Crédito: R$ 500k</div>
                <div className="text-slate-300 text-[11px]">Taxa Adm: Diluída</div>
                <div className="text-emerald-400 font-bold text-xs pt-1 border-t border-amber-500/30">Economia: &gt; R$ 600k</div>
              </div>
            </div>
          ),
          footerText: '3P Patrimônio • Consultoria Estratégica'
        },
        {
          tag: 'PRÓXIMO PASSO',
          headline: 'Quer Simular a Sua Estratégia de Aquisição?',
          subheadline: 'Analisamos seu perfil financeiro para traçar o plano de contemplação ideal para o seu objetivo.',
          content: (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <BrandLogo variant="icon_only" size="sm" useImage={false} />
              </div>
              <p className="text-slate-200 text-xs font-medium">
                Comente <strong>"ESTRATÉGIA"</strong> ou clique no link da bio para solicitar uma simulação exclusiva com nossos sócios consultores.
              </p>
              <div className="inline-block bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg">
                Link na Bio • @3ppatrimonio
              </div>
            </div>
          ),
          footerText: 'Salve este post para consultar quando for investir 📌'
        }
      ],
      caption: `🏛️ Como adquirir imóveis de alto valor sem pagar juros abusivos ao banco?

Muitos investidores ainda acreditam que o financiamento imobiliário é a única via para expandir patrimônio. No entanto, ao calcular o Custo Efetivo Total (CET), você percebe que está comprando um imóvel para você e doando quase dois para a instituição financeira.

Com a assessoria estratégica da 3P Patrimônio, você estrutura:
✅ Aquisições com taxas de administração fixas e previsíveis;
✅ Estratégia de lances baseada no histórico estatístico do grupo;
✅ Alavancagem para compra, construção ou geração de renda passiva com aluguel.

💡 O planejamento patrimonial inteligente não é sobre sorte, é sobre método e números.

📲 Quer entender qual cota se encaixa no seu momento? Clique no link da bio ou envie uma mensagem direta!

#consorcio #investimento #planejamentofinanceiro #patrimonio #investimentosimobiliarios #consorcioimobiliario #educacaofinanceira #3ppatrimonio`,
      hashtags: ['#consorcio', '#investimento', '#patrimonio', '#investimentosimobiliarios', '#3ppatrimonio', '#financas']
    },
    {
      id: 'pilares',
      title: 'Os 3 Pilares da Marca 3P',
      category: 'Branding & Autoridade',
      slides: [
        {
          tag: 'NOSSA ESSÊNCIA',
          headline: 'O Que Significa os 3P da Nossa Marca?',
          subheadline: 'Mais que uma consultoria, uma filosofia de construção patrimonial sólida e sustentável.',
          content: (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs shrink-0 font-serif">1P</div>
                <div>
                  <h5 className="font-bold text-white text-xs">Planejamento</h5>
                  <p className="text-slate-400 text-[10px]">Diagnóstico profundo e seleção da administradora ideal.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs shrink-0 font-serif">2P</div>
                <div>
                  <h5 className="font-bold text-white text-xs">Participação</h5>
                  <p className="text-slate-400 text-[10px]">Acompanhamento contínuo em todas as assembleias mensais.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2.5 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs shrink-0 font-serif">3P</div>
                <div>
                  <h5 className="font-bold text-white text-xs">Patrimônio</h5>
                  <p className="text-slate-400 text-[10px]">Resultado concreto com bens consolidados e protegidos.</p>
                </div>
              </div>
            </div>
          ),
          footerText: '3P Patrimônio • Estratégia • Planejamento • Resultados'
        }
      ],
      caption: `Você sabe o que representa o nome 3P Patrimônio?

Nosso trabalho é fundamentado em 3 pilares inegociáveis:

1️⃣ PLANEJAMENTO: Estudamos a fundo seu fluxo financeiro para encontrar cotas compatíveis com sua capacidade e seus objetivos de curto, médio e longo prazo.
2️⃣ PARTICIPAÇÃO: Não abandonamos você após a assinatura do contrato. Monitoramos cada assembleia, média de lances e datas estratégicas para otimizar sua contemplação.
3️⃣ PATRIMÔNIO: Nosso foco final é a multiplicação real de ativos em seu nome, seja em imóveis, frotas ou maquinário.

🏛️ Conte com quem entende o mercado sob a ótica do investidor.

Acesse o link da nossa bio e agende um bate-papo!

#3ppatrimonio #branding #consorcio #planejamentofinanceiro #investimentos #patrimonio`,
      hashtags: ['#3ppatrimonio', '#branding', '#consorcio', '#planejamento', '#investimentos']
    },
    {
      id: 'comparativo',
      title: 'Financiamento vs Consórcio 3P',
      category: 'Conversão & Vendas',
      slides: [
        {
          tag: 'RAIO-X FINANCEIRO',
          headline: 'Financiamento ou Consórcio? Veja o Teste dos Números',
          subheadline: 'Compare lado a lado o impacto a longo prazo de cada modalidade de crédito.',
          content: (
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-[11px]">
              <div className="grid grid-cols-3 bg-slate-900 p-2 font-bold text-slate-300 border-b border-slate-800">
                <span>Critério</span>
                <span className="text-red-400 text-center">Financiamento</span>
                <span className="text-amber-400 text-right">Consórcio 3P</span>
              </div>
              <div className="divide-y divide-slate-800/80 p-2 space-y-1.5">
                <div className="grid grid-cols-3 pt-1">
                  <span className="text-slate-400">Juros</span>
                  <span className="text-red-400 text-center font-bold">Cobrados a.a.</span>
                  <span className="text-emerald-400 text-right font-bold">Zero Juros (Taxa Fixa)</span>
                </div>
                <div className="grid grid-cols-3 pt-1">
                  <span className="text-slate-400">Entrada</span>
                  <span className="text-slate-300 text-center">20% a 30%</span>
                  <span className="text-amber-300 text-right">Lance Embutido/Livre</span>
                </div>
                <div className="grid grid-cols-3 pt-1">
                  <span className="text-slate-400">Custo Total</span>
                  <span className="text-red-400 text-center font-bold">2.5x a 3x o valor</span>
                  <span className="text-emerald-400 text-right font-bold">1.2x a 1.3x o valor</span>
                </div>
              </div>
            </div>
          ),
          footerText: 'Faça a conta antes de assinar com o banco 💡'
        }
      ],
      caption: `Você já parou para calcular quanto custa o financiamento do seu próximo bem?

A diferença entre pagar juros compostos para o banco e utilizar um consórcio estruturado é o equivalente a comprar um segundo patrimônio.

Se você possui flexibilidade ou previsibilidade no planejamento, o consórcio com estratégia de lance é, sem dúvidas, a ferramenta mais eficiente do mercado financeiro brasileiro.

💬 Quer fazer uma simulação personalizada para comparar com a proposta do seu banco?
Mande uma DM ou acesse o link da bio!

#comparativofinanceiro #consorcio #financiamento #imoveis #educacaofinanceira #3ppatrimonio`,
      hashtags: ['#consorcio', '#financiamento', '#investimento', '#3ppatrimonio']
    },
    {
      id: 'multicotas',
      title: 'Estratégia de Multi-Cotas',
      category: 'Estratégia Avançada',
      slides: [
        {
          tag: 'TÉCNICA DE ALTO NÍVEL',
          headline: 'A Estratégia de Multi-Cotas Para Investidores',
          subheadline: 'Por que dividir um crédito de R$ 1 Milhão em 4 cotas de R$ 250k é muito mais inteligente?',
          content: (
            <div className="space-y-2 text-xs">
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block text-[11px] uppercase">1. Mais chances de contemplação</span>
                <p className="text-slate-300 text-[10px]">Você participa de múltiplos sorteios e assembleias simultâneas.</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block text-[11px] uppercase">2. Flexibilidade de uso</span>
                <p className="text-slate-300 text-[10px]">Compre bens diferentes ou una as cotas para uma única aquisição maior.</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl">
                <span className="text-amber-400 font-bold block text-[11px] uppercase">3. Gestão de fluxo de caixa</span>
                <p className="text-slate-300 text-[10px]">Alivie parcelas ofertando lance embutido de maneira escalonada.</p>
              </div>
            </div>
          ),
          footerText: '3P Patrimônio • Inteligência em Consórcios'
        }
      ],
      caption: `Investidores experientes não compram apenas uma cota grande. Eles operam com a ESTRATÉGIA DE MULTI-COTAS! 🎯

Em vez de contratar uma única cota de R$ 1.000.000, dividimos a operação em 4 cotas de R$ 250.000 em grupos estratégicos.

Vantagens:
🔹 Você multiplica por 4 suas probabilidades estatísticas de sorteio;
🔹 Pode contemplar e utilizar a primeira cota sem precisar esperar as demais;
🔹 Pode unificar as cartas no momento da compra do imóvel;
🔹 Otimiza o uso de lance livre e embutido.

Quer desenhar uma arquitetura de cotas sob medida para a sua empresa ou família?
🔗 Fale com nossos especialistas no link da bio!

#multicotas #investidores #planejamentopatrimonial #consorcioimobiliario #3ppatrimonio`,
      hashtags: ['#multicotas', '#investidores', '#consorcio', '#3ppatrimonio']
    },
    {
      id: 'dica_ouro',
      title: 'Dica de Ouro: Lance Embutido',
      category: 'Dicas Práticas',
      slides: [
        {
          tag: 'DICA DE OURO 3P',
          headline: 'Como Usar a Própria Carta de Crédito Para Dar o Lance',
          subheadline: 'Entenda o poder do Lance Embutido e como ele acelera sua contemplação sem descapitalizar.',
          content: (
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Lightbulb className="w-4 h-4" />
                <span>O que é Lance Embutido?</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Você utiliza um percentual (ex: 25% a 30%) do próprio valor da carta de crédito contratada como oferta de lance na assembleia.
              </p>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400">
                <span className="text-white font-bold block mb-0.5">Exemplo Prático:</span>
                Carta de R$ 400.000 com 30% embutido (R$ 120.000). Ao ser contemplado, você recebe R$ 280.000 líquidos e amortiza o prazo/parcela!
              </div>
            </div>
          ),
          footerText: 'Consulte as regras específicas de cada administradora 📋'
        }
      ],
      caption: `Você sabia que pode ofertar lances no consórcio sem tirar todo o dinheiro do seu bolso? 💡

Essa modalidade se chama LANCE EMBUTIDO. Nela, a própria administradora permite utilizar parte do crédito contratado para compor sua oferta de lance.

É a alternativa perfeita para quem:
✔️ Quer aumentar significativamente as chances de contemplação rápida;
✔️ Não deseja descapitalizar sua reserva de emergência ou investimentos líquidos;
✔️ Busca reduzir o saldo devedor ou valor das parcelas futuras desde o início.

Nossa equipe te orienta a escolher grupos com as melhores regras de lance embutido do mercado!

📩 Mande uma mensagem e receba uma consultoria exclusiva.

#lanceembutido #dicasdeconsorcio #planejamentofinanceiro #3ppatrimonio`,
      hashtags: ['#lanceembutido', '#consorcio', '#dicasfinanceiras', '#3ppatrimonio']
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];
  const currentSlide = currentTemplate.slides[currentSlideIndex] || currentTemplate.slides[0];

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCanva = (width: number, height: number) => {
    // Direct Canva custom size creation URL
    const canvaUrl = `https://www.canva.com/design/play?units=px&width=${width}&height=${height}`;
    window.open(canvaUrl, '_blank');
  };

  // Dimensions by ratio
  const getDimensions = () => {
    switch (aspectRatio) {
      case 'portrait':
        return { w: 1080, h: 1350, label: 'Feed Retrato (4:5 - 1080x1350px)', desc: 'Maior visibilidade no feed do Instagram' };
      case 'square':
        return { w: 1080, h: 1080, label: 'Feed Quadrado (1:1 - 1080x1080px)', desc: 'Formato clássico e balanceado' };
      case 'story':
        return { w: 1080, h: 1920, label: 'Stories / Reels (9:16 - 1080x1920px)', desc: 'Tela cheia vertical' };
    }
  };

  const dimensions = getDimensions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 my-6 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/80 hover:bg-slate-800 rounded-full transition-all border border-slate-800"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30">
                  INSTAGRAM & CANVA STUDIO
                </span>
                <span className="text-xs text-slate-400">• Identidade Visual Oficial</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Estúdio de Posts & Kit de Marca Canva
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenCanva(dimensions.w, dimensions.h)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              title="Abrir o Canva com o tamanho exato selecionado"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Abrir Canva ({dimensions.w}x{dimensions.h})</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'studio'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>1. Visualizador de Posts & Carrossel</span>
          </button>

          <button
            onClick={() => setActiveTab('brand_kit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'brand_kit'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>2. Kit de Cores & Tipografia Canva</span>
          </button>

          <button
            onClick={() => setActiveTab('captions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'captions'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Legendas Prontas & Hashtags</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>4. Guia de Boas Práticas Canva</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">

          {/* TAB 1: VISUAL POST STUDIO */}
          {activeTab === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Controls & Templates Selection */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Formats Selector */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Proporção do Post:</span>
                    <span className="text-amber-400 text-[11px] font-mono">{dimensions.w} x {dimensions.h} px</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setAspectRatio('portrait')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                        aspectRatio === 'portrait'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>Retrato 4:5</span>
                      <span className="text-[9px] text-slate-500">1080x1350</span>
                    </button>

                    <button
                      onClick={() => setAspectRatio('square')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                        aspectRatio === 'square'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Square className="w-4 h-4 text-amber-400" />
                      <span>Quadrado 1:1</span>
                      <span className="text-[9px] text-slate-500">1080x1080</span>
                    </button>

                    <button
                      onClick={() => setAspectRatio('story')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                        aspectRatio === 'story'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Stories 9:16</span>
                      <span className="text-[9px] text-slate-500">1080x1920</span>
                    </button>
                  </div>
                </div>

                {/* Templates Selector */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Selecione o Modelo / Assunto do Post:
                  </label>

                  <div className="space-y-1.5">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => {
                          setSelectedTemplate(tpl.id);
                          setCurrentSlideIndex(0);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                          selectedTemplate === tpl.id
                            ? 'border-amber-500/80 bg-amber-500/10 text-white font-bold shadow-sm'
                            : 'border-slate-850 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">{tpl.category}</div>
                          <div className="font-semibold">{tpl.title}</div>
                        </div>
                        {selectedTemplate === tpl.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canva Quick Action Box */}
                <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/5 border border-amber-500/30 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Como replicar este layout no Canva:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    1. Defina o fundo como <code className="text-amber-300 font-mono">#020617</code>.<br/>
                    2. Use a fonte <strong>Montserrat Extra Bold</strong> para o título e <strong>Georgia</strong> para o logo.<br/>
                    3. Adicione caixas com fundo <code className="text-amber-300 font-mono">#0F172A</code> e borda âmbar <code className="text-amber-300 font-mono">#F59E0B</code>.
                  </p>
                </div>

              </div>

              {/* Right Column: Interactive Live Mockup Preview */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                
                {/* Carousel Slides Navigation if > 1 slide */}
                {currentTemplate.slides.length > 1 && (
                  <div className="w-full flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-bold text-amber-400">Lâmina {currentSlideIndex + 1}</span> de {currentTemplate.slides.length}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-30"
                        title="Lâmina anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {currentTemplate.slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            currentSlideIndex === idx ? 'bg-amber-400 w-5' : 'bg-slate-700 hover:bg-slate-500'
                          }`}
                          title={`Ir para lâmina ${idx + 1}`}
                        />
                      ))}

                      <button
                        onClick={() => setCurrentSlideIndex(Math.min(currentTemplate.slides.length - 1, currentSlideIndex + 1))}
                        disabled={currentSlideIndex === currentTemplate.slides.length - 1}
                        className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-30"
                        title="Próxima lâmina"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Simulated Instagram Post Frame */}
                <div 
                  ref={postPreviewRef}
                  className={`w-full max-w-sm rounded-2xl bg-[#020617] border border-amber-500/40 p-5 shadow-2xl relative flex flex-col justify-between overflow-hidden transition-all duration-300 select-none ${
                    aspectRatio === 'portrait' ? 'aspect-[4/5]' : aspectRatio === 'square' ? 'aspect-square' : 'aspect-[9/16]'
                  }`}
                  style={{
                    backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)'
                  }}
                >
                  {/* Subtle Gold Corner Accents */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Top Bar inside Post */}
                  <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <BrandLogo variant="icon_only" size="sm" />
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[12px] tracking-wide text-white font-serif flex items-center gap-1">
                          3P <span className="font-sans font-black tracking-[0.2em] text-[10px] text-amber-400">PATRIMÔNIO</span>
                        </span>
                        <span className="text-[7.5px] tracking-widest text-slate-400 uppercase font-bold">
                          ESTRATÉGIA • PLANEJAMENTO
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-[8.5px] uppercase tracking-wider border border-amber-500/30">
                      {currentSlide.tag}
                    </span>
                  </div>

                  {/* Center Content inside Post */}
                  <div className="relative z-10 my-auto py-3 space-y-3">
                    <h3 className="font-black text-white text-base sm:text-lg leading-tight tracking-tight">
                      {currentSlide.headline}
                    </h3>
                    
                    <p className="text-slate-300 text-xs leading-relaxed font-normal">
                      {currentSlide.subheadline}
                    </p>

                    <div className="pt-1">
                      {currentSlide.content}
                    </div>
                  </div>

                  {/* Footer inside Post */}
                  <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 font-bold">
                    <span className="text-amber-400/90">{currentSlide.footerText}</span>
                    <span className="text-slate-300 tracking-wider">@3ppatrimonio</span>
                  </div>
                </div>

                {/* Post Action Buttons */}
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(currentTemplate.caption, 'post_caption')}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {copiedCode === 'post_caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{copiedCode === 'post_caption' ? 'Legenda Copiada!' : 'Copiar Legenda do Post'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenCanva(dimensions.w, dimensions.h)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Criar no Canva</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: BRAND KIT & CORES HEX */}
          {activeTab === 'brand_kit' && (
            <div className="space-y-6">
              
              {/* Color Palette Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>Paleta de Cores Oficiais da 3P Patrimônio (HEX para o Canva)</span>
                  </h4>
                  <span className="text-xs text-slate-400">Clique no código para copiar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {brandColors.map((color) => (
                    <div
                      key={color.hex}
                      onClick={() => handleCopyText(color.hex, color.hex)}
                      className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-all group"
                      title="Clique para copiar o código Hex"
                    >
                      <div
                        className="w-12 h-12 rounded-xl shadow-inner border border-white/10 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: color.hex }}
                      >
                        {copiedCode === color.hex && <Check className="w-5 h-5 text-slate-950 font-black" />}
                      </div>

                      <div className="overflow-hidden flex-1">
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {color.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <code className="text-[11px] font-mono text-amber-400 font-extrabold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {color.hex}
                          </code>
                          <span className="text-[10px] text-slate-500">
                            {copiedCode === color.hex ? 'Copiado!' : 'Copiar'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-1">{color.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Guide */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span>Guia Tipográfico Oficial & Fontes Equivalentes no Canva</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fontGuide.map((font, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{font.role}</span>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">{font.weight}</span>
                      </div>
                      <div className="text-sm font-black text-white">{font.canvaFont}</div>
                      <p className="text-xs text-slate-400 leading-relaxed">{font.usage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logos & Assets for Download */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Arquivos de Logo Prontos para o Canva (Download Direto)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Logo Completo */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-center flex flex-col items-center justify-between">
                    <div className="h-16 flex items-center justify-center p-2 bg-slate-900 rounded-xl w-full">
                      <img src={logoCompleto250} alt="Logo 3P" className="max-h-12 object-contain" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">Logo Completo 3P</span>
                      <span className="text-[10px] text-slate-500 block">Alta Resolução PNG</span>
                    </div>
                    <a
                      href={logoCompleto1024}
                      download="3P_Patrimonio_Logo_Completo.png"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Logo PNG</span>
                    </a>
                  </div>

                  {/* Logo Circular Badge */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-center flex flex-col items-center justify-between">
                    <div className="h-16 flex items-center justify-center p-2 bg-slate-900 rounded-xl w-full">
                      <img src={logo250} alt="Badge 3P" className="max-h-12 object-contain" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">Selo Circular 3P</span>
                      <span className="text-[10px] text-slate-500 block">Ideal para Perfil / Selos</span>
                    </div>
                    <a
                      href={logo250}
                      download="3P_Patrimonio_Selo_Circular.png"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Selo PNG</span>
                    </a>
                  </div>

                  {/* 3 Pilares Graphic */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-center flex flex-col items-center justify-between">
                    <div className="h-16 flex items-center justify-center p-2 bg-slate-900 rounded-xl w-full">
                      <img src={tresPilaresImg} alt="3 Pilares" className="max-h-12 object-contain" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">Ícone dos 3 Pilares</span>
                      <span className="text-[10px] text-slate-500 block">Fundo Transparente</span>
                    </div>
                    <a
                      href={tresPilaresImg}
                      download="3P_Patrimonio_3_Pilares.png"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Ícone PNG</span>
                    </a>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: READY CAPTIONS & HASHTAGS */}
          {activeTab === 'captions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Modelos de legendas copywriting com ganchos e chamadas para ação para cada post:
                </span>
              </div>

              <div className="space-y-4">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase rounded-full">
                          {tpl.category}
                        </span>
                        <h4 className="font-bold text-white text-sm">{tpl.title}</h4>
                      </div>

                      <button
                        onClick={() => handleCopyText(tpl.caption, tpl.id)}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow"
                      >
                        {copiedCode === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{copiedCode === tpl.id ? 'Copiado!' : 'Copiar Legenda'}</span>
                      </button>
                    </div>

                    <pre className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-xs font-sans text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {tpl.caption}
                    </pre>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tpl.hashtags.map((ht, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-900 text-amber-400/80 px-2 py-0.5 rounded-md border border-slate-800 font-mono">
                          {ht}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CANVA BEST PRACTICES GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-5 text-xs text-slate-300">
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/30 p-5 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Como Manter a Mesma Identidade Visual da Landing Page no Canva</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  A landing page da 3P Patrimônio foi desenhada seguindo a estética <strong>Bento Grid Sofisticada</strong>, com alto contraste, tons nobres de ouro e azul-marinho profundo. Siga as 4 regras de ouro abaixo ao criar no Canva para manter 100% de consistência.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono">1</span>
                    <span>Proporções & Tamanho dos Elementos</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-400 text-xs">
                    <li>• Use sempre <strong>1080 x 1350 px (4:5)</strong> para posts no feed (ocupa mais espaço na tela do celular e gera +30% de retenção).</li>
                    <li>• Deixe pelo menos <strong>60px de margem de segurança</strong> nas bordas para evitar corte em telas de diferentes modelos de smartphone.</li>
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono">2</span>
                    <span>Hierarquia de Contraste</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-400 text-xs">
                    <li>• Fundo sempre muito escuro (<code className="text-amber-300">#020617</code> ou <code className="text-amber-300">#0F172A</code>).</li>
                    <li>• Títulos em <strong>Branco Puro</strong> (<code className="text-amber-300">#FFFFFF</code>) para máxima legibilidade.</li>
                    <li>• Números, porcentagens e destaques na cor <strong>Âmbar</strong> (<code className="text-amber-300">#F59E0B</code>).</li>
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono">3</span>
                    <span>Caixas Bento & Bordas Finas</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-400 text-xs">
                    <li>• Ao invés de fundos transparentes, use retângulos com cantos arredondados (raio de 16px a 24px).</li>
                    <li>• Adicione borda de 1px a 2px com cor <code className="text-amber-300">#1E293B</code> ou com brilho sutil em <code className="text-amber-300">#F59E0B</code> (opacidade 30%).</li>
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono">4</span>
                    <span>Chamadas para Ação Claras</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-400 text-xs">
                    <li>• Na última lâmina do carrossel, sempre coloque o CTA orientando o seguidor a clicar no link da bio para simular.</li>
                    <li>• Inclua o usuário oficial <strong className="text-white">@3ppatrimonio</strong> no rodapé de todas as artes.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>3P Patrimônio • Social Media & Brand Asset Studio</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleOpenCanva(dimensions.w, dimensions.h)}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir no Canva Agora</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl font-bold"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
