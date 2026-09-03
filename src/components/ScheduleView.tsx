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
  CalendarCheck,
  CheckCircle2,
  SlidersHorizontal
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
    // Intervalo de Almoço Acadêmico (12:20 - 13:10)
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

        {/* SELETOR DE LABORATÓRIO LATERAL */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
            Filtro de Laboratório:
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
              <span className="text-[10px] opacity-75 font-mono">LASER & SIGEO</span>
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
              <span className="text-[10px] opacity-90 font-bold">24 Workstations</span>
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
              <span className="text-[10px] opacity-90 font-bold">Sensores / Scanner</span>
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
            Lotação & Infraestrutura:
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
              <span>LASER (Sala 1B209)</span>
              <span className="text-[10px] text-blue-700 font-mono font-bold">25 Vagas</span>
            </div>
            <p className="text-[11px] text-blue-800/80 leading-tight">
              Lab. de Sensoriamento Remoto • Sensores & Scanner
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Corpo Técnico (Sala 1B308)</span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Plantão</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Sala dos Técnicos • Atendimento e retirada de instrumentos
            </p>
          </div>
        </div>

        {/* LEGENDA DE CORES */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs text-[11px] text-slate-500 space-y-1.5">
          <span className="font-bold text-slate-700 block">Legenda de Identificação:</span>
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">SIGEO</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-bold">LASER</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-950 border border-rose-300 font-bold">Cursos Externos (Agro/Florestal)</span>
          </div>
        </div>

      </div>

      {/* COLUNA PRINCIPAL: GRADE OFICIAL DE HORÁRIOS */}
      <div className="lg:col-span-8 xl:col-span-9 space-y-3">
        
        {/* Barra Superior de Controles e Filtros Rápidos */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Navegação de Semanas */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Semana anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition cursor-pointer"
              >
                Hoje
              </button>
              <button
                onClick={handleNextWeek}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Próxima semana"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 px-1">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{days[0].formattedShort} a {days[5].formattedShort}</span>
              <span className="text-slate-400 font-normal">de</span>
              <span className="capitalize">{days[0].dateObj.toLocaleString('pt-BR', { month: 'long' })}</span>
            </div>
          </div>

          {/* Filtro Rápido de Laboratório no Topo */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedLab('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedLab === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Labs
            </button>
            <button
              onClick={() => setSelectedLab('sigeo')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                selectedLab === 'sigeo' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>SIGEO</span>
            </button>
            <button
              onClick={() => setSelectedLab('laser')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                selectedLab === 'laser' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-blue-800 hover:text-blue-950'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>LASER</span>
            </button>
          </div>

          {/* Modos de Exibição e Ferramentas */}
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode('week')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
                }`}
              >
                Lista
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="p-1.5 text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer"
              title="Baixar planilha CSV da grade"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer no-print"
              title="Imprimir grade"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* 1. VISUALIZAÇÃO: GRADE SEMANAL OFICIAL (FORMATO RESPONSIVO ROBUSTO) */}
        {viewMode === 'week' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Scroll Horizontal Seguro: Garante no mínimo 820px para colunas confortáveis sem amassar texto */}
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                
                {/* Cabeçalho dos 6 Dias (Segunda a Sábado) */}
                <div className="grid grid-cols-[76px_repeat(6,1fr)] border-b border-slate-200 bg-slate-50/90 text-center text-xs sticky top-0 z-10">
                  <div className="py-2.5 px-1 font-bold text-slate-400 uppercase text-[10px] border-r border-slate-200 flex items-center justify-center">
                    Horário
                  </div>
                  {days.map((d) => (
                    <div
                      key={d.dateStr}
                      className={`py-2 px-1 border-r last:border-r-0 border-slate-200 ${
                        d.isToday ? 'bg-blue-50/80 border-b-2 border-b-blue-600' : ''
                      }`}
                    >
                      <div className="font-semibold text-slate-500 text-[10px] uppercase tracking-wide">
                        {d.dayName}
                      </div>
                      <div className={`text-xs font-bold ${d.isToday ? 'text-blue-700 font-black' : 'text-slate-800'}`}>
                        {d.formattedShort}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Linhas da Grade de Horários Oficiais */}
                <div className="divide-y divide-slate-100 max-h-[660px] overflow-y-auto">
                  {officialTimeSlots.map((slot) => {
                    const slotStartMin = timeToMinutes(slot.start);
                    const slotEndMin = timeToMinutes(slot.end);

                    // Linha divisória de intervalo após 11:30 (almoço acadêmico)
                    const isLunchBreak = slot.label === '11:30';

                    return (
                      <React.Fragment key={slot.label}>
                        <div className="grid grid-cols-[76px_repeat(6,1fr)] min-h-[58px] hover:bg-slate-50/30 transition-colors">
                          
                          {/* Coluna do Horário com Tipografia Clara */}
                          <div className="p-1 border-r border-slate-200 bg-slate-50/60 text-slate-700 flex flex-col items-center justify-center font-mono leading-tight select-none">
                            <span className="text-[11px] font-black text-slate-900">{slot.start}</span>
                            <span className="text-[9px] text-slate-400 font-medium">às {slot.end}</span>
                          </div>

                          {/* 6 Dias da Semana */}
                          {days.map((day) => {
                            const dayEvents = getEventsForDate(day.dateStr, selectedLab);

                            // Eventos que iniciam exatamente nesta faixa (para renderizar o card mestre)
                            const startingEvents = dayEvents.filter((ev) => {
                              const evStartMin = timeToMinutes(ev.startTime);
                              return evStartMin >= slotStartMin && evStartMin < slotEndMin;
                            });

                            // Eventos contínuos (que iniciaram antes e continuam cobrindo esta faixa)
                            const continuingEvents = dayEvents.filter((ev) => {
                              const evStartMin = timeToMinutes(ev.startTime);
                              const evEndMin = timeToMinutes(ev.endTime);
                              return evStartMin < slotStartMin && evEndMin > slotStartMin;
                            });

                            const isCellOccupied = startingEvents.length > 0 || continuingEvents.length > 0;

                            return (
                              <div
                                key={day.dateStr}
                                onClick={(e) => {
                                  if (e.target === e.currentTarget) {
                                    openBookingWithPreselection(
                                      selectedLab === 'all' ? 'sigeo' : selectedLab,
                                      day.dateStr,
                                      slot.start
                                    );
                                  }
                                }}
                                className={`p-1 border-r last:border-r-0 border-slate-100 relative cursor-pointer group transition-all ${
                                  day.isToday ? 'bg-blue-50/10' : ''
                                } ${
                                  !isCellOccupied ? 'hover:bg-blue-50/30' : ''
                                }`}
                                title={isCellOccupied ? undefined : 'Horário livre • Clique para solicitar reserva'}
                              >
                                
                                {/* 1. Cartões de Eventos que Iniciam Neste Horário */}
                                {startingEvents.map((ev) => {
                                  const isLaser = ev.labId === 'laser';
                                  const isHighlighted = Boolean(ev.highlightColor);

                                  return (
                                    <div
                                      key={ev.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEventDetail(ev);
                                      }}
                                      className={`p-1.5 rounded-lg border text-left mb-1 transition hover:shadow-md cursor-pointer ${
                                        isHighlighted
                                          ? 'bg-rose-100 border-rose-300 text-rose-950 font-bold border-l-4 border-l-rose-600'
                                          : isLaser
                                          ? 'bg-blue-50 border-blue-200 text-blue-950 border-l-4 border-l-blue-600 hover:border-blue-300'
                                          : 'bg-emerald-50 border-emerald-200 text-emerald-950 border-l-4 border-l-emerald-600 hover:border-emerald-300'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-1 text-[9px] font-bold">
                                        <span className={`px-1 py-0.2 rounded text-[8px] uppercase tracking-wider ${
                                          isHighlighted 
                                            ? 'bg-rose-700 text-white' 
                                            : isLaser 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-emerald-600 text-white'
                                        }`}>
                                          {ev.labId.toUpperCase()}
                                        </span>
                                        <span className="font-mono text-slate-600 font-semibold text-[9px]">
                                          {ev.startTime}-{ev.endTime}
                                        </span>
                                      </div>

                                      <div className="text-[11px] font-bold leading-tight mt-1 line-clamp-2">
                                        {ev.title}
                                      </div>

                                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                        {ev.responsible}
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* 2. Indicador Visual Contínuo para Aulas que se Estendem por Múltiplos Tempos */}
                                {continuingEvents.map((ev) => {
                                  const isLaser = ev.labId === 'laser';
                                  const isHighlighted = Boolean(ev.highlightColor);

                                  return (
                                    <div
                                      key={`cont-${ev.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedEventDetail(ev);
                                      }}
                                      className={`p-1 rounded-md text-left mb-1 transition cursor-pointer flex items-center justify-between gap-1 opacity-85 hover:opacity-100 ${
                                        isHighlighted
                                          ? 'bg-rose-50/80 border border-rose-200 text-rose-900 border-l-2 border-l-rose-500'
                                          : isLaser
                                          ? 'bg-blue-50/70 border border-blue-200 text-blue-900 border-l-2 border-l-blue-500'
                                          : 'bg-emerald-50/70 border border-emerald-200 text-emerald-900 border-l-2 border-l-emerald-500'
                                      }`}
                                      title={`Em andamento: ${ev.title} (${ev.startTime} às ${ev.endTime})`}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="text-[10px] font-bold truncate flex items-center gap-1">
                                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                                          <span className="truncate">{ev.title}</span>
                                        </div>
                                      </div>
                                      <span className="text-[8px] font-mono opacity-75 shrink-0">
                                        até {ev.endTime}
                                      </span>
                                    </div>
                                  );
                                })}

                                {/* 3. Dica Visual no Hover para Horário Livre */}
                                {!isCellOccupied && (
                                  <div className="w-full h-full min-h-[46px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                      + Agendar
                                    </span>
                                  </div>
                                )}

                              </div>
                            );
                          })}

                        </div>

                        {/* Faixa Oficial de Intervalo de Almoço */}
                        {isLunchBreak && (
                          <div className="grid grid-cols-[76px_repeat(6,1fr)] bg-slate-100/90 border-y border-slate-200/90 py-1.5">
                            <div className="col-span-7 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Intervalo de Almoço Institucional • 12:20 às 13:10</span>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 2. VISUALIZAÇÃO: DIA ESPECÍFICO */}
        {viewMode === 'day' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {days.map((d, idx) => (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    selectedDayIndex === idx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{d.dayName}</span>
                  <span className="text-[11px] font-normal opacity-80">({d.formattedShort})</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {(() => {
                const dayEvents = getEventsForDate(days[selectedDayIndex].dateStr, selectedLab);

                if (dayEvents.length === 0) {
                  return (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">Nenhuma aula regular registrada para este dia.</p>
                      <button
                        onClick={() => openBookingWithPreselection(selectedLab === 'all' ? 'sigeo' : selectedLab, days[selectedDayIndex].dateStr, '08:50')}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        + Solicitar reserva ou apoio técnico para este dia
                      </button>
                    </div>
                  );
                }

                return dayEvents.map(ev => {
                  const isLaser = ev.labId === 'laser';
                  const isHighlighted = Boolean(ev.highlightColor);

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventDetail(ev)}
                      className={`p-3.5 rounded-xl border transition hover:shadow-xs cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isHighlighted
                          ? 'bg-rose-50 border-rose-200 border-l-4 border-l-rose-600'
                          : isLaser
                          ? 'bg-blue-50/50 border-blue-200 border-l-4 border-l-blue-600'
                          : 'bg-emerald-50/50 border-emerald-200 border-l-4 border-l-emerald-600'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isHighlighted ? 'bg-rose-700 text-white' : isLaser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {ev.labId.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">{ev.subtitle}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 font-mono shadow-2xs">
                          {ev.startTime} às {ev.endTime}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* 3. VISUALIZAÇÃO: TABELA / LISTA OFICIAL */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Filtrar disciplina ou professor..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-400 font-medium">Grade Semestral Oficial de Agrimensura</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Dia</th>
                    <th className="p-3">Horário</th>
                    <th className="p-3">Laboratório</th>
                    <th className="p-3">Disciplina / Atividade</th>
                    <th className="p-3">Docente / Responsável</th>
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
                      return ev.title.toLowerCase().includes(search) || ev.responsible.toLowerCase().includes(search);
                    });

                    return filtered.map(({ day, event: ev }, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => setSelectedEventDetail(ev)} 
                        className="hover:bg-slate-50 cursor-pointer transition"
                      >
                        <td className="p-3 font-bold text-slate-900">{day}</td>
                        <td className="p-3 font-mono text-slate-700 font-semibold">{ev.startTime} - {ev.endTime}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ev.labId === 'laser' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ev.labId.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{ev.title}</td>
                        <td className="p-3 text-slate-600">{ev.responsible}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
