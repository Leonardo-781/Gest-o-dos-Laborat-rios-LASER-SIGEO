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
  Info
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { UserRole, UserAccount } from '../types';
import { INITIAL_USERS } from '../data/initialData';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    currentUser, 
    login, 
    logout, 
    registerUser 
  } = useLab();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('aluno');
  const [regDoc, setRegDoc] = useState('');
  const [regDept, setRegDept] = useState('Depto. de Engenharia de Agrimensura');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginEmail, loginPassword);
    if (success) {
      setIsAuthModalOpen(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: regName,
      email: regEmail,
      role: regRole,
      documentId: regDoc,
      department: regDept,
      status: 'pendente',
      avatarInitials: regName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
      createdAt: new Date().toISOString()
    };
    registerUser(newUser);
    setIsAuthModalOpen(false);
  };

  const handleQuickLogin = (user: UserAccount) => {
    login(user.email, '123456', user);
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
      case 'tecnico': return 'Analisa solicitações, aprova/recusa e gerencia instrumentos';
      case 'coordenador': return 'Gestão total da grade semestral, leitor de PDF e auditoria';
      default: return 'Visualização pública';
    }
  };

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
              <h3 className="text-lg font-bold">Identificação & Níveis de Acesso</h3>
              <p className="text-xs text-slate-400 mt-0.5">Laboratórios Laser e Sigeo - Agrimensura</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Se já estiver logado: Mostra detalhes da conta e botão de sair */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-base">
                  {currentUser.avatarInitials || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentUser.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Perfil: {currentUser.role}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div><strong>Permissões:</strong> {getRoleDescription(currentUser.role)}</div>
                <div><strong>Documento:</strong> {currentUser.documentId}</div>
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
              {/* Contas de Demonstração Rápidas */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Escolha uma conta para testar os níveis de permissão:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INITIAL_USERS.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleQuickLogin(u)}
                      className="p-2.5 bg-white rounded-xl border border-blue-200 text-left hover:border-blue-500 hover:shadow-xs transition cursor-pointer group flex items-start gap-2"
                    >
                      <div className="mt-0.5">{getRoleIcon(u.role)}</div>
                      <div className="leading-tight">
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">{u.name}</div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider capitalize block mt-0.5">
                          Perfil: {u.role}
                        </span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                          {getRoleDescription(u.role)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Informação sobre os Níveis de Acesso */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-500" /> Regra de Permissões:
                </div>
                <p>• <strong>Sem Login:</strong> Apenas consulta horários e rastreia por protocolo.</p>
                <p>• <strong>Alunos e Professores:</strong> Solicitam laboratório e apoio técnico.</p>
                <p>• <strong>Técnicos (Monitores) e Coordenadores:</strong> Aprovam/recusam e fazem alterações na grade.</p>
              </div>

              {/* Alternador Login / Cadastro */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
                    mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Entrar com E-mail
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
                        type="email"
                        required
                        placeholder="usuario@universidade.edu.br"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 pl-9 focus:ring-2 focus:ring-blue-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Senha:</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 pl-9 focus:ring-2 focus:ring-blue-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <LogIn className="w-4 h-4" /> Entrar no Sistema
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
                      placeholder="Ex: João da Silva"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">E-mail Institucional:</label>
                      <input
                        type="email"
                        required
                        placeholder="nome@universidade.edu.br"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Perfil / Vínculo:</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="aluno">Aluno (Graduação/Pós)</option>
                        <option value="professor">Professor / Docente</option>
                        <option value="tecnico">Técnico de Laboratório</option>
                        <option value="coordenador">Coordenador de Laboratório</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Matrícula ou SIAPE:</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 20240192"
                        value={regDoc}
                        onChange={(e) => setRegDoc(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Senha:</label>
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
                    className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" /> Concluir Cadastro
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
