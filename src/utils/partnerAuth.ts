import { PARTNERS } from './partnerConfig';

export interface PartnerAccount {
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

export const INITIAL_DEFAULT_PASSWORD = '3P@socios';
export const MASTER_EMERGENCY_CODE = '3P-RECUPERA-2025';

const STORAGE_KEY = '3p_partner_accounts_v2';

/**
 * Contas padrão iniciais para os 3 sócios e gestão 3P.
 * Todas iniciam com a senha provisória '3P@socios' e com a flag mustChangePassword = true.
 */
function createInitialAccounts(): Record<string, PartnerAccount> {
  const accounts: Record<string, PartnerAccount> = {};

  PARTNERS.forEach(p => {
    accounts[p.email.toLowerCase()] = {
      id: p.id,
      email: p.email.toLowerCase(),
      name: p.name,
      phone: p.phone,
      password: INITIAL_DEFAULT_PASSWORD,
      mustChangePassword: true,
      passwordChangedAt: null,
      lastLoginAt: null
    };
  });

  // Conta de Gestão Nívea Cristina
  accounts['niveacristinas@gmail.com'] = {
    id: 'nivea',
    email: 'niveacristinas@gmail.com',
    name: 'Nívea Cristina (Sócia Gestora)',
    phone: '5511996876748',
    password: INITIAL_DEFAULT_PASSWORD,
    mustChangePassword: true,
    passwordChangedAt: null,
    lastLoginAt: null
  };

  // E-mail institucional de contato
  accounts['contato@3ppatrimonio.com.br'] = {
    id: 'contato',
    email: 'contato@3ppatrimonio.com.br',
    name: 'Contato 3P Patrimônio',
    phone: '5511996876748',
    password: INITIAL_DEFAULT_PASSWORD,
    mustChangePassword: true,
    passwordChangedAt: null,
    lastLoginAt: null
  };

  return accounts;
}

/**
 * Obtém todas as contas salvas localmente
 */
export function getPartnerAccounts(): Record<string, PartnerAccount> {
  if (typeof window === 'undefined') {
    return createInitialAccounts();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialAccounts();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Garante que os 3 sócios sempre estejam presentes mesmo se o storage estiver parcial
    const initial = createInitialAccounts();
    let hasMissing = false;
    Object.keys(initial).forEach(key => {
      if (!parsed[key]) {
        parsed[key] = initial[key];
        hasMissing = true;
      }
    });
    if (hasMissing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler contas dos sócios:', e);
    return createInitialAccounts();
  }
}

/**
 * Salva as contas no storage local
 */
export function savePartnerAccounts(accounts: Record<string, PartnerAccount>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Erro ao salvar contas dos sócios:', e);
  }
}

/**
 * Localiza a conta do sócio pelo e-mail
 */
export function findPartnerAccount(email: string): PartnerAccount | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  const accounts = getPartnerAccounts();

  if (accounts[clean]) return accounts[clean];

  // Busca por correspondência no prefixo de nome
  if (clean.includes('william')) return accounts['william@3ppatrimonio.com.br'];
  if (clean.includes('carlos')) return accounts['carlos@3ppatrimonio.com.br'];
  if (clean.includes('joao') || clean.includes('joão')) return accounts['joao@3ppatrimonio.com.br'];
  if (clean.includes('nivea')) return accounts['niveacristinas@gmail.com'];
  if (clean.includes('contato')) return accounts['contato@3ppatrimonio.com.br'];

  // Busca parcial
  const foundKey = Object.keys(accounts).find(k => k.includes(clean) || clean.includes(k));
  return foundKey ? accounts[foundKey] : undefined;
}

export interface AuthResult {
  success: boolean;
  mustChangePassword?: boolean;
  partner?: PartnerAccount;
  error?: string;
  isFirstAccess?: boolean;
}

/**
 * Verifica as credenciais do sócio
 */
export async function authenticatePartner(email: string, passwordAttempt: string): Promise<AuthResult> {
  const account = findPartnerAccount(email);

  if (!account) {
    return {
      success: false,
      error: `E-mail não reconhecido como sócio credenciado da 3P Patrimônio.`
    };
  }

  // Tenta autenticação no backend se disponível
  try {
    const res = await fetch('/api/partner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, password: passwordAttempt })
    });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData.success) {
        // Atualiza localmente
        const accounts = getPartnerAccounts();
        accounts[account.email].mustChangePassword = serverData.mustChangePassword;
        accounts[account.email].lastLoginAt = new Date().toISOString();
        savePartnerAccounts(accounts);

        return {
          success: true,
          mustChangePassword: serverData.mustChangePassword,
          isFirstAccess: serverData.mustChangePassword,
          partner: accounts[account.email]
        };
      }
    }
  } catch {
    // Fallback offline / local
  }

  // Validação Local
  const isInitialPassword = passwordAttempt === INITIAL_DEFAULT_PASSWORD;
  const isCustomPassword = passwordAttempt === account.password;

  if (!isInitialPassword && !isCustomPassword) {
    if (account.password !== INITIAL_DEFAULT_PASSWORD && isInitialPassword) {
      return {
        success: false,
        error: `A senha inicial "${INITIAL_DEFAULT_PASSWORD}" já foi alterada anteriormente por este sócio. Use sua nova senha ou clique em "Recuperar Acesso".`
      };
    }
    return {
      success: false,
      error: `Senha incorreta. A senha inicial provisória é "${INITIAL_DEFAULT_PASSWORD}". Caso tenha esquecido, use a recuperação de senha.`
    };
  }

  // Se a senha estiver correta, verifica se precisa forçar troca
  const needsChange = account.mustChangePassword || account.password === INITIAL_DEFAULT_PASSWORD;

  // Atualiza último login
  const accounts = getPartnerAccounts();
  accounts[account.email].lastLoginAt = new Date().toISOString();
  savePartnerAccounts(accounts);

  return {
    success: true,
    mustChangePassword: needsChange,
    isFirstAccess: needsChange,
    partner: accounts[account.email]
  };
}

/**
 * Altera a senha do sócio e desativa a exigência de troca
 */
export async function changePartnerPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const account = findPartnerAccount(email);
  if (!account) {
    return { success: false, error: 'Sócio não encontrado.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
  }

  if (newPassword === INITIAL_DEFAULT_PASSWORD) {
    return {
      success: false,
      error: `Por segurança, a nova senha não pode ser a senha provisória padrão "${INITIAL_DEFAULT_PASSWORD}". Escolha uma senha pessoal diferente.`
    };
  }

  // Salva no backend
  try {
    await fetch('/api/partner/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, newPassword })
    });
  } catch (e) {
    console.warn('Backend sync failed, saving locally:', e);
  }

  // Salva localmente
  const accounts = getPartnerAccounts();
  accounts[account.email] = {
    ...accounts[account.email],
    password: newPassword,
    mustChangePassword: false,
    passwordChangedAt: new Date().toISOString()
  };
  savePartnerAccounts(accounts);

  return { success: true };
}

export interface RecoveryRequestResult {
  success: boolean;
  code?: string;
  message: string;
  partner?: PartnerAccount;
  error?: string;
}

/**
 * Solicita a recuperação de senha: gera código de 6 dígitos
 */
export async function requestPasswordRecovery(email: string): Promise<RecoveryRequestResult> {
  const account = findPartnerAccount(email);
  if (!account) {
    return {
      success: false,
      message: 'E-mail não encontrado entre os sócios credenciados.',
      error: 'E-mail não cadastrado.'
    };
  }

  // Gera código numérico de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutos

  // Tenta sincronizar com o backend
  try {
    await fetch('/api/partner/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, code, expiresAt })
    });
  } catch {}

  // Salva localmente
  const accounts = getPartnerAccounts();
  accounts[account.email] = {
    ...accounts[account.email],
    resetCode: code,
    resetCodeExpiresAt: expiresAt
  };
  savePartnerAccounts(accounts);

  return {
    success: true,
    code,
    message: `Código de recuperação gerado para ${account.name}.`,
    partner: accounts[account.email]
  };
}

/**
 * Valida o código de recuperação e redefine a senha do sócio
 */
export async function verifyAndResetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const account = findPartnerAccount(email);
  if (!account) {
    return { success: false, error: 'Sócio não encontrado.' };
  }

  const cleanCode = (code || '').trim();
  const isMasterCode = cleanCode === MASTER_EMERGENCY_CODE;
  const isMatchCode = account.resetCode && account.resetCode === cleanCode;

  if (!isMasterCode && !isMatchCode) {
    return { success: false, error: 'Código de recuperação inválido ou expirado.' };
  }

  if (!isMasterCode && account.resetCodeExpiresAt && Date.now() > account.resetCodeExpiresAt) {
    return { success: false, error: 'O código de recuperação expirou (validade: 30 minutos). Solicite um novo código.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'A nova senha deve possuir pelo menos 6 caracteres.' };
  }

  if (newPassword === INITIAL_DEFAULT_PASSWORD) {
    return {
      success: false,
      error: `A nova senha não pode ser a senha provisória "${INITIAL_DEFAULT_PASSWORD}". Defina uma senha definitiva.`
    };
  }

  // Atualiza no backend
  try {
    await fetch('/api/partner/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email, code: cleanCode, newPassword })
    });
  } catch {}

  // Atualiza localmente
  const accounts = getPartnerAccounts();
  accounts[account.email] = {
    ...accounts[account.email],
    password: newPassword,
    mustChangePassword: false,
    passwordChangedAt: new Date().toISOString(),
    resetCode: null,
    resetCodeExpiresAt: null
  };
  savePartnerAccounts(accounts);

  return { success: true };
}

/**
 * Restaura a conta para a senha provisória inicial 3P@socios,
 * exigindo nova troca obrigatória no próximo acesso.
 */
export async function restoreInitialPassword(email: string): Promise<{ success: boolean; error?: string }> {
  const account = findPartnerAccount(email);
  if (!account) {
    return { success: false, error: 'Sócio não encontrado.' };
  }

  const accounts = getPartnerAccounts();
  accounts[account.email] = {
    ...accounts[account.email],
    password: INITIAL_DEFAULT_PASSWORD,
    mustChangePassword: true,
    passwordChangedAt: null,
    resetCode: null,
    resetCodeExpiresAt: null
  };
  savePartnerAccounts(accounts);

  try {
    await fetch('/api/partner/reset-to-default', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: account.email })
    });
  } catch {}

  return { success: true };
}
