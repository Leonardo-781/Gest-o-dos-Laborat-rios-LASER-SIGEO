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
  Repeat
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { ViewMode, ScheduleEvent, FixedClass, LabId } from '../types';
import { 
  getWeekDays, 
  formatDateBR, 
  getPurposeBadge, 
  timeToMinutes 
} from '../utils/dateHelpers';
import { MiniMonthCalendar } from './MiniMonthCalendar';

export const ScheduleView: React.FC = () => {
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
    labs
  } = useLab();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState('');

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

  // Faixas oficiais de aula extraídas das fotos da planilha
  const officialTimeSlots = [
    { label: '07:10', start: '07:10', end: '08:00' },
    { label: '08:00', start: '08:00', end: '08:50' },
    { label: '08:50', start: '08:50', end: '09:40' },
    { label: '09:50', start: '09:50', end: '10:40' },
    { label: '10:40', start: '10:40', end: '11:30' },
    { label: '11:30', start: '11:30', end: '12:20' },
    // Intervalo de Almoço
    { label: '13:10', start: '13:10', end: '14:00' },
    { label: '14:00', start: '14:00', end: '14:50' },
    { label: '14:50', start: '14:50', end: '15:40' },
    { label: '16:00', start: '16:00', end: '16:50' },
    { label: '16:50', start: '16:50', end: '17:40' },
    { label: '17:40', start: '17:40', end: '18:30' }
  ];

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

          {/* Botão Rápido de Cadastrar Aula se for Gestor */}
          {isManager && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => openClassModalForNew(selectedLab === 'laser' ? 'laser' : 'sigeo')}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition cursor-pointer flex items-center justify-center gap-1.5"
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
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
              Azul: LASER
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
              Verde: SIGEO
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-950 border border-rose-300 font-black flex items-center gap-1.5 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 flex-shrink-0" />
              Vermelho: Aula / Solicitação Externa
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

          <div className="flex items-center gap-2">
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

        {/* 1. VISUALIZAÇÃO: GRADE SEMANAL OFICIAL */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            
            {/* Cabeçalho dos 6 Dias */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs">
              <div className="py-2.5 px-1 font-bold text-slate-400 uppercase text-[10px] border-r border-slate-200 flex items-center justify-center">
                Horário
              </div>
              {days.map((d) => (
                <div
                  key={d.dateStr}
                  className={`py-2 px-1 border-r last:border-r-0 border-slate-200 ${
                    d.isToday ? 'bg-blue-50/70 border-b-2 border-b-blue-600' : ''
                  }`}
                >
                  <div className="font-semibold text-slate-500 text-[10px] uppercase">
                    {d.dayName.slice(0, 3)}
                  </div>
                  <div className={`text-xs font-bold ${d.isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                    {d.formattedShort}
                  </div>
                </div>
              ))}
            </div>

            {/* Linhas da Grade de Horários Oficiais - Página Única Sem Scroll Interno */}
            <div className="divide-y divide-slate-100">
              {officialTimeSlots.map((slot, sIdx) => {
                const slotStartMin = timeToMinutes(slot.start);
                const slotEndMin = timeToMinutes(slot.end);

                // Linha de intervalo após 11:30 (almoço)
                const isLunchBreak = slot.label === '11:30';

                return (
                  <React.Fragment key={slot.label}>
                    <div className="grid grid-cols-7 min-h-[50px] hover:bg-slate-50/40 transition-colors">
                      
                      {/* Coluna do Horário */}
                      <div className="p-1 border-r border-slate-200 bg-slate-50/50 text-[11px] font-mono text-slate-600 flex items-center justify-center font-bold">
                        {slot.start}-{slot.end}
                      </div>

                      {/* 6 Dias da Semana */}
                      {days.map((day) => {
                        const dayEvents = getEventsForDate(day.dateStr, selectedLab);

                        // Eventos que iniciam nesta faixa (para renderizar o card de cabeçalho)
                        const startingEvents = dayEvents.filter((ev) => {
                          const evStartMin = timeToMinutes(ev.startTime);
                          return evStartMin >= slotStartMin && evStartMin < slotEndMin;
                        });

                        // Eventos que iniciaram antes desta faixa e continuam ativos nela
                        const continuingEvents = dayEvents.filter((ev) => {
                          const evStartMin = timeToMinutes(ev.startTime);
                          const evEndMin = timeToMinutes(ev.endTime);
                          return evStartMin < slotStartMin && evEndMin > slotStartMin;
                        });

                        // Checa ocupação real de cada laboratório nesta faixa de horário
                        const isLaserOccupied = dayEvents.some((ev) => {
                          const evStartMin = timeToMinutes(ev.startTime);
                          const evEndMin = timeToMinutes(ev.endTime);
                          return ev.labId === 'laser' && Math.max(evStartMin, slotStartMin) < Math.min(evEndMin, slotEndMin);
                        });

                        const isSigeoOccupied = dayEvents.some((ev) => {
                          const evStartMin = timeToMinutes(ev.startTime);
                          const evEndMin = timeToMinutes(ev.endTime);
                          return ev.labId === 'sigeo' && Math.max(evStartMin, slotStartMin) < Math.min(evEndMin, slotEndMin);
                        });

                        // Determina qual laboratório pré-selecionar ao clicar em área livre
                        let labToPreselect: LabId = 'laser';
                        if (selectedLab !== 'all') {
                          labToPreselect = selectedLab;
                        } else if (!isLaserOccupied && isSigeoOccupied) {
                          labToPreselect = 'laser';
                        } else if (isLaserOccupied && !isSigeoOccupied) {
                          labToPreselect = 'sigeo';
                        } else {
                          labToPreselect = 'laser';
                        }

                        return (
                          <div
                            key={day.dateStr}
                            onClick={(e) => {
                              if (e.target === e.currentTarget) {
                                openBookingWithPreselection(
                                  labToPreselect,
                                  day.dateStr,
                                  slot.start,
                                  slot.end
                                );
                              }
                            }}
                            className={`p-1 border-r last:border-r-0 border-slate-100 relative cursor-pointer hover:bg-blue-50/20 transition-all ${
                              day.isToday ? 'bg-blue-50/10' : ''
                            }`}
                            title="Clique para solicitar horário ou apoio técnico"
                          >
                            {/* 1. Renderizar cartões de eventos que iniciam neste horário */}
                            {startingEvents.map((ev) => {
                              const isExternal = Boolean(ev.isExternal || ev.customColor === 'vermelho' || ev.highlightColor?.includes('rose'));
                              const isBlue = ev.customColor === 'azul' || (!isExternal && ev.labId === 'laser');
                              const isGreen = ev.customColor === 'verde' || (!isExternal && ev.labId === 'sigeo');

                              return (
                                <div
                                  key={ev.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEventDetail(ev);
                                  }}
                                  className={`p-1.5 rounded-lg border text-left mb-1 transition hover:shadow-xs cursor-pointer ${
                                    isExternal
                                      ? 'bg-rose-100 border-rose-300 text-rose-950 font-bold'
                                      : isBlue
                                      ? 'bg-blue-50 border-blue-200 text-blue-950 hover:border-blue-300'
                                      : 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:border-emerald-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1 text-[9px] font-bold">
                                    <span className={`px-1 rounded ${
                                      isExternal 
                                        ? 'bg-rose-700 text-white' 
                                        : isBlue 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-emerald-600 text-white'
                                    }`}>
                                      {isExternal ? `${ev.labId.toUpperCase()} • EXT` : ev.labId.toUpperCase()}
                                    </span>
                                    <div className="flex items-center gap-1 font-mono text-slate-600 font-semibold">
                                      {ev.isRecurring && (
                                        <span title={`Série Recorrente (${ev.recurrenceWeekIndex || 1}/${ev.recurrenceTotalWeeks || '?'})`}>
                                          <Repeat className="w-2.5 h-2.5 text-indigo-600 inline flex-shrink-0" />
                                        </span>
                                      )}
                                      <span>{ev.startTime}-{ev.endTime}</span>
                                    </div>
                                  </div>

                                  <div className="text-[11px] font-bold leading-tight mt-0.5 line-clamp-1">
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
                                </div>
                              );
                            })}

                            {/* 2. Renderizar cartões de continuação para aulas/reservas que abrangem este slot */}
                            {continuingEvents.map((ev) => {
                              const isExternal = Boolean(ev.isExternal || ev.customColor === 'vermelho' || ev.highlightColor?.includes('rose'));
                              const isBlue = ev.customColor === 'azul' || (!isExternal && ev.labId === 'laser');

                              return (
                                <div
                                  key={`cont-${ev.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEventDetail(ev);
                                  }}
                                  className={`p-1.5 rounded-lg border border-dashed text-left mb-1 transition hover:shadow-xs cursor-pointer ${
                                    isExternal
                                      ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                                      : isBlue
                                      ? 'bg-blue-50/70 border-blue-300 text-blue-950 hover:bg-blue-50'
                                      : 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-50'
                                  }`}
                                  title={`${ev.title} (${ev.startTime} às ${ev.endTime}) • Clique para ver detalhes`}
                                >
                                  <div className="flex items-center justify-between gap-1 text-[8.5px] font-bold">
                                    <span className={`px-1 rounded text-[8px] ${
                                      isExternal 
                                        ? 'bg-rose-700 text-white' 
                                        : isBlue 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-emerald-600 text-white'
                                    }`}>
                                      {isExternal ? `${ev.labId.toUpperCase()} • EXT` : ev.labId.toUpperCase()}
                                    </span>
                                    <span className="text-[8.5px] font-mono text-slate-500 font-semibold">
                                      (até {ev.endTime})
                                    </span>
                                  </div>

                                  <div className="text-[10px] font-bold leading-tight mt-0.5 line-clamp-1 flex items-center gap-1">
                                    <span className="truncate">{ev.title}</span>
                                    <span className="text-[8.5px] font-normal text-slate-400 flex-shrink-0">cont.</span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* 3. Quando vendo Todos os Labs, se um estiver ocupado e o outro livre, sugere o livre */}
                            {selectedLab === 'all' && (!isLaserOccupied || !isSigeoOccupied) && (isLaserOccupied || isSigeoOccupied) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openBookingWithPreselection(
                                    labToPreselect,
                                    day.dateStr,
                                    slot.start,
                                    slot.end
                                  );
                                }}
                                className="w-full text-[9px] font-semibold py-0.5 px-1.5 rounded border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/70 text-slate-500 hover:text-blue-700 transition flex items-center justify-center gap-1 cursor-pointer mt-0.5"
                                title={`Solicitar reserva no ${labs[labToPreselect].name} (Horário livre)`}
                              >
                                <Plus className="w-2.5 h-2.5 text-slate-400" />
                                <span>+ {labs[labToPreselect].name} livre</span>
                              </button>
                            )}
                          </div>
                        );
                      })}

                    </div>

                    {/* Barra de Intervalo de Almoço */}
                    {isLunchBreak && (
                      <div className="grid grid-cols-7 bg-slate-200/70 border-y border-slate-300 text-center py-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <div className="col-span-7 flex items-center justify-center gap-2">
                          <span>Intervalo de Almoço (12:20 às 13:10)</span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
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
                  const isExternal = Boolean(ev.isExternal || ev.customColor === 'vermelho' || ev.highlightColor?.includes('rose'));
                  const isBlue = ev.customColor === 'azul' || (!isExternal && ev.labId === 'laser');
                  const isGreen = ev.customColor === 'verde' || (!isExternal && ev.labId === 'sigeo');

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventDetail(ev)}
                      className={`p-3.5 rounded-xl border transition hover:shadow-xs cursor-pointer flex items-center justify-between gap-4 ${
                        isExternal
                          ? 'bg-rose-50 border-rose-200'
                          : isBlue
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isExternal 
                              ? 'bg-rose-700 text-white' 
                              : isBlue 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {isExternal ? `${ev.labId.toUpperCase()} • EXTERNA` : ev.labId.toUpperCase()}
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

                  return filtered.map(({ day, event: ev }, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedEventDetail(ev)} 
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="p-2.5 font-bold text-slate-900">{day}</td>
                      <td className="p-2.5 font-mono text-slate-700 font-semibold">{ev.startTime} - {ev.endTime}</td>
                      <td className="p-2.5 font-bold uppercase">{ev.labId}</td>
                      <td className="p-2.5 font-bold text-slate-900">{ev.title}</td>
                      <td className="p-2.5 text-slate-600">{ev.responsible || ev.subtitle || '—'}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
