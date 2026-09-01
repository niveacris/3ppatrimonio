export type LeadStatus = 'Novo' | 'Em Contato' | 'Análise Enviada' | 'Em Negociação' | 'Contratado' | 'Perdido';

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  whatsapp: string;
  email?: string;
  objective: string;
  creditAmount: string;
  monthlyInstallment: string;
  timeFrame: string;
  hasBiddingFunds: string;
  source: string;
  message?: string;
  consent: boolean;
  status: LeadStatus;
  notes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface WebhookConfig {
  enabled: boolean;
  webhookUrl: string;
  zapierEnabled: boolean;
  whatsappNotifyEnabled: boolean;
  whatsappNumber: string;
}

export interface AnalyticsStats {
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  leadsByObjective: Record<string, number>;
  leadsByCredit: Record<string, number>;
  leadsByStatus: Record<string, number>;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  iconName: string;
  tag?: string;
}

export interface ServiceStep {
  number: string;
  title: string;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SimulatorParams {
  creditAmount: number;
  months: number;
  adminFeePercentage: number;
  biddingPercentage: number;
}
