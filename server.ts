import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Lead, WebhookConfig, AnalyticsStats } from "./src/types";

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

// In-memory / file-backed persistent leads store
const DATA_FILE = path.join(process.cwd(), 'leads_db.json');

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
    utmCampaign: "campanha_multi_cotas"
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
    utmMedium: "organic"
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
    utmSource: "indicacao"
  }
];

let leads: Lead[] = [];
let pageViews = 142;

try {
  if (fs.existsSync(DATA_FILE)) {
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);
    leads = parsed.leads || initialLeads;
    pageViews = parsed.pageViews || 142;
  } else {
    leads = [...initialLeads];
    saveData();
  }
} catch (err) {
  console.error("Error reading data file, using defaults:", err);
  leads = [...initialLeads];
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ leads, pageViews }, null, 2), 'utf-8');
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
      utmCampaign: sanitizeString(body.utmCampaign, 100)
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
      message: "Análise solicitada com sucesso! Um consultor entrará em contato em breve.",
      leadId: newLead.id
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Erro interno ao processar lead." });
  }
});

// GET list of leads (CRM Panel)
app.get("/api/leads", (req, res) => {
  res.json({ leads, count: leads.length });
});

// Update lead status/notes (CRM Panel)
app.patch("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const leadIndex = leads.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: "Lead não encontrado." });
  }

  if (status) leads[leadIndex].status = status;
  if (notes !== undefined) leads[leadIndex].notes = notes;

  saveData();
  res.json({ success: true, lead: leads[leadIndex] });
});

// Delete lead
app.delete("/api/leads/:id", (req, res) => {
  const { id } = req.params;
  leads = leads.filter(l => l.id !== id);
  saveData();
  res.json({ success: true, message: "Lead removido com sucesso." });
});

// Export leads as CSV
app.get("/api/leads/export/csv", (req, res) => {
  const headers = ["ID", "Data", "Nome", "WhatsApp", "E-mail", "Objetivo", "Crédito", "Parcela", "Prazo", "Lance", "Origem", "Status", "Observações"];
  const rows = leads.map(l => [
    sanitizeCsvField(l.id),
    sanitizeCsvField(new Date(l.createdAt).toLocaleString("pt-BR")),
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`3P Patrimônio Server running at http://localhost:${PORT}`);
  });
}

startServer();
