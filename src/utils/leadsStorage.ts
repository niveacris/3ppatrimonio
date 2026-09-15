import { Lead, LeadStatus } from '../types';

const STORAGE_KEY = 'p3_leads_vault_v1';
const STATUS_OVERRIDES_KEY = 'p3_leads_status_overrides_v1';

export interface StoredLeadRecord {
  id: string;
  timestamp: string;
  source: string;
  synced: boolean;
  serverId?: string;
  data: Partial<Lead> & {
    name: string;
    whatsapp: string;
    email?: string;
    objective: string;
    creditAmount?: string;
    monthlyInstallment?: string;
    timeFrame?: string;
    hasBiddingFunds?: string;
    message?: string;
    consent: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    assignedTo?: string;
    assignedPartnerName?: string;
  };
}

/**
 * Salva um lead no cofre local do navegador (localStorage)
 * Isso garante persistência imediata mesmo se a rede falhar ou a Hostinger oscilar.
 */
export function saveLeadToLocalVault(
  data: StoredLeadRecord['data'],
  synced = false,
  serverId?: string
): StoredLeadRecord {
  const record: StoredLeadRecord = {
    id: `vault-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date().toISOString(),
    source: data.source || 'Formulário do Site',
    synced,
    serverId,
    data
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: StoredLeadRecord[] = raw ? JSON.parse(raw) : [];
    // Evita duplicatas pelo mesmo whatsapp e timestamp recente (últimos 3 minutos)
    const filtered = existing.filter(
      item => item.data.whatsapp !== data.whatsapp || Date.now() - new Date(item.timestamp).getTime() > 180000
    );
    filtered.unshift(record);
    // Guarda até 100 registros locais no cofre
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 100)));
  } catch (err) {
    console.warn('[3P Vault] Aviso ao salvar no localStorage:', err);
  }

  return record;
}

/**
 * Marca um lead salvo localmente como sincronizado com o servidor
 */
export function markLeadAsSynced(localVaultId: string, serverId?: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const existing: StoredLeadRecord[] = JSON.parse(raw);
    const updated = existing.map(item => {
      if (item.id === localVaultId) {
        return { ...item, synced: true, serverId: serverId || item.serverId };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[3P Vault] Aviso ao marcar sincronização:', err);
  }
}

/**
 * Retorna todos os leads gravados no cofre local do navegador
 */
export function getLocalVaultLeads(): StoredLeadRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

/**
 * Verifica se um determinado e-mail já foi cadastrado localmente no navegador
 */
export function isEmailRegisteredLocally(email: string): boolean {
  if (!email || !email.trim()) return false;
  try {
    const clean = email.trim().toLowerCase();
    const leads = getLocalVaultLeads();
    return leads.some(item => (item.data.email || '').trim().toLowerCase() === clean);
  } catch {
    return false;
  }
}

/**
 * Retorna o mapa de status sobrescritos salvos localmente
 */
export function getLeadStatusOverrides(): Record<string, { status: LeadStatus; notes?: string; assignedTo?: string; assignedPartnerName?: string }> {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Salva a alteração de status e sócio responsável de um lead no armazenamento local
 * Garante persistência imediata no celular mesmo sem rede ou com lentidão no servidor
 */
export function saveLeadStatusOverride(
  id: string, 
  status: LeadStatus, 
  notes?: string,
  assignedTo?: string,
  assignedPartnerName?: string
): void {
  try {
    const current = getLeadStatusOverrides();
    current[id] = {
      status,
      notes: notes !== undefined ? notes : current[id]?.notes,
      assignedTo: assignedTo !== undefined ? assignedTo : current[id]?.assignedTo,
      assignedPartnerName: assignedPartnerName !== undefined ? assignedPartnerName : current[id]?.assignedPartnerName
    };
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(current));

    // Se o lead estiver no cofre local, atualiza o registro também
    const rawVault = localStorage.getItem(STORAGE_KEY);
    if (rawVault) {
      const records: StoredLeadRecord[] = JSON.parse(rawVault);
      const updated = records.map(item => {
        if (item.id === id || item.serverId === id) {
          return {
            ...item,
            data: {
              ...item.data,
              status,
              notes: notes !== undefined ? notes : item.data.notes,
              assignedTo: assignedTo !== undefined ? assignedTo : item.data.assignedTo,
              assignedPartnerName: assignedPartnerName !== undefined ? assignedPartnerName : item.data.assignedPartnerName
            }
          };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('[3P Vault] Aviso ao salvar status override:', err);
  }
}

/**
 * Remove o lead do armazenamento local
 */
export function removeLeadFromLocalVault(id: string): void {
  try {
    const current = getLeadStatusOverrides();
    delete current[id];
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(current));

    const rawVault = localStorage.getItem(STORAGE_KEY);
    if (rawVault) {
      const records: StoredLeadRecord[] = JSON.parse(rawVault);
      const filtered = records.filter(item => item.id !== id && item.serverId !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.warn('[3P Vault] Aviso ao remover do cofre:', err);
  }
}

/**
 * Sincroniza leads pendentes quando a conexão for restabelecida
 */
export async function syncPendingVaultLeads(): Promise<number> {
  const records = getLocalVaultLeads();
  const pending = records.filter(r => !r.synced);
  if (pending.length === 0) return 0;

  let syncedCount = 0;
  const p3Data = typeof window !== 'undefined' ? (window as any).P3_DATA : null;
  const isWp = p3Data?.api_url || (typeof window !== 'undefined' && !window.location.port.includes('3000') && !window.location.hostname.includes('run.app'));
  const targetUrl = p3Data?.api_url || (isWp ? '/wp-json/p3/v1/lead' : '/api/leads');

  for (const item of pending) {
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      if (res.ok) {
        const json = await res.json();
        markLeadAsSynced(item.id, json.leadId);
        syncedCount++;
      }
    } catch {
      // Deixa para a próxima tentativa de sincronização
    }
  }

  return syncedCount;
}
