import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  User, 
  Lock, 
  Mail, 
  Sparkles,
  GraduationCap,
  Briefcase,
  Wrench,
  Building,
  Info,
  Eye,
  EyeOff,
  Crown,
  AlertCircle
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { UserRole, UserAccount } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { validateEmailStrict, hashPassword, generateSalt } from '../services/authSecurity';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    currentUser, 
    login, 
    logout, 
    registerUser,
    showToast
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
  const [regDoc, setRegDoc] = useState('');
  const [regDept, setRegDept] = useState('Depto. de Engenharia de Agrimensura - UFU');
  const [regEmailError, setRegEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginEmailChange = (val: string) => {
    setLoginEmail(val);
    if (val.includes(',')) {
      setLoginEmailError('Atenção: Vírgulas (,) não são permitidas. Digite ponto (.) para o domínio institucional (ex: leonardo.cardoso@ufu.br).');
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
        createdAt: new Date().toISOString()
      };
      registerUser(newUser);
      setIsAuthModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (user: UserAccount) => {
    await login(user.email, undefined, user);
    setIsAuthModalOpen(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'aluno': return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'professor': return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'tecnico': return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'coordenador': return <Building className="w-4 h-4 text-emerald-600" />;
      default: return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'aluno': return 'Visualiza horários e solicita laboratório / apoio técnico';
      case 'professor': return 'Visualiza horários e solicita laboratório / apoio para aulas e projetos';
      case 'tecnico': return 'Analisa solicitações, aprova/recusa e gerencia instrumentos na Sala 1B308';
      case 'coordenador': return 'Gestão total da grade semestral, leitor de PDF e auditoria';
      default: return 'Visualização pública';
    }
  };

  // Apenas perfis genéricos de teste são exibidos para demonstração rápida (Master Leonardo é estritamente confidencial)
  const demoUsers = INITIAL_USERS.filter(u => u.id !== 'usr-master');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Identificação & Autenticação Segura</h3>
              <p className="text-xs text-slate-400 mt-0.5">SILAB • Laboratórios LASER & SIGEO • UFU</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Se já estiver logado: Mostra detalhes da conta e botão de sair */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-xs">
                  {currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentUser.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{currentUser.roleTitle || `Perfil: ${currentUser.role}`}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div><strong>Permissões:</strong> {getRoleDescription(currentUser.role)}</div>
                <div><strong>Documento:</strong> {currentUser.documentId}</div>
                <div><strong>Departamento:</strong> {currentUser.department}</div>
                <div><strong>Notificações por E-mail:</strong> <span className="text-emerald-600 font-bold">Ativas e Validadas ✓</span></div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                >
                  Sair da Conta (Modo Visitante)
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
              {/* Contas de Demonstração Rápidas para Teste */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ambiente de Teste • Contas Rápidas para Avaliação:</span>
                  </span>
                </div>

                {/* Contas de teste (Aluno, Professor, Coordenador, Técnico) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleQuickLogin(u)}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 text-left hover:border-blue-500 hover:shadow-xs transition cursor-pointer group flex items-start gap-2"
                    >
                      <div className="mt-0.5">{getRoleIcon(u.role)}</div>
                      <div className="leading-tight flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 truncate">{u.name}</div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                          {u.roleTitle || u.role}
                        </span>
                        <span className="text-[9px] text-slate-400 block line-clamp-1 mt-0.5">
                          Senha teste: <code className="font-mono">123456</code>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Informação sobre os Níveis de Acesso */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600" /> Regra de Governança & Notificações:
                </div>
                <p>• <strong>Sem Login:</strong> Apenas consulta horários e rastreia por protocolo.</p>
                <p>• <strong>Alunos e Professores:</strong> Solicitam horários e recebem confirmação por e-mail.</p>
                <p>• <strong>Técnicos e Coordenadores:</strong> Aprovam/recusam reservas e gerenciam máquinas na Sala 1B308.</p>
              </div>

              {/* Alternador Login / Cadastro */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Entrar com E-mail e Senha
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Criar Nova Conta
                </button>
              </div>

              {/* Formulário de Login */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">E-mail Institucional:</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="seu.email@ufu.br"
                        value={loginEmail}
                        onChange={(e) => handleLoginEmailChange(e.target.value)}
                        className={`w-full text-xs bg-slate-50 border rounded-xl px-3 py-2.5 pl-9 focus:ring-2 focus:ring-blue-500 ${
                          loginEmailError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {loginEmailError && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
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
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 pl-9 pr-10 focus:ring-2 focus:ring-blue-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !!loginEmailError}
                    className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isSubmitting ? 'Autenticando com segurança...' : 'Entrar com Autenticação Real'}</span>
                  </button>
                </form>
              ) : (
                /* Formulário de Cadastro */
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome Completo:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Leonardo Cardoso"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
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
                        className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 ${
                          regEmailError ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Perfil Solicitado:</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="aluno">Aluno (Graduação/Pós)</option>
                        <option value="professor">Professor / Docente</option>
                        <option value="tecnico">Técnico de Laboratório (Sala 1B308)</option>
                        <option value="coordenador">Coordenador de Laboratório</option>
                      </select>
                    </div>
                  </div>

                  {regEmailError && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
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
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Senha Segura (Mín. 6):</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !!regEmailError}
                    className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Criptografando credenciais...' : 'Concluir Cadastro com Validação'}</span>
                  </button>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
