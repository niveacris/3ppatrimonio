import React, { useState } from 'react';
import { BookOpen, Download, CheckCircle2, Shield, Lock, ArrowRight, FileText, Sparkles, Send, Eye, X, Award, ChevronRight, ChevronLeft, User, Phone, Mail, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { Lead } from '../types';
import { EBOOK_META, EBOOK_CHAPTERS, EbookChapter } from '../data/ebookContent';
import { generateEbookPdf } from '../utils/generateEbookPdf';
import { validateEmail, EmailValidationResult } from '../utils/emailValidator';

interface EbookDownloadProps {
  onSuccess?: (newLead: Lead) => void;
}

export const EbookDownload: React.FC<EbookDownloadProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [readerOpen, setReaderOpen] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const emailValidation = validateEmail(email);

  const handleApplySuggestion = (suggested: string) => {
    setEmail(suggested);
    setEmailConfirmed(true);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailTouched(true);

    if (!name.trim()) {
      setErrorMsg('Por favor, informe seu Nome Completo.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.length < 8) {
      setErrorMsg('Por favor, informe seu WhatsApp com DDD.');
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setErrorMsg(emailCheck.error || 'Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (emailCheck.suggestion && !emailConfirmed) {
      setErrorMsg(`Atenção: Você quis dizer "${emailCheck.suggestedEmail}"? Clique no botão de correção abaixo ou clique novamente em Receber E-book para confirmar.`);
      setEmailConfirmed(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        objective: 'Download de E-book Patrimonial',
        creditAmount: 'A definir',
        monthlyInstallment: 'A definir',
        timeFrame: 'Planejamento de Longo Prazo',
        hasBiddingFunds: 'Não informado',
        source: 'E-book Gratuito (Carlos Yoshimori)',
        message: 'Lead realizou o cadastro para download do e-book: "Como Construir Patrimônio Utilizando Consórcios" por Carlos Yoshimori.',
        consent: true,
        utmSource: 'ebook_download'
      };

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
          response = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (eNet) {
        response = await fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();

      const newLead: Lead = {
        id: (data && data.leadId) || `lead-ebook-${Date.now()}`,
        createdAt: new Date().toISOString(),
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        objective: 'Download de E-book Patrimonial',
        creditAmount: 'A definir',
        monthlyInstallment: 'A definir',
        timeFrame: 'Planejamento de Longo Prazo',
        hasBiddingFunds: 'Não informado',
        source: 'E-book Gratuito (Carlos Yoshimori)',
        message: 'Cadastro para download do e-book "Como Construir Patrimônio Utilizando Consórcios" por Carlos Yoshimori',
        consent: true,
        status: 'Novo'
      };

      if (onSuccess) {
        onSuccess(newLead);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting ebook form:', err);
      // Even if network is offline, allow reading/downloading
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    setDownloadingPdf(true);
    try {
      generateEbookPdf(name, email);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setTimeout(() => setDownloadingPdf(false), 1000);
    }
  };

  const currentChapter = EBOOK_CHAPTERS[activeChapterIndex] || EBOOK_CHAPTERS[0];

  return (
    <section id="ebook" className="py-20 bg-slate-950 text-slate-100 border-b border-slate-800 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Bento Layout */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0c1427] border border-amber-500/30 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: E-book Presentation & 3D Book Cover Visual */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-extrabold uppercase tracking-widest">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>E-BOOK EXCLUSIVO & GRATUITO</span>
                </div>
                <span className="px-3 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-full text-[11px] font-semibold">
                  57 Páginas • 11 Capítulos
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-amber-400 font-bold text-sm sm:text-base uppercase tracking-wider flex items-center gap-1.5">
                  <span>Por Carlos Yoshimori</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[#8d96a4] text-xs font-normal">Sócio 3P Patrimônio</span>
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#d97706] leading-tight tracking-tight">
                  Como Construir Patrimônio Utilizando Consórcios
                </h2>
              </div>

              <p className="text-[#8d96a4] text-sm sm:text-base leading-relaxed">
                Descubra como investidores utilizam planejamento e estratégia para acelerar a formação de patrimônio sem as armadilhas dos juros bancários. Um guia completo com fundamentação jurídica, tributária e financeira.
              </p>

              {/* Author Highlight Card */}
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-[#d97706] text-sm">Sobre o Autor: Carlos Yoshimori</div>
                  <p className="text-[#8d96a4] leading-relaxed">
                    Advogado, especialista em Direito Tributário, Imobiliário e Leilão de Imóveis. Atuou por 23 anos como Auditor Fiscal Tributário da PMSP e é fundador da 3P Patrimônio.
                  </p>
                </div>
              </div>

              {/* What you'll learn badge items */}
              <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[#d97706]">Juros vs Taxa de Administração</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[#d97706]">Estratégia de Múltiplas Cotas</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[#d97706]">Efeito Bola de Neve Patrimonial</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[#d97706]">Valor da Carta Contemplada</span>
                </div>
              </div>

            </div>

            {/* Right Column: Lead Registration Form or Immediate Download Tile */}
            <div className="lg:col-span-6">
              <div className="bg-slate-950/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
                
                {submitted ? (
                  /* Success State with Instant PDF Download & In-App Reader */
                  <div className="text-center space-y-6 py-4 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                        Cadastro Realizado com Sucesso!
                      </span>
                      <h3 className="text-2xl font-black text-white">
                        Seu E-book está liberado
                      </h3>
                      <p className="text-slate-300 text-xs sm:text-sm">
                        Obrigado, <strong className="text-amber-400">{name}</strong>. O e-book oficial de <strong>Carlos Yoshimori</strong> foi liberado e associado ao seu e-mail <strong className="text-emerald-400">{email}</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left text-xs space-y-2.5 max-w-sm mx-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Exemplar Reservado & Validado</span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> E-mail Verificado
                        </span>
                      </div>
                      <div className="text-white truncate"><strong>Nome:</strong> {name}</div>
                      <div className="text-white truncate"><strong>E-mail:</strong> {email}</div>
                      <div className="text-white truncate"><strong>WhatsApp:</strong> {whatsapp}</div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={handleDownloadPdf}
                        disabled={downloadingPdf}
                        className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{downloadingPdf ? 'GERANDO PDF...' : 'Baixar E-book (PDF Completo)'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveChapterIndex(0);
                          setReaderOpen(true);
                        }}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-400 font-bold text-xs px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span>Ler Online na Tela</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setSubmitted(false)}
                        className="text-[11px] text-slate-500 hover:text-slate-300 underline"
                      >
                        Cadastrar outro e-mail ou reabrir formulário
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Registration Form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span>Preencha seus dados para liberar o e-book</span>
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Download imediato em PDF + acesso ao leitor digital online.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="bg-red-500/10 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs font-semibold">
                        {errorMsg}
                      </div>
                    )}

                    {/* Field: Nome Completo */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        Nome Completo <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Seu Nome Completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Field: WhatsApp */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        WhatsApp <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="tel"
                          required
                          placeholder="Ex: (11) 99999-9999"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Field: E-mail com Validação Avançada */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                          E-mail para Envio do E-book <span className="text-amber-400">*</span>
                        </label>
                        {emailTouched && email && emailValidation.isValid && !emailValidation.suggestion && (
                          <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> E-mail Válido
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                          emailTouched && email
                            ? emailValidation.isValid
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                            : 'text-slate-500'
                        }`} />
                        <input
                          type="email"
                          required
                          placeholder="Ex: seu.email@exemplo.com.br"
                          value={email}
                          onBlur={() => setEmailTouched(true)}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (!emailTouched && e.target.value.length > 3) {
                              setEmailTouched(true);
                            }
                            if (errorMsg) setErrorMsg('');
                          }}
                          className={`w-full bg-slate-900 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all ${
                            emailTouched && email
                              ? emailValidation.isDisposable || (!emailValidation.isValid && !emailValidation.suggestion)
                                ? 'border border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/20'
                                : emailValidation.suggestion
                                ? 'border border-amber-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/20'
                                : 'border border-emerald-500/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20'
                              : 'border border-slate-800 focus:border-amber-500'
                          }`}
                        />
                        {emailTouched && email && (
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                            {emailValidation.isValid && !emailValidation.suggestion ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : emailValidation.suggestion ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ) : (
                              <X className="w-4 h-4 text-rose-400" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Sugestão Interativa de Correção de Digitação (ex: gmai.com -> gmail.com) */}
                      {emailTouched && emailValidation.suggestion && emailValidation.suggestedEmail && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Você quis dizer <strong>{emailValidation.suggestedEmail}</strong>?</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplySuggestion(emailValidation.suggestedEmail!)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0"
                          >
                            Corrigir
                          </button>
                        </div>
                      )}

                      {/* Mensagem de Erro de Formato ou Provedor Descartável */}
                      {emailTouched && email && !emailValidation.isValid && (
                        <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 pl-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{emailValidation.error}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider py-4 px-6 rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>{loading ? 'PROCESSANDO...' : 'RECEBER E-BOOK GRATUITO AGORA'}</span>
                      </button>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Seus dados estão protegidos. Não enviamos spam.</span>
                      </div>
                    </div>

                  </form>
                )}

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Interactive In-App Full 57-Page E-book Reader Modal */}
      {readerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] flex flex-col">
            
            {/* Reader Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    3P Patrimônio • Livro Digital Completo (Edição 2026)
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Como Construir Patrimônio Utilizando Consórcios
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition-all active:scale-95"
                  title="Baixar em PDF"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
                </button>

                <button
                  onClick={() => setReaderOpen(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
                  aria-label="Fechar leitor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chapter Selector Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
              {EBOOK_CHAPTERS.map((chap, idx) => (
                <button
                  key={chap.id}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeChapterIndex === idx
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{chap.number ? chap.number : chap.title}</span>
                </button>
              ))}
            </div>

            {/* Chapter Content View */}
            <div className="flex-1 overflow-y-auto pr-3 space-y-6 text-slate-300 text-sm leading-relaxed">
              
              {/* Chapter Header Card */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-2">
                {currentChapter.number && (
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
                    {currentChapter.number}
                  </span>
                )}
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  {currentChapter.title}
                </h4>
                {currentChapter.subtitle && (
                  <p className="text-slate-400 text-sm italic">
                    {currentChapter.subtitle}
                  </p>
                )}
              </div>

              {/* Chapter Sections */}
              {currentChapter.sections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-3">
                  {sec.heading && (
                    <h5 className="text-base font-bold text-amber-300 flex items-center gap-2 pt-2">
                      <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{sec.heading}</span>
                    </h5>
                  )}

                  {sec.subheading && (
                    <div className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-300">
                      {sec.subheading}
                    </div>
                  )}

                  {sec.type === 'callout' && (
                    <div className="bg-amber-500/10 border-l-4 border-amber-400 p-4 rounded-r-xl text-slate-200 text-xs sm:text-sm italic">
                      {typeof sec.content === 'string' ? sec.content : sec.content.join(' ')}
                    </div>
                  )}

                  {sec.type === 'points' && (
                    <div className="bg-slate-950 border border-amber-500/30 p-4 sm:p-5 rounded-2xl space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Destaques Estratégicos</span>
                      </div>
                      {(Array.isArray(sec.content) ? sec.content : [sec.content]).map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.type === 'list' && (
                    <div className="space-y-2 pl-2">
                      {(Array.isArray(sec.content) ? sec.content : [sec.content]).map((item, iIdx) => (
                        <div key={iIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.type === 'qa' && (
                    <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <p>{typeof sec.content === 'string' ? sec.content : sec.content.join(' ')}</p>
                    </div>
                  )}

                  {(!sec.type || sec.type === 'paragraph') && (
                    <div className="space-y-3">
                      {(Array.isArray(sec.content) ? sec.content : [sec.content]).map((p, pIdx) => (
                        <p key={pIdx} className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* End of Chapter Navigation Buttons */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
                <button
                  disabled={activeChapterIndex === 0}
                  onClick={() => setActiveChapterIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Capítulo Anterior</span>
                </button>

                <span className="text-xs text-slate-500 font-mono">
                  {activeChapterIndex + 1} / {EBOOK_CHAPTERS.length}
                </span>

                <button
                  disabled={activeChapterIndex === EBOOK_CHAPTERS.length - 1}
                  onClick={() => setActiveChapterIndex((prev) => Math.min(EBOOK_CHAPTERS.length - 1, prev + 1))}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <span>Próximo Capítulo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Modal Bottom Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">Autor:</span>
                <span>Carlos Yoshimori • 3P Patrimônio Consultoria</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPdf}
                  className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Salvar Arquivo PDF</span>
                </button>
                <button
                  onClick={() => setReaderOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl font-bold"
                >
                  Fechar Leitor
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
