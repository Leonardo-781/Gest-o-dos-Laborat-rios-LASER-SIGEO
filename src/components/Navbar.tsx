import React from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  ShieldCheck, 
  Cpu, 
  BarChart2, 
  BookOpen, 
  RotateCcw,
  FileUp,
  FileSpreadsheet,
  LogIn,
  Wrench,
  Laptop,
  Mail,
  Crown,
  LayoutGrid
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    currentUser, 
    setIsAuthModalOpen,
    getPendingRequestsCount, 
    getPendingUsersCount,
    getPendingMaintenanceCount,
    getPendingSoftwareCount,
    setIsBookingOpen, 
    setIsRulesOpen,
    firebaseConfig,
    resetToDemoData,
    emails,
    unreadEmailsCount,
    setIsEmailModalOpen
  } = useLab();

  const pendingRequests = getPendingRequestsCount();
  const pendingUsers = getPendingUsersCount();
  const totalPendingCoord = pendingRequests + pendingUsers;

  const pendingMaintenance = getPendingMaintenanceCount();
  const pendingSoftware = getPendingSoftwareCount();
  const totalPendingTech = pendingMaintenance + pendingSoftware;

  // Apenas Coordenadores e Técnicos têm acesso privilegiado
  const isManager = currentUser?.role === 'coordenador' || currentUser?.role === 'tecnico';
  const isMaster = currentUser?.id === 'usr-master' || currentUser?.email?.toLowerCase() === 'leonardo.cardoso@ufu.br';
  const canViewEmails = isMaster || currentUser?.permissions?.canViewEmails === true;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      
      {/* Top Bar Institucional */}
      <div className="border-b border-slate-100 bg-slate-50/90 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              UFU • Universidade Federal de Uberlândia
            </span>
            <span>•</span>
            <span className="font-medium text-slate-600">Agrimensura & Cartografia</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="hidden lg:inline text-slate-400">LASER (1B309) • SIGEO (1B307) • LTGEO (1B210) • Sala dos Técnicos (1B308)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium transition cursor-pointer"
            >
              <BookOpen className="w-3 h-3" />
              <span>Normas dos Labs</span>
            </button>

            <span>•</span>

            {/* Central de E-mails / Notificações (Apenas Leonardo Cardoso e Técnicos Autorizados) */}
            {canViewEmails && (
              <>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-medium transition cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-slate-200/60"
                  title="Central de E-mails e Notificações Institucionais (Acesso Restrito)"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline font-semibold">E-mails</span>
                  {emails.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      unreadEmailsCount > 0 
                        ? 'bg-blue-600 text-white animate-pulse' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {emails.length}
                    </span>
                  )}
                </button>
                <span>•</span>
              </>
            )}

            {firebaseConfig.isConnected && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">Nuvem Online</span>
              </span>
            )}

            {/* Identificação de Acesso */}
            {currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-bold transition cursor-pointer border ${
                  currentUser.id === 'usr-master'
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-950 border-amber-300 hover:border-amber-400 shadow-2xs'
                    : currentUser.role === 'tecnico'
                    ? 'text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
                    : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200'
                }`}
                title="Clique para ver detalhes do seu perfil e gerenciar jurisdição"
              >
                {currentUser.id === 'usr-master' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                ) : (
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0 ${
                    currentUser.role === 'tecnico' ? 'bg-indigo-600' : 'bg-blue-600'
                  }`}>
                    {currentUser.avatarInitials || currentUser.name[0]}
                  </div>
                )}
                <span>
                  {currentUser.name.split(' ')[0]}{' '}
                  {currentUser.id === 'usr-master'
                    ? '(Master • Todos Labs)'
                    : currentUser.role === 'tecnico'
                    ? `(Técnico • ${(currentUser.assignedLabs || currentUser.permissions?.assignedLabs || ['laser', 'sigeo']).map(l => l.toUpperCase()).join('/')})`
                    : currentUser.role === 'coordenador'
                    ? '(Coordenação • Todos Labs)'
                    : `(${currentUser.role.toUpperCase()})`}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1 text-slate-700 hover:text-blue-600 font-bold transition cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>Entrar (Login)</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm('Deseja restaurar as aulas para a grade oficial padrão das fotos?')) resetToDemoData();
              }}
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              title="Restaurar grade padrão"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 gap-4">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0" 
            onClick={() => setActiveTab('grade')}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs tracking-wider">
              SI
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">SILAB</span>
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-xs text-slate-600 font-semibold hidden md:inline">Gestão dos Labs</span>
                <span className="px-1.5 py-0.2 bg-blue-50 text-blue-800 font-bold text-[10px] rounded border border-blue-200">LASER</span>
                <span className="text-slate-300 text-xs">&</span>
                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded border border-emerald-200">SIGEO</span>
                <span className="text-slate-300 text-xs">&</span>
                <span className="px-1.5 py-0.2 bg-orange-50 text-orange-800 font-bold text-[10px] rounded border border-orange-200">LTGEO</span>
              </div>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
              
              {/* 1. Grade de Horários (Pública) */}
              <button
                onClick={() => setActiveTab('grade')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'grade' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Horários</span>
              </button>

              {/* 2. Solicitação de Manutenção de Máquinas (Pública) */}
              <button
                onClick={() => setActiveTab('solicitar_manutencao')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'solicitar_manutencao' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Manutenção</span>
              </button>

              {/* 3. Solicitação de Softwares (Pública) */}
              <button
                onClick={() => setActiveTab('solicitar_software')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'solicitar_software' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-purple-600" />
                <span>Softwares</span>
              </button>

              {/* 4. Rastreamento Unificado (Público) */}
              <button
                onClick={() => setActiveTab('rastrear')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'rastrear' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Rastrear</span>
              </button>

              {/* 5. Equipamentos (Público para consulta) */}
              <button
                onClick={() => setActiveTab('equipamentos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'equipamentos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Equipamentos</span>
              </button>

              {/* 6. ABAS RESTRITAS EXCLUSIVAS PARA COORDENADORES E TÉCNICOS */}
              {isManager && (
                <>
                  {/* Painel Técnico & Máquinas em Manutenção */}
                  <button
                    onClick={() => setActiveTab('gestao_manutencao')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer relative whitespace-nowrap ${
                      activeTab === 'gestao_manutencao' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    <span>Área de Manutenção</span>
                    {totalPendingTech > 0 && (
                      <span className="flex h-4 px-1 min-w-[16px] items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                        {totalPendingTech}
                      </span>
                    )}
                  </button>

                  {/* Painel da Coordenação */}
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer relative whitespace-nowrap ${
                      activeTab === 'admin' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coordenação</span>
                    {totalPendingCoord > 0 && (
                      <span className="flex h-4 px-1 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                        {totalPendingCoord}
                      </span>
                    )}
                  </button>

                  {/* Estatísticas */}
                  <button
                    onClick={() => setActiveTab('indicadores')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'indicadores' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Estatísticas</span>
                  </button>

                  {/* Leitor de Grade PDF */}
                  <button
                    onClick={() => setActiveTab('importar_pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'importar_pdf' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5 text-purple-600" />
                    <span>Leitor PDF</span>
                  </button>

                  {/* Trilha de Auditoria */}
                  <button
                    onClick={() => setActiveTab('auditoria')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                      activeTab === 'auditoria' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
                    <span>Auditoria</span>
                  </button>
                </>
              )}

            </nav>

            {/* Botão de Solicitação de Horário */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Solicitar Horário</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
