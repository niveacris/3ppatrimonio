/**
 * Utilitário de Validação e Sanitização de E-mails para a 3P Patrimônio
 * Suporta detecção de sintaxe RFC 5322, correção automática de erros comuns de digitação
 * e bloqueio de provedores de e-mails temporários/descartáveis.
 */

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  suggestedEmail?: string;
  domain?: string;
  isDisposable?: boolean;
}

// Domínios descartáveis comuns que devem ser rejeitados para garantir leads reais
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'nada.ltd',
  'getairmail.com',
  'mohmal.com',
  'fakemailgenerator.com',
  'trashmail.com',
  'burnermail.io',
  'crazymailing.com',
  'temp-mail.org',
  'maildrop.cc',
  'inboxkitten.com',
  'mytemp.email',
  'tempmailo.com',
  'generator.email',
  'emailondeck.com',
  'tempail.com',
  'fakeinbox.com'
]);

// Mapa de erros comuns de digitação em domínios populares
const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  // Gmail
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmaio.com': 'gmail.com',
  'gmaol.com': 'gmail.com',
  'gmail.com.br': 'gmail.com', // Gmail não possui domínio oficial @gmail.com.br (é sempre .com)

  // Hotmail / Outlook
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmeil.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmaol.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outluk.com': 'outlook.com',
  'outloock.com': 'outlook.com',

  // Yahoo
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaoo.com': 'yahoo.com',
  'yaho.com.br': 'yahoo.com.br',
  'yahooo.com.br': 'yahoo.com.br',

  // iCloud
  'icloud.co': 'icloud.com',
  'icoud.com': 'icloud.com',
  'iclod.com': 'icloud.com',

  // Provedores Brasileiros comuns
  'uol.com': 'uol.com.br',
  'uoll.com.br': 'uol.com.br',
  'bol.com': 'bol.com.br',
  'boll.com.br': 'bol.com.br',
  'terra.com': 'terra.com.br'
};

// Expressão regular rigorosa para conformidade RFC 5322
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Valida minuciosamente um endereço de e-mail para envio do e-book
 */
export function validateEmail(rawEmail: string): EmailValidationResult {
  const email = (rawEmail || '').trim().toLowerCase();

  if (!email) {
    return {
      isValid: false,
      error: 'Por favor, informe seu endereço de e-mail.'
    };
  }

  // Verifica caracteres proibidos ou espaços internos
  if (/\s/.test(email)) {
    return {
      isValid: false,
      error: 'O e-mail não pode conter espaços.'
    };
  }

  // Verifica a presença de exatamente um arroba
  const atParts = email.split('@');
  if (atParts.length !== 2) {
    return {
      isValid: false,
      error: 'O formato do e-mail é inválido (deve conter @).'
    };
  }

  const [username, domain] = atParts;

  if (!username || username.length < 1) {
    return {
      isValid: false,
      error: 'Informe a parte inicial do e-mail antes do @.'
    };
  }

  if (!domain || domain.length < 3) {
    return {
      isValid: false,
      error: 'Informe o domínio completo do e-mail após o @ (ex: @gmail.com).'
    };
  }

  // Verifica se o domínio possui pelo menos um ponto e TLD válido
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return {
      isValid: false,
      error: 'O domínio do e-mail deve ter uma extensão válida (ex: .com ou .com.br).'
    };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return {
      isValid: false,
      error: 'Extensão de domínio inválida (ex: .com, .com.br).'
    };
  }

  // Validação por expressão regular geral
  if (!STRICT_EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      error: 'Endereço de e-mail com caracteres ou formato inválido.'
    };
  }

  // Verifica domínios descartáveis/temporários
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      isDisposable: true,
      error: 'Por favor, utilize um e-mail pessoal ou corporativo válido (não descartável) para receber o e-book.'
    };
  }

  // Verifica sugestão de correção para erros de digitação comuns
  if (COMMON_DOMAIN_TYPOS[domain]) {
    const suggestedDomain = COMMON_DOMAIN_TYPOS[domain];
    const suggestedEmail = `${username}@${suggestedDomain}`;
    return {
      isValid: true, // É estruturalmente válido, mas possui sugestão de correção
      domain,
      suggestion: suggestedDomain,
      suggestedEmail
    };
  }

  return {
    isValid: true,
    domain
  };
}

/**
 * Validação simplificada em tempo real enquanto o usuário digita
 */
export function isTypingValidEmail(email: string): boolean {
  if (!email || email.length < 5) return false;
  return email.includes('@') && email.includes('.') && email.length > 6;
}
