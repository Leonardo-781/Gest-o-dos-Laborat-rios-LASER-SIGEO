import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  Info, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Building2,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { UserRole, UserAccount, LabId } from '../types';
import { validateEmailStrict, hashPassword, generateSalt } from '../services/authSecurity';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    currentUser, 
    login, 
    logout, 
    registerUser,
    showToast,
    canUserManageLab
  } = useLab();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmailError, setLoginEmailError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('aluno');
  const [regRequestedLabs, setRegRequestedLabs] = useState<LabId[]>(['laser', 'sigeo']);
  const [regDoc, setRegDoc] = useState('');
  const [regDept, setRegDept] = useState('Depto. de Engenharia de Agrimensura - UFU');
  const [regEmailError, setRegEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const LAB_OPTIONS: { id: LabId; name: string; room: string; badgeColor: string }[] = [
    { id: 'laser', name: 'LASER', room: 'Sala 1B309', badgeColor: 'bg-blue-600' },
    { id: 'sigeo', name: 'SIGEO', room: 'Sala 1B307', badgeColor: 'bg-emerald-600' },
    { id: 'ltgeo', name: 'LTGEO', room: 'Sala 1B210', badgeColor: 'bg-orange-600' },
  ];

  if (!isAuthModalOpen) return null;

  const toggleRequestedLab = (lab: LabId) => {
    setRegRequestedLabs(prev => {
      if (prev.includes(lab)) {
        if (prev.length === 1) {
          showToast('Selecione pelo menos um laboratório para sua solicitação de perfil técnico.');
          return prev;
        }
        return prev.filter(l => l !== lab);
      } else {
        return [...prev, lab];
      }
    });
  };

  const handleLoginEmailChange = (val: string) => {
    setLoginEmail(val);
    if (val.includes(',')) {
      setLoginEmailError('Atenção: Vírgulas (,) não são permitidas. Digite ponto (.) para o domínio institucional.');
    } else {
      setLoginEmailError(null);
    }
  };

  const handleRegEmailChange = (val: string) => {
    setRegEmail(val);
    if (val.includes(',')) {
      setRegEmailError('Atenção: Vírgulas (,) não são permitidas. Digite ponto (.) para o domínio institucional.');
    } else {
      setRegEmailError(null);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        setIsAuthModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailCheck = validateEmailStrict(regEmail);
    if (!emailCheck.isValid) {
      showToast(emailCheck.error || 'E-mail inválido.');
      setRegEmailError(emailCheck.error || null);
      return;
    }

    if (regPassword.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (regRole === 'tecnico' && regRequestedLabs.length === 0) {
      showToast('Selecione ao menos um laboratório para sua atuação técnica.');
      return;
    }

    setIsSubmitting(true);
    try {
      const salt = generateSalt();
      const hash = await hashPassword(regPassword, salt);

      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: regName,
        email: regEmail.trim().toLowerCase(),
        role: regRole,
        documentId: regDoc,
        department: regDept,
        status: 'pendente',
        avatarInitials: regName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
        passwordSalt: salt,
        passwordHash: hash,
        emailVerified: true,
        requestedLabs: regRole === 'tecnico' ? regRequestedLabs : undefined,
        assignedLabs: regRole === 'tecnico' ? regRequestedLabs : undefined,
        permissions: {
          canViewEmails: false,
          canApproveBookings: false,
          canManageTechnicians: false,
          canManageEquipment: false,
          canManageSoftware: false,
          canViewAudit: false,
          assignedLabs: regRole === 'tecnico' ? regRequestedLabs : undefined
        },
        createdAt: new Date().toISOString()
      };
      registerUser(newUser);
      setIsAuthModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'aluno': return 'Visualiza horários e solicita laboratório / apoio técnico';
      case 'professor': return 'Visualiza horários e solicita laboratório / apoio para aulas e projetos';
      case 'tecnico': return 'Gerencia reservas, equipamentos e horários nos laboratórios autorizados';
      case 'coordenador': return 'Gestão total da grade semestral, leitor de PDF e auditoria';
      default: return 'Visualização pública';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header Fixo no Topo (shrink-0 garante que nunca será cortado) */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 relative border-b border-slate-800 shrink-0">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Autenticação Segura SILAB</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Laboratórios LASER & SIGEO • UFU</p>
            </div>
          </div>
        </div>

        {/* Corpo com Rolagem Interna Suave (Nunca corta na tela) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* SE JÁ ESTIVER LOGADO: Exibe informações da conta ativa */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full font-black flex items-center justify-center text-sm shadow-xs shrink-0 ${
                  currentUser.id === 'usr-master'
                    ? 'bg-amber-500 text-white'
                    : currentUser.role === 'tecnico'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {currentUser.id === 'usr-master' ? (
                    <Crown className="w-5 h-5 text-white" />
                  ) : (
                    currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">{currentUser.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{currentUser.roleTitle || `Perfil: ${currentUser.role}`}</span>
                  </div>
                </div>
              </div>

              {/* Jurisdição de Laboratórios Autorizados */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Jurisdição & Escopo de Ação:</span>
                  </span>
                  {currentUser.id === 'usr-master' || currentUser.role === 'coordenador' ? (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-extrabold">
                      Gestão Total (Todos Labs)
                    </span>
                  ) : currentUser.role === 'tecnico' ? (
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-extrabold">
                      Gestão Específica
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-200/70 border border-slate-300 px-2 py-0.5 rounded-full font-semibold">
                      Consulta / Solicitação
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {LAB_OPTIONS.map(lab => {
                    const isAllowed = canUserManageLab(lab.id);
                    return (
                      <div 
                        key={lab.id}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isAllowed 
                            ? 'bg-white border-emerald-300 shadow-2xs ring-1 ring-emerald-500/20' 
                            : 'bg-slate-100/70 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${lab.badgeColor}`} />
                          <span className="font-extrabold text-[11px] text-slate-800">{lab.name}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{lab.room}</div>
                        <div className="mt-1.5">
                          {isAllowed ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              ✓ Autorizado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-500">
                              🔒 Bloqueado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div><strong>Permissões:</strong> {getRoleDescription(currentUser.role)}</div>
                <div><strong>Identificação:</strong> {currentUser.documentId}</div>
                <div><strong>Departamento:</strong> {currentUser.department}</div>
                <div className="text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Notificações e e-mails institucionais ativos</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={logout}
                  className="px-3.5 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                >
                  Sair da Conta (Visitante)
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Alternador Login / Cadastro */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entrar com E-mail
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Criar Nova Conta
                </button>
              </div>

              {/* 1. FORMULÁRIO DE LOGIN */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">E-mail Institucional:</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="seu.email@ufu.br"
                        value={loginEmail}
                        onChange={(e) => handleLoginEmailChange(e.target.value)}
                        className={`w-full text-xs bg-slate-50 border rounded-xl px-3 py-2 pl-9 focus:ring-2 focus:ring-blue-500 font-medium ${
                          loginEmailError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    {loginEmailError && (
                      <p className="mt-1 text-[10px] font-semibold text-rose-600 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.2" />
                        <span>{loginEmailError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Senha de Acesso:</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Digite sua senha"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pl-9 pr-10 focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !!loginEmailError}
                    className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isSubmitting ? 'Autenticando...' : 'Entrar no Sistema'}</span>
                  </button>
                </form>
              ) : (
                /* 2. FORMULÁRIO DE CADASTRO */
                <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome Completo:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">E-mail Institucional:</label>
                      <input
                        type="text"
                        required
                        placeholder="usuario@ufu.br"
                        value={regEmail}
                        onChange={(e) => handleRegEmailChange(e.target.value)}
                        className={`w-full text-xs bg-slate-50 border rounded-xl p-2 focus:ring-2 focus:ring-blue-500 ${
                          regEmailError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Perfil Solicitado:</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                      >
                        <option value="aluno">Aluno (Graduação/Pós)</option>
                        <option value="professor">Professor / Docente</option>
                        <option value="tecnico">Técnico de Laboratório (Específico)</option>
                        <option value="coordenador">Coordenador de Laboratório</option>
                      </select>
                    </div>
                  </div>

                  {/* Seletor de Jurisdição/Laboratórios quando perfil for Técnico */}
                  {regRole === 'tecnico' && (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>Laboratórios Solicitados para Atuação:</span>
                        </label>
                        <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          {regRequestedLabs.length} selecionado{regRequestedLabs.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800 leading-tight">
                        Marque os laboratórios onde você desempenha atividades. O Administrador Master (Leonardo Cardoso) validará sua jurisdição ao confirmar o cargo.
                      </p>
                      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {LAB_OPTIONS.map(lab => {
                          const isSelected = regRequestedLabs.includes(lab.id);
                          return (
                            <button
                              key={lab.id}
                              type="button"
                              onClick={() => toggleRequestedLab(lab.id)}
                              className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-white border-amber-500 shadow-xs ring-1 ring-amber-400'
                                  : 'bg-white/60 border-amber-200/70 text-slate-400 hover:bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-xs font-black ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                  {lab.name}
                                </span>
                                <span className={`w-2 h-2 rounded-full ${lab.badgeColor}`} />
                              </div>
                              <span className="text-[9px] text-slate-500 font-medium mt-0.5">
                                {lab.room}
                              </span>
                              <span className={`text-[9px] font-bold mt-1 inline-block ${
                                isSelected ? 'text-amber-700' : 'text-slate-400'
                              }`}>
                                {isSelected ? 'Solicitado ✓' : 'Não atua'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {regEmailError && (
                    <p className="text-[10px] font-semibold text-rose-600 flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.2" />
                      <span>{regEmailError}</span>
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Matrícula ou SIAPE:</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 20260012"
                        value={regDoc}
                        onChange={(e) => setRegDoc(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Senha (Mín. 6):</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !!regEmailError}
                    className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Criptografando...' : 'Concluir Cadastro'}</span>
                  </button>
                </form>
              )}

              {/* Informação Institucional de Acesso */}
              <div className="pt-2 border-t border-slate-100">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Acesso Institucional SILAB:</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Utilize seu e-mail institucional cadastrado e senha para entrar. Novos alunos, docentes e técnicos devem solicitar acesso na aba <strong>Criar Nova Conta</strong> acima.
                  </p>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
