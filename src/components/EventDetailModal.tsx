import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  Cpu, 
  Trash2, 
  Edit3,
  CheckCircle,
  Tag,
  Repeat,
  Ban,
  Globe,
  Lock,
  Sparkles
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { 
  formatDateBR, 
  formatDateToYYYYMMDD,
  getPurposeBadge, 
  getStatusBadge, 
  isEventEnded,
  getNextDayOfWeekDate,
  addWeeksToDateStr
} from '../utils/dateHelpers';
import { Reservation, FixedClass } from '../types';

export const EventDetailModal: React.FC = () => {
  const { 
    selectedEventDetail, 
    setSelectedEventDetail, 
    labs, 
    equipments, 
    currentUser, 
    cancelReservation,
    deleteReservation,
    deleteFixedClass,
    openClassModalForEdit,
    openReservationModalForEdit,
    reactivateReservation,
    canUserManageLab,
    checkAvailability
  } = useLab();

  if (!selectedEventDetail) return null;

  const ev = selectedEventDetail;
  const isLaser = ev.labId === 'laser';
  const lab = labs[ev.labId];
  const isFixedClass = ev.originType === 'fixed_class';
  const badge = getPurposeBadge(ev.type);

  const reservationItem = !isFixedClass ? (ev.rawItem as Reservation) : null;
  const fixedClassItem = isFixedClass ? (ev.rawItem as FixedClass) : null;

  const statusBadge = reservationItem ? getStatusBadge(reservationItem.status) : null;

  const allocatedEquipments = reservationItem?.requestedEquipments
    ? equipments.filter(eq => reservationItem.requestedEquipments.includes(eq.id))
    : [];

  const isManager = currentUser?.role === 'coordenador' || currentUser?.role === 'tecnico';
  const canManageThisLab = Boolean(isManager && canUserManageLab(ev.labId));
  const isApplicant = Boolean(
    currentUser &&
    reservationItem &&
    (currentUser.id === reservationItem.applicantId || currentUser.email.toLowerCase() === reservationItem.applicantEmail?.toLowerCase())
  );
  const isEnded = Boolean(ev.isEnded || (ev.originType === 'reservation' && ev.date && isEventEnded(ev.date, ev.endTime)));
  const isExternal = !isEnded && (ev.isExternal !== undefined
    ? Boolean(ev.isExternal)
    : Boolean(ev.customColor === 'vermelho' || ev.highlightColor?.includes('rose')));
  const isOrange = !isEnded && !isExternal && (ev.customColor === 'laranja' || ev.labId === 'ltgeo');
  const isBlue = !isEnded && !isExternal && (ev.customColor === 'azul' || ev.labId === 'laser');

  // Estados para reativação de horário pelo técnico
  const [showReactivateForm, setShowReactivateForm] = useState(false);
  const [reactivateDate, setReactivateDate] = useState<string>('');
  const [reactivateStartTime, setReactivateStartTime] = useState<string>('');
  const [reactivateEndTime, setReactivateEndTime] = useState<string>('');
  const [reactivateWeeks, setReactivateWeeks] = useState<number>(1);

  const todayStr = formatDateToYYYYMMDD(new Date());

  useEffect(() => {
    if (selectedEventDetail && selectedEventDetail.originType === 'reservation') {
      setShowReactivateForm(false);
      setReactivateStartTime(selectedEventDetail.startTime);
      setReactivateEndTime(selectedEventDetail.endTime);
      setReactivateWeeks(1);
      
      // Sugere a próxima data correspondente ao dia da semana do evento
      const nextDate = getNextDayOfWeekDate(selectedEventDetail.dayOfWeek);
      setReactivateDate(nextDate);
    }
  }, [selectedEventDetail]);

  // Checagem de disponibilidade em tempo real das semanas selecionadas para reativação
  const availabilityCheck = useMemo(() => {
    if (!reservationItem || !reactivateDate || !reactivateStartTime || !reactivateEndTime) {
      return { hasConflict: false, firstConflictReason: null, dates: [], lastDate: reactivateDate };
    }

    const count = Math.max(1, Math.min(16, reactivateWeeks || 1));
    const dates: string[] = [];
    let firstConflictReason: string | null = null;

    for (let w = 0; w < count; w++) {
      const dStr = addWeeksToDateStr(reactivateDate, w);
      dates.push(dStr);
      if (!firstConflictReason) {
        const chk = checkAvailability(reservationItem.labId, dStr, reactivateStartTime, reactivateEndTime);
        if (!chk.available) {
          firstConflictReason = `Semana ${w + 1} (${formatDateBR(dStr)}): ${chk.conflictReason || 'Horário já ocupado nesta data.'}`;
        }
      }
    }

    return {
      hasConflict: Boolean(firstConflictReason),
      firstConflictReason,
      dates,
      lastDate: dates[dates.length - 1] || reactivateDate
    };
  }, [reservationItem, reactivateDate, reactivateStartTime, reactivateEndTime, reactivateWeeks, checkAvailability]);

  const handleConfirmReactivate = () => {
    if (!reservationItem) return;
    const res = reactivateReservation(
      reservationItem,
      reactivateDate,
      reactivateStartTime,
      reactivateEndTime,
      reactivateWeeks
    );
    if (res.success) {
      setShowReactivateForm(false);
      setSelectedEventDetail(null);
    } else if (res.error) {
      alert(`Não foi possível reativar:\n${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8">
        
        {/* Header com cor do Lab */}
        <div className={`p-6 text-white relative ${
          isEnded
            ? 'bg-gradient-to-r from-slate-600 to-slate-850'
            : isExternal 
            ? 'bg-gradient-to-r from-rose-700 to-rose-950'
            : isOrange
            ? 'bg-gradient-to-r from-orange-600 to-orange-800'
            : isBlue 
            ? 'bg-gradient-to-r from-blue-700 to-blue-900' 
            : 'bg-gradient-to-r from-emerald-700 to-emerald-900'
        }`}>
          <button
            onClick={() => setSelectedEventDetail(null)}
            className="absolute top-6 right-6 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
              LAB {lab.name}
            </span>
            {isEnded ? (
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-900/60 backdrop-blur-xs text-white border border-white/20">
                ⏳ Horário Finalizado (Histórico)
              </span>
            ) : isExternal ? (
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/80 backdrop-blur-xs text-white border border-white/30">
                🔴 Aula / Solicitação Externa
              </span>
            ) : null}
            <span className="text-xs font-semibold text-white/90">
              {isFixedClass ? '• Grade Semestral Oficial' : `• Protocolo: ${reservationItem?.protocol}`}
            </span>
          </div>

          <h3 className="text-xl font-bold leading-snug">{ev.title}</h3>
          <p className="text-xs text-white/80 mt-1">{ev.subtitle}</p>
        </div>

        {/* Corpo dos Detalhes */}
        <div className="p-6 space-y-5 text-xs text-slate-600">
          
          {/* Banner de Horário Finalizado */}
          {isEnded && (
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-2xl text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
              <Clock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Horário Finalizado / Histórico de Uso</span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  A data e horário desta solicitação já se encerraram. O registro permanece visível na grade em tom cinza exclusivamente para fins de histórico e prestação de contas de uso do laboratório.
                </span>
              </div>
            </div>
          )}

          {/* Card de Horário & Local */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Horário da Aula</span>
                <span className="text-xs font-bold text-slate-900">{ev.startTime} às {ev.endTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Localização</span>
                <span className="text-xs font-bold text-slate-900">{lab.location}</span>
              </div>
            </div>
          </div>

          {/* Card de Recorrência Semanal */}
          {reservationItem?.isRecurring && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>
                  Reserva Recorrente Semanal: <strong>Semana {reservationItem.recurrenceWeekIndex} de {reservationItem.recurrenceTotalWeeks}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded-full">
                Série Semanal
              </span>
            </div>
          )}

          {/* Tipo e Status */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tipo de Atividade</span>
              <span className={`inline-block px-2.5 py-1 rounded-lg border font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
            </div>

            {statusBadge && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status da Reserva</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${
                  isEnded 
                    ? 'bg-slate-100 text-slate-700 border-slate-300' 
                    : `${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isEnded ? 'bg-slate-400' : statusBadge.dot}`} />
                  {isEnded ? 'Concluída (Histórico)' : statusBadge.label}
                </span>
              </div>
            )}
          </div>

          {/* Identificação da Turma / Responsável */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {isFixedClass ? 'Identificação da Turma & Docente' : 'Docentes & Solicitante'}
            </span>
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">
                  {ev.responsible || 'Turma Oficial de Graduação'}
                </div>
                {fixedClassItem && (
                  <div className="text-[11px] text-slate-500">
                    Semestre: {fixedClassItem.semester} • Código: {fixedClassItem.courseCode}
                  </div>
                )}
                {fixedClassItem?.notes && (
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    {fixedClassItem.notes}
                  </div>
                )}
                {reservationItem && (
                  <div className="text-[11px] text-slate-500">
                    Solicitante: <strong>{reservationItem.applicantName}</strong> ({reservationItem.applicantRole})
                  </div>
                )}
              </div>
            </div>

            {/* Professor em Uso (Público - Visível a Todos) */}
            {(reservationItem?.userTeacher || ev.userTeacher) && (
              <div className="flex items-center gap-2.5 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950">
                <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1.5">
                    Professor em Uso
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded border border-emerald-300">
                      Público
                    </span>
                  </span>
                  <span className="font-bold text-xs text-blue-950">
                    {reservationItem?.userTeacher || ev.userTeacher}
                  </span>
                </div>
              </div>
            )}

            {/* Professor Responsável (Uso Interno - Apenas Técnicos, Coordenadores e o Próprio Solicitante) */}
            {(isManager || (currentUser && reservationItem && (currentUser.id === reservationItem.createdById || currentUser.email.toLowerCase() === reservationItem.applicantEmail.toLowerCase()))) && (reservationItem?.responsibleTeacher || reservationItem?.supervisorName || ev.responsibleTeacher) && (
              <div className="flex items-center justify-between gap-2.5 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1.5">
                      Professor Responsável
                      <span className="text-[9px] font-bold text-amber-900 bg-amber-200/70 px-1.5 py-0.2 rounded border border-amber-300">
                        Uso Interno
                      </span>
                    </span>
                    <span className="font-bold text-xs text-amber-950">
                      {reservationItem?.responsibleTeacher || reservationItem?.supervisorName || ev.responsibleTeacher}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Descrição da Atividade se houver */}
            {reservationItem?.description && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Descrição:</span>
                <p className="leading-relaxed">{reservationItem.description}</p>
              </div>
            )}
          </div>

          {/* Equipamentos Alocados */}
          {allocatedEquipments.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Equipamentos Vinculados</span>
              <div className="space-y-1.5">
                {allocatedEquipments.map(eq => (
                  <div key={eq.id} className="flex items-center gap-2 p-2 bg-blue-50/50 border border-blue-200 rounded-lg text-blue-900 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>{eq.name} ({eq.code})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AÇÕES DE GESTÃO PARA COORDENADOR OU TÉCNICO */}
          {(isManager || isApplicant) && (
            <div className="border-t border-slate-200 pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {isManager ? 'Ações do Gestor / Técnico:' : 'Ações da Sua Solicitação:'}
                </span>
                {isManager && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    canManageThisLab 
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}>
                    {canManageThisLab ? 'Jurisdição Autorizada ✓' : 'Jurisdição Restrita 🔒'}
                  </span>
                )}
              </div>

              {/* Se for Aula Fixa da Grade */}
              {isFixedClass && fixedClassItem && (
                canManageThisLab ? (
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente remover a disciplina "${fixedClassItem.courseName}" da grade semestral?`)) {
                          deleteFixedClass(fixedClassItem.id);
                          setSelectedEventDetail(null);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                      title="Exclui esta aula da grade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir da Grade</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedEventDetail(null);
                        openClassModalForEdit(fixedClassItem);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Horário & Informações</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Esta aula pertence ao laboratório <strong>{ev.labId.toUpperCase()}</strong>. Seu perfil técnico não tem autorização para alterar esta sala.
                    </span>
                  </div>
                )
              )}

              {/* Se for Reserva de Horário */}
              {!isFixedClass && reservationItem && (
                canManageThisLab ? (
                  <div className="space-y-3">
                    {/* Painel de Reativação e Repetição Aberto pelo Técnico */}
                    {showReactivateForm && (
                      <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl space-y-3.5 shadow-sm text-slate-700 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                              <Repeat className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-emerald-950">Reativar & Repetir Horário na Grade</h4>
                              <p className="text-[10px] text-emerald-700 font-medium">Ação exclusiva de técnico • Aprovação direta</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full uppercase">
                            Lab {reservationItem.labId}
                          </span>
                        </div>

                        {/* Inputs: Data inicial e horários */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                              Data Inicial:
                            </label>
                            <input
                              type="date"
                              value={reactivateDate}
                              min={todayStr}
                              onChange={e => setReactivateDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                              Início:
                            </label>
                            <input
                              type="time"
                              value={reactivateStartTime}
                              onChange={e => setReactivateStartTime(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                              Término:
                            </label>
                            <input
                              type="time"
                              value={reactivateEndTime}
                              onChange={e => setReactivateEndTime(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        {/* Seletor de Semanas de Recorrência */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase text-slate-600">
                              Repetir por Quantas Semanas Consecutivas?
                            </label>
                            <span className="text-xs font-extrabold text-emerald-800">
                              {reactivateWeeks === 1 ? '1 semana (uso único)' : `${reactivateWeeks} semanas consecutivas`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {[1, 2, 4, 8, 12, 16].map(w => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => setReactivateWeeks(w)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  reactivateWeeks === w
                                    ? 'bg-emerald-700 text-white shadow-xs'
                                    : 'bg-white hover:bg-emerald-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {w === 1 ? '1 sem. (única)' : `${w} semanas`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Painel de Checagem de Conflitos em Tempo Real */}
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-200/80 space-y-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-[11px]">
                            <span>Cronograma Planejado ({reactivateWeeks} {reactivateWeeks === 1 ? 'semana' : 'semanas'}):</span>
                            {availabilityCheck.hasConflict ? (
                              <span className="text-rose-600 flex items-center gap-1 font-bold">
                                ⚠️ Conflito Detectado
                              </span>
                            ) : (
                              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                ✓ 100% Disponível
                              </span>
                            )}
                          </div>

                          {availabilityCheck.hasConflict ? (
                            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] leading-tight">
                              <strong>Atenção:</strong> {availabilityCheck.firstConflictReason}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              De <strong>{formatDateBR(reactivateDate)}</strong> até <strong>{formatDateBR(availabilityCheck.lastDate)}</strong> ({reactivateStartTime} às {reactivateEndTime}) no Lab {reservationItem.labId.toUpperCase()}.
                            </p>
                          )}
                        </div>

                        {/* Ações do Form de Reativação */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowReactivateForm(false)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            disabled={availabilityCheck.hasConflict}
                            onClick={handleConfirmReactivate}
                            className={`px-4 py-1.5 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                              availabilityCheck.hasConflict
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirmar Reativação ({reactivateWeeks} {reactivateWeeks === 1 ? 'sem.' : 'semanas'})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Barra de Botões do Técnico com Jurisdição */}
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowReactivateForm(!showReactivateForm)}
                        className={`px-3.5 py-1.5 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                          showReactivateForm
                            ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                            : isEnded
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                        title="Reativar este horário para repetir em novas semanas"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>{showReactivateForm ? 'Ocultar Reativação' : 'Reativar / Repetir por Semanas'}</span>
                      </button>

                      <button
                        onClick={() => {
                          const isRec = Boolean(reservationItem.isRecurring && reservationItem.recurrenceGroupId);
                          const deleteWhole = isRec ? confirm(`Esta é uma reserva recorrente.\n\nClique em OK para excluir TODA a série de ${reservationItem.recurrenceTotalWeeks || ''} semanas.\nClique em CANCELAR para excluir apenas este dia (${formatDateBR(reservationItem.date)}).`) : false;
                          
                          deleteReservation(reservationItem.id, deleteWhole);
                          setSelectedEventDetail(null);
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                        title="Exclui definitivamente do banco de dados"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Reserva</span>
                      </button>

                      <button
                        onClick={() => {
                          const isRec = Boolean(reservationItem.isRecurring && reservationItem.recurrenceGroupId);
                          const cancelWhole = isRec ? confirm(`Esta é uma reserva recorrente.\n\nClique em OK para cancelar TODA a série de ${reservationItem.recurrenceTotalWeeks || ''} semanas.\nClique em CANCELAR para cancelar apenas este dia (${formatDateBR(reservationItem.date)}).`) : false;

                          cancelReservation(reservationItem.id, cancelWhole);
                          setSelectedEventDetail(null);
                        }}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-300 transition cursor-pointer flex items-center gap-1.5"
                        title="Cancela a reserva e libera o horário para outros usuários"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancelar Horário</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedEventDetail(null);
                          openReservationModalForEdit(reservationItem);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modificar Horário / Detalhes</span>
                      </button>
                    </div>
                  </div>
                ) : isApplicant ? (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        cancelReservation(reservationItem.id, false);
                        setSelectedEventDetail(null);
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancelar Minha Solicitação</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold block">Jurisdição Restrita</span>
                      <span>Esta reserva é do laboratório <strong>{ev.labId.toUpperCase()}</strong>. Seu perfil técnico está restrito a <strong>{currentUser?.assignedLabs?.map(l => l.toUpperCase()).join(', ')}</strong>. Apenas técnicos do {ev.labId.toUpperCase()} ou o Administrador Master podem alterar este horário.</span>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setSelectedEventDetail(null)}
            className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
