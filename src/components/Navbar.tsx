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
  User as UserIcon,
  Users
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
    setIsBookingOpen, 
    setIsRulesOpen,
    resetToDemoData 
  } = useLab();

  const pendingRequests = getPendingRequestsCount();
  const pendingUsers = getPendingUsersCount();
  const totalPending = pendingRequests + pendingUsers;

  // Apenas Coordenadores e Técnicos têm acesso privilegiado
  const isManager = currentUser?.role === 'coordenador' || currentUser?.role === 'tecnico';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      
      {/* Top Bar Institucional */}
      <div className="border-b border-slate-100 bg-slate-50/80 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Agrimensura & Cartografia</span>
            <span>•</span>
            <span className="hidden sm:inline">Laboratórios LASER e SIGEO</span>
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

            {/* Identificação de Acesso */}
            {currentUser ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md font-bold transition cursor-pointer border border-blue-200"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">
                  {currentUser.avatarInitials || currentUser.name[0]}
                </div>
                <span>{currentUser.name.split(' ')[0]} ({currentUser.role.toUpperCase()})</span>
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
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={() => setActiveTab('grade')}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              AG
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 tracking-tight">Gestão dos Laboratórios</span>
                <span className="px-1.5 py-0.2 bg-blue-50 text-blue-800 font-bold text-[10px] rounded border border-blue-200">LASER</span>
                <span className="text-slate-300 text-xs">&</span>
                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded border border-emerald-200">SIGEO</span>
              </div>
            </div>
          </div>

          {/* Abas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
              
              {/* 1. Grade de Horários (Pública) */}
              <button
                onClick={() => setActiveTab('grade')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'grade' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Horários das Aulas</span>
              </button>

              {/* 2. Rastreamento de Solicitação (Público) */}
              <button
                onClick={() => setActiveTab('rastrear')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'rastrear' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Rastrear Pedido</span>
              </button>

              {/* 3. Equipamentos (Público para consulta) */}
              <button
                onClick={() => setActiveTab('equipamentos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'equipamentos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Equipamentos</span>
              </button>

              {/* 4. ABAS RESTRITAS APENAS PARA COORDENADORES E TÉCNICOS */}
              {isManager && (
                <>
                  {/* Estatísticas (Apenas Coordenadores e Técnicos) */}
                  <button
                    onClick={() => setActiveTab('indicadores')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'indicadores' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Estatísticas</span>
                  </button>

                  {/* Painel da Coordenação / Gestão */}
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer relative ${
                      activeTab === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coordenação</span>
                    {totalPending > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                        {totalPending}
                      </span>
                    )}
                  </button>

                  {/* Leitor de Grade PDF */}
                  <button
                    onClick={() => setActiveTab('importar_pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'importar_pdf' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5 text-purple-600" />
                    <span>Leitor PDF</span>
                  </button>

                  {/* Trilha de Auditoria */}
                  <button
                    onClick={() => setActiveTab('auditoria')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      activeTab === 'auditoria' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
                    <span>Auditoria</span>
                  </button>
                </>
              )}

            </nav>

            {/* Botão de Solicitação (ABERTO A QUALQUER PESSOA) */}
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
