import React from 'react';
import { Users, ShieldCheck, HeartHandshake, Award, Quote, CheckCircle, User } from 'lucide-react';

interface AboutUsProps {
  foundersPhotoUrl?: string;
}

export const AboutUs: React.FC<AboutUsProps> = () => {
  const partners = [
    {
      name: 'William Lourenço',
      description: 'Advogado e gestor com sólida trajetória em liderança, gestão de equipes e formação de pessoas.'
    },
    {
      name: 'Carlos Yoshimori',
      description: 'Advogado especializado em Direito Tributário e Imobiliário. Atuou por 23 anos como auditor fiscal da Prefeitura de São Paulo.'
    },
    {
      name: 'João Silva',
      description: 'Economista, contador e empresário contábil, com mais de 30 anos de experiência em contabilidade e gestão.'
    }
  ];

  return (
    <section id="sobre-nos" className="py-24 bg-slate-900 text-slate-100 border-b border-slate-800 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* 1. Header & Quem Somos Introduction */}
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20 inline-block">
            QUEM SOMOS
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Três sócios. Um propósito em comum.
          </h2>

          <div className="space-y-3.5 text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            <p>
              A 3P Patrimônio nasceu da união de três sócios que compartilham o mesmo propósito: ajudar pessoas, famílias, profissionais e investidores a utilizarem o consórcio de forma planejada, consciente e estratégica.
            </p>
            <p>
              Atuamos na consultoria e intermediação de consórcios, oferecendo atendimento personalizado para aquisição de imóveis, veículos, máquinas, equipamentos e formação patrimonial.
            </p>
            <p className="text-[#275693] text-xs sm:text-sm">
              Mais do que apresentar valores de crédito e parcelas, buscamos compreender o objetivo de cada cliente e construir uma solução adequada ao seu momento financeiro.
            </p>
          </div>
        </div>

        {/* 2. Three Partners Grid (3 Columns) */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400/90">
              Sócios Consultores
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-[#030919] border border-amber-500/50 hover:border-amber-400 rounded-2xl p-6 shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4 relative overflow-hidden group hover:shadow-amber-500/10 hover:-translate-y-1"
              >
                {/* Gold User Icon */}
                <div className="w-14 h-14 rounded-full border border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7 stroke-[1.75]" />
                </div>

                {/* Partner Name */}
                <h4 className="text-lg font-bold text-amber-400 tracking-tight">
                  {partner.name}
                </h4>

                {/* Partner Bio */}
                <p className="text-[#d4d9e6] text-xs sm:text-[13px] leading-relaxed font-normal">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Differentiator Section (Nosso Diferencial) */}
        <div className="bg-slate-950/90 p-8 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
              NOSSO DIFERENCIAL
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              Grupo exclusivo de consórcio imobiliário com foco em sorteio.
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Trabalhamos com um grupo exclusivo de consórcio imobiliário estruturado para quem busca uma estratégia patrimonial de médio e longo prazo, com foco nas contemplações por sorteio.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Sua configuração permite uma relação diferenciada entre o número de participantes e as contemplações previstas, tornando-o uma alternativa interessante para quem pode planejar a aquisição sem depender de contemplação imediata.
            </p>
          </div>

          {/* 6 Differential Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-5xl mx-auto">
            {[
              'Grupo com número controlado de participantes',
              'Foco em contemplações por sorteio',
              'Possibilidade de utilização de múltiplas cotas',
              'Estratégia voltada ao médio e longo prazo',
              'Suporte consultivo antes da contratação',
              'Acompanhamento e suporte pós-venda'
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors"
              >
                <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm sm:text-base font-semibold text-amber-300 pt-2">
            Planejamento, transparência e acompanhamento em todas as etapas da sua jornada.
          </p>
        </div>

        {/* 4. Institutional Phrase */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border border-amber-500/40 p-6 sm:p-8 rounded-2xl text-center shadow-xl max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Quote className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1.5">
                Frase Institucional
              </span>
              <p className="text-lg sm:text-xl font-bold text-white italic">
                "Estratégia, parceria e confiança para construir patrimônio."
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
