import React, { useState, useEffect } from 'react';
import {
  X, LayoutDashboard, Users, Download, Zap, BarChart2,
  Phone, Mail, MessageSquare, Search, Trash2, Edit3, Check, RefreshCw, Send, Sliders, Globe, Lock, ShieldCheck,
  Instagram, Copy, Sparkles, ExternalLink, Bot, Layers
} from 'lucide-react';
import { Lead, LeadStatus, AnalyticsStats, WebhookConfig } from '../types';
import { BrandLogo } from './BrandLogo';

interface CrmModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onUpdateLeadStatus: (id: string, status: LeadStatus, notes?: string) => void;
  onDeleteLead: (id: string) => void;
  onRefreshLeads: () => void;
  onOpenWPExport?: () => void;
  onOpenPartnerLogin?: () => void;
  onOpenInstagramStudio?: () => void;
  partnerUser?: { loggedIn: boolean; name: string; email: string } | null;
}

export const CrmModal: React.FC<CrmModalProps> = ({
  isOpen,
  onClose,
  leads,
  onUpdateLeadStatus,
  onDeleteLead,
  onRefreshLeads,
  onOpenWPExport,
  onOpenPartnerLogin,
  onOpenInstagramStudio,
  partnerUser
}) => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'table' | 'analytics' | 'automation' | 'instagram'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    enabled: false,
    webhookUrl: '',
    zapierEnabled: true,
    whatsappNotifyEnabled: true,
    whatsappNumber: '5511996876748'
  });

  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookFeedback, setWebhookFeedback] = useState('');

  // Instagram integration specific states
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [simulatingIg, setSimulatingIg] = useState(false);
  const [igSimFeedback, setIgSimFeedback] = useState('');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleSimulateInstagramLead = async () => {
    setSimulatingIg(true);
    setIgSimFeedback('');
    try {
      const res = await fetch('/api/test/instagram-lead', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setIgSimFeedback(`✨ Sucesso! Lead "${data.lead.name}" vindo do Instagram Lead Ads foi criado no CRM!`);
        onRefreshLeads();
      } else {
        setIgSimFeedback('Erro ao simular lead.');
      }
    } catch (e) {
      setIgSimFeedback('Erro na simulação de lead.');
    } finally {
      setSimulatingIg(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
      fetchWebhookSettings();
    }
  }, [isOpen]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    }
  };

  const fetchWebhookSettings = async () => {
    try {
      const res = await fetch('/api/settings/webhook');
      if (res.ok) {
        const data = await res.json();
        setWebhookConfig(data);
      }
    } catch (e) {
      console.error('Error fetching webhook settings:', e);
    }
  };

  const saveWebhookSettings = async () => {
    setSavingWebhook(true);
    setWebhookFeedback('');
    try {
      const res = await fetch('/api/settings/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookConfig)
      });
      if (res.ok) {
        setWebhookFeedback('Configurações de automação salvas com sucesso!');
      }
    } catch (e) {
      setWebhookFeedback('Erro ao salvar automação.');
    } finally {
      setSavingWebhook(false);
    }
  };

  if (!isOpen) return null;

  const statuses: LeadStatus[] = ['Novo', 'Em Contato', 'Análise Enviada', 'Em Negociação', 'Contratado', 'Perdido'];

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.whatsapp.includes(searchTerm) ||
      l.objective.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatusFilter === 'todos' || l.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenWhatsApp = (lead: Lead) => {
    const cleanPhone = lead.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá, ${lead.name}! Sou consultor da 3P Patrimônio. Recebi sua solicitação referente ao objetivo: "${lead.objective}".\nPodemos conversar sobre a análise do crédito de ${lead.creditAmount}?`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const handleSaveNotes = (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      onUpdateLeadStatus(id, lead.status, notesInput);
      setEditingNotesId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="horizontal" size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">Painel de Movimentações dos Sócios</h3>
                {partnerUser?.loggedIn ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{partnerUser.name}</span>
                  </span>
                ) : (
                  <button
                    onClick={onOpenPartnerLogin}
                    className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors"
                  >
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Fazer Login Sócio</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Acompanhamento em tempo real das movimentações, análises de crédito e leads recebidos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenInstagramStudio && (
              <button
                onClick={onOpenInstagramStudio}
                className="bg-slate-900 hover:bg-slate-800 text-pink-400 border border-pink-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all shadow"
                title="Estúdio de Posts Instagram & Kit Canva"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span className="hidden sm:inline">Instagram & Canva</span>
              </button>
            )}

            {onOpenWPExport && (
              <button
                onClick={onOpenWPExport}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold transition-all shadow"
                title="Exportar para WordPress e Hostinger"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">WordPress / Hostinger</span>
              </button>
            )}

            <a
              href="/api/leads/export/csv"
              download
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between gap-4 overflow-x-auto text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'kanban'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Funil Kanban ({leads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'table'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Tabela Detalhada</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Métricas & Conversão</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'automation'
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Automação & Webhook</span>
            </button>

            <button
              onClick={() => setActiveTab('instagram')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 relative ${
                activeTab === 'instagram'
                  ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 border border-pink-500/20'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>Integração Instagram</span>
              <span className="text-[9px] bg-pink-500/30 text-pink-200 px-1.5 py-0.5 rounded-full font-bold uppercase">
                Ads & Direct
              </span>
            </button>
          </div>

          <button
            onClick={onRefreshLeads}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 shrink-0"
            title="Atualizar lista de leads"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950">
          
          {/* 1. KANBAN TAB */}
          {activeTab === 'kanban' && (
            <div className="space-y-4 h-full flex flex-col">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar lead por nome, telefone ou objetivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              {/* Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1 overflow-x-auto pb-4">
                {statuses.map((st) => {
                  const columnLeads = filteredLeads.filter(l => l.status === st);
                  return (
                    <div key={st} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col min-w-[220px]">
                      
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                        <span className="font-bold text-xs text-slate-200">{st}</span>
                        <span className="bg-slate-950 border border-slate-800 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded-full">
                          {columnLeads.length}
                        </span>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {columnLeads.length > 0 ? (
                          columnLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-3 rounded-xl space-y-2 text-xs shadow-md"
                            >
                              <div className="flex items-start justify-between">
                                <strong className="text-white font-bold leading-tight block">{lead.name}</strong>
                                <button
                                  onClick={() => onDeleteLead(lead.id)}
                                  className="text-slate-600 hover:text-red-400 p-0.5"
                                  title="Remover lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-[11px] text-amber-400 font-medium">
                                {lead.objective}
                              </div>

                              <div className="text-[11px] text-slate-400">
                                💰 Crédito: {lead.creditAmount}
                              </div>

                              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                                <span>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                                <span className="uppercase text-amber-500/80 font-mono">{lead.source}</span>
                              </div>

                              {/* Status Switcher Select */}
                              <div className="pt-2 flex items-center gap-1.5">
                                <select
                                  value={lead.status}
                                  onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                                  className="bg-slate-900 text-slate-300 border border-slate-800 rounded-lg text-[10px] px-2 py-1 flex-1 outline-none font-medium"
                                >
                                  {statuses.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>

                                <button
                                  onClick={() => handleOpenWhatsApp(lead)}
                                  className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 p-1.5 rounded-lg transition-colors"
                                  title="Iniciar conversa no WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-[11px] text-slate-600 italic">
                            Nenhum lead
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. TABLE TAB */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Filtrar tabela..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Status:</span>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="todos">Todos os Status</option>
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Nome / Contato</th>
                      <th className="p-3">Objetivo</th>
                      <th className="p-3">Crédito / Parcela</th>
                      <th className="p-3">Prazo / Lance</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3 text-slate-400 font-mono text-[11px]">
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}<br />
                          <span className="text-[10px] text-slate-500">{new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-white">{lead.name}</div>
                          <div className="text-[11px] text-amber-400">{lead.whatsapp}</div>
                          {lead.email && <div className="text-[10px] text-slate-500">{lead.email}</div>}
                        </td>

                        <td className="p-3 font-medium text-slate-200">
                          {lead.objective}
                        </td>

                        <td className="p-3">
                          <div className="text-amber-300 font-semibold">{lead.creditAmount}</div>
                          <div className="text-[11px] text-slate-400">Parc: {lead.monthlyInstallment}</div>
                        </td>

                        <td className="p-3 text-[11px]">
                          <div>Prazo: {lead.timeFrame}</div>
                          <div className="text-slate-400">Lance: {lead.hasBiddingFunds}</div>
                        </td>

                        <td className="p-3">
                          <select
                            value={lead.status}
                            onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="bg-slate-950 border border-slate-800 text-amber-400 text-xs rounded-lg px-2 py-1 outline-none font-bold"
                          >
                            {statuses.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleOpenWhatsApp(lead)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg text-xs"
                            title="Conversar no Whats"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteLead(lead.id)}
                            className="bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 p-1.5 rounded-lg text-xs"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Visualizações Totais</span>
                  <div className="text-3xl font-extrabold text-white font-mono">{stats?.totalViews || 142}</div>
                  <span className="text-[10px] text-slate-500">Acessos à Landing Page</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Leads Capturados</span>
                  <div className="text-3xl font-extrabold text-amber-400 font-mono">{stats?.totalSubmissions || leads.length}</div>
                  <span className="text-[10px] text-slate-500">Formulários Concluídos</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Taxa de Conversão</span>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono">{stats?.conversionRate || 8.4}%</div>
                  <span className="text-[10px] text-slate-500">Lead por Visitante</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Leads por Objetivo Principal
                  </h4>
                  <div className="space-y-2 text-xs">
                    {stats?.leadsByObjective && Object.entries(stats.leadsByObjective).map(([obj, count]) => (
                      <div key={obj} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                        <span className="text-slate-300 font-medium">{obj}</span>
                        <span className="text-amber-400 font-bold font-mono">{count} leads</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Distribuição por Faixa de Crédito
                  </h4>
                  <div className="space-y-2 text-xs">
                    {stats?.leadsByCredit && Object.entries(stats.leadsByCredit).map(([cred, count]) => (
                      <div key={cred} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                        <span className="text-slate-300 font-medium">{cred}</span>
                        <span className="text-emerald-400 font-bold font-mono">{count} leads</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 4. AUTOMATION TAB */}
          {activeTab === 'automation' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Integração Nativa com Automações</h4>
                    <p className="text-xs text-slate-400">
                      Dispare novos leads instantaneamente para o Zapier, Make, n8n, CRM externo ou WhatsApp API.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white">
                    <input
                      type="checkbox"
                      checked={webhookConfig.enabled}
                      onChange={(e) => setWebhookConfig({ ...webhookConfig, enabled: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 rounded"
                    />
                    <span>Ativar Webhook HTTP POST em tempo real</span>
                  </label>

                  <div>
                    <label className="block text-slate-300 mb-1">URL do Webhook (Zapier / Make / n8n / Webhook Customizado):</label>
                    <input
                      type="url"
                      placeholder="https://hooks.zapier.com/hooks/catch/12345/abcde"
                      value={webhookConfig.webhookUrl}
                      onChange={(e) => setWebhookConfig({ ...webhookConfig, webhookUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={webhookConfig.whatsappNotifyEnabled}
                        onChange={(e) => setWebhookConfig({ ...webhookConfig, whatsappNotifyEnabled: e.target.checked })}
                        className="accent-amber-500 w-4 h-4 rounded"
                      />
                      <span>Notificação automática no WhatsApp dos Sócios a cada novo Lead</span>
                    </label>

                    <input
                      type="tel"
                      placeholder="5511996876748"
                      value={webhookConfig.whatsappNumber}
                      onChange={(e) => setWebhookConfig({ ...webhookConfig, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  {webhookFeedback && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold">
                      {webhookFeedback}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={saveWebhookSettings}
                      disabled={savingWebhook}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase px-6 py-2.5 rounded-xl shadow-md"
                    >
                      {savingWebhook ? 'Salvando...' : 'Salvar Configurações de Automação'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 5. INSTAGRAM INTEGRATION TAB */}
          {activeTab === 'instagram' && (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Instagram Banner Header */}
              <div className="bg-gradient-to-r from-pink-950/60 via-slate-900 to-amber-950/40 border border-pink-500/30 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Instagram className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-extrabold text-white">Hub de Integração do Instagram</h4>
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full font-bold">
                        Meta Graph API & Direct
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                      Conecte os Anúncios Patrocinados do Instagram (Lead Ads) e as automações do Instagram Direct (ManyChat, Make, Meta Business Suite) diretamente ao CRM da 3P Patrimônio.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSimulateInstagramLead}
                  disabled={simulatingIg}
                  className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{simulatingIg ? 'Simulando Lead...' : 'Testar Recebimento de Lead IG'}</span>
                </button>
              </div>

              {igSimFeedback && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{igSimFeedback}</span>
                </div>
              )}

              {/* Grid 2 Columns: Lead Ads + ManyChat/Direct */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card 1: Meta / Instagram Lead Ads Native Webhook */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">1. Instagram Lead Ads (Meta Business)</h5>
                      <p className="text-[11px] text-slate-400">Captura automática de formulários instantâneos de anúncios no Instagram.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">URL do Webhook do Instagram:</label>
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                        <code className="text-amber-400 font-mono text-[11px] truncate flex-1">
                          {window.location.origin}/api/webhooks/instagram
                        </code>
                        <button
                          onClick={() => handleCopy(`${window.location.origin}/api/webhooks/instagram`, 'webhook_ig')}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Copiar URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {copiedText === 'webhook_ig' && (
                        <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">✓ URL copiada!</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Meta Verify Token (Token de Verificação):</label>
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                        <code className="text-pink-400 font-mono text-[11px] truncate flex-1">
                          3p_patrimonio_ig_2026
                        </code>
                        <button
                          onClick={() => handleCopy('3p_patrimonio_ig_2026', 'token_ig')}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Copiar Token"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {copiedText === 'token_ig' && (
                        <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">✓ Token copiado!</span>
                      )}
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 space-y-1 text-[11px] text-slate-400">
                      <span className="font-bold text-amber-400 block mb-1">Como configurar no Gerenciador Meta:</span>
                      <p>1. Acesse Meta Business Suite &rarr; Integrações &rarr; Webhooks LeadGen.</p>
                      <p>2. Cole a URL acima e use o Token <code>3p_patrimonio_ig_2026</code>.</p>
                      <p>3. Selecione os formulários de anúncios do Instagram da 3P Patrimônio.</p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Instagram Direct & ManyChat Bot Automation */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">2. Instagram Direct (ManyChat / Make)</h5>
                      <p className="text-[11px] text-slate-400">Receba solicitações via chat/DM do Instagram automaticamente.</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Endpoint para Instagram Direct (POST JSON):</label>
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                        <code className="text-amber-400 font-mono text-[11px] truncate flex-1">
                          {window.location.origin}/api/leads/instagram-direct
                        </code>
                        <button
                          onClick={() => handleCopy(`${window.location.origin}/api/leads/instagram-direct`, 'direct_ig')}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Copiar URL Direct"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {copiedText === 'direct_ig' && (
                        <span className="text-[10px] text-emerald-400 font-bold mt-1 inline-block">✓ URL Direct copiada!</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Exemplo de Payload JSON (ManyChat / Make):</label>
                      <pre className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`{
  "name": "{{user_first_name}} {{user_last_name}}",
  "whatsapp": "{{phone_number}}",
  "instagramUser": "@{{username}}",
  "objective": "Consórcio de Imóveis",
  "creditAmount": "R$ 500.000,00"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

              </div>

              {/* Card 3: UTM Tracking Links for Instagram Bio & Stories */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-amber-400" />
                      <span>Gerador de Links Rasteados para Bio e Stories do Instagram</span>
                    </h5>
                    <p className="text-xs text-slate-400">Use estes links na bio ou em arrasta pra cima/links de Stories para identificar automaticamente no CRM quem veio do Instagram.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                    <span className="text-amber-400 font-bold text-[11px] block">Link para Bio do Instagram (@3ppatrimonio)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/?utm_source=instagram&utm_medium=bio_link&utm_campaign=3ppatrimonio_bio`}
                        className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1.5 rounded-lg flex-1 font-mono truncate"
                      />
                      <button
                        onClick={() => handleCopy(`${window.location.origin}/?utm_source=instagram&utm_medium=bio_link&utm_campaign=3ppatrimonio_bio`, 'bio_link')}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] px-3 py-1.5 rounded-lg border border-amber-500/30 shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2">
                    <span className="text-pink-400 font-bold text-[11px] block">Link para Stories do Instagram (Campanha Cotas)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/?utm_source=instagram&utm_medium=stories&utm_campaign=cotas_investimento`}
                        className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2.5 py-1.5 rounded-lg flex-1 font-mono truncate"
                      />
                      <button
                        onClick={() => handleCopy(`${window.location.origin}/?utm_source=instagram&utm_medium=stories&utm_campaign=cotas_investimento`, 'stories_link')}
                        className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-bold text-[11px] px-3 py-1.5 rounded-lg border border-pink-500/30 shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
