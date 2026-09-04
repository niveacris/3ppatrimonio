import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Shield, Lock, AlertCircle, Phone, MessageSquare, Instagram } from 'lucide-react';
import { Lead } from '../types';

interface LeadFormProps {
  preFilledData?: {
    creditAmount?: string;
    monthlyInstallment?: string;
    objective?: string;
  } | null;
  onSuccess: (newLead: Lead) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ preFilledData, onSuccess }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [objective, setObjective] = useState('Comprar um imóvel');
  const [creditAmount, setCreditAmount] = useState('De R$ 300 mil a R$ 500 mil');
  const [monthlyInstallment, setMonthlyInstallment] = useState('De R$ 2.500 a R$ 5.000');
  const [timeFrame, setTimeFrame] = useState('Em até 1 ano');
  const [hasBiddingFunds, setHasBiddingFunds] = useState('Sim');
  const [source, setSource] = useState('Instagram');
  const [instagramUser, setInstagramUser] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(true);
  const [isInstagramVisitor, setIsInstagramVisitor] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Apply pre-filled values if coming from simulator or URL search params
  useEffect(() => {
    if (preFilledData) {
      if (preFilledData.creditAmount) setCreditAmount(preFilledData.creditAmount);
      if (preFilledData.monthlyInstallment) setMonthlyInstallment(preFilledData.monthlyInstallment);
      if (preFilledData.objective) setObjective(preFilledData.objective);
    }

    // Detect if visitor came from Instagram URL or UTM
    const params = new URLSearchParams(window.location.search);
    const utmSource = (params.get('utm_source') || '').toLowerCase();
    if (utmSource.includes('instagram') || utmSource.includes('ig') || document.referrer.includes('instagram.com')) {
      setIsInstagramVisitor(true);
      setSource('Instagram');
    }
  }, [preFilledData]);

  const objectivesList = [
    'Comprar um imóvel',
    'Comprar ou trocar um veículo',
    'Investir em imóveis',
    'Construir patrimônio',
    'Adquirir máquinas ou veículos pesados',
    'Substituir um financiamento',
    'Ainda estou avaliando'
  ];

  const creditAmountsList = [
    'Até R$ 100 mil',
    'De R$ 100 mil a R$ 300 mil',
    'De R$ 300 mil a R$ 500 mil',
    'De R$ 500 mil a R$ 1 milhão',
    'Acima de R$ 1 milhão',
    'Ainda não sei'
  ];

  const installmentsList = [
    'Até R$ 1.000',
    'De R$ 1.000 a R$ 2.500',
    'De R$ 2.500 a R$ 5.000',
    'De R$ 5.000 a R$ 10.000',
    'Acima de R$ 10.000',
    'Prefiro conversar'
  ];

  const timeFramesList = [
    'Preciso do bem imediatamente',
    'Em até 1 ano',
    'Entre 1 e 3 anos',
    'Acima de 3 anos',
    'Não tenho prazo definido'
  ];

  const biddingFundsList = [
    'Sim',
    'Não',
    'Talvez',
    'Prefiro conversar sobre isso'
  ];

  const sourcesList = [
    'Instagram',
    'Facebook',
    'Google',
    'Indicação',
    'WhatsApp',
    'Outro'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu Nome Completo.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.length < 8) {
      setErrorMsg('Por favor, informe um número de WhatsApp válido.');
      return;
    }
    if (!consent) {
      setErrorMsg('É necessário autorizar o contato da 3P Patrimônio para prosseguir.');
      return;
    }

    setLoading(true);

    try {
      const formattedMessage = instagramUser
        ? `[Perfil Instagram: @${instagramUser.replace('@', '')}] ${message}`
        : message;

      const payload = {
        name,
        whatsapp,
        email,
        objective,
        creditAmount,
        monthlyInstallment,
        timeFrame,
        hasBiddingFunds,
        source,
        message: formattedMessage,
        consent,
        utmSource: new URLSearchParams(window.location.search).get('utm_source') || (isInstagramVisitor ? 'instagram' : 'direct'),
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || 'web',
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'landing_page'
      };

      // Detect WordPress REST API endpoint (Hostinger) vs Express local server
      const p3Data = typeof window !== 'undefined' ? (window as any).P3_DATA : null;
      const isWp = p3Data?.api_url || (typeof window !== 'undefined' && !window.location.port.includes('3000') && !window.location.hostname.includes('run.app'));
      const primaryUrl = p3Data?.api_url || (isWp ? '/wp-json/p3/v1/lead' : '/api/leads');
      const fallbackUrl = primaryUrl === '/api/leads' ? '/wp-json/p3/v1/lead' : '/api/leads';

      let response: Response;
      try {
        response = await fetch(primaryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.status === 404) {
          // If primary 404s (e.g. running in WordPress without /api/leads), try fallback
          response = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (errNet) {
        // Network retry on fallback
        response = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      if (response.ok && (data.success || data.id)) {
        setSubmitted(true);
        const createdLead: Lead = {
          id: data.leadId || `lead-${Date.now()}`,
          createdAt: new Date().toISOString(),
          name,
          whatsapp,
          email,
          objective,
          creditAmount,
          monthlyInstallment,
          timeFrame,
          hasBiddingFunds,
          source,
          message,
          consent,
          status: 'Novo'
        };
        onSuccess(createdLead);
      } else {
        setErrorMsg(data.error || 'Não foi possível enviar suas informações. Tente novamente.');
      }
    } catch (err) {
      console.error('Submit lead error:', err);
      // Fallback local save if server fails
      const fallbackLead: Lead = {
        id: `lead-local-${Date.now()}`,
        createdAt: new Date().toISOString(),
        name,
        whatsapp,
        email,
        objective,
        creditAmount,
        monthlyInstallment,
        timeFrame,
        hasBiddingFunds,
        source,
        message,
        consent,
        status: 'Novo'
      };
      setSubmitted(true);
      onSuccess(fallbackLead);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const text = encodeURIComponent(
      `Olá, 3P Patrimônio! Solicitei uma análise de consórcio para ${objective}.\nMeu nome: ${name}\nCrédito pretendido: ${creditAmount}\nParcela: ${monthlyInstallment}`
    );
    window.open(`https://wa.me/5511996876748?text=${text}`, '_blank');
  };

  return (
    <section id="formulario" className="py-16 sm:py-20 text-slate-100 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Bento Tile */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-xl">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/30">
            ANÁLISE PERSONALIZADA
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            RECEBA UMA ANÁLISE PERSONALIZADA
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Preencha as informações abaixo. Um consultor da 3P Patrimônio entrará em contato para compreender seu objetivo e apresentar as possibilidades adequadas ao seu perfil.
          </p>
        </div>

        {/* Form Bento Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          
          {submitted ? (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-white">Solicitação Recebida com Sucesso!</h3>
                <p className="text-slate-300 text-sm max-w-lg mx-auto">
                  Obrigado, <strong className="text-amber-400">{name}</strong>. Nossos consultores já receberam sua ficha para elaboração da sua análise de consórcio personalizada.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl max-w-md mx-auto text-left space-y-3 text-xs">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Resumo do seu Objetivo:</div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Objetivo:</span>
                  <span className="text-white font-bold">{objective}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Crédito Procurado:</span>
                  <span className="text-amber-400 font-bold">{creditAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parcela Confortável:</span>
                  <span className="text-white font-bold">{monthlyInstallment}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Acelerar Atendimento via WhatsApp</span>
                </button>

                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs py-3.5 px-5 rounded-2xl font-semibold"
                >
                  Enviar Nova Solicitação
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Instagram Special Welcome Banner */}
              {(isInstagramVisitor || source === 'Instagram') && (
  <div className="bg-gradient-to-r from-orange-200 via-orange-100 to-amber-100 border border-orange-400 p-4 rounded-2xl flex items-center gap-3 text-xs text-orange-900 shadow-md">
    <div className="w-9 h-9 rounded-xl bg-orange-300 text-orange-900 flex items-center justify-center shrink-0 border border-orange-400">
      <Instagram className="w-5 h-5" />
    </div>
    <div>
      <span className="font-extrabold text-orange-900 block">
        Atendimento Prioritário Instagram @3ppatrimonio
      </span>
      <span className="text-[11px] text-gray-700">
        Você veio do Instagram! Sua solicitação será encaminhada diretamente a um dos consultores sócios da 3P Patrimônio.
      </span>
    </div>
  </div>
)}


              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-300 p-4 rounded-2xl text-xs flex items-center gap-3 font-semibold">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Contato Inicial */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-xs flex items-center justify-center font-mono font-bold" style={{ color: '#aeb9d3' }}>1</span>
                  <span className="font-bold" style={{ color: '#bac6d7' }}>Seus Dados de Contato</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      Nome completo <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva Santos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      WhatsApp <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-200 mb-1.5">
                      E-mail <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="seu.email@exemplo.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-1.5 flex items-center justify-between">
                      <span>Perfil do Instagram</span>
                      <span className="text-slate-600 font-normal text-[9px] uppercase">(opcional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-orange-500 font-bold text-sm">@</span>
                      <input
                        type="text"
                        placeholder="seu.usuario"
                        value={instagramUser}
                        onChange={(e) => setInstagramUser(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Objetivo */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-mono">2</span>
                  <span>Qual é o seu principal objetivo?</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {objectivesList.map((obj) => (
                    <button
                      type="button"
                      key={obj}
                      onClick={() => setObjective(obj)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        objective === obj
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{obj}</span>
                      {objective === obj && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Valor aproximado de crédito */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-mono">3</span>
                  <span>Valor aproximado de crédito pretendido</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {creditAmountsList.map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setCreditAmount(val)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        creditAmount === val
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{val}</span>
                      {creditAmount === val && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Parcela confortável */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-mono">4</span>
                  <span>Parcela mensal confortável</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {installmentsList.map((inst) => (
                    <button
                      type="button"
                      key={inst}
                      onClick={() => setMonthlyInstallment(inst)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        monthlyInstallment === inst
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{inst}</span>
                      {monthlyInstallment === inst && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Prazo e Lances */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quando pretende utilizar o crédito?
                  </label>
                  <select
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  >
                    {timeFramesList.map((tf) => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Possui recursos para lance?
                  </label>
                  <select
                    value={hasBiddingFunds}
                    onChange={(e) => setHasBiddingFunds(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  >
                    {biddingFundsList.map((bf) => (
                      <option key={bf} value={bf}>{bf}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 6: Origem e Mensagem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Como conheceu a 3P Patrimônio?
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white outline-none"
                  >
                    {sourcesList.map((src) => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mensagem ou observação <span className="text-slate-600 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Conte detalhes adicionais sobre o bem que deseja..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2 border-t border-slate-850 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>
                    Autorizo a 3P Patrimônio a entrar em contato por WhatsApp, telefone ou e-mail para responder à minha solicitação de análise.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 text-center space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest px-10 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all inline-flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'ENVIANDO SOLICITAÇÃO...' : 'SOLICITAR ANÁLISE PERSONALIZADA'}</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Seus dados serão tratados com segurança e confidencialidade.</span>
                </div>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
