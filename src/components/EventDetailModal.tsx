import React from 'react';
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
  Tag
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { formatDateBR, getPurposeBadge, getStatusBadge } from '../utils/dateHelpers';
import { Reservation, FixedClass } from '../types';

export const EventDetailModal: React.FC = () => {
  const { 
    selectedEventDetail, 
    setSelectedEventDetail, 
    labs, 
    equipments, 
    currentUser, 
    cancelReservation,
    openClassModalForEdit
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8">
        
        {/* Header com cor do Lab */}
        <div className={`p-6 text-white relative ${
          ev.highlightColor 
            ? 'bg-gradient-to-r from-rose-700 to-amber-700'
            : isLaser 
            ? 'bg-gradient-to-r from-blue-700 to-blue-900' 
            : 'bg-gradient-to-r from-emerald-700 to-emerald-900'
        }`}>
          <button
            onClick={() => setSelectedEventDetail(null)}
            className="absolute top-6 right-6 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
              LAB {lab.name}
            </span>
            <span className="text-xs font-semibold text-white/90">
              {isFixedClass ? '• Grade Semestral Oficial' : `• Protocolo: ${reservationItem?.protocol}`}
            </span>
          </div>

          <h3 className="text-xl font-bold leading-snug">{ev.title}</h3>
          <p className="text-xs text-white/80 mt-1">{ev.subtitle}</p>
        </div>

        {/* Corpo dos Detalhes */}
        <div className="p-6 space-y-5 text-xs text-slate-600">
          
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
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                  <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                  {statusBadge.label}
                </span>
              </div>
            )}
          </div>

          {/* Docente / Responsável */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Docente / Responsável</span>
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{ev.responsible}</div>
                {fixedClassItem && (
                  <div className="text-[11px] text-slate-500">
                    Semestre: {fixedClassItem.semester} • Turma: {fixedClassItem.courseCode}
                  </div>
                )}
                {fixedClassItem?.notes && (
                  <div className="text-[11px] text-blue-700 mt-0.5">
                    {fixedClassItem.notes}
                  </div>
                )}
              </div>
            </div>
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

          {/* AÇÕES DE GESTÃO (EDITAR AULA) SE FOR COORDENADOR OU TÉCNICO */}
          {isManager && isFixedClass && fixedClassItem && (
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">Ações do Gestor:</span>
              
              <button
                onClick={() => {
                  setSelectedEventDetail(null);
                  openClassModalForEdit(fixedClassItem);
                }}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Informações desta Aula</span>
              </button>
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
