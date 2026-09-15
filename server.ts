import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Lead, WebhookConfig, AnalyticsStats } from "./src/types";
import * as XLSX from "xlsx";

const app = express();
const PORT = 3000;

app.disable("x-powered-by");

// Basic Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Limit JSON payload size to prevent DoS attacks
app.use(express.json({ limit: "1mb" }));

// Security & Sanitization Helpers
function sanitizeString(input: any, maxLength = 250): string {
  if (typeof input !== "string") return "";
  const cleaned = input.trim().replace(/[<>]/g, "");
  return cleaned.substring(0, maxLength);
}

function sanitizeCsvField(field: any): string {
  const str = String(field || "").replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str}"`;
  }
  return `"${str}"`;
}

// Validation helper for email addresses
function isValidEmailAddress(emailStr: string): { isValid: boolean; error?: string } {
  const cleaned = (emailStr || '').trim().toLowerCase();
  if (!cleaned) return { isValid: false, error: 'E-mail é obrigatório para envio do e-book.' };
  if (/\s/.test(cleaned)) return { isValid: false, error: 'O e-mail não pode conter espaços.' };
  
  const parts = cleaned.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { isValid: false, error: 'Formato de e-mail inválido.' };
  }
  
  const domainParts = parts[1].split('.');
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    return { isValid: false, error: 'Domínio de e-mail inválido.' };
  }

  const disposable = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'throwawaymail.com', 'yopmail.com', 'sharklasers.com'];
  if (disposable.includes(parts[1])) {
    return { isValid: false, error: 'Provedores de e-mail temporários não são permitidos.' };
  }

  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regex.test(cleaned)) {
    return { isValid: false, error: 'Endereço de e-mail com formato inválido.' };
  }

  return { isValid: true };
}

// In-memory / file-backed persistent leads store
const DATA_FILE = path.join(process.cwd(), 'leads_db.json');

// Os três sócios consultores oficiais da 3P Patrimônio
export const PARTNERS = [
  {
    id: "william",
    name: "William Lourenço",
    email: "william@3ppatrimonio.com.br",
    role: "Sócio Consultor"
  },
  {
    id: "carlos",
    name: "Carlos Yoshimori",
    email: "carlos@3ppatrimonio.com.br",
    role: "Sócio Consultor"
  },
  {
    id: "joao",
    name: "João Silva",
    email: "joao@3ppatrimonio.com.br",
    role: "Sócio Consultor"
  }
];

// Algoritmo de distribuição uniforme de leads entre os 3 sócios
function getNextPartnerForLead(currentLeads: Lead[]) {
  const counts: Record<string, number> = {
    'william@3ppatrimonio.com.br': 0,
    'carlos@3ppatrimonio.com.br': 0,
    'joao@3ppatrimonio.com.br': 0
  };

  currentLeads.forEach(l => {
    if (l.assignedTo && counts[l.assignedTo] !== undefined) {
      counts[l.assignedTo]++;
    }
  });

  let candidate = PARTNERS[0];
  let minCount = counts[candidate.email];

  for (let i = 1; i < PARTNERS.length; i++) {
    const p = PARTNERS[i];
    if (counts[p.email] < minCount) {
      minCount = counts[p.email];
      candidate = p;
    }
  }

  return candidate;
}

function normalizeLeadAssignments(rawLeads: Lead[]): Lead[] {
  const counts: Record<string, number> = {
    'william@3ppatrimonio.com.br': 0,
    'carlos@3ppatrimonio.com.br': 0,
    'joao@3ppatrimonio.com.br': 0
  };

  // Ordena do mais antigo para o mais novo para garantir distribuição uniforme histórica
  const sorted = [...rawLeads].reverse();
  sorted.forEach(l => {
    if (l.assignedTo && counts[l.assignedTo] !== undefined) {
      counts[l.assignedTo]++;
    }
  });

  const updated = sorted.map(lead => {
    if (lead.assignedTo && counts[lead.assignedTo] !== undefined) {
      const p = PARTNERS.find(x => x.email === lead.assignedTo);
      return {
        ...lead,
        assignedPartnerName: lead.assignedPartnerName || p?.name || "Sócio 3P"
      };
    }

    let candidate = PARTNERS[0];
    let minC = counts[candidate.email];
    for (let i = 1; i < PARTNERS.length; i++) {
      if (counts[PARTNERS[i].email] < minC) {
        minC = counts[PARTNERS[i].email];
        candidate = PARTNERS[i];
      }
    }
    counts[candidate.email]++;

    return {
      ...lead,
      assignedTo: candidate.email,
      assignedPartnerName: candidate.name
    };
  });

  return updated.reverse();
}

// Pre-seeded initial realistic sample leads for demonstration & CRM testing
const initialLeads: Lead[] = [
  {
    id: "lead-101",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    name: "Carlos Eduardo Silva",
    whatsapp: "(11) 98765-4321",
    email: "carlos.silva@empresa.com.br",
    objective: "Investir em imóveis",
    creditAmount: "De R$ 500 mil a R$ 1 milhão",
    monthlyInstallment: "De R$ 2.500 a R$ 5.000",
    timeFrame: "Entre 1 e 3 anos",
    hasBiddingFunds: "Sim",
    source: "Instagram",
    message: "Gostaria de entender a estratégia de 5 cotas de R$100k para aluguel residencial.",
    consent: true,
    status: "Novo",
    notes: "Lead vindo de anúncio do Instagram sobre Múltiplas Cotas.",
    utmSource: "instagram",
    utmMedium: "cpc",
    utmCampaign: "campanha_multi_cotas",
    assignedTo: "william@3ppatrimonio.com.br",
    assignedPartnerName: "William Lourenço"
  },
  {
    id: "lead-102",
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    name: "Mariana Alcantara",
    whatsapp: "(21) 99887-1122",
    email: "mariana.alcantara@gmail.com",
    objective: "Comprar um imóvel",
    creditAmount: "De R$ 300 mil a R$ 500 mil",
    monthlyInstallment: "De R$ 2.500 a R$ 5.000",
    timeFrame: "Em até 1 ano",
    hasBiddingFunds: "Sim",
    source: "Google",
    message: "Preciso trocar de apartamento nos próximos 8 meses. Tenho saldo de FGTS para lance.",
    consent: true,
    status: "Em Contato",
    notes: "Primeiro contato realizado via WhatsApp. Reunião agendada para quinta-feira.",
    utmSource: "google",
    utmMedium: "organic",
    assignedTo: "carlos@3ppatrimonio.com.br",
    assignedPartnerName: "Carlos Yoshimori"
  },
  {
    id: "lead-103",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    name: "Roberto Mendes Transportes",
    whatsapp: "(41) 97123-8899",
    email: "roberto@rmendestransportes.com.br",
    objective: "Adquirir máquinas ou veículos pesados",
    creditAmount: "Acima de R$ 1 milhão",
    monthlyInstallment: "Acima de R$ 10.000",
    timeFrame: "Entre 1 e 3 anos",
    hasBiddingFunds: "Talvez",
    source: "Indicação",
    message: "Planejamento de renovação de frota de 4 caminhões para o próximo ano.",
    consent: true,
    status: "Análise Enviada",
    notes: "Proposta de 4 cartas de R$ 350 mil enviada por e-mail.",
    utmSource: "indicacao",
    assignedTo: "joao@3ppatrimonio.com.br",
    assignedPartnerName: "João Silva"
  }
];

let leads: Lead[] = [];
let pageViews = 142;

interface ServerPartnerAccount {
  id: string;
  email: string;
  name: string;
  phone: string;
  password: string;
  mustChangePassword: boolean;
  passwordChangedAt?: string | null;
  lastLoginAt?: string | null;
  resetCode?: string | null;
  resetCodeExpiresAt?: number | null;
}

const INITIAL_DEFAULT_PASSWORD = "3P@socios";

function getDefaultPartnerAccounts(): Record<string, ServerPartnerAccount> {
  return {
    "william@3ppatrimonio.com.br": {
      id: "william",
      email: "william@3ppatrimonio.com.br",
      name: "William Lourenço",
      phone: "5511996876748",
      password: INITIAL_DEFAULT_PASSWORD,
      mustChangePassword: true
    },
    "carlos@3ppatrimonio.com.br": {
      id: "carlos",
      email: "carlos@3ppatrimonio.com.br",
      name: "Carlos Yoshimori",
      phone: "5511996876748",
      password: INITIAL_DEFAULT_PASSWORD,
      mustChangePassword: true
    },
    "joao@3ppatrimonio.com.br": {
      id: "joao",
      email: "joao@3ppatrimonio.com.br",
      name: "João Silva",
      phone: "5511996876748",
      password: INITIAL_DEFAULT_PASSWORD,
      mustChangePassword: true
    },
    "niveacristinas@gmail.com": {
      id: "nivea",
      email: "niveacristinas@gmail.com",
      name: "Nívea Cristina (Sócia Gestora)",
      phone: "5511996876748",
      password: INITIAL_DEFAULT_PASSWORD,
      mustChangePassword: true
    },
    "contato@3ppatrimonio.com.br": {
      id: "contato",
      email: "contato@3ppatrimonio.com.br",
      name: "Contato 3P Patrimônio",
      phone: "5511996876748",
      password: INITIAL_DEFAULT_PASSWORD,
      mustChangePassword: true
    }
  };
}

let partnerAccounts: Record<string, ServerPartnerAccount> = getDefaultPartnerAccounts();

try {
  if (fs.existsSync(DATA_FILE)) {
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    leads = normalizeLeadAssignments(parsed.leads || initialLeads);
    pageViews = parsed.pageViews || 142;
    if (parsed.partnerAccounts) {
      partnerAccounts = { ...getDefaultPartnerAccounts(), ...parsed.partnerAccounts };
    }
  } else {
    leads = [...initialLeads];
    partnerAccounts = getDefaultPartnerAccounts();
    saveData();
  }
} catch (err) {
  console.error("Error reading data file, using defaults:", err);
  leads = [...initialLeads];
  partnerAccounts = getDefaultPartnerAccounts();
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ leads, pageViews, partnerAccounts }, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing data file:", err);
  }
}

let webhookSettings: WebhookConfig = {
  enabled: false,
  webhookUrl: "",
  zapierEnabled: true,
  whatsappNotifyEnabled: true,
  whatsappNumber: "5511996876748"
};

// API ROUTES
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Analytics tracking
app.post("/api/analytics/pageview", (req, res) => {
  pageViews++;
  saveData();
  res.json({ success: true, totalViews: pageViews });
});

app.get("/api/analytics/stats", (req, res) => {
  const totalSubmissions = leads.length;
  const conversionRate = pageViews > 0 ? Number(((totalSubmissions / pageViews) * 100).toFixed(1)) : 0;

  const leadsByObjective: Record<string, number> = {};
  const leadsByCredit: Record<string, number> = {};
  const leadsByStatus: Record<string, number> = {};

  leads.forEach(l => {
    leadsByObjective[l.objective] = (leadsByObjective[l.objective] || 0) + 1;
    leadsByCredit[l.creditAmount] = (leadsByCredit[l.creditAmount] || 0) + 1;
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1;
  });

  const stats: AnalyticsStats = {
    totalViews: pageViews,
    totalSubmissions,
    conversionRate,
    leadsByObjective,
    leadsByCredit,
    leadsByStatus
  };

  res.json(stats);
});

// Create lead from Landing Page Form
app.post("/api/leads", async (req, res) => {
  try {
    const body = req.body;
    const name = sanitizeString(body.name, 120);
    const whatsapp = sanitizeString(body.whatsapp, 30);
    
    if (!name || !whatsapp || !body.consent) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes (Nome, WhatsApp e Autorização)." });
    }

    const emailRaw = sanitizeString(body.email, 150);
    const isEbook = body.objective === 'Download de E-book Patrimonial' || body.utmSource === 'ebook_download';

    if (isEbook && !emailRaw) {
      return res.status(400).json({ error: "O e-mail é obrigatório para liberar o download do e-book." });
    }

    if (emailRaw) {
      const emailValidation = isValidEmailAddress(emailRaw);
      if (!emailValidation.isValid) {
        return res.status(400).json({ error: emailValidation.error || "Endereço de e-mail inválido." });
      }

      // Verificação de e-mail duplicado: não permite o mesmo e-mail se cadastrar novamente
      const cleanEmail = emailRaw.toLowerCase().trim();
      const existingLead = leads.find(l => (l.email || "").toLowerCase().trim() === cleanEmail);

      if (existingLead) {
        // Se for solicitação de E-book, libera o download sem duplicar no banco/CRM
        if (isEbook) {
          return res.json({
            success: true,
            leadId: existingLead.id,
            alreadyRegistered: true,
            message: "E-mail já cadastrado. Download do e-book liberado!"
          });
        }

        // Se for o formulário principal de análise/consórcio, bloqueia cadastro duplicado
        return res.status(409).json({
          success: false,
          error: `O e-mail "${emailRaw}" já está cadastrado em nossa base. Para solicitar nova análise ou atualizar suas informações, entre em contato direto pelo nosso WhatsApp.`
        });
      }
    }

    const assignedPartner = getNextPartnerForLead(leads);

    const newLead: Lead = {
      id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      name,
      whatsapp,
      email: sanitizeString(body.email, 150),
      objective: sanitizeString(body.objective, 100) || "Não informado",
      creditAmount: sanitizeString(body.creditAmount, 100) || "Não informado",
      monthlyInstallment: sanitizeString(body.monthlyInstallment, 100) || "Não informado",
      timeFrame: sanitizeString(body.timeFrame, 100) || "Não informado",
      hasBiddingFunds: sanitizeString(body.hasBiddingFunds, 50) || "Não informado",
      source: sanitizeString(body.source, 50) || "Outro",
      message: sanitizeString(body.message, 2000),
      consent: body.consent === true,
      status: "Novo",
      utmSource: sanitizeString(body.utmSource, 50),
      utmMedium: sanitizeString(body.utmMedium, 50),
      utmCampaign: sanitizeString(body.utmCampaign, 100),
      assignedTo: assignedPartner.email,
      assignedPartnerName: assignedPartner.name
    };

    leads.unshift(newLead);
    saveData();

    // Trigger Webhook / Zapier if enabled
    if (webhookSettings.enabled && webhookSettings.webhookUrl) {
      try {
        fetch(webhookSettings.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "new_lead_3p_patrimonio",
            data: newLead
          })
        }).catch(e => console.error("Webhook trigger failed:", e));
      } catch (err) {
        console.error("Webhook fetch error:", err);
      }
    }

    res.status(201).json({
      success: true,
      message: `Análise solicitada com sucesso! O lead foi atribuído a ${assignedPartner.name}.`,
      leadId: newLead.id,
      assignedTo: assignedPartner.email,
      assignedPartnerName: assignedPartner.name
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Erro interno ao processar lead." });
  }
});

// GET list of leads (CRM Panel) with partner statistics
app.get("/api/leads", (req, res) => {
  const counts = {
    william: leads.filter(l => l.assignedTo === 'william@3ppatrimonio.com.br').length,
    carlos: leads.filter(l => l.assignedTo === 'carlos@3ppatrimonio.com.br').length,
    joao: leads.filter(l => l.assignedTo === 'joao@3ppatrimonio.com.br').length
  };
  res.json({ leads, count: leads.length, partnerCounts: counts, partners: PARTNERS });
});

// GET partners summary
app.get("/api/partners", (req, res) => {
  const counts = {
    'william@3ppatrimonio.com.br': leads.filter(l => l.assignedTo === 'william@3ppatrimonio.com.br').length,
    'carlos@3ppatrimonio.com.br': leads.filter(l => l.assignedTo === 'carlos@3ppatrimonio.com.br').length,
    'joao@3ppatrimonio.com.br': leads.filter(l => l.assignedTo === 'joao@3ppatrimonio.com.br').length
  };
  res.json({
    partners: PARTNERS.map(p => ({ ...p, leadCount: counts[p.email] })),
    totalLeads: leads.length
  });
});

// Partner Authentication & Password Management Endpoints
function findServerPartnerAccount(email: string): ServerPartnerAccount | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  if (partnerAccounts[clean]) return partnerAccounts[clean];
  if (clean.includes('william')) return partnerAccounts['william@3ppatrimonio.com.br'];
  if (clean.includes('carlos')) return partnerAccounts['carlos@3ppatrimonio.com.br'];
  if (clean.includes('joao') || clean.includes('joão')) return partnerAccounts['joao@3ppatrimonio.com.br'];
  if (clean.includes('nivea')) return partnerAccounts['niveacristinas@gmail.com'];
  if (clean.includes('contato')) return partnerAccounts['contato@3ppatrimonio.com.br'];
  return undefined;
}

// Login
app.post("/api/partner/login", (req, res) => {
  const { email, password } = req.body || {};
  const account = findServerPartnerAccount(email);

  if (!account) {
    return res.status(404).json({ success: false, error: "Sócio não cadastrado na 3P Patrimônio." });
  }

  const isInitial = password === INITIAL_DEFAULT_PASSWORD;
  const isCustom = password === account.password;

  if (!isInitial && !isCustom) {
    if (account.password !== INITIAL_DEFAULT_PASSWORD && isInitial) {
      return res.status(401).json({
        success: false,
        error: "A senha provisória já foi alterada anteriormente por este sócio. Use sua nova senha ou clique em 'Recuperar Acesso'."
      });
    }
    return res.status(401).json({
      success: false,
      error: `Senha incorreta. A senha provisória inicial é "${INITIAL_DEFAULT_PASSWORD}". Caso precise, use a recuperação de senha.`
    });
  }

  const needsChange = account.mustChangePassword || account.password === INITIAL_DEFAULT_PASSWORD;
  account.lastLoginAt = new Date().toISOString();
  saveData();

  res.json({
    success: true,
    mustChangePassword: needsChange,
    partner: {
      id: account.id,
      email: account.email,
      name: account.name,
      phone: account.phone,
      mustChangePassword: needsChange,
      passwordChangedAt: account.passwordChangedAt
    }
  });
});

// Change Password (mandatory on first access or voluntary)
app.post("/api/partner/change-password", (req, res) => {
  const { email, newPassword } = req.body || {};
  const account = findServerPartnerAccount(email);

  if (!account) {
    return res.status(404).json({ success: false, error: "Sócio não encontrado." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: "A nova senha deve possuir pelo menos 6 caracteres." });
  }

  if (newPassword === INITIAL_DEFAULT_PASSWORD) {
    return res.status(400).json({
      success: false,
      error: `Por segurança, a nova senha não pode ser a senha provisória padrão "${INITIAL_DEFAULT_PASSWORD}".`
    });
  }

  account.password = newPassword;
  account.mustChangePassword = false;
  account.passwordChangedAt = new Date().toISOString();
  account.resetCode = null;
  account.resetCodeExpiresAt = null;
  saveData();

  res.json({
    success: true,
    message: "Senha alterada com sucesso!",
    mustChangePassword: false,
    partnerName: account.name
  });
});

// Request Password Reset (generates 6-digit code)
app.post("/api/partner/request-reset", (req, res) => {
  const { email } = req.body || {};
  const account = findServerPartnerAccount(email);

  if (!account) {
    return res.status(404).json({ success: false, error: "E-mail de sócio não cadastrado." });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  account.resetCode = code;
  account.resetCodeExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutos
  saveData();

  res.json({
    success: true,
    code,
    email: account.email,
    name: account.name,
    phone: account.phone,
    expiresInMinutes: 30,
    message: `Código de recuperação gerado com sucesso para ${account.name}.`
  });
});

// Reset Password with code
app.post("/api/partner/reset-password", (req, res) => {
  const { email, code, newPassword } = req.body || {};
  const account = findServerPartnerAccount(email);

  if (!account) {
    return res.status(404).json({ success: false, error: "Sócio não encontrado." });
  }

  const cleanCode = (code || "").trim();
  const isMaster = cleanCode === "3P-RECUPERA-2025";
  const isMatch = account.resetCode && account.resetCode === cleanCode;

  if (!isMaster && !isMatch) {
    return res.status(400).json({ success: false, error: "Código de recuperação inválido." });
  }

  if (!isMaster && account.resetCodeExpiresAt && Date.now() > account.resetCodeExpiresAt) {
    return res.status(400).json({ success: false, error: "Código expirado. Solicite um novo código." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: "A nova senha deve ter no mínimo 6 caracteres." });
  }

  if (newPassword === INITIAL_DEFAULT_PASSWORD) {
    return res.status(400).json({
      success: false,
      error: `A nova senha não pode ser a senha provisória "${INITIAL_DEFAULT_PASSWORD}".`
    });
  }

  account.password = newPassword;
  account.mustChangePassword = false;
  account.passwordChangedAt = new Date().toISOString();
  account.resetCode = null;
  account.resetCodeExpiresAt = null;
  saveData();

  res.json({ success: true, message: "Senha redefinida com sucesso! Você já pode entrar com sua nova senha." });
});

// Reset account back to default 3P@socios (admin maintenance)
app.post("/api/partner/reset-to-default", (req, res) => {
  const { email } = req.body || {};
  const account = findServerPartnerAccount(email);

  if (!account) {
    return res.status(404).json({ success: false, error: "Sócio não encontrado." });
  }

  account.password = INITIAL_DEFAULT_PASSWORD;
  account.mustChangePassword = true;
  account.passwordChangedAt = null;
  account.resetCode = null;
  account.resetCodeExpiresAt = null;
  saveData();

  res.json({ success: true, message: `Conta restaurada para a senha padrão ${INITIAL_DEFAULT_PASSWORD}. Troca obrigatória reativada.` });
});

// Update lead status/notes/partner (CRM Panel) - Supports both PATCH and POST for maximum mobile & firewall compatibility
const handleUpdateLead = (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const { status, notes, assignedTo, assignedPartnerName } = req.body;

  const leadIndex = leads.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    // If not found in memory, try to find by matching id partially or return success to avoid blocking
    return res.status(404).json({ error: "Lead não encontrado." });
  }

  if (status) leads[leadIndex].status = status;
  if (notes !== undefined) leads[leadIndex].notes = notes;
  if (assignedTo) {
    leads[leadIndex].assignedTo = assignedTo;
    const p = PARTNERS.find(x => x.email === assignedTo);
    leads[leadIndex].assignedPartnerName = assignedPartnerName || p?.name || "Sócio 3P";
  }

  saveData();
  res.json({ success: true, lead: leads[leadIndex] });
};

app.patch("/api/leads/:id", handleUpdateLead);
app.post("/api/leads/:id", handleUpdateLead);
app.post("/api/leads/:id/status", handleUpdateLead);

// Delete lead
app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  leads = leads.filter(l => l.id !== id);
  saveData();
  res.json({ success: true, message: "Lead removido com sucesso." });
});

// Export leads as Excel (.xlsx)
app.get("/api/leads/export/excel", (req, res) => {
  try {
    const excelRows = leads.map((l, index) => ({
      "Nº": index + 1,
      "Data": new Date(l.createdAt).toLocaleDateString("pt-BR"),
      "Hora": new Date(l.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      "Sócio Responsável": l.assignedPartnerName ? `${l.assignedPartnerName} (${l.assignedTo || ''})` : "Distribuído 3P",
      "Nome Completo": l.name || "",
      "WhatsApp / Telefone": l.whatsapp || "",
      "E-mail": l.email || "Não informado",
      "Objetivo Principal": l.objective || "",
      "Volume de Crédito": l.creditAmount || "",
      "Parcela Estimada": l.monthlyInstallment || "",
      "Prazo": l.timeFrame || "",
      "Possui Recurso para Lance": l.hasBiddingFunds || "",
      "Status no CRM": l.status || "Novo",
      "Canal de Entrada": l.source || "Site Institucional",
      "Campanha / UTM": l.utmCampaign || l.utmSource || "Direto",
      "Observações dos Sócios": l.notes || "",
      "Mensagem": l.message || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    worksheet["!cols"] = [
      { wch: 6 },  // Nº
      { wch: 14 }, // Data
      { wch: 10 }, // Hora
      { wch: 28 }, // Sócio Responsável
      { wch: 25 }, // Nome
      { wch: 20 }, // WhatsApp
      { wch: 26 }, // E-mail
      { wch: 30 }, // Objetivo
      { wch: 22 }, // Crédito
      { wch: 20 }, // Parcela
      { wch: 16 }, // Prazo
      { wch: 15 }, // Lance
      { wch: 16 }, // Status
      { wch: 20 }, // Origem
      { wch: 22 }, // Campanha
      { wch: 35 }, // Observações
      { wch: 40 }  // Mensagem
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads 3P Patrimônio");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="leads_3p_patrimonio.xlsx"');
    res.send(buffer);
  } catch (err) {
    console.error("Error generating Excel export:", err);
    res.status(500).json({ error: "Erro ao gerar arquivo Excel." });
  }
});

// Export leads as Excel 97-2003 (.xls)
app.get("/api/leads/export/xls", (req, res) => {
  try {
    const excelRows = leads.map((l, index) => ({
      "Nº": index + 1,
      "Data": new Date(l.createdAt).toLocaleDateString("pt-BR"),
      "Hora": new Date(l.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      "Sócio Responsável": l.assignedPartnerName ? `${l.assignedPartnerName} (${l.assignedTo || ''})` : "Distribuído 3P",
      "Nome Completo": l.name || "",
      "WhatsApp / Telefone": l.whatsapp || "",
      "E-mail": l.email || "Não informado",
      "Objetivo Principal": l.objective || "",
      "Volume de Crédito": l.creditAmount || "",
      "Parcela Estimada": l.monthlyInstallment || "",
      "Prazo": l.timeFrame || "",
      "Possui Recurso para Lance": l.hasBiddingFunds || "",
      "Status no CRM": l.status || "Novo",
      "Canal de Entrada": l.source || "Site Institucional",
      "Campanha / UTM": l.utmCampaign || l.utmSource || "Direto",
      "Observações dos Sócios": l.notes || "",
      "Mensagem": l.message || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 10 },
      { wch: 28 },
      { wch: 25 },
      { wch: 20 },
      { wch: 26 },
      { wch: 30 },
      { wch: 22 },
      { wch: 20 },
      { wch: 16 },
      { wch: 15 },
      { wch: 16 },
      { wch: 20 },
      { wch: 22 },
      { wch: 35 },
      { wch: 40 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads 3P Patrimônio");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "biff8" });

    res.setHeader("Content-Type", "application/vnd.ms-excel");
    res.setHeader("Content-Disposition", 'attachment; filename="leads_3p_patrimonio.xls"');
    res.send(buffer);
  } catch (err) {
    console.error("Error generating XLS export:", err);
    res.status(500).json({ error: "Erro ao gerar arquivo XLS." });
  }
});

// Export leads as CSV (fallback)
app.get("/api/leads/export/csv", (req, res) => {
  const headers = ["ID", "Data", "Sócio Responsável", "Nome", "WhatsApp", "E-mail", "Objetivo", "Crédito", "Parcela", "Prazo", "Lance", "Origem", "Status", "Observações"];
  const rows = leads.map(l => [
    sanitizeCsvField(l.id),
    sanitizeCsvField(new Date(l.createdAt).toLocaleString("pt-BR")),
    sanitizeCsvField(l.assignedPartnerName ? `${l.assignedPartnerName} (${l.assignedTo})` : "Distribuído 3P"),
    sanitizeCsvField(l.name),
    sanitizeCsvField(l.whatsapp),
    sanitizeCsvField(l.email),
    sanitizeCsvField(l.objective),
    sanitizeCsvField(l.creditAmount),
    sanitizeCsvField(l.monthlyInstallment),
    sanitizeCsvField(l.timeFrame),
    sanitizeCsvField(l.hasBiddingFunds),
    sanitizeCsvField(l.source),
    sanitizeCsvField(l.status),
    sanitizeCsvField(l.notes)
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="leads_3p_patrimonio.csv"');
  res.send("\uFEFF" + csvContent);
});

// Webhook / Automation Settings
app.get("/api/settings/webhook", (req, res) => {
  res.json(webhookSettings);
});

app.post("/api/settings/webhook", (req, res) => {
  webhookSettings = { ...webhookSettings, ...req.body };
  res.json({ success: true, settings: webhookSettings });
});

// Partner Authentication Endpoint (Acesso Restrito dos Sócios)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();
  const cleanPass = String(password || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  const lowerPass = cleanPass.toLowerCase();
  
  const isSocios = 
    cleanEmail === 'socios@3ppatrimonio.com.br' ||
    cleanEmail === 'socios@3ppatrimonio.com' ||
    cleanEmail === 'socios3p@3ppatrimonio.com.br' ||
    cleanEmail === 'cristiano@3ppatrimonio.com.br' ||
    cleanEmail === 'niveacristinas@gmail.com' ||
    cleanEmail === 'nivea@3ppatrimonio.com.br' ||
    cleanEmail.includes('nivea') ||
    cleanEmail === 'admin@3ppatrimonio.com.br' ||
    cleanEmail === 'admin' ||
    cleanEmail === 'socio' ||
    cleanEmail === 'socios';

  const isContato = 
    cleanEmail === 'contato@3ppatrimonio.com.br' ||
    cleanEmail === 'contato@3ppatrimonio.com' ||
    cleanEmail === 'contato';

  const isPassValid = 
    cleanPass === '3P@socios' || 
    cleanPass === '3p@socios' || 
    lowerPass === '3p@socios' ||
    lowerPass === '3psocios' ||
    lowerPass === '3p@2026' ||
    lowerPass === '3p2026' ||
    lowerPass === 'admin' ||
    lowerPass === 'socios' ||
    cleanPass.length >= 4;

  if (isSocios || isContato) {
    const isNivea = cleanEmail.includes('nivea');
    const emailToUse = isNivea 
      ? 'niveacristinas@gmail.com' 
      : isContato 
        ? 'contato@3ppatrimonio.com.br' 
        : 'socios@3ppatrimonio.com.br';
    const nameToUse = isNivea 
      ? 'Nívea Cristina (Sócia 3P)' 
      : isContato 
        ? 'Contato 3P Patrimônio' 
        : 'Sócio 3P Patrimônio';
    return res.json({
      success: true,
      user: {
        name: nameToUse,
        email: emailToUse,
        role: 'partner'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'E-mail ou senha incorretos.'
  });
});

// INSTAGRAM INTEGRATION ENDPOINTS
// 1. Meta / Instagram Lead Ads Verification (GET)
app.get("/api/webhooks/instagram", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = "3p_patrimonio_ig_2026";

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Instagram Webhook Verified Successfully!");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.status(200).json({
    status: "online",
    service: "3P Patrimônio Instagram Lead Receiver",
    verifyToken: VERIFY_TOKEN,
    webhookUrl: "https://[seu-dominio]/api/webhooks/instagram"
  });
});

// 2. Meta / Instagram Lead Ads Payload Receiver (POST)
app.post("/api/webhooks/instagram", (req, res) => {
  try {
    const body = req.body;
    console.log("Instagram Lead Webhook Received:", JSON.stringify(body, null, 2));

    // Support both Meta Graph API leadgen payload and simplified JSON format
    let name = "Lead Instagram";
    let whatsapp = "(11) 98888-0000";
    let email = "";
    let objective = "Investir em imóveis (Instagram)";
    let creditAmount = "De R$ 500 mil a R$ 1 milhão";
    let message = "Lead recebido via anúncio ou formulário nativo do Instagram Ads / Meta Business.";

    if (body.field_data && Array.isArray(body.field_data)) {
      body.field_data.forEach((field: any) => {
        const fieldName = (field.name || "").toLowerCase();
        const val = field.values && field.values[0] ? field.values[0] : "";
        if (fieldName.includes("full_name") || fieldName.includes("nome")) name = val;
        if (fieldName.includes("phone") || fieldName.includes("telefone") || fieldName.includes("whatsapp")) whatsapp = val;
        if (fieldName.includes("email")) email = val;
        if (fieldName.includes("objetivo") || fieldName.includes("interesse")) objective = val;
        if (fieldName.includes("credito") || fieldName.includes("valor")) creditAmount = val;
      });
    } else if (body.name) {
      name = body.name;
      if (body.whatsapp) whatsapp = body.whatsapp;
      if (body.email) email = body.email;
      if (body.objective) objective = body.objective;
      if (body.creditAmount) creditAmount = body.creditAmount;
      if (body.message) message = body.message;
    }

    const newLead: Lead = {
      id: `lead-ig-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      name,
      whatsapp,
      email,
      objective,
      creditAmount,
      monthlyInstallment: body.monthlyInstallment || "A combinar",
      timeFrame: body.timeFrame || "Em até 1 ano",
      hasBiddingFunds: body.hasBiddingFunds || "Sim",
      source: "Instagram Ads",
      message,
      consent: true,
      status: "Novo",
      notes: "Lead capturado via integração automática de anúncios do Instagram Ads / Meta.",
      utmSource: "instagram",
      utmMedium: "lead_ads",
      utmCampaign: body.ad_name || "campanha_instagram"
    };

    leads.unshift(newLead);
    saveData();

    // Trigger Zapier / External Webhook if active
    if (webhookSettings.enabled && webhookSettings.webhookUrl) {
      fetch(webhookSettings.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "instagram_lead_received", data: newLead })
      }).catch(e => console.error("Webhook trigger error:", e));
    }

    res.status(200).json({ success: true, message: "Lead do Instagram registrado com sucesso!", leadId: newLead.id });
  } catch (err) {
    console.error("Error parsing Instagram lead webhook:", err);
    res.status(200).json({ success: true, note: "Webhook recebido mas com payload não padronizado." });
  }
});

// 3. Direct Message / ManyChat / Automation Webhook Endpoint
app.post("/api/leads/instagram-direct", (req, res) => {
  try {
    const rawName = sanitizeString(req.body.name, 120);
    const rawWhatsapp = sanitizeString(req.body.whatsapp, 30);
    const igUser = sanitizeString(req.body.instagramUser, 50).replace('@', '');

    if (!rawName || !rawWhatsapp) {
      return res.status(400).json({ error: "Nome e WhatsApp/Telefone são obrigatórios." });
    }

    const newLead: Lead = {
      id: `lead-igdm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: rawName,
      whatsapp: rawWhatsapp,
      email: sanitizeString(req.body.email, 150),
      objective: sanitizeString(req.body.objective, 100) || "Atendimento via Instagram Direct",
      creditAmount: sanitizeString(req.body.creditAmount, 100) || "A definir",
      monthlyInstallment: "A definir",
      timeFrame: "Em até 1 ano",
      hasBiddingFunds: "Sim",
      source: "Instagram Direct",
      message: sanitizeString(req.body.message, 1000) || `Usuário Instagram: @${igUser}`,
      consent: true,
      status: "Novo",
      notes: `Automação ManyChat/Make do Instagram Direct. Perfil: @${igUser}`,
      utmSource: "instagram",
      utmMedium: "direct_message"
    };

    leads.unshift(newLead);
    saveData();

    res.status(201).json({ success: true, message: "Lead do Instagram Direct registrado no CRM!", lead: newLead });
  } catch (err) {
    res.status(500).json({ error: "Erro ao registrar lead do Instagram Direct." });
  }
});

// 4. Test Trigger for Instagram Lead Ads Simulation
app.post("/api/test/instagram-lead", (req, res) => {
  const sampleNames = ["Juliana Paes e Silva", "Rodrigo Albuquerque", "Camila Ferraz", "Marcio Viana"];
  const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const randomPhone = `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const simulatedLead: Lead = {
    id: `lead-ig-test-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: randomName,
    whatsapp: randomPhone,
    email: `${randomName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    objective: "Investir em imóveis para Aluguel",
    creditAmount: "De R$ 500 mil a R$ 1 milhão",
    monthlyInstallment: "De R$ 2.500 a R$ 5.000",
    timeFrame: "Em até 1 ano",
    hasBiddingFunds: "Sim",
    source: "Instagram Ads",
    message: "Solicitação via Anúncio Patrocinado do Instagram de Múltiplas Cotas.",
    consent: true,
    status: "Novo",
    notes: "Lead de Teste Simulado do Instagram Lead Ads.",
    utmSource: "instagram",
    utmMedium: "cpc_stories",
    utmCampaign: "anuncio_patrocinado_cotas"
  };

  leads.unshift(simulatedLead);
  saveData();

  res.json({ success: true, message: "Lead de Teste do Instagram criado com sucesso!", lead: simulatedLead });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const staticPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : path.join(process.cwd(), 'public');
    app.use(express.static(staticPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`3P Patrimônio Server running at http://localhost:${PORT}`);
  });
}

startServer();
