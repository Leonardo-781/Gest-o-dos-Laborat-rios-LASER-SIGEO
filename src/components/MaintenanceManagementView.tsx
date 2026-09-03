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
  Key
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { formatDateBR, formatDateTimeBR } from '../utils/dateHelpers';
import { Equipment, MaintenanceRequest, SoftwareRequest, MaintenanceStatus, SoftwareRequestStatus } from '../types';

export const MaintenanceManagementView: React.FC = () => {
  const { 
    equipments, 
    maintenanceRequests, 
    softwareRequests, 
    updateMaintenanceStatus, 
    updateSoftwareStatus, 
    setEquipmentMaintenance, 
    currentUser,
    labs
  } = useLab();

  const [activeTab, setActiveTab] = useState<'maquinas' | 'chamados' | 'softwares'>('maquinas');
  
  // Modal de Colocar Equipamento em Manutenção
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualTech, setManualTech] = useState(currentUser?.name || 'Técnico Responsável');

  // Modal de Resolução de Chamado de Manutenção
  const [resolvingReq, setResolvingReq] = useState<MaintenanceRequest | null>(null);
  const [techNotes, setTechNotes] = useState('');

  // Modal de Resolução de Software
  const [resolvingSoft, setResolvingSoft] = useState<SoftwareRequest | null>(null);
  const [softNotes, setSoftNotes] = useState('');

  const machinesInMaintenance = equipments.filter(e => e.status === 'manutencao');
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
              Gestão de equipamentos em manutenção, triagem de chamados e homologação de softwares dos laboratórios Laser e Sigeo.
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

          {machinesInMaintenance.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h5 className="text-base font-bold text-slate-900">Todos os Equipamentos Operando Normalmente!</h5>
              <p className="text-xs text-slate-500">Nenhuma máquina ou instrumento está em manutenção no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machinesInMaintenance.map(eq => (
                <div 
                  key={eq.id}
                  className="bg-white p-5 rounded-3xl border-2 border-amber-200 shadow-xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          eq.labId === 'laser' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          LAB {eq.labId.toUpperCase()}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-500">{eq.code}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{eq.name}</h4>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-amber-600" />
                      <span>Em Manutenção</span>
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div>
                      <strong>Motivo:</strong> {eq.maintenanceReason || 'Manutenção preventiva e aferição de rotina.'}
                    </div>
                    <div className="text-[11px] text-amber-800">
                      <strong>Técnico Responsável:</strong> {eq.assignedTechnician || 'Corpo Técnico (Sala 1B308)'}
                    </div>
                    {eq.maintenanceSince && (
                      <div className="text-[10px] text-amber-700">
                        Entrada em manutenção: {formatDateTimeBR(eq.maintenanceSince)}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      onClick={() => {
                        if (confirm(`Concluir manutenção e liberar "${eq.name}" para uso normal?`)) {
                          setEquipmentMaintenance(eq.id, false);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Concluir Reparo & Liberar Máquina</span>
                    </button>
                  </div>
                </div>
              ))}
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
                        isLaser ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
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
                Demandas de programas, plugins e bibliotecas para homologação nas bancadas do Laser e Sigeo.
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
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      LAB {soft.labId.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {soft.targetScope === 'todas_maquinas' ? 'Todas as 24 Bancadas' : soft.specificWorkstations || 'Bancadas Específicas'}
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-up">
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
                      [{eq.labId.toUpperCase()}] {eq.name} ({eq.code})
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
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

    </div>
  );
};
