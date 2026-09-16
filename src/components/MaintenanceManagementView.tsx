import React, { useState } from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  User, 
  Send, 
  PlusCircle, 
  Check, 
  X, 
  Laptop, 
  Terminal, 
  ExternalLink, 
  Layers, 
  Filter, 
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Copy,
  Key,
  Truck,
  Trash2,
  Edit3,
  Printer,
  FileText
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { formatDateBR, formatDateTimeBR } from '../utils/dateHelpers';
import { Equipment, MaintenanceRequest, SoftwareRequest, MaintenanceStatus, SoftwareRequestStatus } from '../types';
import { ExternalMaintenanceModal } from './ExternalMaintenanceModal';

export const MaintenanceManagementView: React.FC = () => {
  const { 
    equipments, 
    maintenanceRequests, 
    softwareRequests, 
    updateMaintenanceStatus, 
    updateSoftwareStatus, 
    setEquipmentMaintenance, 
    editEquipment,
    currentUser,
    labs,
    canUserManageMovements
  } = useLab();

  const [activeTab, setActiveTab] = useState<'maquinas' | 'chamados' | 'softwares'>('maquinas');
  
  // Modal de Colocar Equipamento em Manutenção
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualTech, setManualTech] = useState(currentUser?.name || 'Técnico Responsável');

  // Modal de Manutenção Externa Integrada
  const [externalModalEq, setExternalModalEq] = useState<Equipment | null>(null);

  // Modal de Edição de Dados da Manutenção
  const [editingMaintEq, setEditingMaintEq] = useState<Equipment | null>(null);
  const [editReason, setEditReason] = useState('');
  const [editTech, setEditTech] = useState('');

  // Modal de Ficha de Manutenção para Impressão
  const [printFichaEq, setPrintFichaEq] = useState<Equipment | null>(null);

  // Filtros de Máquinas em Manutenção
  const [maintLabFilter, setMaintLabFilter] = useState<'todos' | 'ltgeo' | 'laser' | 'sigeo'>('todos');
  const [maintTypeFilter, setMaintTypeFilter] = useState<'todos' | 'interna' | 'externa'>('todos');

  // Modal de Resolução de Chamado de Manutenção
  const [resolvingReq, setResolvingReq] = useState<MaintenanceRequest | null>(null);
  const [techNotes, setTechNotes] = useState('');

  // Modal de Resolução de Software
  const [resolvingSoft, setResolvingSoft] = useState<SoftwareRequest | null>(null);
  const [softNotes, setSoftNotes] = useState('');

  const machinesInMaintenance = equipments.filter(e => e.status === 'manutencao' || e.status === 'manutencao_externa');
  
  const filteredMachines = machinesInMaintenance.filter(eq => {
    if (maintLabFilter !== 'todos' && eq.labId !== maintLabFilter) return false;
    if (maintTypeFilter === 'interna' && eq.status !== 'manutencao') return false;
    if (maintTypeFilter === 'externa' && eq.status !== 'manutencao_externa') return false;
    return true;
  });

  const getDaysInMaintenance = (sinceDate?: string) => {
    if (!sinceDate) return null;
    const start = new Date(sinceDate).getTime();
    if (isNaN(start)) return null;
    const now = new Date().getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  const pendingMaintenanceReports = maintenanceRequests.filter(m => m.status === 'pendente' || m.status === 'em_averiguacao');
  const pendingSoftwareRequests = softwareRequests.filter(s => s.status === 'pendente' || s.status === 'em_analise' || s.status === 'em_instalacao');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId) {
      alert('Selecione um equipamento.');
      return;
    }
    setEquipmentMaintenance(selectedEqId, true, manualReason, manualTech);
    setIsManualModalOpen(false);
    setSelectedEqId('');
    setManualReason('');
  };

  const handleSaveEditMaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaintEq) return;
    editEquipment(editingMaintEq.id, {
      maintenanceReason: editReason.trim(),
      assignedTechnician: editTech.trim()
    });
    setEditingMaintEq(null);
  };

  const handleConfirmResolveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvingReq) {
      updateMaintenanceStatus(resolvingReq.id, 'resolvido', techNotes, currentUser?.name);
      // Se havia um equipamento vinculado, libera-o de volta
      if (resolvingReq.equipmentId) {
        setEquipmentMaintenance(resolvingReq.equipmentId, false);
      }
      setResolvingReq(null);
      setTechNotes('');
    }
  };

  const handleConfirmResolveSoftware = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvingSoft) {
      updateSoftwareStatus(resolvingSoft.id, 'instalado', softNotes);
      setResolvingSoft(null);
      setSoftNotes('');
    }
  };

  const getUrgencyBadge = (urgency: MaintenanceRequest['urgency']) => {
    switch (urgency) {
      case 'critica':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px]">Crítica ⚠️</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-300 font-bold text-[10px]">Alta</span>;
      case 'media':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold text-[10px]">Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[10px]">Baixa</span>;
    }
  };

  const getMaintenanceStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'resolvido':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Resolvido</span>;
      case 'em_manutencao':
        return <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold text-[10px]">Em Reparo / Peça</span>;
      case 'em_averiguacao':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Em Averiguação</span>;
      case 'recusado':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">Não Procede</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Pendente</span>;
    }
  };

  const getSoftwareStatusBadge = (status: SoftwareRequestStatus) => {
    switch (status) {
      case 'instalado':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Instalado & Homologado</span>;
      case 'em_instalacao':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">Em Deploy / Instalação</span>;
      case 'em_analise':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Em Análise Técnica</span>;
      case 'recusado':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">Recusado</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Pendente</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xs">
            <Wrench className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Painel Técnico de Manutenção & Softwares
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                Acesso Técnico / Coordenação
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão de equipamentos em manutenção, triagem de chamados e homologação de softwares dos laboratórios Laser, Sigeo e LTGEO.
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('maquinas')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'maquinas' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            <span>Máquinas em Manutenção</span>
            {machinesInMaintenance.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                {machinesInMaintenance.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chamados')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'chamados' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Chamados de Averiguação</span>
            {pendingMaintenanceReports.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {pendingMaintenanceReports.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('softwares')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'softwares' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-purple-600" />
            <span>Chamados de Softwares</span>
            {pendingSoftwareRequests.length > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-500 text-white text-[9px] font-bold rounded-full">
                {pendingSoftwareRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 1. ABA: MÁQUINAS EM MANUTENÇÃO */}
      {activeTab === 'maquinas' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Equipamentos Atualmente Indisponíveis por Manutenção</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Computadores, sensores ou instrumentos retirados da grade para calibração, troca de peças ou limpeza.
              </p>
            </div>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Colocar Máquina em Manutenção</span>
            </button>
          </div>

          {/* Barra de Filtros Rápidos */}
          {machinesInMaintenance.length > 0 && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-500 text-[11px] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  Filtrar por Laboratório:
                </span>
                <div className="flex items-center gap-1">
                  {(['todos', 'ltgeo', 'laser', 'sigeo'] as const).map(lab => (
                    <button
                      key={lab}
                      type="button"
                      onClick={() => setMaintLabFilter(lab)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        maintLabFilter === lab
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lab === 'todos' ? 'Todos os Labs' : lab.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-500 text-[11px]">Tipo:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMaintTypeFilter('todos')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      maintTypeFilter === 'todos' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todas ({machinesInMaintenance.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaintTypeFilter('interna')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      maintTypeFilter === 'interna' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Interna ({machinesInMaintenance.filter(e => e.status === 'manutencao').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaintTypeFilter('externa')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      maintTypeFilter === 'externa' ? 'bg-purple-700 text-white shadow-xs' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                    }`}
                  >
                    Externa ({machinesInMaintenance.filter(e => e.status === 'manutencao_externa').length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {filteredMachines.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h5 className="text-base font-bold text-slate-900">
                {machinesInMaintenance.length === 0 
                  ? 'Todos os Equipamentos Operando Normalmente!' 
                  : 'Nenhum equipamento corresponde aos filtros selecionados'}
              </h5>
              <p className="text-xs text-slate-500">
                {machinesInMaintenance.length === 0 
                  ? 'Nenhuma máquina ou instrumento está em manutenção no momento.' 
                  : 'Tente alterar os filtros de laboratório ou tipo de manutenção acima.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMachines.map(eq => {
                const daysInMaint = getDaysInMaintenance(eq.maintenanceSince);
                const isLongWait = daysInMaint !== null && daysInMaint >= 15;

                return (
                  <div 
                    key={eq.id}
                    className={`bg-white p-5 rounded-3xl border-2 shadow-xs space-y-3 relative overflow-hidden flex flex-col justify-between ${
                      eq.status === 'manutencao_externa' ? 'border-purple-300' : 'border-amber-200'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header do Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              eq.labId === 'laser' 
                                ? 'bg-blue-100 text-blue-800' 
                                : eq.labId === 'sigeo' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              LAB {eq.labId.toUpperCase()}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-500">{eq.code}</span>
                            {eq.patrimonio && (
                              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Pat. {eq.patrimonio}
                              </span>
                            )}
                            {/* Indicador de SLA / Tempo Parado */}
                            {daysInMaint !== null && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                                isLongWait 
                                  ? 'bg-rose-100 text-rose-800 border-rose-300' 
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>{daysInMaint === 0 ? 'Entrou hoje' : `${daysInMaint}d parado`}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{eq.name}</h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {eq.status === 'manutencao_externa' ? (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px] border border-purple-300 flex items-center gap-1">
                              <Truck className="w-3 h-3 text-purple-700" />
                              <span>Manutenção Externa</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300 flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-amber-600" />
                              <span>Manutenção Interna</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Motivo e Detalhes */}
                      <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                        eq.status === 'manutencao_externa'
                          ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                          : 'bg-amber-50/70 border-amber-200 text-amber-950'
                      }`}>
                        {eq.status === 'manutencao_externa' && eq.externalCompany && (
                          <div className="font-bold text-purple-900">
                            Assistência / Empresa: {eq.externalCompany}
                            {eq.externalServiceOrder && <> • O.S.: <span className="font-mono">{eq.externalServiceOrder}</span></>}
                          </div>
                        )}
                        <div>
                          <strong>Motivo:</strong> {eq.maintenanceReason || 'Manutenção preventiva e aferição de rotina.'}
                        </div>
                        <div className="text-[11px] opacity-90 flex items-center justify-between flex-wrap gap-1">
                          <span><strong>Técnico Responsável:</strong> {eq.assignedTechnician || 'Corpo Técnico (Sala 1B308)'}</span>
                          {eq.maintenanceSince && (
                            <span className="text-[10px] opacity-80">
                              Entrada: {formatDateTimeBR(eq.maintenanceSince)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Linha Completa de Ações */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      {/* Ações Rápidas: Apagar/Cancelar, Editar e Imprimir */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Cancelar o registro de manutenção de "${eq.name}" e restaurar o status imediatamente como DISPONÍVEL?\n\n(Use se o registro foi feito por engano ou para teste).`)) {
                              setEquipmentMaintenance(eq.id, false);
                            }
                          }}
                          title="Cancelar bloqueio / Apagar registro de manutenção"
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Apagar Bloqueio</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingMaintEq(eq);
                            setEditReason(eq.maintenanceReason || '');
                            setEditTech(eq.assignedTechnician || currentUser?.name || 'Leonardo Cardoso');
                          }}
                          title="Editar motivo e laudo da manutenção"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPrintFichaEq(eq)}
                          title="Imprimir Ficha / Guia de Encaminhamento"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Ações Principais: Envio Externo e Concluir Reparo */}
                      <div className="flex items-center gap-1.5">
                        {canUserManageMovements() && (
                          <button
                            type="button"
                            onClick={() => setExternalModalEq(eq)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{eq.status === 'manutencao_externa' ? 'Ver Envio Externo' : '📦 Enviar p/ Externa'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Concluir manutenção e liberar "${eq.name}" para uso normal?`)) {
                              setEquipmentMaintenance(eq.id, false);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Concluir Reparo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. ABA: CHAMADOS DE AVERIGUAÇÃO E DEFEITOS REPORTADOS */}
      {activeTab === 'chamados' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Chamados de Defeitos & Averiguação ({maintenanceRequests.length})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Problemas relatados por alunos e professores que demandam inspeção técnica no laboratório.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {maintenanceRequests.map(req => {
              const isLaser = req.labId === 'laser';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        {req.protocol}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        req.labId === 'laser' 
                          ? 'bg-blue-100 text-blue-800' 
                          : req.labId === 'sigeo' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        LAB {req.labId.toUpperCase()}
                      </span>
                      {getUrgencyBadge(req.urgency)}
                      {getMaintenanceStatusBadge(req.status)}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Aberto em: {formatDateTimeBR(req.createdAt)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-slate-500" />
                      <span>{req.equipmentName}</span>
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                      "{req.problemDescription}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Reportado por:</span>
                      <span className="font-bold text-slate-800">{req.applicantName} ({req.applicantRole})</span>
                      <span className="text-[10px] text-slate-500 block">{req.applicantEmail} • Doc: {req.applicantId}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Técnico Encarregado / Parecer:</span>
                      <span className="font-bold text-slate-800">{req.assignedTechnician || 'Aguardando designação'}</span>
                      {req.technicianNotes && (
                        <p className="text-[11px] text-blue-700 mt-0.5 line-clamp-2">
                          {req.technicianNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações do Técnico */}
                  {req.status !== 'resolvido' && req.status !== 'recusado' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          updateMaintenanceStatus(req.id, 'em_averiguacao', 'Técnico em inspeção presencial no laboratório.', currentUser?.name);
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 transition cursor-pointer"
                      >
                        Iniciar Averiguação
                      </button>

                      <button
                        onClick={() => {
                          updateMaintenanceStatus(req.id, 'em_manutencao', 'Máquina isolada para reparo físico / substituição de componente.', currentUser?.name);
                          if (req.equipmentId) {
                            setEquipmentMaintenance(req.equipmentId, true, req.problemDescription);
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold border border-amber-200 transition cursor-pointer"
                      >
                        Colocar Máquina em Reparo
                      </button>

                      <button
                        onClick={() => {
                          setResolvingReq(req);
                          setTechNotes('');
                        }}
                        className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Concluir & Resolver Chamado</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ABA: CHAMADOS DE INSTALAÇÃO DE SOFTWARES */}
      {activeTab === 'softwares' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Solicitações de Instalação & Atualização de Softwares ({softwareRequests.length})
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Demandas de programas, plugins e bibliotecas para homologação nas bancadas do Laser, Sigeo e LTGEO.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {softwareRequests.map(soft => (
              <div
                key={soft.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      {soft.protocol}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      soft.labId === 'laser' 
                        ? 'bg-blue-100 text-blue-800' 
                        : soft.labId === 'sigeo' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      LAB {soft.labId.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {soft.targetScope === 'todas_maquinas' ? `Todas as ${labs[soft.labId]?.workstationsCount || 24} Bancadas` : soft.specificWorkstations || 'Bancadas Específicas'}
                    </span>
                    {getSoftwareStatusBadge(soft.status)}
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Solicitado em: {formatDateTimeBR(soft.createdAt)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{soft.softwareName}</h4>
                    {soft.softwareVersion && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                        {soft.softwareVersion}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 mt-1 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed font-medium">
                    <strong>Finalidade:</strong> {soft.justification}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Solicitante:</span>
                    <span className="font-bold text-slate-800">{soft.applicantName}</span>
                    <span className="text-[10px] text-slate-500 block">{soft.applicantEmail}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Disciplina / Prazo:</span>
                    <span className="font-bold text-slate-800">{soft.courseOrProject || 'Geral'}</span>
                    <span className="text-[10px] text-slate-500 block">
                      Data Limite: {soft.deadlineDate ? formatDateBR(soft.deadlineDate) : 'Não especificado'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Licenciamento / Link:</span>
                    <span className="font-bold text-slate-800 capitalize">{soft.licenseType.replace(/_/g, ' ')}</span>
                    {soft.downloadUrl && (
                      <a 
                        href={soft.downloadUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-purple-600 font-bold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" /> Acessar Link Oficial
                      </a>
                    )}
                  </div>
                </div>

                {/* BLOCO DA CHAVE DE LICENÇA FORNECIDA PELO USUÁRIO */}
                {soft.licenseKey && (
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-purple-900 block">Código / Chave de Licença Fornecida:</span>
                        <code className="font-mono text-xs font-black text-purple-950 bg-white px-2 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                          {soft.licenseKey}
                        </code>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(soft.licenseKey!);
                        alert('Chave de licença copiada para a área de transferência!');
                      }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 self-end sm:self-center"
                      title="Copiar código de ativação"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Chave</span>
                    </button>
                  </div>
                )}

                {soft.technicianNotes && (
                  <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-950">
                    <strong>Parecer Técnico:</strong> {soft.technicianNotes}
                  </div>
                )}

                {/* Ações Técnicas */}
                {soft.status !== 'instalado' && soft.status !== 'recusado' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        updateSoftwareStatus(soft.id, 'em_instalacao', 'Script de instalação em lote (deploy) iniciado nas bancadas.');
                      }}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold border border-purple-200 transition cursor-pointer"
                    >
                      Iniciar Instalação
                    </button>

                    <button
                      onClick={() => {
                        setResolvingSoft(soft);
                        setSoftNotes('');
                      }}
                      className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Concluir & Homologar Software</span>
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Manual: Colocar Máquina em Manutenção */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-auto animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>Colocar Equipamento em Manutenção</span>
              </h4>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Selecione o Equipamento / Máquina:</label>
                <select
                  required
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium cursor-pointer"
                >
                  <option value="">-- Selecione o item --</option>
                  {equipments.filter(e => e.status !== 'manutencao').map(eq => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.labId.toUpperCase()}] {eq.name} {eq.patrimonio ? `• [Pat. ${eq.patrimonio}]` : `(${eq.code})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Motivo do Bloqueio / Sintoma:</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Teclado quebrado, fonte queimada, calibração óptica periódica..."
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Técnico Responsável:</label>
                <input
                  type="text"
                  required
                  value={manualTech}
                  onChange={(e) => setManualTech(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirmar Bloqueio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Conclusão de Chamado de Manutenção */}
      {resolvingReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 my-auto animate-scale-up">
            <h4 className="text-base font-bold text-slate-900">Concluir Chamado de Manutenção</h4>
            <p className="text-xs text-slate-500">
              Informe o parecer técnico de resolução para {resolvingReq.equipmentName} ({resolvingReq.protocol}):
            </p>

            <form onSubmit={handleConfirmResolveMaintenance} className="space-y-3 text-xs">
              <textarea
                required
                rows={3}
                placeholder="Ex: Realizada troca de cabo de alimentação e testes de estresse na GPU. Equipamento 100% operacional."
                value={techNotes}
                onChange={(e) => setTechNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingReq(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-xs"
                >
                  Confirmar Resolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Conclusão de Software */}
      {resolvingSoft && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 my-auto animate-scale-up">
            <h4 className="text-base font-bold text-slate-900">Homologar Instalação de Software</h4>
            <p className="text-xs text-slate-500">
              Confirme a instalação de {resolvingSoft.softwareName} ({resolvingSoft.protocol}):
            </p>

            <form onSubmit={handleConfirmResolveSoftware} className="space-y-3 text-xs">
              <textarea
                required
                rows={3}
                placeholder="Ex: Software instalado e testado em todas as 24 bancadas do SIGEO. Atalhos criados na Área de Trabalho."
                value={softNotes}
                onChange={(e) => setSoftNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium focus:ring-2 focus:ring-purple-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingSoft(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-xs"
                >
                  Confirmar Conclusão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Dados da Manutenção */}
      {editingMaintEq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-auto animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <span>Editar Informações da Manutenção</span>
              </h4>
              <button onClick={() => setEditingMaintEq(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMaint} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{editingMaintEq.name}</div>
                <div className="text-[11px] text-slate-500">
                  Código: <strong className="font-mono text-slate-700">{editingMaintEq.code}</strong>
                  {editingMaintEq.patrimonio && <> • Patrimônio: <strong className="font-mono text-amber-900">Pat. {editingMaintEq.patrimonio}</strong></>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motivo / Laudo do Defeito *</label>
                <textarea
                  required
                  rows={3}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Técnico Encarregado *</label>
                <input
                  type="text"
                  required
                  value={editTech}
                  onChange={(e) => setEditTech(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMaintEq(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Impressão de Ficha / Guia de Encaminhamento */}
      {printFichaEq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 my-auto animate-scale-up text-slate-900">
            {/* Cabeçalho da Ficha Timbrada */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Universidade Federal de Uberlândia • UFU
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  FICHA DE CONTROLE E ENCAMINHAMENTO DE MANUTENÇÃO
                </h3>
                <span className="text-xs text-slate-600 block">
                  Instituto de Geografia • Laboratórios Integrados (LTGEO / LASER / SIGEO)
                </span>
              </div>
              <button 
                onClick={() => setPrintFichaEq(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dados do Equipamento */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Equipamento / Modelo:</span>
                <span className="font-bold text-slate-900 text-sm">{printFichaEq.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Laboratório de Origem:</span>
                <span className="font-bold text-slate-800">{printFichaEq.labId.toUpperCase()} ({labs[printFichaEq.labId]?.location})</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Nº de Patrimônio UFU:</span>
                <span className="font-mono font-bold text-amber-900 text-sm">
                  {printFichaEq.patrimonio ? `Pat. ${printFichaEq.patrimonio}` : 'Não Tombado / Avulso'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Código Interno:</span>
                <span className="font-mono font-bold text-slate-800">{printFichaEq.code}</span>
              </div>
            </div>

            {/* Informações da Ocorrência */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Defeito Identificado / Parecer Inicial:</span>
                <div className="p-3 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 leading-relaxed min-h-[60px]">
                  {printFichaEq.maintenanceReason || 'Aferição periódica e calibração de rotina.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Técnico Responsável:</span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                    {printFichaEq.assignedTechnician || currentUser?.name || 'Leonardo Cardoso'}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Data de Entrada:</span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                    {printFichaEq.maintenanceSince ? formatDateTimeBR(printFichaEq.maintenanceSince) : formatDateBR(new Date().toISOString())}
                  </div>
                </div>
              </div>

              {printFichaEq.status === 'manutencao_externa' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-purple-950">
                  <div className="font-bold">Assistência / Destino: {printFichaEq.externalCompany || 'Assistência Técnica'}</div>
                  {printFichaEq.externalServiceOrder && <div>Ordem de Serviço (O.S.): <strong className="font-mono">{printFichaEq.externalServiceOrder}</strong></div>}
                  {printFichaEq.externalExpectedReturn && <div>Previsão de Retorno: {formatDateBR(printFichaEq.externalExpectedReturn)}</div>}
                </div>
              )}
            </div>

            {/* Campo de Assinatura */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-500">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1.5 h-8"></div>
                <span>Assinatura do Técnico Encarregado</span>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1.5 h-8"></div>
                <span>Recebedor / Assistência Técnica</span>
              </div>
            </div>

            {/* Ações */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={() => setPrintFichaEq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Ficha (PDF / A4)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Manutenção Externa Integrada */}
      <ExternalMaintenanceModal 
        isOpen={!!externalModalEq} 
        onClose={() => setExternalModalEq(null)} 
        equipment={externalModalEq} 
      />

    </div>
  );
};
