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
import { SectionDiscoveryBar } from './components/SectionDiscoveryBar';
import { RevealedSectionWrapper } from './components/RevealedSectionWrapper';
import { PartnerDashboardSection } from './components/PartnerDashboardSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Lead, LeadStatus } from './types';
import { MessageSquare, LayoutDashboard, Lock, Globe, Instagram } from 'lucide-react';
import { syncPendingVaultLeads, getLocalVaultLeads, saveLeadStatusOverride, getLeadStatusOverrides, removeLeadFromLocalVault } from './utils/leadsStorage';
import { distributeLeadsUniformly, getNextPartnerForLead } from './utils/partnerConfig';

export default function App() {
  const [isCompactHero, setIsCompactHero] = useState(false);
  const [crmOpen, setCrmOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [wpExportModalOpen, setWpExportModalOpen] = useState(false);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Progressive section visibility: hide secondary sections until clicked in the menu
  const [revealedSections, setRevealedSections] = useState<{
    about: boolean;       // #sobre-nos (Quem Somos)
    process: boolean;     // #como-funciona
    solutions: boolean;   // #solucoes
    ebook: boolean;       // #ebook
    simulator: boolean;   // #simulador
    faq: boolean;         // #duvidas
  }>({
    about: false,
    process: false,
    solutions: false,
    ebook: false,
    simulator: false,
    faq: false,
  });

  const [showAllSections, setShowAllSections] = useState(false);
  
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
    // Sincroniza eventuais cadastros retidos offline antes de buscar do servidor
    syncPendingVaultLeads()
      .catch(() => {})
      .finally(() => {
        fetchLeads();
      });

    // Track initial page view in backend analytics
    fetch('/api/analytics/pageview', { method: 'POST' }).catch(() => {});
  }, []);

  const handlePartnerLoginSuccess = (partnerName: string, partnerEmail: string) => {
    const session = { loggedIn: true, name: partnerName, email: partnerEmail };
    setPartnerUser(session);
    try {
      localStorage.setItem('3p_partner_session', JSON.stringify(session));
    } catch (e) {}
    setLoginModalOpen(false);
    fetchLeads();
    
    // Rola suavemente até o módulo de CRM, Instagram e Hostinger aparente na página
    setTimeout(() => {
      const section = document.getElementById('painel-socios');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleOpenPartnerSectionOrModal = () => {
    const section = document.getElementById('painel-socios');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setCrmOpen(true);
    }
  };

  const handleLogoutPartner = () => {
    setPartnerUser(null);
    try {
      localStorage.removeItem('3p_partner_session');
    } catch (e) {}
  };

  const fetchLeads = async () => {
    try {
      const overrides = getLeadStatusOverrides();
      const p3Data = typeof window !== 'undefined' ? (window as any).P3_DATA : null;
      const isWp = p3Data?.api_url || (typeof window !== 'undefined' && !window.location.port.includes('3000') && !window.location.hostname.includes('run.app'));
      const primaryUrl = isWp ? (p3Data?.api_leads || '/wp-json/p3/v1/leads') : '/api/leads';
      const fallbackUrl = primaryUrl === '/api/leads' ? (p3Data?.api_leads || '/wp-json/p3/v1/leads') : '/api/leads';

      let res = await fetch(primaryUrl);
      if (!res.ok && res.status === 404) {
        res = await fetch(fallbackUrl);
      }
      if (res.ok) {
        const data = await res.json();
        if (data.leads && Array.isArray(data.leads)) {
          // Aplica os overrides locais para manter status alterados no celular
          const serverLeads: Lead[] = data.leads.map((l: Lead) => {
            const ov = overrides[l.id];
            if (ov) {
              return {
                ...l,
                status: ov.status,
                notes: ov.notes !== undefined ? ov.notes : l.notes,
                assignedTo: ov.assignedTo || l.assignedTo,
                assignedPartnerName: ov.assignedPartnerName || l.assignedPartnerName
              };
            }
            return l;
          });

          // Mescla com leads do cofre local que ainda não foram gravados no servidor
          const vaultItems = getLocalVaultLeads();
          const unsyncedLeads: Lead[] = vaultItems
            .filter(v => !v.synced && !serverLeads.some((l: Lead) => l.whatsapp === v.data.whatsapp))
            .map(v => {
              const ov = overrides[v.id];
              return {
                id: v.id,
                createdAt: v.timestamp,
                name: v.data.name,
                whatsapp: v.data.whatsapp,
                email: v.data.email,
                objective: v.data.objective,
                creditAmount: v.data.creditAmount || 'A definir',
                monthlyInstallment: v.data.monthlyInstallment || '',
                timeFrame: v.data.timeFrame,
                hasBiddingFunds: v.data.hasBiddingFunds,
                source: v.data.source || 'Cofre Local',
                message: v.data.message || '',
                consent: v.data.consent,
                status: ov ? ov.status : ((v.data.status as LeadStatus) || 'Novo'),
                notes: ov?.notes !== undefined ? ov.notes : v.data.notes,
                utmSource: v.data.utmSource,
                utmMedium: v.data.utmMedium,
                utmCampaign: v.data.utmCampaign,
                assignedTo: ov?.assignedTo || v.data.assignedTo,
                assignedPartnerName: ov?.assignedPartnerName || v.data.assignedPartnerName
              };
            });

          const distributed = distributeLeadsUniformly([...unsyncedLeads, ...serverLeads]);
          setLeads(distributed);
          return;
        }
      }
    } catch (e) {
      console.error('Error fetching leads:', e);
    }

    // Fallback: em caso de falha de rede ou modo offline no celular, carrega do cofre local
    const overrides = getLeadStatusOverrides();
    const vaultItems = getLocalVaultLeads();
    if (vaultItems.length > 0) {
      const localLeads: Lead[] = vaultItems.map(v => {
        const ov = overrides[v.id];
        return {
          id: v.id,
          createdAt: v.timestamp,
          name: v.data.name,
          whatsapp: v.data.whatsapp,
          email: v.data.email,
          objective: v.data.objective,
          creditAmount: v.data.creditAmount || 'A definir',
          monthlyInstallment: v.data.monthlyInstallment || '',
          timeFrame: v.data.timeFrame,
          hasBiddingFunds: v.data.hasBiddingFunds,
          source: v.data.source || 'Cofre Local',
          message: v.data.message || '',
          consent: v.data.consent,
          status: ov ? ov.status : ((v.data.status as LeadStatus) || 'Novo'),
          notes: ov?.notes !== undefined ? ov.notes : v.data.notes,
          utmSource: v.data.utmSource,
          utmMedium: v.data.utmMedium,
          utmCampaign: v.data.utmCampaign,
          assignedTo: ov?.assignedTo || v.data.assignedTo,
          assignedPartnerName: ov?.assignedPartnerName || v.data.assignedPartnerName
        };
      });
      setLeads(distributeLeadsUniformly(localLeads));
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
    setLeads((prev) => {
      let leadWithPartner = { ...newLead };
      if (!leadWithPartner.assignedTo) {
        const nextPartner = getNextPartnerForLead(prev);
        leadWithPartner.assignedTo = nextPartner.email;
        leadWithPartner.assignedPartnerName = nextPartner.name;
      }
      return [leadWithPartner, ...prev];
    });
  };

  const handleUpdateLeadStatus = async (
    id: string,
    status: LeadStatus,
    notes?: string,
    assignedTo?: string,
    assignedPartnerName?: string
  ) => {
    // 1. ATUALIZAÇÃO OTIMISTA IMEDIATA NO ESTADO REACT (Resposta instantânea no celular)
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? {
        ...l,
        status,
        notes: notes !== undefined ? notes : l.notes,
        assignedTo: assignedTo !== undefined ? assignedTo : l.assignedTo,
        assignedPartnerName: assignedPartnerName !== undefined ? assignedPartnerName : l.assignedPartnerName
      } : l))
    );

    // 2. SALVA LOCALMENTE NO NAVEGADOR (Garante que a mudança não se perde nem com reload ou sem sinal)
    saveLeadStatusOverride(id, status, notes, assignedTo, assignedPartnerName);

    // 3. SINCRONIZAÇÃO RESILIENTE COM O SERVIDOR (Aceita POST e PATCH, REST API e AJAX)
    try {
      const p3Data = typeof window !== 'undefined' ? (window as any).P3_DATA : null;
      const isWp = p3Data?.api_url || (typeof window !== 'undefined' && !window.location.port.includes('3000') && !window.location.hostname.includes('run.app'));
      
      const wpBase = p3Data?.api_url ? p3Data.api_url.replace(/\/lead$/, '') : '/wp-json/p3/v1';
      const primaryUrl = isWp ? `${wpBase}/lead/${id}` : `/api/leads/${id}`;
      const fallbackUrl = primaryUrl.startsWith('/api') ? `${wpBase}/lead/${id}` : `/api/leads/${id}`;

      const payload = JSON.stringify({ status, notes, assignedTo, assignedPartnerName });
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'PATCH'
      };
      if (p3Data?.nonce) {
        headers['X-WP-Nonce'] = p3Data.nonce;
      }

      // Tenta primeiro POST (compatível com todas as operadoras móveis e firewalls)
      let res = await fetch(primaryUrl, {
        method: 'POST',
        headers,
        body: payload
      });

      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await fetch(primaryUrl, {
          method: 'PATCH',
          headers,
          body: payload
        });
      }

      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await fetch(fallbackUrl, {
          method: 'POST',
          headers,
          body: payload
        });
        if (!res.ok) {
          res = await fetch(fallbackUrl, {
            method: 'PATCH',
            headers,
            body: payload
          });
        }
      }

      // Fallback via admin-ajax.php para WordPress se REST API for bloqueada por segurança
      if (!res.ok && isWp && p3Data?.ajax_url) {
        const formData = new URLSearchParams();
        formData.append('action', 'p3_update_lead_status');
        formData.append('security', p3Data.ajax_nonce || '');
        formData.append('id', id);
        formData.append('status', status);
        if (notes) formData.append('notes', notes);

        await fetch(p3Data.ajax_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
      }
    } catch (e) {
      console.warn('Erro na sincronização de status com o servidor (salvo localmente):', e);
    }
  };

  const handleDeleteLead = async (id: string) => {
    // 1. Remoção otimista imediata da tela
    setLeads((prev) => prev.filter((l) => l.id !== id));
    removeLeadFromLocalVault(id);

    try {
      const p3Data = typeof window !== 'undefined' ? (window as any).P3_DATA : null;
      const isWp = p3Data?.api_url || (typeof window !== 'undefined' && !window.location.port.includes('3000') && !window.location.hostname.includes('run.app'));
      const wpBase = p3Data?.api_url ? p3Data.api_url.replace(/\/lead$/, '') : '/wp-json/p3/v1';
      const primaryUrl = isWp ? `${wpBase}/lead/${id}` : `/api/leads/${id}`;
      const fallbackUrl = primaryUrl.startsWith('/api') ? `${wpBase}/lead/${id}` : `/api/leads/${id}`;

      let res = await fetch(primaryUrl, { method: 'DELETE' });
      if (!res.ok && res.status === 404) {
        res = await fetch(fallbackUrl, { method: 'DELETE' });
      }

      if (!res.ok && isWp && p3Data?.ajax_url) {
        const formData = new URLSearchParams();
        formData.append('action', 'p3_delete_lead');
        formData.append('security', p3Data.ajax_nonce || '');
        formData.append('id', id);

        await fetch(p3Data.ajax_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
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

  // Progressive navigation handler: reveals section on demand and smoothly scrolls
  const handleNavigate = (href: string) => {
    const targetId = href.replace('#', '').toLowerCase();

    if (targetId === 'socios' || targetId === 'login' || targetId === 'crm' || targetId === 'admin') {
      if (partnerUser?.loggedIn) {
        setCrmOpen(true);
      } else {
        setLoginModalOpen(true);
      }
      return;
    }

    if (targetId === 'sobre-nos' || targetId === 'quem-somos') {
      setRevealedSections((prev) => ({ ...prev, about: true }));
    } else if (targetId === 'como-funciona') {
      setRevealedSections((prev) => ({ ...prev, process: true }));
    } else if (targetId === 'solucoes') {
      setRevealedSections((prev) => ({ ...prev, solutions: true }));
    } else if (targetId === 'ebook') {
      setRevealedSections((prev) => ({ ...prev, ebook: true }));
    } else if (targetId === 'simulador') {
      setRevealedSections((prev) => ({ ...prev, simulator: true }));
    } else if (targetId === 'duvidas') {
      setRevealedSections((prev) => ({ ...prev, faq: true }));
    }

    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  // Handle URL hash and query params on initial page load if direct link was used
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash?.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash.includes('socio') || hash.includes('login') || hash.includes('crm') || params.get('socios') || params.get('login') || params.get('crm')) {
        setTimeout(() => {
          let hasSession = false;
          try {
            const saved = localStorage.getItem('3p_partner_session');
            if (saved && JSON.parse(saved)?.loggedIn) {
              hasSession = true;
            }
          } catch {}

          if (hasSession) {
            setCrmOpen(true);
          } else {
            setLoginModalOpen(true);
          }
        }, 150);
      } else if (window.location.hash) {
        handleNavigate(window.location.hash);
      }
    }
  }, []);

  const handleToggleSection = (
    key: 'about' | 'process' | 'solutions' | 'ebook' | 'simulator' | 'faq',
    targetId: string
  ) => {
    setRevealedSections((prev) => {
      const nextState = !prev[key];
      if (nextState) {
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
      return { ...prev, [key]: nextState };
    });
  };

  const handleToggleAllSections = () => {
    if (showAllSections) {
      setShowAllSections(false);
      setRevealedSections({
        about: false,
        process: false,
        solutions: false,
        ebook: false,
        simulator: false,
        faq: false,
      });
      document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowAllSections(true);
      setRevealedSections({
        about: true,
        process: true,
        solutions: true,
        ebook: true,
        simulator: true,
        faq: true,
      });
    }
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

      {/* Barra Superior de Sócio Conectado com Acesso Direto ao CRM */}
      {partnerUser?.loggedIn && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold px-3 py-2 text-xs shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Área do Sócio
              </span>
              <span className="truncate hidden sm:inline">Conectado: <strong>{partnerUser.name}</strong></span>
              <span className="text-[11px] bg-slate-950/20 px-2 py-0.5 rounded-full font-mono font-black">
                {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenPartnerSectionOrModal}
                className="bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-white px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow transition-all active:scale-95"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Ver CRM & Painel dos Sócios</span>
              </button>
              <button
                onClick={handleLogoutPartner}
                className="bg-slate-950/15 hover:bg-slate-950/30 text-slate-950 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors"
                title="Sair da sessão"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Landmark */}
      <Header
        onOpenForm={handleScrollToForm}
        onToggleCompactHero={() => setIsCompactHero(!isCompactHero)}
        isCompactHero={isCompactHero}
        onNavigate={handleNavigate}
        revealedSections={revealedSections}
        showAllSections={showAllSections}
        partnerUser={partnerUser}
        onOpenCRM={handleOpenPartnerSectionOrModal}
        onOpenPartnerLogin={() => setLoginModalOpen(true)}
        onLogoutPartner={handleLogoutPartner}
        leadCount={leads.length}
      />

      {/* Main Content Landmark */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Painel do Sócio Aparente na Página: CRM, Instagram e Hostinger */}
        {partnerUser?.loggedIn && (
          <PartnerDashboardSection
            partnerUser={partnerUser}
            leads={leads}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onDeleteLead={handleDeleteLead}
            onRefreshLeads={fetchLeads}
            onLogoutPartner={handleLogoutPartner}
            onOpenInstagramModal={() => setInstagramModalOpen(true)}
            onOpenWPModal={() => setWpExportModalOpen(true)}
          />
        )}

        {/* 1. Início (Hero) - Always Visible */}
        <Hero
          onOpenForm={handleScrollToForm}
          isCompactHero={isCompactHero}
        />

        {/* Interactive Quick Discovery Bar between essential sections and form */}
        <SectionDiscoveryBar
          revealedSections={revealedSections}
          showAllSections={showAllSections}
          onToggleSection={handleToggleSection}
          onToggleAll={handleToggleAllSections}
          onOpenForm={handleScrollToForm}
        />

        {/* 2. Quem Somos & Marca (Revealed on-demand via menu or discovery bar) */}
        {(showAllSections || revealedSections.about) && (
          <RevealedSectionWrapper
            sectionName="Quem Somos"
            onDismiss={() => setRevealedSections((prev) => ({ ...prev, about: false }))}
            onScrollToTop={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <AboutUs />
            <BrandMeaning />
          </RevealedSectionWrapper>
        )}

        {/* 3. Como Funciona (Revealed on-demand via menu or discovery bar) */}
        {(showAllSections || revealedSections.process) && (
          <RevealedSectionWrapper
            sectionName="Como Funciona"
            onDismiss={() => setRevealedSections((prev) => ({ ...prev, process: false }))}
            onScrollToTop={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Process onOpenForm={handleScrollToForm} />
          </RevealedSectionWrapper>
        )}

        {/* 4. Soluções & Estratégia Patrimonial (Revealed on-demand via menu or discovery bar) */}
        {(showAllSections || revealedSections.solutions) && (
          <RevealedSectionWrapper
            sectionName="Soluções & Estratégia Patrimonial"
            onDismiss={() => setRevealedSections((prev) => ({ ...prev, solutions: false }))}
            onScrollToTop={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Solutions onSelectSolution={handleSelectSolution} />
            <WealthStrategy onOpenForm={handleScrollToForm} />
            <MultiQuotaStrategy onOpenForm={handleScrollToForm} />
            <TargetAudience onOpenForm={handleScrollToForm} />
          </RevealedSectionWrapper>
        )}

        {/* 5. E-book Gratuito (Revealed on-demand via menu or discovery bar) */}
        {(showAllSections || revealedSections.ebook) && (
          <RevealedSectionWrapper
            sectionName="E-book Gratuito"
            onDismiss={() => setRevealedSections((prev) => ({ ...prev, ebook: false }))}
            onScrollToTop={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <EbookDownload onSuccess={handleNewLeadCreated} />
          </RevealedSectionWrapper>
        )}

        {/* 6. Simulador Interativo (Revealed on-demand via menu or discovery bar) */}
        {(showAllSections || revealedSections.simulator) && (
          <RevealedSectionWrapper
            sectionName="Simulador Interativo"
            onDismiss={() => setRevealedSections((prev) => ({ ...prev, simulator: false }))}
            onScrollToTop={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Simulator onPreFillForm={handlePreFillFromSimulator} />
          </RevealedSectionWrapper>
        )}

        {/* 7. Formulário de Análise Personalizada - Always Visible */}
        <LeadForm
          preFilledData={preFilledFormData}
          onSuccess={handleNewLeadCreated}
          existingLeads={leads}
        />

        {/* 8. Dúvidas Frequentes & FAQ (Revealed on-demand via menu or discovery bar) */}
        {(showAllSections || revealedSections.faq) && (
          <RevealedSectionWrapper
            sectionName="Dúvidas Frequentes & Perguntas"
            onDismiss={() => setRevealedSections((prev) => ({ ...prev, faq: false }))}
            onScrollToTop={() => document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FAQ />
            <FinalCTA onOpenForm={handleScrollToForm} />
          </RevealedSectionWrapper>
        )}
      </main>

      {/* Footer Landmark with Administrative Area */}
      <Footer 
        onOpenForm={handleScrollToForm} 
        onNavigate={handleNavigate}
        onOpenCRM={handleOpenPartnerSectionOrModal}
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

        {/* Floating CRM shortcut - Visível apenas para o sócio autenticado */}
        {partnerUser?.loggedIn && (
          <button
            onClick={handleOpenPartnerSectionOrModal}
            className="bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-400 p-3 rounded-full shadow-xl transition-all hover:scale-105 flex items-center justify-center relative"
            title="Abrir Painel CRM"
            aria-label="Abrir Painel CRM"
          >
            <LayoutDashboard className="w-5 h-5" />
            {leads.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {leads.length}
              </span>
            )}
          </button>
        )}
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

        {partnerUser?.loggedIn && (
          <button
            onClick={handleOpenPartnerSectionOrModal}
            className="bg-slate-900 border border-slate-800 active:bg-slate-800 text-amber-400 p-3 rounded-xl flex items-center justify-center relative shrink-0"
            title="Abrir Painel CRM"
            aria-label="Abrir Painel CRM"
          >
            <LayoutDashboard className="w-4 h-4" />
            {leads.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {leads.length}
              </span>
            )}
          </button>
        )}
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
