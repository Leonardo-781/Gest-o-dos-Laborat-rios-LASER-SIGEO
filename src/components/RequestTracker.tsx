import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  User, 
  Cpu, 
  FileText, 
  Ban,
  Filter,
  Wrench,
  Laptop,
  Check,
  ChevronRight,
  ExternalLink,
  Key
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { formatDateBR, formatDateTimeBR, getPurposeBadge, getStatusBadge } from '../utils/dateHelpers';
import { ReservationStatus, MaintenanceRequest, SoftwareRequest } from '../types';

export const RequestTracker: React.FC = () => {
  const { 
    reservations, 
    maintenanceRequests, 
    softwareRequests, 
    cancelReservation, 
    labs, 
    equipments 
  } = useLab();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'reservas' | 'manutencoes' | 'softwares'>('todos');

  // Filtered reservations
  const filteredReservations = reservations.filter(res => {
    if (typeFilter !== 'todos' && typeFilter !== 'reservas') return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return res.protocol.toLowerCase().includes(s) ||
      res.applicantEmail.toLowerCase().includes(s) ||
      res.applicantName.toLowerCase().includes(s) ||
      res.applicantId.toLowerCase().includes(s) ||
      res.title.toLowerCase().includes(s);
  });

  // Filtered maintenance requests
  const filteredMaintenance = maintenanceRequests.filter(m => {
    if (typeFilter !== 'todos' && typeFilter !== 'manutencoes') return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return m.protocol.toLowerCase().includes(s) ||
      m.applicantEmail.toLowerCase().includes(s) ||
      m.applicantName.toLowerCase().includes(s) ||
      m.applicantId.toLowerCase().includes(s) ||
      m.equipmentName.toLowerCase().includes(s);
  });

  // Filtered software requests
  const filteredSoftware = softwareRequests.filter(sf => {
    if (typeFilter !== 'todos' && typeFilter !== 'softwares') return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return sf.protocol.toLowerCase().includes(s) ||
      sf.applicantEmail.toLowerCase().includes(s) ||
      sf.applicantName.toLowerCase().includes(s) ||
      sf.softwareName.toLowerCase().includes(s);
  });

  const totalResults = filteredReservations.length + filteredMaintenance.length + filteredSoftware.length;

  return (
    <div className="space-y-6">
      
      {/* Header e Busca */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Rastreamento Unificado de Protocolos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulte o andamento de <strong>Reservas de Horários (REQ-)</strong>, <strong>Chamados de Manutenção (MAN-)</strong> e <strong>Pedidos de Softwares (SFT-)</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Ex: REQ-2026-0801, MAN-2026-1041, SFT-2026-0501, seu e-mail ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Filtro de Tipo */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
            <button
              onClick={() => setTypeFilter('todos')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                typeFilter === 'todos' ? 'bg-slate-900 text-white shadow-xs font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('reservas')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                typeFilter === 'reservas' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              Horários (REQ)
            </button>
            <button
              onClick={() => setTypeFilter('manutencoes')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                typeFilter === 'manutencoes' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Manutenções (MAN)
            </button>
            <button
              onClick={() => setTypeFilter('softwares')}
              className={`px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                typeFilter === 'softwares' ? 'bg-purple-600 text-white shadow-xs font-bold' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              Softwares (SFT)
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {totalResults === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Nenhuma solicitação encontrada</h4>
          <p className="text-xs text-slate-400">Verifique o protocolo digitado ou limpe os filtros de pesquisa.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* 1. RESERVAS DE HORÁRIOS (REQ-) */}
          {filteredReservations.map(res => {
            const isLaser = res.labId === 'laser';
            const lab = labs[res.labId];
            const badge = getPurposeBadge(res.purposeType);
            const status = getStatusBadge(res.status);

            return (
              <div
                key={res.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {res.protocol}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      isLaser ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      LAB {lab.name}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.text} ${status.border}`}>
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{res.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{res.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Data & Horário:</span>
                    <span className="font-bold text-slate-800">{formatDateBR(res.date)} • {res.startTime} às {res.endTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Solicitante:</span>
                    <span className="font-bold text-slate-800">{res.applicantName} ({res.applicantRole})</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status da Avaliação:</span>
                    {res.reviewedBy ? (
                      <span className="text-slate-700">Decidido por: <strong>{res.reviewedBy.userName}</strong></span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Aguardando análise da equipe técnica</span>
                    )}
                  </div>
                </div>

                {res.adminNotes && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                    <strong>Parecer Técnico:</strong> {res.adminNotes}
                  </div>
                )}
              </div>
            );
          })}

          {/* 2. CHAMADOS DE MANUTENÇÃO (MAN-) */}
          {filteredMaintenance.map(man => {
            const isLaser = man.labId === 'laser';

            return (
              <div
                key={man.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                      {man.protocol}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      isLaser ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      LAB {man.labId.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> Manutenção
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                    Status: {man.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-500" />
                    <span>{man.equipmentName}</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">"{man.problemDescription}"</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Reportado por:</span>
                    <span className="font-bold text-slate-800">{man.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Urgência Declarada:</span>
                    <span className="font-bold text-slate-800 capitalize">{man.urgency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Técnico Encarregado:</span>
                    <span className="font-bold text-slate-800">{man.assignedTechnician || 'Em triagem na Sala 1B308'}</span>
                  </div>
                </div>

                {man.technicianNotes && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                    <strong>Parecer Técnico:</strong> {man.technicianNotes}
                  </div>
                )}
              </div>
            );
          })}

          {/* 3. PEDIDOS DE SOFTWARES (SFT-) */}
          {filteredSoftware.map(soft => (
            <div
              key={soft.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                    {soft.protocol}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    LAB {soft.labId.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                    <Laptop className="w-3 h-3" /> Software / Plugin
                  </span>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-100 text-purple-900 border border-purple-200">
                  Status: {soft.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {soft.softwareName} {soft.softwareVersion ? `(${soft.softwareVersion})` : ''}
                </h4>
                <p className="text-xs text-slate-600 mt-1"><strong>Finalidade:</strong> {soft.justification}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Solicitante:</span>
                  <span className="font-bold text-slate-800">{soft.applicantName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Escopo & Licença:</span>
                  <span className="font-bold text-slate-800">
                    {soft.targetScope === 'todas_maquinas' ? 'Todas as 24 Bancadas' : soft.specificWorkstations || 'Específicas'}
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold block capitalize">
                    {soft.licenseType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Prazo Desejado:</span>
                  <span className="font-bold text-slate-800">
                    {soft.deadlineDate ? formatDateBR(soft.deadlineDate) : 'Não especificado'}
                  </span>
                </div>
              </div>

              {soft.licenseKey && (
                <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span className="text-purple-900">
                    <strong>Chave de Licença Fornecida:</strong> <code className="font-mono font-bold">{soft.licenseKey}</code>
                  </span>
                </div>
              )}

              {soft.technicianNotes && (
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950">
                  <strong>Parecer Técnico:</strong> {soft.technicianNotes}
                </div>
              )}
            </div>
          ))}

        </div>
      )}

    </div>
  );
};
