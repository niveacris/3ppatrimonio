import React, { useState } from 'react';
import {
  X, Lock, Mail, ShieldCheck, CheckCircle2, KeyRound, UserCheck,
  AlertTriangle, ArrowLeft, RefreshCw, Copy, Check, MessageSquare,
  ShieldAlert, Eye, EyeOff
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PARTNERS, getPartnerByEmail } from '../utils/partnerConfig';
import { resolveAssetUrl } from '../utils/assets';
import {
  authenticatePartner,
  changePartnerPassword,
  requestPasswordRecovery,
  verifyAndResetPassword,
  restoreInitialPassword,
  INITIAL_DEFAULT_PASSWORD,
  findPartnerAccount,
  PartnerAccount
} from '../utils/partnerAuth';

interface PartnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (partnerName: string, partnerEmail: string) => void;
}

type ModalViewMode = 'login' | 'must_change_password' | 'recovery';

export const PartnerLoginModal: React.FC<PartnerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [viewMode, setViewMode] = useState<ModalViewMode>('login');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('william');
  const [email, setEmail] = useState('william@3ppatrimonio.com.br');
  const [password, setPassword] = useState(INITIAL_DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  // Estados para troca obrigatória de senha
  const [pendingPartner, setPendingPartner] = useState<PartnerAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados para recuperação de senha
  const [recoveryEmail, setRecoveryEmail] = useState('william@3ppatrimonio.com.br');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [showRecoveryPassword, setShowRecoveryPassword] = useState(false);

  // Feedback geral
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectPartner = (pId: string) => {
    setSelectedPartnerId(pId);
    if (pId === 'socios_admin') {
      setEmail('socios@3ppatrimonio.com.br');
      setRecoveryEmail('socios@3ppatrimonio.com.br');
      setPassword(INITIAL_DEFAULT_PASSWORD);
      setErrorMsg('');
      setSuccessMsg('');
      return;
    }
    const p = PARTNERS.find(item => item.id === pId);
    if (p) {
      setEmail(p.email);
      setRecoveryEmail(p.email);
      setPassword(INITIAL_DEFAULT_PASSWORD);
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const result = await authenticatePartner(email, password);

      if (!result.success) {
        setErrorMsg(result.error || 'Credenciais inválidas.');
        setLoading(false);
        return;
      }

      if (result.mustChangePassword && result.partner) {
        // Primeiro acesso detectado: obriga troca imediata de senha!
        setPendingPartner(result.partner);
        setViewMode('must_change_password');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(false);
        return;
      }

      // Login direto com senha personalizada já trocada
      const partnerName = result.partner?.name || 'Sócio 3P';
      const partnerEmail = result.partner?.email || email;
      setSuccessMsg(`Bem-vindo, ${partnerName}! Abrindo CRM dos Sócios...`);

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(partnerName, partnerEmail);
      }, 400);
    } catch (err: any) {
      setErrorMsg('Erro ao autenticar. Verifique sua conexão e tente novamente.');
      setLoading(false);
    }
  };

  const handleMandatoryPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!pendingPartner) {
      setErrorMsg('Sessão expirada. Faça login novamente.');
      setViewMode('login');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword === INITIAL_DEFAULT_PASSWORD) {
      setErrorMsg(`Por segurança patrimonial, a nova senha não pode ser a senha provisória inicial (${INITIAL_DEFAULT_PASSWORD}).`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('A nova senha e a confirmação não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await changePartnerPassword(pendingPartner.email, newPassword);
      if (!res.success) {
        setErrorMsg(res.error || 'Erro ao alterar senha.');
        setLoading(false);
        return;
      }

      setSuccessMsg(`✓ Senha alterada com sucesso para ${pendingPartner.name}! Acessando o CRM...`);

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(pendingPartner.name, pendingPartner.email);
      }, 600);
    } catch (err: any) {
      setErrorMsg('Falha ao registrar nova senha.');
      setLoading(false);
    }
  };

  const handleRequestRecoveryCode = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await requestPasswordRecovery(recoveryEmail);
      if (!res.success) {
        setErrorMsg(res.message || 'Erro ao solicitar código de recuperação.');
        setLoading(false);
        return;
      }

      if (res.code) {
        setGeneratedCode(res.code);
        setRecoveryCode(res.code); // Pré-preenche para conveniência
        setSuccessMsg(`Código de segurança gerado com sucesso para ${res.partner?.name || 'o sócio'}.`);
      }
    } catch (err) {
      setErrorMsg('Não foi possível gerar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!recoveryCode) {
      setErrorMsg('Informe o código de 6 dígitos gerado.');
      return;
    }

    if (recoveryNewPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (recoveryNewPassword === INITIAL_DEFAULT_PASSWORD) {
      setErrorMsg(`A nova senha não pode ser a provisória "${INITIAL_DEFAULT_PASSWORD}".`);
      return;
    }

    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setErrorMsg('As senhas digitadas não conferem.');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyAndResetPassword(recoveryEmail, recoveryCode, recoveryNewPassword);
      if (!res.success) {
        setErrorMsg(res.error || 'Código inválido ou expirado.');
        setLoading(false);
        return;
      }

      const p = findPartnerAccount(recoveryEmail);
      const partnerName = p?.name || 'Sócio';

      setSuccessMsg(`✓ Senha redefinida com sucesso para ${partnerName}! Acessando o CRM...`);

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(partnerName, recoveryEmail);
      }, 600);
    } catch (err) {
      setErrorMsg('Falha ao redefinir a senha.');
      setLoading(false);
    }
  };

  const handleRestoreDefaultPassword = async () => {
    if (!confirm(`Deseja restaurar a senha da conta ${recoveryEmail} para a senha provisória padrão "${INITIAL_DEFAULT_PASSWORD}"? O sócio terá que cadastrar uma nova senha no próximo acesso.`)) {
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await restoreInitialPassword(recoveryEmail);
      if (res.success) {
        setEmail(recoveryEmail);
        setPassword(INITIAL_DEFAULT_PASSWORD);
        setViewMode('login');
        setSuccessMsg(`Conta restaurada para a senha padrão "${INITIAL_DEFAULT_PASSWORD}". No primeiro login será exigida uma nova senha.`);
      } else {
        setErrorMsg(res.error || 'Erro ao restaurar senha padrão.');
      }
    } catch {
      setErrorMsg('Erro de conexão ao restaurar.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // Avaliação de força de senha
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: 'Vazia', color: 'bg-slate-700' };
    if (pwd.length < 6) return { score: 1, text: 'Muito curta', color: 'bg-red-500' };
    let score = 1;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;

    if (score <= 2) return { score: 2, text: 'Média', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, text: 'Boa', color: 'bg-blue-500' };
    return { score: 4, text: 'Excelente', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(viewMode === 'must_change_password' ? newPassword : recoveryNewPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 pt-0 sm:pt-0 shadow-2xl space-y-5 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/80 hover:bg-slate-800 rounded-full transition-all border border-slate-800 z-10"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header com Logo subida e destacada */}
        <div className="text-center flex flex-col items-center -mt-12 sm:-mt-14">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border-2 border-amber-500/40 p-1.5 shadow-2xl shadow-amber-500/20 flex items-center justify-center mb-3">
            <BrandLogo variant="badge_3p" size="md" />
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-amber-500/20">
              {viewMode === 'must_change_password'
                ? 'Primeiro Acesso • Segurança'
                : viewMode === 'recovery'
                ? 'Recuperação de Acesso'
                : 'CRM Interno dos Sócios'}
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {viewMode === 'must_change_password'
                ? 'Troca Obrigatória de Senha'
                : viewMode === 'recovery'
                ? 'Recuperar Senha do Sócio'
                : 'Acesso dos 3 Sócios'}
            </h2>
            <p className="text-xs text-slate-400">
              {viewMode === 'must_change_password'
                ? 'Substitua a senha provisória 3P@socios por sua senha definitiva.'
                : viewMode === 'recovery'
                ? 'Gere um código de verificação para definir uma nova senha.'
                : 'Distribuição balanceada 1/3 e gestão patrimonial.'}
            </p>
          </div>
        </div>

        {/* Feedback de Erro ou Sucesso */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-xs font-medium flex items-start gap-2 animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-medium flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODO 1: LOGIN PRINCIPAL COM SENHA PROVISÓRIA INICIAL    */}
        {/* ======================================================== */}
        {viewMode === 'login' && (
          <div className="space-y-4">
            {/* Seleção Rápida dos 3 Sócios com Fotos Oficiais */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Selecione seu perfil de sócio:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PARTNERS.map((partner) => {
                  const isSelected = selectedPartnerId === partner.id;
                  return (
                    <button
                      key={partner.id}
                      type="button"
                      onClick={() => handleSelectPartner(partner.id)}
                      className={`relative p-2 rounded-2xl border transition-all flex flex-col items-center text-center cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 mb-1.5 shadow-md">
                        <img
                          src={resolveAssetUrl(partner.avatar)}
                          alt={partner.name}
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-amber-400 drop-shadow" />
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                        {partner.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 line-clamp-1">
                        {partner.email.split('@')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Opção de Acesso Admin Geral: socios@3ppatrimonio.com.br */}
              <button
                type="button"
                onClick={() => handleSelectPartner('socios_admin')}
                className={`w-full py-2 px-3 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                  selectedPartnerId === 'socios_admin'
                    ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-1 ring-amber-500/30 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold leading-tight">Admin Geral dos Sócios</span>
                    <span className="text-[10px] text-slate-400 font-mono">socios@3ppatrimonio.com.br</span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {selectedPartnerId === 'socios_admin' ? '✓ Selecionado' : 'Conta Admin'}
                </span>
              </button>
            </div>

            {/* Formulário de Login */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  E-mail do Sócio
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="william@3ppatrimonio.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email);
                      setErrorMsg('');
                      setSuccessMsg('');
                      setViewMode('recovery');
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Senha de acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                    title={showPassword ? 'Ocultar' : 'Ver'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
                  <span>Senha inicial provisória: <strong className="text-amber-400 font-mono">3P@socios</strong></span>
                  <span className="text-slate-500">(troca no 1º acesso)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verificando...
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      Entrar como {PARTNERS.find(p => p.id === selectedPartnerId)?.name.split(' ')[0] || 'Sócio'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Aviso Informativo dos Sócios */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Segurança das Contas dos Sócios:</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  • Senha inicial provisória definida como <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">3P@socios</code>.
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  • No primeiro acesso, o sistema exige a definição imediata de uma nova senha pessoal definitiva.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-medium">⚖️ Divisão circular 1/3 de leads ativa.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email);
                      setErrorMsg('');
                      setSuccessMsg('');
                      setViewMode('recovery');
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                  >
                    Recuperar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODO 2: TROCA OBRIGATÓRIA DE SENHA NO 1º ACESSO         */}
        {/* ======================================================== */}
        {viewMode === 'must_change_password' && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Troca Obrigatória no Primeiro Acesso</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Olá, <strong className="text-white">{pendingPartner?.name}</strong>!
                Para assegurar a governança e proteção dos dados patrimoniais dos clientes da 3P,
                é necessário cadastrar sua nova senha pessoal definitiva agora.
              </p>
            </div>

            <form onSubmit={handleMandatoryPasswordChange} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Nova Senha Pessoal
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Medidor de força da senha */}
              {newPassword && (
                <div className="space-y-1 px-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Segurança da senha:</span>
                    <span className="font-bold text-slate-200">{strength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-red-400 px-1">As senhas digitadas não coincidem.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Salvando...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar Nova Senha & Acessar CRM</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setViewMode('login');
                }}
                className="w-full text-slate-400 hover:text-white text-xs font-semibold py-1.5 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODO 3: RECUPERAÇÃO DE SENHA DOS SÓCIOS                 */}
        {/* ======================================================== */}
        {viewMode === 'recovery' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-300">
                Selecione ou confirme o E-mail do Sócio
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ex: william@3ppatrimonio.com.br"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PARTNERS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setRecoveryEmail(p.email)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      recoveryEmail.toLowerCase() === p.email.toLowerCase()
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setRecoveryEmail('socios@3ppatrimonio.com.br')}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                    recoveryEmail.toLowerCase() === 'socios@3ppatrimonio.com.br'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Admin Sócios
                </button>
              </div>
            </div>

            {/* Botão de gerar código */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestRecoveryCode}
                disabled={loading}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{generatedCode ? 'Gerar Novo Código' : 'Gerar Código de Recuperação'}</span>
              </button>
            </div>

            {/* Exibição do Código Gerado para o Sócio */}
            {generatedCode && (
              <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-3.5 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Código de Segurança (30 min):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono transition-colors"
                  >
                    {codeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{codeCopied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="text-2xl font-black font-mono tracking-widest text-center text-white bg-slate-900/90 py-2 rounded-xl border border-slate-800">
                  {generatedCode}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Válido para <strong className="text-slate-200">{recoveryEmail}</strong></span>
                  <a
                    href={`https://wa.me/5511996876748?text=${encodeURIComponent(`Olá! Sou sócio da 3P Patrimônio e solicitei recuperação de acesso para ${recoveryEmail}. Código de verificação: ${generatedCode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold underline"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp 3P</span>
                  </a>
                </div>
              </div>
            )}

            {/* Formulário de Redefinição */}
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Código de 6 Dígitos
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Digite os 6 dígitos"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.trim())}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono tracking-wider"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Nova Senha Definitiva
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showRecoveryPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={recoveryNewPassword}
                    onChange={(e) => setRecoveryNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRecoveryPassword(!showRecoveryPassword)}
                    className="absolute right-3.5 top-2.5 text-xs text-slate-500 hover:text-slate-300"
                  >
                    {showRecoveryPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showRecoveryPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Confirme a nova senha"
                    value={recoveryConfirmPassword}
                    onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !recoveryCode || recoveryNewPassword.length < 6 || recoveryNewPassword !== recoveryConfirmPassword}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Redefinindo...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Redefinir Senha & Conectar</span>
                  </>
                )}
              </button>
            </form>

            {/* Ação Alternativa: Restaurar para Senha Provisória 3P@socios */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRestoreDefaultPassword}
                disabled={loading}
                className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors py-1 text-center"
              >
                Ou restaurar conta para senha padrão <strong className="text-amber-300 font-mono">3P@socios</strong> (Troca no próximo login)
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setViewMode('login');
                }}
                className="w-full text-slate-400 hover:text-white text-xs font-semibold py-1.5 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
