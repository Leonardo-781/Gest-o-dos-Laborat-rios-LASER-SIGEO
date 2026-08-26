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
  Filter
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { formatDateBR, formatDateTimeBR, getPurposeBadge, getStatusBadge } from '../utils/dateHelpers';
import { ReservationStatus } from '../types';

export const RequestTracker: React.FC = () => {
  const { reservations, cancelReservation, labs, equipments } = useLab();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | ReservationStatus>('todas');

  const filteredReservations = reservations.filter(res => {
    const matchesSearch = 
      !searchTerm ||
      res.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.applicantId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todas' || res.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header e Busca */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Rastreamento de Solicitações</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulte o andamento da sua reserva inserindo o número do protocolo ou seu e-mail/matrícula.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Ex: REQ-2026-0801, seu e-mail ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['todas', 'pendente', 'aprovada', 'recusada'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap capitalize ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'todas' ? 'Todas' : st === 'pendente' ? 'Em Análise' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Solicitações */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Nenhuma solicitação encontrada</h4>
          <p className="text-xs text-slate-400 mt-1">Verifique o protocolo digitado ou limpe os filtros de pesquisa.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map(res => {
            const isLaser = res.labId === 'laser';
            const lab = labs[res.labId];
            const badge = getPurposeBadge(res.purposeType);
            const statusBadge = getStatusBadge(res.status);

            const allocatedEquipments = equipments.filter(eq => res.requestedEquipments?.includes(eq.id));

            return (
              <div 
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 transition-all hover:border-slate-300"
              >
                {/* Linha 1: Header da Reserva com Protocolo e Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {res.protocol}
                    </span>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                      isLaser ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      LAB {lab.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                      <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  </div>
                </div>

                {/* Linha 2: Título e Justificativa */}
                <div>
                  <h4 className="text-base font-bold text-slate-900">{res.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{res.description}</p>
                </div>

                {/* Linha 3: Grid de Informações de Horário e Solicitante */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Data da Reserva</span>
                      <span className="font-bold text-slate-800">{formatDateBR(res.date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Horário</span>
                      <span className="font-bold text-slate-800">{res.startTime} às {res.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Solicitante</span>
                      <span className="font-bold text-slate-800">{res.applicantName}</span>
                    </div>
                  </div>
                </div>

                {/* Linha 4: Equipamentos Solicitados se houver */}
                {allocatedEquipments.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" /> Equipamentos:
                    </span>
                    {allocatedEquipments.map(eq => (
                      <span key={eq.id} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200">
                        {eq.name} ({eq.code})
                      </span>
                    ))}
                  </div>
                )}

                {/* Motivo de Recusa se houver */}
                {res.status === 'recusada' && res.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    <strong className="block font-bold mb-0.5">Motivo da Recusa / Orientação da Coordenação:</strong>
                    {res.rejectionReason}
                  </div>
                )}

                {/* Linha 5: Linha do Tempo e Ações */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
                  <div>
                    Enviado em: {formatDateTimeBR(res.createdAt)}
                  </div>

                  {res.status === 'pendente' && (
                    <button
                      onClick={() => {
                        if (confirm('Deseja realmente cancelar esta solicitação pendente?')) {
                          cancelReservation(res.id);
                        }
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancelar Solicitação
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
