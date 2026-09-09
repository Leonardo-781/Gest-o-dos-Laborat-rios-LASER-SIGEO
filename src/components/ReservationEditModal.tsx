import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Clock, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Repeat, 
  Ban, 
  FileText,
  Building,
  Sparkles,
  Globe,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { LabId, PurposeType, ReservationStatus } from '../types';
import { formatDateBR } from '../utils/dateHelpers';

export const ReservationEditModal: React.FC = () => {
  const { 
    isReservationModalOpen, 
    setIsReservationModalOpen, 
    editingReservation, 
    editReservation, 
    deleteReservation,
    cancelReservation,
    checkAvailability,
    labs,
    currentUser
  } = useLab();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labId, setLabId] = useState<LabId>('laser');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:00');
  const [purposeType, setPurposeType] = useState<PurposeType>('tcc');
  const [status, setStatus] = useState<ReservationStatus>('aprovada');
  const [adminNotes, setAdminNotes] = useState('');
  const [responsibleTeacher, setResponsibleTeacher] = useState('');
  const [userTeacher, setUserTeacher] = useState('');
  const [updateWholeSeries, setUpdateWholeSeries] = useState(false);
  const [conflictStatus, setConflictStatus] = useState<{ available: boolean; conflictReason?: string }>({ available: true });

  useEffect(() => {
    if (isReservationModalOpen && editingReservation) {
      setTitle(editingReservation.title || '');
      setDescription(editingReservation.description || '');
      setLabId(editingReservation.labId || 'laser');
      setDate(editingReservation.date || '');
      setStartTime(editingReservation.startTime || '14:00');
      setEndTime(editingReservation.endTime || '17:00');
      setPurposeType(editingReservation.purposeType || 'tcc');
      setStatus(editingReservation.status || 'aprovada');
      setAdminNotes(editingReservation.adminNotes || '');
      setResponsibleTeacher(editingReservation.responsibleTeacher || editingReservation.supervisorName || '');
      setUserTeacher(editingReservation.userTeacher || '');
      setUpdateWholeSeries(false);
    }
  }, [isReservationModalOpen, editingReservation]);

  // Checagem de disponibilidade em tempo real
  useEffect(() => {
    if (editingReservation && date && startTime && endTime && labId) {
      const result = checkAvailability(labId, date, startTime, endTime, editingReservation.id);
      setConflictStatus(result);
    }
  }, [editingReservation, labId, date, startTime, endTime]);

  if (!isReservationModalOpen || !editingReservation) return null;

  const isRecurring = Boolean(editingReservation.isRecurring && editingReservation.recurrenceGroupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!conflictStatus.available && status === 'aprovada') {
      alert(`Não é possível salvar com o horário atual:\n${conflictStatus.conflictReason}`);
      return;
    }

    const res = editReservation(
      editingReservation.id,
      {
        title,
        description,
        labId,
        date,
        startTime,
        endTime,
        purposeType,
        status,
        adminNotes: adminNotes || undefined,
        responsibleTeacher: responsibleTeacher.trim() || undefined,
        userTeacher: userTeacher.trim() || undefined,
        supervisorName: responsibleTeacher.trim() || undefined
      },
      updateWholeSeries
    );

    if (res.success) {
      setIsReservationModalOpen(false);
    } else {
      alert(`Erro ao atualizar reserva:\n${res.error}`);
    }
  };

  const handleCancelReservation = () => {
    const msg = isRecurring
      ? updateWholeSeries
        ? `Deseja realmente CANCELAR TODAS as ${editingReservation.recurrenceTotalWeeks || ''} semanas desta série recorrente?`
        : `Deseja cancelar apenas a reserva da data ${formatDateBR(editingReservation.date)}?`
      : `Deseja cancelar a reserva "${editingReservation.title}"? O horário ficará liberado para outros usuários.`;

    if (confirm(msg)) {
      cancelReservation(editingReservation.id, updateWholeSeries);
      setIsReservationModalOpen(false);
    }
  };

  const handleDeletePermanent = () => {
    const msg = isRecurring
      ? updateWholeSeries
        ? `⚠️ ATENÇÃO: Deseja EXCLUIR DEFINITIVAMENTE TODAS as ${editingReservation.recurrenceTotalWeeks || ''} semanas desta série do banco de dados?`
        : `⚠️ Deseja excluir definitivamente esta reserva de ${formatDateBR(editingReservation.date)} do banco de dados?`
      : `⚠️ Deseja EXCLUIR DEFINITIVAMENTE a reserva "${editingReservation.title}" (${editingReservation.protocol}) do banco de dados?`;

    if (confirm(msg)) {
      deleteReservation(editingReservation.id, updateWholeSeries);
      setIsReservationModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800">
          <button
            onClick={() => setIsReservationModalOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Modificar e Gerenciar Horário</h3>
                <span className="font-mono text-[11px] bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
                  {editingReservation.protocol}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Solicitante: <strong>{editingReservation.applicantName}</strong> ({editingReservation.applicantRole})
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Informação de Recorrência se aplicável */}
          {isRecurring && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                <Repeat className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Esta reserva faz parte de uma Série Semanal Recorrente</span>
              </div>
              <p className="text-[11px] text-indigo-800">
                Semana <strong>{editingReservation.recurrenceWeekIndex}</strong> de <strong>{editingReservation.recurrenceTotalWeeks}</strong>.
              </p>
              
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={updateWholeSeries}
                  onChange={(e) => setUpdateWholeSeries(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-indigo-900">
                  Aplicar novo horário / modificação a TODAS as {editingReservation.recurrenceTotalWeeks} semanas desta série
                </span>
              </label>
            </div>
          )}

          {/* 1. Laboratório */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Laboratório:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setLabId('laser')}
                className={`p-3 rounded-xl border-2 transition cursor-pointer ${
                  labId === 'laser'
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="font-bold text-xs text-blue-900 block">LABORATÓRIO LASER</span>
                <span className="text-[10px] text-slate-500">Capacidade: {labs.laser.capacity}</span>
              </div>

              <div
                onClick={() => setLabId('sigeo')}
                className={`p-3 rounded-xl border-2 transition cursor-pointer ${
                  labId === 'sigeo'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <span className="font-bold text-xs text-emerald-900 block">LABORATÓRIO SIGEO</span>
                <span className="text-[10px] text-slate-500">Capacidade: {labs.sigeo.capacity}</span>
              </div>
            </div>
          </div>

          {/* 2. Data e Horário */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Data e Horário:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Data:</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isRecurring && updateWholeSeries}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium disabled:opacity-50"
                />
                {isRecurring && updateWholeSeries && (
                  <span className="text-[9px] text-slate-400 mt-0.5 block">
                    (Cada semana manterá seu próprio dia)
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Início:</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Término:</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>
            </div>

            {/* Alerta de Conflito em Tempo Real */}
            <div className="mt-2.5">
              {conflictStatus.available ? (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Horário livre e sem conflitos na grade do {labs[labId].name}!</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{conflictStatus.conflictReason}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Título e Finalidade */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              3. Título e Finalidade:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tipo de Atividade:</label>
                <select
                  value={purposeType}
                  onChange={(e) => setPurposeType(e.target.value as PurposeType)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium cursor-pointer"
                >
                  <option value="tcc">Trabalho de Conclusão de Curso (TCC)</option>
                  <option value="iniciacao_cientifica">Iniciação Científica / Pesquisa</option>
                  <option value="projeto_extensao">Projeto de Extensão</option>
                  <option value="reposicao">Aula Prática Extra / Reposição</option>
                  <option value="apoio_tecnico">Apoio Técnico / Plantão de Dúvidas</option>
                  <option value="reuniao">Reunião de Grupo de Pesquisa</option>
                  <option value="aula_regular">Aula Regular</option>
                  <option value="manutencao">Manutenção Preventiva</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Status Atual:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReservationStatus)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold cursor-pointer"
                >
                  <option value="aprovada">🟢 Aprovada (Fixada na Grade)</option>
                  <option value="pendente">🟡 Pendente de Avaliação</option>
                  <option value="cancelada">⚪ Cancelada (Horário Liberado)</option>
                  <option value="recusada">🔴 Recusada</option>
                </select>
              </div>
            </div>

            {/* Professores: Em Uso (Público) e Responsável (Interno) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Professores Vinculados ao Horário:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      Professor em Uso:
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Público na Grade
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Prof. Dr. Silva"
                    value={userTeacher}
                    onChange={(e) => setUserTeacher(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">
                    Exibido publicamente na grade de horários para todos.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      Professor Responsável:
                    </span>
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      Uso Interno
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Prof. Coordenador"
                    value={responsibleTeacher}
                    onChange={(e) => setResponsibleTeacher(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 font-medium"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">
                    Uso restrito a técnicos e coordenação (oculto ao público).
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Título da Atividade:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Descrição / Observações Técnicas:</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nota do Técnico / Justificativa Interna:</label>
              <input
                type="text"
                placeholder="Ex: Horário remanejado a pedido do solicitante."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5"
              />
            </div>
          </div>

          {/* Botões de Ação do Gestor */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Ações Destrutivas / Cancelamento */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancelReservation}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold rounded-xl border border-amber-300 transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Cancela o agendamento e libera a vaga na grade"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancelar Reserva</span>
              </button>

              <button
                type="button"
                onClick={handleDeletePermanent}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl border border-rose-300 transition cursor-pointer flex items-center justify-center gap-1.5"
                title="Exclui definitivamente do banco de dados"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir do BD</span>
              </button>
            </div>

            {/* Ações de Salvamento */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsReservationModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Fechar
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Modificações</span>
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
