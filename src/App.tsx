import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Solutions } from './components/Solutions';
import { Process } from './components/Process';
import { WealthStrategy } from './components/WealthStrategy';
import { MultiQuotaStrategy } from './components/MultiQuotaStrategy';
import { Simulator } from './components/Simulator';
import { AboutUs } from './components/AboutUs';
import { BrandMeaning } from './components/BrandMeaning';
import { TargetAudience } from './components/TargetAudience';
import { LeadForm } from './components/LeadForm';
import { EbookDownload } from './components/EbookDownload';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { CrmModal } from './components/CrmModal';
import { PartnerLoginModal } from './components/PartnerLoginModal';
import { WordPressExportModal } from './components/WordPressExportModal';
import { InstagramCanvaModal } from './components/InstagramCanvaModal';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { Lead, LeadStatus } from './types';
import { MessageSquare, LayoutDashboard, Lock, Globe, Instagram } from 'lucide-react';

import foundersPhotoUrl from './assets/images/socios.png';
import heroBannerUrl from './assets/images/wealth_planning_hero_1786042869039.jpg';

export default function App() {
  const [isCompactHero, setIsCompactHero] = useState(false);
  const [crmOpen, setCrmOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [wpExportModalOpen, setWpExportModalOpen] = useState(false);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const [partnerUser, setPartnerUser] = useState<{ loggedIn: boolean; name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('3p_partner_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [preFilledFormData, setPreFilledFormData] = useState<{
    creditAmount?: string;
    monthlyInstallment?: string;
    objective?: string;
  } | null>(null);

  useEffect(() => {
    fetchLeads();
    // Track initial page view in backend analytics
    fetch('/api/analytics/pageview', { method: 'POST' }).catch(() => {});
  }, []);

  const handlePartnerLoginSuccess = (partnerName: string, partnerEmail: string) => {
    const session = { loggedIn: true, name: partnerName, email: partnerEmail };
    setPartnerUser(session);
    try {
      localStorage.setItem('3p_partner_session', JSON.stringify(session));
    } catch (e) {}
    setCrmOpen(true);
  };

  const handleLogoutPartner = () => {
    setPartnerUser(null);
    try {
      localStorage.removeItem('3p_partner_session');
    } catch (e) {}
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (data.leads) setLeads(data.leads);
      }
    } catch (e) {
      console.error('Error fetching leads:', e);
    }
  };

  const handleScrollToForm = () => {
    const el = document.getElementById('formulario');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSolution = (solutionTitle: string) => {
    let objectiveVal = 'Comprar um imóvel';
    if (solutionTitle.includes('Veículos')) objectiveVal = 'Comprar ou trocar um veículo';
    else if (solutionTitle.includes('patrimonial')) objectiveVal = 'Construir patrimônio';
    else if (solutionTitle.includes('pesados')) objectiveVal = 'Adquirir máquinas ou veículos pesados';
    else if (solutionTitle.includes('financiamento')) objectiveVal = 'Substituir um financiamento';

    setPreFilledFormData({ objective: objectiveVal });
    handleScrollToForm();
  };

  const handlePreFillFromSimulator = (data: { creditAmount: string; monthlyInstallment: string }) => {
    setPreFilledFormData(data);
    handleScrollToForm();
  };

  const handleNewLeadCreated = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleUpdateLeadStatus = async (id: string, status: LeadStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (e) {
      console.error('Error updating lead status:', e);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (e) {
      console.error('Error deleting lead:', e);
    }
  };

  const handleFloatingWhatsApp = () => {
    let msg = 'Olá! Gostaria de receber uma análise personalizada de consórcio da 3P Patrimônio.';
    if (preFilledFormData?.creditAmount) {
      msg += ` Crédito pretendido: ${preFilledFormData.creditAmount}.`;
    }
    if (preFilledFormData?.objective) {
      msg += ` Objetivo: ${preFilledFormData.objective}.`;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('utm_source')?.toLowerCase().includes('instagram') || document.referrer.includes('instagram.com')) {
      msg += ' (Vim pelo Instagram)';
    }
    window.open(`https://wa.me/5511996876748?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-20 sm:pb-0">
      
      {/* Skip to Main Content Link for Keyboard / Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-amber-400 focus:text-slate-950 focus:font-black focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all"
      >
        Ir para o conteúdo principal
      </a>

      {/* Floating Accessibility Widget */}
      <AccessibilityToolbar />

      {/* Header Landmark */}
      <Header
        onOpenForm={handleScrollToForm}
        onToggleCompactHero={() => setIsCompactHero(!isCompactHero)}
        isCompactHero={isCompactHero}
      />

      {/* Main Content Landmark */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* 1. Início (Hero) */}
        <Hero
          onOpenForm={handleScrollToForm}
          isCompactHero={isCompactHero}
          foundersPhotoUrl={foundersPhotoUrl}
          heroBannerUrl={heroBannerUrl}
        />

        {/* 2. Sobre Nós & Marca */}
        <AboutUs foundersPhotoUrl={foundersPhotoUrl} />
        <BrandMeaning />

        {/* 3. Como Funciona */}
        <Process onOpenForm={handleScrollToForm} />

        {/* 4. Soluções & Estratégia Patrimonial */}
        <Solutions onSelectSolution={handleSelectSolution} />
        <WealthStrategy onOpenForm={handleScrollToForm} />
        <MultiQuotaStrategy onOpenForm={handleScrollToForm} />
        <TargetAudience onOpenForm={handleScrollToForm} />

        {/* 5. Simulador Interativo & E-book Gratuito */}
        <EbookDownload onSuccess={handleNewLeadCreated} />
        <Simulator onPreFillForm={handlePreFillFromSimulator} />

        {/* 6. Dúvidas, Formulário & FAQ */}
        <LeadForm
          preFilledData={preFilledFormData}
          onSuccess={handleNewLeadCreated}
        />
        <FAQ />
        <FinalCTA onOpenForm={handleScrollToForm} />
      </main>

      {/* Footer Landmark with Administrative Area */}
      <Footer 
        onOpenForm={handleScrollToForm} 
        onOpenCRM={() => setCrmOpen(true)}
        onOpenPartnerLogin={() => setLoginModalOpen(true)}
        onOpenInstagramStudio={() => setInstagramModalOpen(true)} 
        onOpenWPExport={() => setWpExportModalOpen(true)}
        partnerUser={partnerUser}
        onLogoutPartner={handleLogoutPartner}
        leadCount={leads.length}
      />

      {/* Floating Sticky Actions (Desktop) */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-3">
        {/* Floating WhatsApp button */}
        <button
          onClick={handleFloatingWhatsApp}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-3.5 rounded-full shadow-2xl shadow-emerald-500/40 transition-all hover:scale-110 flex items-center justify-center group"
          title="Falar no WhatsApp"
          aria-label="Falar no WhatsApp"
        >
          <MessageSquare className="w-6 h-6 fill-slate-950" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 text-xs font-extrabold uppercase">
            Falar no WhatsApp
          </span>
        </button>

        {/* Floating CRM shortcut */}
        <button
          onClick={() => setCrmOpen(true)}
          className="bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-400 p-3 rounded-full shadow-xl transition-all hover:scale-105 flex items-center justify-center relative"
          title="Abrir CRM Administrador"
          aria-label="Abrir CRM Administrador"
        >
          <LayoutDashboard className="w-5 h-5" />
          {leads.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {leads.length}
            </span>
          )}
        </button>
      </div>

      {/* Sticky Bottom Action Bar for Mobile Phones */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2.5 px-3 flex items-center justify-between gap-2 shadow-2xl">
        <button
          onClick={handleFloatingWhatsApp}
          className="flex-1 bg-emerald-500 active:bg-emerald-400 text-slate-950 font-black text-xs uppercase py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
          aria-label="Falar no WhatsApp"
        >
          <MessageSquare className="w-4 h-4 fill-slate-950" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={handleScrollToForm}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 active:from-amber-400 active:to-amber-300 text-slate-950 font-black text-xs uppercase py-3 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
          aria-label="Simular Crédito"
        >
          <span>Simular Crédito</span>
        </button>

        <button
          onClick={() => setCrmOpen(true)}
          className="bg-slate-900 border border-slate-800 active:bg-slate-800 text-amber-400 p-3 rounded-xl flex items-center justify-center relative shrink-0"
          title="Abrir CRM"
          aria-label="Abrir CRM Administrador"
        >
          <LayoutDashboard className="w-4 h-4" />
          {leads.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {leads.length}
            </span>
          )}
        </button>
      </div>

      {/* Admin CRM Lead Management Modal */}
      <CrmModal
        isOpen={crmOpen}
        onClose={() => setCrmOpen(false)}
        leads={leads}
        onUpdateLeadStatus={handleUpdateLeadStatus}
        onDeleteLead={handleDeleteLead}
        onRefreshLeads={fetchLeads}
        onOpenWPExport={() => setWpExportModalOpen(true)}
        onOpenPartnerLogin={() => setLoginModalOpen(true)}
        onOpenInstagramStudio={() => setInstagramModalOpen(true)}
        partnerUser={partnerUser}
      />

      {/* Login dos Sócios Modal */}
      <PartnerLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handlePartnerLoginSuccess}
      />

      {/* WordPress & Hostinger Export Guide Modal */}
      <WordPressExportModal
        isOpen={wpExportModalOpen}
        onClose={() => setWpExportModalOpen(false)}
      />

      {/* Instagram & Canva Brand Studio Modal */}
      <InstagramCanvaModal
        isOpen={instagramModalOpen}
        onClose={() => setInstagramModalOpen(false)}
      />

    </div>
  );
}
