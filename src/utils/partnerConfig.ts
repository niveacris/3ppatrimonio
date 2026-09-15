import { Lead, PartnerUser } from '../types';
import williamPhoto from '../assets/images/william80x80.jpg';
import carlosPhoto from '../assets/images/carlos80x80.jpg';
import joaoPhoto from '../assets/images/joao80x80.jpg';
import logo3p from '../assets/images/logo_250x250.png';

export const PARTNERS: PartnerUser[] = [
  {
    id: 'william',
    name: 'William Lourenço',
    email: 'william@3ppatrimonio.com.br',
    role: 'Sócio Consultor',
    phone: '5511996876748',
    avatar: williamPhoto,
    color: '#3b82f6' // Azul corporativo
  },
  {
    id: 'carlos',
    name: 'Carlos Yoshimori',
    email: 'carlos@3ppatrimonio.com.br',
    role: 'Sócio Consultor',
    phone: '5511996876748',
    avatar: carlosPhoto,
    color: '#f59e0b' // Dourado 3P
  },
  {
    id: 'joao',
    name: 'João Silva',
    email: 'joao@3ppatrimonio.com.br',
    role: 'Sócio Consultor',
    phone: '5511996876748',
    avatar: joaoPhoto,
    color: '#10b981' // Verde esmeralda
  }
];

export const OFFICIAL_PARTNER_EMAILS = PARTNERS.map(p => p.email);

export const ADMIN_PARTNER: PartnerUser = {
  id: 'socios_admin',
  name: 'Sócios 3P (Administrador)',
  email: 'socios@3ppatrimonio.com.br',
  role: 'Administrador Geral',
  phone: '5511996876748',
  avatar: logo3p,
  color: '#f59e0b'
};

/**
 * Retorna os dados do sócio com base no e-mail (ou aproximação)
 */
export function getPartnerByEmail(email: string): PartnerUser | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  
  if (clean.includes('socios') || clean === 'socios@3ppatrimonio.com.br') {
    return ADMIN_PARTNER;
  }
  if (clean.includes('william')) {
    return PARTNERS.find(p => p.id === 'william');
  }
  if (clean.includes('carlos')) {
    return PARTNERS.find(p => p.id === 'carlos');
  }
  if (clean.includes('joao') || clean.includes('joão')) {
    return PARTNERS.find(p => p.id === 'joao');
  }

  return PARTNERS.find(p => p.email.toLowerCase() === clean);
}

/**
 * Determina uniformemente qual sócio deve receber o próximo lead registrado.
 * Algoritmo de balanceamento de carga (Round-Robin com equalização):
 * O lead é atribuído ao sócio com MENOS leads no momento.
 * Em caso de empate, segue a sequência cíclica: William -> Carlos -> João.
 */
export function getNextPartnerForLead(existingLeads: Lead[]): PartnerUser {
  // Contabiliza leads atribuídos a cada sócio
  const counts: Record<string, number> = {
    'william@3ppatrimonio.com.br': 0,
    'carlos@3ppatrimonio.com.br': 0,
    'joao@3ppatrimonio.com.br': 0
  };

  (existingLeads || []).forEach(lead => {
    if (lead.assignedTo && counts[lead.assignedTo] !== undefined) {
      counts[lead.assignedTo]++;
    }
  });

  // Encontra o sócio com menor volume (prioridade de desempate na ordem da lista: William, Carlos, João)
  let chosen = PARTNERS[0];
  let minCount = counts[chosen.email];

  for (let i = 1; i < PARTNERS.length; i++) {
    const p = PARTNERS[i];
    const c = counts[p.email];
    if (c < minCount) {
      minCount = c;
      chosen = p;
    }
  }

  return chosen;
}

/**
 * Garante que todos os leads existentes estejam distribuídos igualmente entre os 3 sócios.
 * Se algum lead não tiver sócio atribuído, é distribuído uniformemente.
 */
export function distributeLeadsUniformly(leads: Lead[]): Lead[] {
  if (!leads || leads.length === 0) return [];

  // Cria cópia ordenada cronologicamente (mais antigos primeiro para distribuição histórica justa)
  const sorted = [...leads].sort((a, b) => 
    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );

  const counts: Record<string, number> = {
    'william@3ppatrimonio.com.br': 0,
    'carlos@3ppatrimonio.com.br': 0,
    'joao@3ppatrimonio.com.br': 0
  };

  // Primeiro passo: registra quem já tem sócio válido
  sorted.forEach(lead => {
    if (lead.assignedTo && counts[lead.assignedTo] !== undefined) {
      counts[lead.assignedTo]++;
    }
  });

  // Segundo passo: para qualquer lead sem sócio ou com sócio desconhecido, atribui ao com menor contagem
  const assigned = sorted.map(lead => {
    if (lead.assignedTo && counts[lead.assignedTo] !== undefined) {
      const partner = getPartnerByEmail(lead.assignedTo);
      return {
        ...lead,
        assignedPartnerName: lead.assignedPartnerName || partner?.name || 'Sócio 3P'
      };
    }

    // Atribui ao sócio com menor número no momento
    let candidate = PARTNERS[0];
    let minC = counts[candidate.email];

    for (let i = 1; i < PARTNERS.length; i++) {
      const p = PARTNERS[i];
      if (counts[p.email] < minC) {
        minC = counts[p.email];
        candidate = p;
      }
    }

    counts[candidate.email]++;

    return {
      ...lead,
      assignedTo: candidate.email,
      assignedPartnerName: candidate.name
    };
  });

  // Mantém a ordem decrescente padrão (mais recentes no topo do CRM)
  return assigned.sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

/**
 * Estatísticas resumidas de distribuição dos leads
 */
export function getPartnerDistributionStats(leads: Lead[]) {
  const stats = {
    total: leads.length,
    william: 0,
    carlos: 0,
    joao: 0,
    williamPct: 0,
    carlosPct: 0,
    joaoPct: 0
  };

  leads.forEach(l => {
    if (l.assignedTo === 'william@3ppatrimonio.com.br') stats.william++;
    else if (l.assignedTo === 'carlos@3ppatrimonio.com.br') stats.carlos++;
    else if (l.assignedTo === 'joao@3ppatrimonio.com.br') stats.joao++;
  });

  if (stats.total > 0) {
    stats.williamPct = Math.round((stats.william / stats.total) * 100);
    stats.carlosPct = Math.round((stats.carlos / stats.total) * 100);
    stats.joaoPct = Math.round((stats.joao / stats.total) * 100);
  }

  return stats;
}
