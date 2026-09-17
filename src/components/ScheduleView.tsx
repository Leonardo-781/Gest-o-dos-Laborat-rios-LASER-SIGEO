import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Download, 
  Printer, 
  Plus, 
  Clock, 
  Compass, 
  Globe, 
  Edit3,
  Layers,
  Sparkles,
  Repeat,
  BookOpen,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { ViewMode, ScheduleEvent, FixedClass, LabId } from '../types';
import { 
  getWeekDays, 
  formatDateBR, 
  getPurposeBadge, 
  timeToMinutes,
  isEventEnded
} from '../utils/dateHelpers';
import { MiniMonthCalendar } from './MiniMonthCalendar';

interface ScheduleViewProps {
  onBackToHub?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onBackToHub }) => {
  const { 
    selectedLab, 
    setSelectedLab, 
    referenceDate, 
    setReferenceDate, 
    getEventsForDate, 
    setSelectedEventDetail,
    openBookingWithPreselection,
    openClassModalForNew,
    currentUser,
    canUserManageLab,
    labs,
    activeLabGroup,
    setActiveLabGroup,
    setIsBookingOpen,
    setIsRulesOpen
  } = useLab();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [slotMode, setSlotMode] = useState<'blocks' | 'periods'>('blocks');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState('');

  // Ticker de 60s para atualizar automaticamente o status de horário finalizado em tempo real
  const [, setClockTick] = useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setClockTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const weekInfo = getWeekDays(referenceDate);
  const days = weekInfo.days;

  const isManager = currentUser?.role === 'coordenador' || currentUser?.role === 'tecnico';

  const handlePrevWeek = () => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - 7);
    setReferenceDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() + 7);
    setReferenceDate(d);
  };

  const handleToday = () => {
    setReferenceDate(new Date());
  };

  // 1. Faixas oficiais em Blocos de Aula (Padrão Acadêmico UFU - sem lacunas vazias)
  const blockTimeSlots = [
    { label: '07:10-08:50', start: '07:10', end: '08:50', period: '1º e 2º Tempos', isLunchBreakAfter: false },
    { label: '08:50-10:40', start: '08:50', end: '10:40', period: '3º e 4º Tempos', isLunchBreakAfter: false },
    { label: '10:40-12:20', start: '10:40', end: '12:20', period: '5º e 6º Tempos', isLunchBreakAfter: true },
    // Intervalo de Almoço (12:20 às 13:10)
    { label: '13:10-14:50', start: '13:10', end: '14:50', period: '7º e 8º Tempos', isLunchBreakAfter: false },
    { label: '14:50-16:50', start: '14:50', end: '16:50', period: '9º e 10º Tempos', isLunchBreakAfter: false },
    { label: '16:50-18:30', start: '16:50', end: '18:30', period: '11º e 12º Tempos', isLunchBreakAfter: false }
  ];

  // 2. Faixas detalhadas de 50 minutos (detalhamento tempo a tempo)
  const periodTimeSlots = [
    { label: '07:10-08:00', start: '07:10', end: '08:00', period: '1º Tempo', isLunchBreakAfter: false },
    { label: '08:00-08:50', start: '08:00', end: '08:50', period: '2º Tempo', isLunchBreakAfter: false },
    { label: '08:50-09:40', start: '08:50', end: '09:40', period: '3º Tempo', isLunchBreakAfter: false },
    { label: '09:50-10:40', start: '09:50', end: '10:40', period: '4º Tempo', isLunchBreakAfter: false },
    { label: '10:40-11:30', start: '10:40', end: '11:30', period: '5º Tempo', isLunchBreakAfter: false },
    { label: '11:30-12:20', start: '11:30', end: '12:20', period: '6º Tempo', isLunchBreakAfter: true },
    // Intervalo de Almoço (12:20 às 13:10)
    { label: '13:10-14:00', start: '13:10', end: '14:00', period: '7º Tempo', isLunchBreakAfter: false },
    { label: '14:00-14:50', start: '14:00', end: '14:50', period: '8º Tempo', isLunchBreakAfter: false },
    { label: '14:50-15:40', start: '14:50', end: '15:40', period: '9º Tempo', isLunchBreakAfter: false },
    { label: '16:00-16:50', start: '16:00', end: '16:50', period: '10º Tempo', isLunchBreakAfter: false },
    { label: '16:50-17:40', start: '16:50', end: '17:40', period: '11º Tempo', isLunchBreakAfter: false },
    { label: '17:40-18:30', start: '17:40', end: '18:30', period: '12º Tempo', isLunchBreakAfter: false }
  ];

  const officialTimeSlots = slotMode === 'blocks' ? blockTimeSlots : periodTimeSlots;

  const lunchSlotIndex = officialTimeSlots.findIndex(s => s.isLunchBreakAfter);
  const morningSlots = lunchSlotIndex !== -1 
    ? officialTimeSlots.slice(0, lunchSlotIndex + 1)
    : officialTimeSlots;
  const afternoonSlots = lunchSlotIndex !== -1 
    ? officialTimeSlots.slice(lunchSlotIndex + 1)
    : [];

  const isDualLab = activeLabGroup === 'laser_sigeo' && selectedLab === 'all';
  const targetLabs: LabId[] = isDualLab 
    ? ['laser', 'sigeo'] 
    : (activeLabGroup === 'ltgeo' ? ['ltgeo'] : [selectedLab === 'all' ? 'laser' : selectedLab]);

  // Exportar CSV
  const handleExportCSV = () => {
    const allEvents: { dia: string; data: string; lab: string; horario: string; titulo: string; responsavel: string; tipo: string }[] = [];
    
    days.forEach(d => {
      const dayEvents = getEventsForDate(d.dateStr, selectedLab);
      dayEvents.forEach(e => {
        allEvents.push({
          dia: d.dayName,
          data: d.dateStr,
          lab: e.labId.toUpperCase(),
          horario: `${e.startTime} - ${e.endTime}`,
          titulo: e.title,
          responsavel: e.responsible,
          tipo: getPurposeBadge(e.type).label
        });
      });
    });

    const headers = 'Dia da Semana;Data;Laboratório;Horário;Atividade / Disciplina;Responsável;Tipo\n';
    const rows = allEvents.map(e => `"${e.dia}";"${e.data}";"${e.lab}";"${e.horario}";"${e.titulo}";"${e.responsavel}";"${e.tipo}"`).join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `grade-oficial-laser-sigeo-${weekInfo.days[0].dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* SELETOR PRINCIPAL DE LABORATÓRIOS (SEGMENTED CONTROL DE ALTA FIDELIDADE) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-nowrap overflow-x-auto no-scrollbar no-print">
        
        {/* Segmented Switcher */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1 items-center flex-nowrap shrink-0">
          
          {/* Aba 1: Complexo LASER & SIGEO */}
          <button
            type="button"
            onClick={() => {
              setActiveLabGroup('laser_sigeo');
              if (selectedLab === 'ltgeo') setSelectedLab('all');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeLabGroup === 'laser_sigeo'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90 ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <div className="flex items-center -space-x-1 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="text-left leading-tight">
              <div className="font-extrabold flex items-center gap-1.5">
                <span>LASER & SIGEO</span>
                {activeLabGroup === 'laser_sigeo' && (
                  <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                    Ativo
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Salas 1B309 & 1B307</div>
            </div>
          </button>

          {/* Aba 2: LTGEO */}
          <button
            type="button"
            onClick={() => {
              setActiveLabGroup('ltgeo');
              setSelectedLab('ltgeo');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeLabGroup === 'ltgeo'
                ? 'bg-white text-orange-950 shadow-xs border border-orange-200/90 ring-1 ring-orange-500/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white shrink-0" />
            <div className="text-left leading-tight">
              <div className="font-extrabold flex items-center gap-1.5">
                <span>LTGEO</span>
                {activeLabGroup === 'ltgeo' && (
                  <span className="text-[9px] font-black uppercase text-orange-700 bg-orange-50 px-1 py-0.2 rounded border border-orange-200">
                    Ativo
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Sala 1B210 (Topografia)</div>
            </div>
          </button>

        </div>

        {/* Lado Direito: Ações e Indicador em Linha Única */}
        <div className="flex items-center gap-2 shrink-0 flex-nowrap ml-auto">
          
          {/* Indicador de Jurisdição para Usuário Gestor Logado */}
          {currentUser && isManager && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition shadow-2xs shrink-0 whitespace-nowrap ${
              (activeLabGroup === 'ltgeo' ? canUserManageLab('ltgeo') : (canUserManageLab('laser') || canUserManageLab('sigeo')))
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {(activeLabGroup === 'ltgeo' ? canUserManageLab('ltgeo') : (canUserManageLab('laser') || canUserManageLab('sigeo'))) ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sua Jurisdição Autorizada</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Modo Somente Leitura</span>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 whitespace-nowrap"
            title="Consultar normas e regras de uso dos laboratórios"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regras</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBookingOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer shrink-0 whitespace-nowrap ${
              activeLabGroup === 'ltgeo' 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fazer Reserva</span>
          </button>

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* COLUNA LATERAL: MINI CALENDÁRIO + FILTROS + STATUS */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4 no-print">
          
          {/* 🗓 MINI CALENDÁRIO MENSAL */}
          <MiniMonthCalendar />

          {/* SELETOR DE LABORATÓRIO */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
              Visualizar Laboratório:
            </span>

            {activeLabGroup === 'ltgeo' ? (
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedLab('ltgeo')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl bg-orange-600 text-white shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-300"></span>
                    <span>LTGEO • Topografia e Geodésia</span>
                  </div>
                  <span className="text-[10px] opacity-90 font-bold">Sala 1B210</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedLab('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    selectedLab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Visão Geral (Ambos)</span>
                  <span className="text-[10px] opacity-75">Laser & Sigeo</span>
                </button>

                <button
                  onClick={() => setSelectedLab('sigeo')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    selectedLab === 'sigeo'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Laboratório SIGEO</span>
                  </div>
                  <span className="text-[10px] opacity-80 font-bold">24 Workstations</span>
                </button>

                <button
                  onClick={() => setSelectedLab('laser')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    selectedLab === 'laser'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50/70 text-blue-900 hover:bg-blue-100/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Laboratório LASER</span>
                  </div>
                  <span className="text-[10px] opacity-80 font-bold">Sensores / Scanner</span>
                </button>
              </div>
            )}

            {/* Botão Rápido de Cadastrar Aula se for Gestor */}
            {isManager && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    const targetLab: LabId = activeLabGroup === 'ltgeo' ? 'ltgeo' : (selectedLab === 'laser' ? 'laser' : 'sigeo');
                    openClassModalForNew(targetLab);
                  }}
                  className={`w-full py-2 font-bold text-xs rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeLabGroup === 'ltgeo'
                      ? 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Adicionar Aula na Grade</span>
                </button>
              </div>
            )}
          </div>

          {/* INFORMAÇÕES DAS SALAS OFICIAIS */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 text-xs text-slate-600">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Salas & Lotação Oficial:
            </span>

            {activeLabGroup === 'ltgeo' ? (
              <div className="p-2.5 bg-orange-50/70 rounded-xl border border-orange-200 space-y-0.5">
                <div className="flex items-center justify-between font-bold text-orange-950">
                  <span>LTGEO (Sala 1B210)</span>
                  <span className="text-[10px] text-orange-800 font-mono font-bold">30 Vagas</span>
                </div>
                <p className="text-[11px] text-orange-900/80 leading-tight">
                  Lab. de Topografia e Geodésia • Estações Totais, GNSS RTK, Níveis Ópticos
                </p>
              </div>
            ) : (
              <>
                <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-emerald-950">
                    <span>SIGEO (Sala 1B307)</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">35 Vagas</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 leading-tight">
                    Lab. de SIG e Geoprocessamento • 24 Workstations
                  </p>
                </div>

                <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-blue-950">
                    <span>LASER (Sala 1B309)</span>
                    <span className="text-[10px] text-blue-700 font-mono font-bold">25 Vagas</span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 leading-tight">
                    Lab. de Sensoriamento Remoto • Sensores & Scanner
                  </p>
                </div>
              </>
            )}

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Apoio Técnico (Sala 1B308)</span>
                <span className="text-[10px] text-slate-500 font-mono font-bold">Plantão</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Sala dos Técnicos • Atendimento e retirada de instrumentos
              </p>
            </div>
          </div>

          {/* LEGENDA DE CORES */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-xs space-y-2">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              Legenda de Cores da Grade:
            </span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {activeLabGroup === 'ltgeo' ? (
                <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-950 border border-orange-200 font-bold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                  Laranja: LTGEO (Sala 1B210)
                </span>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                    Azul: LASER
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                    Verde: SIGEO
                  </span>
                </>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-950 border border-rose-300 font-black flex items-center gap-1.5 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 flex-shrink-0" />
                Vermelho: Aula / Solicitação Externa
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center gap-1.5 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 flex-shrink-0" />
                Cinza: Solicitação Finalizada (Histórico)
              </span>
            </div>
          </div>

        </div>

      {/* COLUNA PRINCIPAL: GRADE OFICIAL DE HORÁRIOS */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-3">
        
        {/* Barra Superior */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 rounded-md hover:bg-white text-slate-600 transition cursor-pointer"
                title="Semana anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-md transition cursor-pointer"
              >
                Hoje
              </button>
              <button
                onClick={handleNextWeek}
                className="p-1.5 rounded-md hover:bg-white text-slate-600 transition cursor-pointer"
                title="Próxima semana"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-bold text-slate-800 ml-1">
              {days[0].formattedShort} a {days[5].formattedShort} de {days[0].dateObj.toLocaleString('pt-BR', { month: 'long' })}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Seletor de Formato de Horários (Blocos Oficiais UFU vs Tempos Detalhados) */}
            {viewMode === 'week' && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSlotMode('blocks')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    slotMode === 'blocks' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Horários agrupados por blocos de aula oficiais da UFU (sem faixas vazias)"
                >
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span>Blocos de Aula</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSlotMode('periods')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    slotMode === 'periods' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Detalhamento tempo a tempo de 50 minutos"
                >
                  <span>Tempos de 50m</span>
                </button>
              </div>
            )}

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setViewMode('week')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Lista
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="p-1.5 text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
              title="Baixar planilha da grade"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer no-print"
              title="Imprimir grade"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* 1. VISUALIZAÇÃO: GRADE SEMANAL OFICIAL (BLOCO CONTÍNUO ESTILO ROWSPAN) */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[960px] xl:min-w-full">
                
                {/* Cabeçalho dos 6 Dias com Subcolunas de Laboratório */}
                <div 
                  className="grid border-b border-slate-200 bg-slate-50 text-center text-xs"
                  style={{
                    gridTemplateColumns: 'minmax(96px, 110px) repeat(6, minmax(0, 1fr))'
                  }}
                >
                  <div className="py-2.5 px-1 font-bold text-slate-400 uppercase text-[10px] border-r border-slate-200 flex items-center justify-center">
                    Horário
                  </div>
                  {days.map((d) => (
                    <div
                      key={d.dateStr}
                      className={`border-r last:border-r-0 border-slate-200 flex flex-col justify-between ${
                        d.isToday ? 'bg-blue-50/70 border-b-2 border-b-blue-600' : ''
                      }`}
                    >
                      <div className="py-1.5 px-1">
                        <div className="font-semibold text-slate-500 text-[10px] uppercase">
                          {d.dayName.slice(0, 3)}
                        </div>
                        <div className={`text-xs font-bold ${d.isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                          {d.formattedShort}
                        </div>
                      </div>

                      {/* Sub-header de laboratórios quando em Visão Geral (LASER e SIGEO simultâneos) */}
                      {isDualLab && (
                        <div className="grid grid-cols-2 text-[9px] font-extrabold border-t border-slate-200/90 text-center uppercase tracking-tight">
                          <div className="py-0.5 border-r border-slate-200/90 text-blue-700 bg-blue-50/70">
                            LASER
                          </div>
                          <div className="py-0.5 text-emerald-700 bg-emerald-50/70">
                            SIGEO
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* TURNO MATUTINO (MANHÃ) */}
                {(() => {
                  const sectionSlots = morningSlots;
                  const slotMinHeight = slotMode === 'blocks' ? 84 : 48;

                  return (
                    <div 
                      className="grid"
                      style={{
                        gridTemplateColumns: 'minmax(96px, 110px) repeat(6, minmax(0, 1fr))',
                      }}
                    >
                      {/* Coluna de Horários (Manhã) */}
                      <div className="border-r border-slate-200 bg-slate-50/60 flex flex-col divide-y divide-slate-100">
                        {sectionSlots.map((slot) => (
                          <div 
                            key={slot.label} 
                            className="p-1.5 flex flex-col items-center justify-center text-center flex-1"
                            style={{ minHeight: `${slotMinHeight}px` }}
                          >
                            <span className="text-[11px] font-mono font-bold text-slate-800 leading-tight">
                              {slot.start}-{slot.end}
                            </span>
                            {slot.period && (
                              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-tight mt-0.5">
                                {slot.period}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 6 Dias da Semana (Manhã) */}
                      {days.map((day) => {
                        const dayEvents = getEventsForDate(day.dateStr, selectedLab);

                        const occupiedSlotsByLab: Record<string, Set<number>> = {};
                        targetLabs.forEach(labId => {
                          occupiedSlotsByLab[labId] = new Set<number>();
                        });

                        interface EventLayoutItem {
                          event: ScheduleEvent;
                          startSlotIdx: number;
                          endSlotIdx: number;
                          span: number;
                          colNum: number;
                        }

                        const eventsToRender: EventLayoutItem[] = [];

                        targetLabs.forEach((labId, labColIdx) => {
                          const colNum = labColIdx + 1;
                          const labEvents = dayEvents.filter(ev => ev.labId === labId);

                          labEvents.forEach(ev => {
                            const evStartMin = timeToMinutes(ev.startTime);
                            const evEndMin = timeToMinutes(ev.endTime);

                            let startSlotIdx = -1;
                            let endSlotIdx = -1;

                            for (let i = 0; i < sectionSlots.length; i++) {
                              const slot = sectionSlots[i];
                              const sStart = timeToMinutes(slot.start);
                              const sEnd = timeToMinutes(slot.end);

                              if (Math.max(evStartMin, sStart) < Math.min(evEndMin, sEnd)) {
                                if (startSlotIdx === -1) {
                                  startSlotIdx = i;
                                }
                                endSlotIdx = i;
                              }
                            }

                            if (startSlotIdx !== -1) {
                              const span = Math.max(1, (endSlotIdx - startSlotIdx) + 1);
                              eventsToRender.push({
                                event: ev,
                                startSlotIdx,
                                endSlotIdx,
                                span,
                                colNum
                              });

                              for (let s = startSlotIdx; s <= endSlotIdx; s++) {
                                occupiedSlotsByLab[labId].add(s);
                              }
                            }
                          });
                        });

                        return (
                          <div
                            key={day.dateStr}
                            className={`border-r last:border-r-0 border-slate-200 relative ${
                              day.isToday ? 'bg-blue-50/15' : ''
                            }`}
                          >
                            <div
                              className="grid h-full w-full"
                              style={{
                                gridTemplateRows: `repeat(${sectionSlots.length}, minmax(${slotMinHeight}px, 1fr))`,
                                gridTemplateColumns: isDualLab ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                              }}
                            >
                              {/* Células de slots livres */}
                              {targetLabs.map((labId, labColIdx) => {
                                const colNum = labColIdx + 1;
                                return sectionSlots.map((slot, sIdx) => {
                                  const isOccupied = occupiedSlotsByLab[labId].has(sIdx);
                                  if (isOccupied) return null;

                                  return (
                                    <div
                                      key={`free-m-${labId}-${sIdx}`}
                                      style={{
                                        gridRow: `${sIdx + 1} / span 1`,
                                        gridColumn: colNum,
                                      }}
                                      onClick={() => openBookingWithPreselection(labId, day.dateStr, slot.start, slot.end)}
                                      className={`p-1 border-b last:border-b-0 ${
                                        isDualLab && labColIdx === 0 ? 'border-r border-slate-100' : ''
                                      } border-slate-100 hover:bg-blue-50/30 transition-colors cursor-pointer group flex items-center justify-center`}
                                      title={`Horário livre no ${labId.toUpperCase()} (${slot.start} às ${slot.end}). Clique para solicitar.`}
                                    >
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold text-blue-600 bg-white/95 px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs flex items-center gap-1">
                                        <Plus className="w-2.5 h-2.5 shrink-0" />
                                        <span>{isDualLab ? labId.toUpperCase() : 'Reservar'}</span>
                                      </span>
                                    </div>
                                  );
                                });
                              })}

                              {/* Cartões contínuos em bloco único */}
                              {eventsToRender.map((item) => {
                                const ev = item.event;
                                const isEnded = Boolean(ev.isEnded || (ev.originType === 'reservation' && ev.date && isEventEnded(ev.date, ev.endTime)));
                                const isExternal = !isEnded && (ev.isExternal !== undefined
                                  ? Boolean(ev.isExternal)
                                  : Boolean(ev.customColor === 'vermelho' || ev.highlightColor?.includes('rose')));
                                const isOrange = !isEnded && !isExternal && (ev.customColor === 'laranja' || ev.labId === 'ltgeo');
                                const isBlue = !isEnded && !isExternal && (ev.customColor === 'azul' || ev.labId === 'laser');
                                const isGreen = !isEnded && !isExternal && (ev.customColor === 'verde' || ev.labId === 'sigeo');

                                const durationMins = timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime);
                                const numTempos = Math.round(durationMins / 50);
                                const temposLabel = numTempos > 1 ? `${numTempos} Tempos` : '1 Tempo';

                                return (
                                  <div
                                    key={ev.id}
                                    style={{
                                      gridRow: `${item.startSlotIdx + 1} / span ${item.span}`,
                                      gridColumn: item.colNum,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEventDetail(ev);
                                    }}
                                    className={`m-1 p-2 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 hover:shadow-md cursor-pointer relative z-10 ${
                                      isEnded
                                        ? 'bg-slate-100/95 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-200/70 opacity-85'
                                        : isExternal
                                        ? 'bg-rose-50 border-rose-200 text-rose-950 hover:border-rose-300 hover:bg-rose-100/80 border-l-4 border-l-rose-600'
                                        : isOrange
                                        ? 'bg-orange-50/90 border-orange-200 text-orange-950 hover:border-orange-300 hover:bg-orange-100/80 border-l-4 border-l-orange-500'
                                        : isBlue
                                        ? 'bg-blue-50/90 border-blue-200 text-blue-950 hover:border-blue-300 hover:bg-blue-100/80 border-l-4 border-l-blue-600'
                                        : 'bg-emerald-50/90 border-emerald-200 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100/80 border-l-4 border-l-emerald-600'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1 text-[9px] font-bold">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span 
                                          className={`px-1.5 py-0.2 rounded font-extrabold ${
                                            isEnded
                                              ? 'bg-slate-500 text-white'
                                              : isExternal 
                                              ? 'bg-rose-700 text-white' 
                                              : isOrange
                                              ? 'bg-orange-600 text-white'
                                              : isBlue 
                                              ? 'bg-blue-600 text-white' 
                                              : 'bg-emerald-600 text-white'
                                          }`}
                                          title={isEnded ? 'Solicitação encerrada (Histórico de uso)' : undefined}
                                        >
                                          {isEnded ? `${ev.labId.toUpperCase()} • FIM` : isExternal ? `${ev.labId.toUpperCase()} • EXT` : ev.labId.toUpperCase()}
                                        </span>

                                        {item.span >= 2 && (
                                          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-extrabold bg-white/95 text-slate-700 border border-slate-200/90 shadow-2xs">
                                            {temposLabel}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 font-mono text-slate-600 font-semibold text-[9px]">
                                        {ev.isRecurring && (
                                          <span title={`Série Recorrente (${ev.recurrenceWeekIndex || 1}/${ev.recurrenceTotalWeeks || '?'})`}>
                                            <Repeat className="w-2.5 h-2.5 text-indigo-600 inline flex-shrink-0" />
                                          </span>
                                        )}
                                        <span>{ev.startTime}-{ev.endTime}</span>
                                      </div>
                                    </div>

                                    <div className="my-auto py-1">
                                      <div className={`font-bold text-slate-900 leading-tight ${item.span >= 2 ? 'text-xs line-clamp-2' : 'text-[11px] line-clamp-1'}`}>
                                        {ev.title}
                                      </div>

                                      {ev.responsible ? (
                                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                          {ev.responsible}
                                        </div>
                                      ) : ev.subtitle ? (
                                        <div className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                          {ev.subtitle}
                                        </div>
                                      ) : null}

                                      {item.span >= 2 && ev.notes && (
                                        <div className="text-[9.5px] text-slate-500/90 line-clamp-2 mt-1 italic leading-tight">
                                          {ev.notes}
                                        </div>
                                      )}
                                    </div>

                                    {item.span >= 2 && (
                                      <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[8.5px] text-slate-400 font-medium mt-auto">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                                          Bloco contínuo
                                        </span>
                                        <span className="font-mono text-slate-500 font-semibold">{temposLabel}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* FAIXA DO INTERVALO DE ALMOÇO (12:20 ÀS 13:10) */}
                <div className="bg-slate-100/95 border-y border-slate-200/90 text-center py-2 text-[10.5px] font-bold text-slate-600 uppercase tracking-widest no-print">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Intervalo de Almoço Acadêmico (12:20 às 13:10)</span>
                  </div>
                </div>

                {/* TURNO VESPERTINO (TARDE) */}
                {(() => {
                  const sectionSlots = afternoonSlots;
                  const slotMinHeight = slotMode === 'blocks' ? 84 : 48;

                  return (
                    <div 
                      className="grid"
                      style={{
                        gridTemplateColumns: 'minmax(96px, 110px) repeat(6, minmax(0, 1fr))',
                      }}
                    >
                      {/* Coluna de Horários (Tarde) */}
                      <div className="border-r border-slate-200 bg-slate-50/60 flex flex-col divide-y divide-slate-100">
                        {sectionSlots.map((slot) => (
                          <div 
                            key={slot.label} 
                            className="p-1.5 flex flex-col items-center justify-center text-center flex-1"
                            style={{ minHeight: `${slotMinHeight}px` }}
                          >
                            <span className="text-[11px] font-mono font-bold text-slate-800 leading-tight">
                              {slot.start}-{slot.end}
                            </span>
                            {slot.period && (
                              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-tight mt-0.5">
                                {slot.period}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 6 Dias da Semana (Tarde) */}
                      {days.map((day) => {
                        const dayEvents = getEventsForDate(day.dateStr, selectedLab);

                        const occupiedSlotsByLab: Record<string, Set<number>> = {};
                        targetLabs.forEach(labId => {
                          occupiedSlotsByLab[labId] = new Set<number>();
                        });

                        interface EventLayoutItem {
                          event: ScheduleEvent;
                          startSlotIdx: number;
                          endSlotIdx: number;
                          span: number;
                          colNum: number;
                        }

                        const eventsToRender: EventLayoutItem[] = [];

                        targetLabs.forEach((labId, labColIdx) => {
                          const colNum = labColIdx + 1;
                          const labEvents = dayEvents.filter(ev => ev.labId === labId);

                          labEvents.forEach(ev => {
                            const evStartMin = timeToMinutes(ev.startTime);
                            const evEndMin = timeToMinutes(ev.endTime);

                            let startSlotIdx = -1;
                            let endSlotIdx = -1;

                            for (let i = 0; i < sectionSlots.length; i++) {
                              const slot = sectionSlots[i];
                              const sStart = timeToMinutes(slot.start);
                              const sEnd = timeToMinutes(slot.end);

                              if (Math.max(evStartMin, sStart) < Math.min(evEndMin, sEnd)) {
                                if (startSlotIdx === -1) {
                                  startSlotIdx = i;
                                }
                                endSlotIdx = i;
                              }
                            }

                            if (startSlotIdx !== -1) {
                              const span = Math.max(1, (endSlotIdx - startSlotIdx) + 1);
                              eventsToRender.push({
                                event: ev,
                                startSlotIdx,
                                endSlotIdx,
                                span,
                                colNum
                              });

                              for (let s = startSlotIdx; s <= endSlotIdx; s++) {
                                occupiedSlotsByLab[labId].add(s);
                              }
                            }
                          });
                        });

                        return (
                          <div
                            key={day.dateStr}
                            className={`border-r last:border-r-0 border-slate-200 relative ${
                              day.isToday ? 'bg-blue-50/15' : ''
                            }`}
                          >
                            <div
                              className="grid h-full w-full"
                              style={{
                                gridTemplateRows: `repeat(${sectionSlots.length}, minmax(${slotMinHeight}px, 1fr))`,
                                gridTemplateColumns: isDualLab ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                              }}
                            >
                              {/* Células de slots livres */}
                              {targetLabs.map((labId, labColIdx) => {
                                const colNum = labColIdx + 1;
                                return sectionSlots.map((slot, sIdx) => {
                                  const isOccupied = occupiedSlotsByLab[labId].has(sIdx);
                                  if (isOccupied) return null;

                                  return (
                                    <div
                                      key={`free-a-${labId}-${sIdx}`}
                                      style={{
                                        gridRow: `${sIdx + 1} / span 1`,
                                        gridColumn: colNum,
                                      }}
                                      onClick={() => openBookingWithPreselection(labId, day.dateStr, slot.start, slot.end)}
                                      className={`p-1 border-b last:border-b-0 ${
                                        isDualLab && labColIdx === 0 ? 'border-r border-slate-100' : ''
                                      } border-slate-100 hover:bg-blue-50/30 transition-colors cursor-pointer group flex items-center justify-center`}
                                      title={`Horário livre no ${labId.toUpperCase()} (${slot.start} às ${slot.end}). Clique para solicitar.`}
                                    >
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold text-blue-600 bg-white/95 px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs flex items-center gap-1">
                                        <Plus className="w-2.5 h-2.5 shrink-0" />
                                        <span>{isDualLab ? labId.toUpperCase() : 'Reservar'}</span>
                                      </span>
                                    </div>
                                  );
                                });
                              })}

                              {/* Cartões contínuos em bloco único */}
                              {eventsToRender.map((item) => {
                                const ev = item.event;
                                const isEnded = Boolean(ev.isEnded || (ev.originType === 'reservation' && ev.date && isEventEnded(ev.date, ev.endTime)));
                                const isExternal = !isEnded && (ev.isExternal !== undefined
                                  ? Boolean(ev.isExternal)
                                  : Boolean(ev.customColor === 'vermelho' || ev.highlightColor?.includes('rose')));
                                const isOrange = !isEnded && !isExternal && (ev.customColor === 'laranja' || ev.labId === 'ltgeo');
                                const isBlue = !isEnded && !isExternal && (ev.customColor === 'azul' || ev.labId === 'laser');
                                const isGreen = !isEnded && !isExternal && (ev.customColor === 'verde' || ev.labId === 'sigeo');

                                const durationMins = timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime);
                                const numTempos = Math.round(durationMins / 50);
                                const temposLabel = numTempos > 1 ? `${numTempos} Tempos` : '1 Tempo';

                                return (
                                  <div
                                    key={ev.id}
                                    style={{
                                      gridRow: `${item.startSlotIdx + 1} / span ${item.span}`,
                                      gridColumn: item.colNum,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEventDetail(ev);
                                    }}
                                    className={`m-1 p-2 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 hover:shadow-md cursor-pointer relative z-10 ${
                                      isEnded
                                        ? 'bg-slate-100/95 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-200/70 opacity-85'
                                        : isExternal
                                        ? 'bg-rose-50 border-rose-200 text-rose-950 hover:border-rose-300 hover:bg-rose-100/80 border-l-4 border-l-rose-600'
                                        : isOrange
                                        ? 'bg-orange-50/90 border-orange-200 text-orange-950 hover:border-orange-300 hover:bg-orange-100/80 border-l-4 border-l-orange-500'
                                        : isBlue
                                        ? 'bg-blue-50/90 border-blue-200 text-blue-950 hover:border-blue-300 hover:bg-blue-100/80 border-l-4 border-l-blue-600'
                                        : 'bg-emerald-50/90 border-emerald-200 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100/80 border-l-4 border-l-emerald-600'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1 text-[9px] font-bold">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span 
                                          className={`px-1.5 py-0.2 rounded font-extrabold ${
                                            isEnded
                                              ? 'bg-slate-500 text-white'
                                              : isExternal 
                                              ? 'bg-rose-700 text-white' 
                                              : isOrange
                                              ? 'bg-orange-600 text-white'
                                              : isBlue 
                                              ? 'bg-blue-600 text-white' 
                                              : 'bg-emerald-600 text-white'
                                          }`}
                                          title={isEnded ? 'Solicitação encerrada (Histórico de uso)' : undefined}
                                        >
                                          {isEnded ? `${ev.labId.toUpperCase()} • FIM` : isExternal ? `${ev.labId.toUpperCase()} • EXT` : ev.labId.toUpperCase()}
                                        </span>

                                        {item.span >= 2 && (
                                          <span className="px-1.5 py-0.2 rounded-full text-[8px] font-extrabold bg-white/95 text-slate-700 border border-slate-200/90 shadow-2xs">
                                            {temposLabel}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1 font-mono text-slate-600 font-semibold text-[9px]">
                                        {ev.isRecurring && (
                                          <span title={`Série Recorrente (${ev.recurrenceWeekIndex || 1}/${ev.recurrenceTotalWeeks || '?'})`}>
                                            <Repeat className="w-2.5 h-2.5 text-indigo-600 inline flex-shrink-0" />
                                          </span>
                                        )}
                                        <span>{ev.startTime}-{ev.endTime}</span>
                                      </div>
                                    </div>

                                    <div className="my-auto py-1">
                                      <div className={`font-bold text-slate-900 leading-tight ${item.span >= 2 ? 'text-xs line-clamp-2' : 'text-[11px] line-clamp-1'}`}>
                                        {ev.title}
                                      </div>

                                      {ev.responsible ? (
                                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                          {ev.responsible}
                                        </div>
                                      ) : ev.subtitle ? (
                                        <div className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                          {ev.subtitle}
                                        </div>
                                      ) : null}

                                      {item.span >= 2 && ev.notes && (
                                        <div className="text-[9.5px] text-slate-500/90 line-clamp-2 mt-1 italic leading-tight">
                                          {ev.notes}
                                        </div>
                                      )}
                                    </div>

                                    {item.span >= 2 && (
                                      <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[8.5px] text-slate-400 font-medium mt-auto">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                                          Bloco contínuo
                                        </span>
                                        <span className="font-mono text-slate-500 font-semibold">{temposLabel}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

              </div>
            </div>
          </div>
        )}

        {/* 2. VISUALIZAÇÃO: DIA ESPECÍFICO */}
        {viewMode === 'day' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {days.map((d, idx) => (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                    selectedDayIndex === idx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{d.dayName}</span>
                  <span className="text-[11px] font-normal">({d.formattedShort})</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {(() => {
                const dayEvents = getEventsForDate(days[selectedDayIndex].dateStr, selectedLab);

                if (dayEvents.length === 0) {
                  return (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">Nenhuma aula regular neste dia.</p>
                      <button
                        onClick={() => openBookingWithPreselection(selectedLab === 'all' ? 'laser' : selectedLab, days[selectedDayIndex].dateStr, '08:50', '09:40')}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        + Solicitar reserva / apoio técnico para este dia
                      </button>
                    </div>
                  );
                }

                return dayEvents.map(ev => {
                  const isEnded = Boolean(ev.isEnded || (ev.originType === 'reservation' && ev.date && isEventEnded(ev.date, ev.endTime)));
                  const isExternal = !isEnded && (ev.isExternal !== undefined
                    ? Boolean(ev.isExternal)
                    : Boolean(ev.customColor === 'vermelho' || ev.highlightColor?.includes('rose')));
                  const isOrange = !isEnded && !isExternal && (ev.customColor === 'laranja' || ev.labId === 'ltgeo');
                  const isBlue = !isEnded && !isExternal && (ev.customColor === 'azul' || ev.labId === 'laser');
                  const isGreen = !isEnded && !isExternal && (ev.customColor === 'verde' || ev.labId === 'sigeo');

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventDetail(ev)}
                      className={`p-3.5 rounded-xl border transition hover:shadow-xs cursor-pointer flex items-center justify-between gap-4 ${
                        isEnded
                          ? 'bg-slate-100/90 border-slate-300 text-slate-700 hover:bg-slate-200/60 opacity-85'
                          : isExternal
                          ? 'bg-rose-50 border-rose-200'
                          : isOrange
                          ? 'bg-orange-50/60 border-orange-200'
                          : isBlue
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isEnded
                              ? 'bg-slate-500 text-white'
                              : isExternal 
                              ? 'bg-rose-700 text-white' 
                              : isOrange
                              ? 'bg-orange-600 text-white'
                              : isBlue 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {isEnded ? `${ev.labId.toUpperCase()} • FINALIZADO` : isExternal ? `${ev.labId.toUpperCase()} • EXTERNA` : ev.labId.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{ev.subtitle}</p>
                      </div>

                      <div className="flex items-center gap-3 text-right flex-shrink-0">
                        {ev.isRecurring && (
                          <span className="hidden sm:flex items-center gap-1 text-[10px] text-indigo-700 font-sans font-bold bg-indigo-100 px-2 py-0.5 rounded-full">
                            <Repeat className="w-3 h-3 text-indigo-600" />
                            Semana {ev.recurrenceWeekIndex || 1}/{ev.recurrenceTotalWeeks || '?'}
                          </span>
                        )}
                        <div className="text-xs font-bold text-slate-700 font-mono">
                          {ev.startTime} às {ev.endTime}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* 3. VISUALIZAÇÃO: TABELA / LISTA */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <input
                type="text"
                placeholder="Filtrar disciplina ou professor..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-400">Grade semestral oficial</span>
            </div>

            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Dia</th>
                  <th className="p-2.5">Horário</th>
                  <th className="p-2.5">Lab</th>
                  <th className="p-2.5">Disciplina</th>
                  <th className="p-2.5">Código / Turma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(() => {
                  const allEvents: { day: string; event: ScheduleEvent }[] = [];
                  days.forEach(d => {
                    const list = getEventsForDate(d.dateStr, selectedLab);
                    list.forEach(ev => allEvents.push({ day: d.dayName, event: ev }));
                  });

                  const filtered = allEvents.filter(({ event: ev }) => {
                    if (!searchFilter) return true;
                    const search = searchFilter.toLowerCase();
                    return (
                      ev.title.toLowerCase().includes(search) || 
                      (ev.responsible && ev.responsible.toLowerCase().includes(search)) ||
                      (ev.subtitle && ev.subtitle.toLowerCase().includes(search))
                    );
                  });

                  return filtered.map(({ day, event: ev }, idx) => {
                    const isEnded = Boolean(ev.isEnded || (ev.originType === 'reservation' && ev.date && isEventEnded(ev.date, ev.endTime)));
                    return (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedEventDetail(ev)} 
                        className={`hover:bg-slate-50 cursor-pointer transition ${isEnded ? 'bg-slate-50/70 text-slate-500' : ''}`}
                      >
                        <td className="p-2.5 font-bold text-slate-900">{day}</td>
                        <td className="p-2.5 font-mono text-slate-700 font-semibold">{ev.startTime} - {ev.endTime}</td>
                        <td className="p-2.5 font-bold uppercase">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${isEnded ? 'bg-slate-200 text-slate-700 font-medium' : ''}`}>
                            {ev.labId} {isEnded ? '(Finalizado)' : ''}
                          </span>
                        </td>
                        <td className={`p-2.5 font-bold ${isEnded ? 'text-slate-700' : 'text-slate-900'}`}>{ev.title}</td>
                        <td className="p-2.5 text-slate-600">{ev.responsible || ev.subtitle || '—'}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  </div>
  );
};
