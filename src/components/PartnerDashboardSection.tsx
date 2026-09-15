import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Users, FileSpreadsheet, Instagram, Globe,
  BarChart2, Search, MessageSquare, Trash2, ShieldCheck, Check,
  ExternalLink, Copy, Sparkles, RefreshCw, Zap, Sliders, LogOut,
  ChevronDown, ChevronUp, UserCheck, ArrowRightLeft, CheckCircle2,
  KeyRound, Lock, X, AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Lead, LeadStatus } from '../types';
import { formatSafeDate, formatSafeTime } from '../utils/dateUtils';
import { ErrorBoundary } from './ErrorBoundary';
import { PARTNERS, getPartnerByEmail } from '../utils/partnerConfig';
import { resolveAssetUrl } from '../utils/assets';
import { changePartnerPassword, INITIAL_DEFAULT_PASSWORD } from '../utils/partnerAuth';

interface PartnerDashboardSectionProps {
  partnerUser: { loggedIn: boolean; name: string; email: string } | null;
  leads: Lead[];
  onUpdateLeadStatus: (id: string, status: LeadStatus, notes?: string, assignedTo?: string, assignedPartnerName?: string) => void;
  onDeleteLead: (id: string) => void;
  onRefreshLeads: () => void;
  onLogoutPartner: () => void;
  onOpenInstagramModal?: () => void;
  onOpenWPModal?: () => void;
}

export const PartnerDashboardSection: React.FC<PartnerDashboardSectionProps> = ({
  partnerUser,
  leads,
  onUpdateLeadStatus,
  onDeleteLead,
  onRefreshLeads,
  onLogoutPartner,
  onOpenInstagramModal,
  onOpenWPModal
}) => {
  const [activeTab, setActiveTab] = useState<'crm' | 'instagram' | 'hostinger' | 'metricas'>('crm');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  
  // Filtro de Sócio: se o usuário logado for um dos 3 sócios, filtra inicialmente por ele
  const defaultPartnerFilter = useMemo(() => {
    const email = partnerUser?.email?.toLowerCase() || '';
    if (email.includes('william')) return 'william@3ppatrimonio.com.br';
    if (email.includes('carlos')) return 'carlos@3ppatrimonio.com.br';
    if (email.includes('joao')) return 'joao@3ppatrimonio.com.br';
    return 'todos';
  }, [partnerUser?.email]);

  const [partnerFilter, setPartnerFilter] = useState<string>(defaultPartnerFilter);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Estados de alteração de senha voluntária pelo sócio logado
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentNewPassword, setCurrentNewPassword] = useState('');
  const [currentConfirmPassword, setCurrentConfirmPassword] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');

  if (!partnerUser?.loggedIn) {
    return null;
  }

  const statuses: LeadStatus[] = ['Novo', 'Em Contato', 'Análise Enviada', 'Em Negociação', 'Contratado', 'Perdido'];

  // Contagens por sócio
  const partnerCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'william@3ppatrimonio.com.br': 0,
      'carlos@3ppatrimonio.com.br': 0,
      'joao@3ppatrimonio.com.br': 0
    };
    (leads || []).forEach(lead => {
      const email = lead.assignedTo || '';
      if (counts[email] !== undefined) {
        counts[email]++;
      }
    });
    return counts;
  }, [leads]);

  const filteredLeads = (leads || []).filter((l) => {
    if (!l) return false;
    const name = String(l.name || '').toLowerCase();
    const phone = String(l.whatsapp || '');
    const obj = String(l.objective || '').toLowerCase();
    const search = String(searchTerm || '').toLowerCase();

    const matchesSearch = !search || name.includes(search) || phone.includes(search) || obj.includes(search);
    const matchesStatus = selectedStatus === 'todos' || l.status === selectedStatus;
    const matchesPartner = partnerFilter === 'todos' || l.assignedTo === partnerFilter;

    return matchesSearch && matchesStatus && matchesPartner;
  });

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    const lead = leads.find(l => l.id === id);
    onUpdateLeadStatus(id, newStatus, lead?.notes, lead?.assignedTo, lead?.assignedPartnerName);
    setStatusFeedback(`✓ Status atualizado para "${newStatus}"`);
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleReassignLead = (leadId: string, targetEmail: string) => {
    const targetPartner = PARTNERS.find(p => p.email === targetEmail);
    const lead = leads.find(l => l.id === leadId);
    if (targetPartner && lead) {
      onUpdateLeadStatus(leadId, lead.status, lead.notes, targetPartner.email, targetPartner.name);
      setStatusFeedback(`✓ Lead transferido para ${targetPartner.name}`);
      setTimeout(() => setStatusFeedback(null), 3500);
    }
  };

  const handleOpenWhatsApp = (lead: Lead) => {
    const cleanPhone = String(lead?.whatsapp || '').replace(/\D/g, '');
    const partnerFirstName = partnerUser?.name?.split(' ')[0] || 'consultor';
    const message = encodeURIComponent(
      `Olá, ${lead?.name || 'Cliente'}! Sou o ${partnerFirstName} da 3P Patrimônio. Recebi sua solicitação referente ao objetivo de "${lead?.objective || 'Planejamento Patrimonial'}".\nPodemos conversar sobre a análise do crédito de ${lead?.creditAmount || ''}?`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const handleExport = (format: 'xls' | 'xlsx' = 'xls') => {
    try {
      setIsExporting(true);
      const listToExport = filteredLeads.length > 0 ? filteredLeads : leads;

      if (!listToExport || listToExport.length === 0) {
        setExportFeedback('Nenhum lead encontrado para exportar.');
        setTimeout(() => setExportFeedback(null), 3000);
        setIsExporting(false);
        return;
      }

      const rows = listToExport.map((lead, idx) => ({
        'Nº': idx + 1,
        'Data': formatSafeDate(lead.createdAt),
        'Hora': formatSafeTime(lead.createdAt),
        'Sócio Responsável': lead.assignedPartnerName ? `${lead.assignedPartnerName} (${lead.assignedTo || ''})` : 'Distribuído 3P',
        'Nome Completo': lead.name || '',
        'WhatsApp / Telefone': lead.whatsapp || '',
        'E-mail': lead.email || 'Não informado',
        'Objetivo Principal': lead.objective || '',
        'Volume de Crédito': lead.creditAmount || '',
        'Parcela Estimada': lead.monthlyInstallment || '',
        'Prazo Desejado': lead.timeFrame || '',
        'Possui Recurso p/ Lance': lead.hasBiddingFunds || '',
        'Status Atual': lead.status || 'Novo',
        'Canal de Entrada': lead.source || 'Site Institucional',
        'Origem / Campanha': lead.utmCampaign || lead.utmSource || 'Acesso Direto',
        'Observações': lead.notes || '',
        'Mensagem Inicial': lead.message || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [
        { wch: 6 },  { wch: 14 }, { wch: 10 }, { wch: 28 }, { wch: 26 }, { wch: 20 },
        { wch: 28 }, { wch: 30 }, { wch: 22 }, { wch: 20 }, { wch: 16 },
        { wch: 22 }, { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 35 }, { wch: 40 }
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads 3P Patrimônio');

      const dataHoje = new Date().toISOString().slice(0, 10);
      const filename = `leads_3p_patrimonio_${dataHoje}.${format}`;
      XLSX.writeFile(workbook, filename, { bookType: format === 'xls' ? 'biff8' : 'xlsx' });

      setExportFeedback(`✓ Planilha exportada com ${listToExport.length} leads!`);
      setTimeout(() => setExportFeedback(null), 3500);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      setExportFeedback('Erro ao gerar planilha.');
      setTimeout(() => setExportFeedback(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ErrorBoundary fallbackTitle="Painel de Gestão dos Sócios">
      <section
        id="painel-socios"
        className="w-full bg-slate-950 border-y-2 border-amber-500/40 py-8 px-4 sm:px-6 relative overflow-hidden shadow-2xl transition-all"
      >
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header Superior da Área dos Sócios */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Área Exclusiva dos Sócios
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Painel de Gestão & Divisão de Leads 3P
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conectado como <strong className="text-amber-400">{partnerUser.name}</strong> ({partnerUser.email}) • Distribuição uniforme 1/3 entre os sócios
                </p>
              </div>
            </div>

            {/* Ações Rápidas do Cabeçalho */}
            <div className="flex items-center gap-2">
              <button
                onClick={onRefreshLeads}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all cursor-pointer"
                title="Recarregar Leads"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              <button
                onClick={() => {
                  setChangePasswordError('');
                  setChangePasswordSuccess('');
                  setCurrentNewPassword('');
                  setCurrentConfirmPassword('');
                  setIsChangePasswordOpen(true);
                }}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all cursor-pointer"
                title="Alterar minha senha de sócio"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Alterar Senha</span>
              </button>

              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all cursor-pointer"
                title={isCollapsed ? 'Expandir painel' : 'Recolher painel'}
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4 text-amber-400" /> : <ChevronUp className="w-4 h-4 text-amber-400" />}
                <span className="hidden sm:inline">{isCollapsed ? 'Expandir' : 'Minimizar'}</span>
              </button>

              <button
                onClick={onLogoutPartner}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all cursor-pointer"
                title="Encerrar sessão de sócio"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {!isCollapsed && (
            <>
              {/* Cards de Distribuição Uniforme entre os 3 Sócios */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <UserCheck className="w-4 h-4 text-amber-400" />
                    <span>Divisão Uniforme de Leads entre os 3 Sócios (1/3 para cada)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ⚖️ Balanceamento Automático Ativo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PARTNERS.map((p) => {
                    const count = partnerCounts[p.email] || 0;
                    const percent = leads.length > 0 ? Math.round((count / leads.length) * 100) : 33;
                    const isCurrentUser = partnerUser.email.toLowerCase() === p.email.toLowerCase();
                    const isFilterActive = partnerFilter === p.email;

                    return (
                      <div
                        key={p.id}
                        onClick={() => setPartnerFilter(isFilterActive ? 'todos' : p.email)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isFilterActive
                            ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-500/30 shadow-lg'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-500/40 shrink-0 shadow">
                            <img
                              src={resolveAssetUrl(p.avatar)}
                              alt={p.name}
                              className="w-full h-full object-cover object-top"
                              referrerPolicy="no-referrer"
                            />
                            {isCurrentUser && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-slate-950" title="Você" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                              {isCurrentUser && (
                                <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded font-mono">
                                  VOCÊ
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">{p.email}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-amber-400 font-mono leading-none">
                            {count}
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium">
                            {percent}% do total
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Abas de Navegação Aparente: CRM, Instagram, Hostinger, Métricas */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('crm')}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'crm'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>1. Painel CRM de Leads</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    activeTab === 'crm' ? 'bg-slate-950 text-amber-400 font-black' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {filteredLeads.length}/{leads.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('instagram')}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'instagram'
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Instagram className="w-4 h-4" />
                  <span>2. Instruções do Instagram & Meta</span>
                </button>

                <button
                  onClick={() => setActiveTab('hostinger')}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'hostinger'
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>3. Instruções da Hostinger / WordPress</span>
                </button>

                <button
                  onClick={() => setActiveTab('metricas')}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'metricas'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>4. Métricas do Site</span>
                </button>
              </div>

              {/* CONTEÚDO 1: CRM DE LEADS */}
              {activeTab === 'crm' && (
                <div className="space-y-4">
                  
                  {/* Barra de Busca, Filtros de Sócios e Exportação Excel */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5 flex-1 min-w-[240px] flex-wrap">
                      <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          placeholder="Buscar por nome, WhatsApp ou objetivo..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
                        />
                      </div>

                      {/* Filtro por Sócio */}
                      <select
                        value={partnerFilter}
                        onChange={(e) => setPartnerFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
                      >
                        <option value="todos">Todos os Sócios ({leads.length})</option>
                        <option value="william@3ppatrimonio.com.br">
                          William Lourenço ({partnerCounts['william@3ppatrimonio.com.br'] || 0})
                        </option>
                        <option value="carlos@3ppatrimonio.com.br">
                          Carlos Yoshimori ({partnerCounts['carlos@3ppatrimonio.com.br'] || 0})
                        </option>
                        <option value="joao@3ppatrimonio.com.br">
                          João Silva ({partnerCounts['joao@3ppatrimonio.com.br'] || 0})
                        </option>
                      </select>

                      {/* Filtro por Status */}
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
                      >
                        <option value="todos">Todos os Status</option>
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                        <button
                          onClick={() => setViewMode('kanban')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === 'kanban' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Kanban
                        </button>
                        <button
                          onClick={() => setViewMode('table')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Tabela
                        </button>
                      </div>

                      <button
                        onClick={() => handleExport('xls')}
                        disabled={isExporting}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-black transition-all shadow active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Exportar Planilha Excel com coluna do Sócio Responsável"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Exportar Excel</span>
                      </button>

                      {exportFeedback && (
                        <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/30">
                          {exportFeedback}
                        </span>
                      )}

                      {statusFeedback && (
                        <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 animate-pulse">
                          {statusFeedback}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* VISUALIZAÇÃO KANBAN */}
                  {viewMode === 'kanban' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                      {statuses.map((st) => {
                        const colLeads = filteredLeads.filter(l => l.status === st);
                        return (
                          <div key={st} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-3 flex flex-col min-h-[300px]">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                              <span className="font-extrabold text-xs text-slate-200">{st}</span>
                              <span className="bg-slate-950 border border-slate-800 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                                {colLeads.length}
                              </span>
                            </div>

                            <div className="space-y-2.5 flex-1 overflow-y-auto">
                              {colLeads.length > 0 ? (
                                colLeads.map((lead) => {
                                  const partner = getPartnerByEmail(lead.assignedTo);
                                  return (
                                    <div
                                      key={lead.id}
                                      className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl space-y-2 text-xs shadow-md transition-all"
                                    >
                                      {/* Sócio Responsável Badge */}
                                      <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-900">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          {partner?.avatar && (
                                            <img
                                              src={resolveAssetUrl(partner.avatar)}
                                              alt={partner.name}
                                              className="w-4 h-4 rounded-full object-cover shrink-0"
                                              referrerPolicy="no-referrer"
                                            />
                                          )}
                                          <span className="text-[10px] font-bold text-amber-400 truncate">
                                            {lead.assignedPartnerName || partner?.name || 'Sócio 3P'}
                                          </span>
                                        </div>
                                        
                                        {/* Dropdown de Transferência de Sócio */}
                                        <select
                                          value={lead.assignedTo || ''}
                                          onChange={(e) => handleReassignLead(lead.id, e.target.value)}
                                          className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 rounded px-1 py-0.5 outline-none cursor-pointer hover:text-white hover:border-slate-700"
                                          title="Transferir lead para outro sócio"
                                        >
                                          {PARTNERS.map(p => (
                                            <option key={p.email} value={p.email}>
                                              {p.name.split(' ')[0]}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="flex items-start justify-between gap-1">
                                        <strong className="text-white font-bold leading-tight block">{lead.name}</strong>
                                        <button
                                          onClick={() => onDeleteLead(lead.id)}
                                          className="text-slate-600 hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                                          title="Remover lead"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      <div className="text-[11px] text-amber-400 font-medium">
                                        🎯 {lead.objective}
                                      </div>

                                      <div className="text-[11px] text-slate-300">
                                        💰 Crédito: <strong>{lead.creditAmount}</strong>
                                      </div>

                                      {lead.monthlyInstallment && (
                                        <div className="text-[10px] text-slate-400">
                                          Parcela: {lead.monthlyInstallment}
                                        </div>
                                      )}

                                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                                        <span>{formatSafeDate(lead.createdAt)}</span>
                                        <span className="uppercase text-amber-500 font-mono text-[9px]">{lead.source || 'Site'}</span>
                                      </div>

                                      {/* Troca de status e botão de WhatsApp */}
                                      <div className="pt-1 flex items-center gap-1.5">
                                        <select
                                          value={lead.status}
                                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                          className="bg-slate-900 text-slate-200 border border-slate-700 hover:border-amber-500/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg text-xs sm:text-[11px] px-2.5 py-1.5 min-h-[38px] sm:min-h-[30px] flex-1 outline-none font-semibold cursor-pointer transition-colors touch-manipulation"
                                        >
                                          {statuses.map(s => (
                                            <option key={s} value={s} className="bg-slate-900 text-slate-200">{s}</option>
                                          ))}
                                        </select>

                                        <button
                                          onClick={() => handleOpenWhatsApp(lead)}
                                          className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 p-2 sm:p-1.5 rounded-lg transition-colors cursor-pointer min-h-[38px] min-w-[38px] sm:min-h-[30px] sm:min-w-[30px] flex items-center justify-center"
                                          title="Chamar no WhatsApp"
                                        >
                                          <MessageSquare className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-8 text-slate-600 text-[11px]">
                                  Nenhum lead
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* VISUALIZAÇÃO TABELA */
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                            <tr>
                              <th className="p-3">Data</th>
                              <th className="p-3">Sócio Responsável</th>
                              <th className="p-3">Nome / Contato</th>
                              <th className="p-3">Objetivo</th>
                              <th className="p-3">Crédito</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Origem</th>
                              <th className="p-3 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {filteredLeads.map((lead) => {
                              const partner = getPartnerByEmail(lead.assignedTo);
                              return (
                                <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                                  <td className="p-3 whitespace-nowrap text-slate-400">
                                    {formatSafeDate(lead.createdAt)}
                                    <div className="text-[10px] text-slate-600">{formatSafeTime(lead.createdAt)}</div>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      {partner?.avatar && (
                                        <img
                                          src={resolveAssetUrl(partner.avatar)}
                                          alt={partner.name}
                                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-amber-500/30"
                                          referrerPolicy="no-referrer"
                                        />
                                      )}
                                      <div>
                                        <select
                                          value={lead.assignedTo || ''}
                                          onChange={(e) => handleReassignLead(lead.id, e.target.value)}
                                          className="bg-slate-950 border border-slate-850 text-amber-400 text-xs font-bold rounded px-1.5 py-1 outline-none cursor-pointer hover:border-amber-500/50"
                                        >
                                          {PARTNERS.map(p => (
                                            <option key={p.email} value={p.email}>
                                              {p.name}
                                            </option>
                                          ))}
                                        </select>
                                        <div className="text-[9px] text-slate-500">{lead.assignedTo}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <div className="font-bold text-white">{lead.name}</div>
                                    <div className="text-slate-400 text-[11px]">{lead.whatsapp}</div>
                                    {lead.email && <div className="text-slate-500 text-[10px]">{lead.email}</div>}
                                  </td>
                                  <td className="p-3 text-amber-400 font-medium">
                                    {lead.objective}
                                  </td>
                                  <td className="p-3 font-semibold text-slate-200">
                                    {lead.creditAmount}
                                  </td>
                                  <td className="p-3">
                                    <select
                                      value={lead.status}
                                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                      className="bg-slate-950 border border-slate-700 hover:border-amber-500/60 focus:border-amber-500 text-amber-400 text-xs rounded-lg px-2.5 py-1.5 min-h-[38px] sm:min-h-[32px] outline-none font-bold cursor-pointer transition-colors touch-manipulation"
                                    >
                                      {statuses.map(s => (
                                        <option key={s} value={s} className="bg-slate-900 text-slate-200">{s}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-3 text-slate-400 text-[11px]">
                                    {lead.source || 'Site'}
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleOpenWhatsApp(lead)}
                                        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>WhatsApp</span>
                                      </button>
                                      <button
                                        onClick={() => onDeleteLead(lead.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                                        title="Excluir"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* CONTEÚDO 2: INSTRUÇÕES DO INSTAGRAM */}
              {activeTab === 'instagram' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                        <Instagram className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Conexão com Instagram, Meta Lead Ads e Direct
                        </h3>
                        <p className="text-xs text-slate-400">
                          Receba leads de anúncios e posts patrocinados direto neste painel CRM distribuídos entre os sócios.
                        </p>
                      </div>
                    </div>

                    {onOpenInstagramModal && (
                      <button
                        onClick={onOpenInstagramModal}
                        className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 text-xs px-4 py-2.5 rounded-xl font-extrabold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Abrir Estúdio & Canva</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">Passo 1: Meta Ads</div>
                      <h4 className="text-white font-semibold">Campanhas de Cadastro</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Crie anúncios no Gerenciador de Anúncios da Meta apontando para a Landing Page ou usando formulários nativos do Instagram Lead Ads.
                      </p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="text-pink-400 font-bold uppercase text-[10px] tracking-wider">Passo 2: Webhook / Zapier</div>
                      <h4 className="text-white font-semibold">Sincronização Automática</h4>
                      <p className="text-slate-400 leading-relaxed">
                        Conecte a Meta Lead Ads ao endpoint Webhook da 3P para que novos contatos entrem imediatamente no rodízio uniforme dos 3 sócios.
                      </p>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">Passo 3: Atendimento Ágil</div>
                      <h4 className="text-white font-semibold">WhatsApp em 1 Clique</h4>
                      <p className="text-slate-400 leading-relaxed">
                        O sócio responsável clica no botão do WhatsApp e a mensagem oficial com nome e objetivo do cliente já é aberta pronta para envio.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTEÚDO 3: HOSTINGER / WORDPRESS */}
              {activeTab === 'hostinger' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Publicação na Hostinger & Tema WordPress Oficial
                        </h3>
                        <p className="text-xs text-slate-400">
                          Instruções para subir esta Landing Page completa no seu domínio oficial com suporte a banco de dados.
                        </p>
                      </div>
                    </div>

                    {onOpenWPModal && (
                      <button
                        onClick={onOpenWPModal}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-4 py-2.5 rounded-xl font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Ver Guia Completo Hostinger</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <h4 className="text-white font-bold">Estrutura do Tema WordPress Pronta</h4>
                    <p className="text-slate-400 leading-relaxed">
                      O tema oficial com tabela MySQL customizada para os leads (incluindo o campo <code className="text-amber-400 font-mono">assigned_to</code> para os 3 sócios) já está configurado na pasta <code className="text-amber-400 font-mono">public/wordpress-theme</code>.
                    </p>
                  </div>
                </div>
              )}

              {/* CONTEÚDO 4: MÉTRICAS DO SITE */}
              {activeTab === 'metricas' && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Total de Leads</span>
                    <div className="text-3xl font-extrabold text-amber-400 font-mono">{leads.length}</div>
                    <span className="text-[10px] text-slate-500">Cadastros no CRM</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">William Lourenço</span>
                    <div className="text-3xl font-extrabold text-sky-400 font-mono">
                      {partnerCounts['william@3ppatrimonio.com.br'] || 0}
                    </div>
                    <span className="text-[10px] text-slate-500">william@3ppatrimonio.com.br</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Carlos Yoshimori</span>
                    <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                      {partnerCounts['carlos@3ppatrimonio.com.br'] || 0}
                    </div>
                    <span className="text-[10px] text-slate-500">carlos@3ppatrimonio.com.br</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">João Silva</span>
                    <div className="text-3xl font-extrabold text-purple-400 font-mono">
                      {partnerCounts['joao@3ppatrimonio.com.br'] || 0}
                    </div>
                    <span className="text-[10px] text-slate-500">joao@3ppatrimonio.com.br</span>
                  </div>
                </div>
              )}

            </>
          )}

          {/* Modal de Alteração de Senha do Sócio Logado */}
          {isChangePasswordOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
              <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <button
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Alterar Senha do Sócio</h3>
                    <p className="text-xs text-slate-400">{partnerUser.name} ({partnerUser.email})</p>
                  </div>
                </div>

                {changePasswordError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{changePasswordError}</span>
                  </div>
                )}

                {changePasswordSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{changePasswordSuccess}</span>
                  </div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setChangePasswordError('');
                    setChangePasswordSuccess('');

                    if (!partnerUser?.email) {
                      setChangePasswordError('Sócio não identificado.');
                      return;
                    }

                    if (currentNewPassword.length < 6) {
                      setChangePasswordError('A nova senha deve ter no mínimo 6 caracteres.');
                      return;
                    }

                    if (currentNewPassword === INITIAL_DEFAULT_PASSWORD) {
                      setChangePasswordError(`Por segurança patrimonial, a nova senha não pode ser a senha provisória padrão (${INITIAL_DEFAULT_PASSWORD}).`);
                      return;
                    }

                    if (currentNewPassword !== currentConfirmPassword) {
                      setChangePasswordError('As senhas digitadas não coincidem.');
                      return;
                    }

                    setChangePasswordLoading(true);
                    try {
                      const res = await changePartnerPassword(partnerUser.email, currentNewPassword);
                      if (!res.success) {
                        setChangePasswordError(res.error || 'Erro ao alterar a senha.');
                        setChangePasswordLoading(false);
                        return;
                      }

                      setChangePasswordSuccess('✓ Senha atualizada com sucesso!');
                      setTimeout(() => {
                        setChangePasswordLoading(false);
                        setIsChangePasswordOpen(false);
                        setCurrentNewPassword('');
                        setCurrentConfirmPassword('');
                      }, 1000);
                    } catch {
                      setChangePasswordError('Falha ao comunicar com o servidor.');
                      setChangePasswordLoading(false);
                    }
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">Nova Senha Pessoal</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={currentNewPassword}
                        onChange={(e) => setCurrentNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">Confirmar Nova Senha</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Digite novamente a nova senha"
                        value={currentConfirmPassword}
                        onChange={(e) => setCurrentConfirmPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangePasswordOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={changePasswordLoading}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {changePasswordLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Salvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Salvar Nova Senha
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </section>
    </ErrorBoundary>
  );
};
