import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useLab } from '../context/LabContext';
import { getMonthMatrix } from '../utils/dateHelpers';

export const MiniMonthCalendar: React.FC = () => {
  const { referenceDate, setReferenceDate, getEventsForDate } = useLab();
  
  // Mês visível no seletor (pode ser navegado independentemente ou sincronizado)
  const [viewYear, setViewYear] = useState<number>(() => referenceDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => referenceDate.getMonth());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysHeader = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (cellDate: Date) => {
    setReferenceDate(cellDate);
    setViewYear(cellDate.getFullYear());
    setViewMonth(cellDate.getMonth());
  };

  const handleGoToday = () => {
    const today = new Date();
    setReferenceDate(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const matrix = getMonthMatrix(viewYear, viewMonth, referenceDate);

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
      
      {/* Header do Mês com Navegação */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            {monthNames[viewMonth]} <span className="text-slate-500 font-normal">{viewYear}</span>
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={handleGoToday}
            className="px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Ir para hoje"
          >
            Hoje
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Mês anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Próximo mês"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 text-center mb-1">
        {daysHeader.map((d, i) => (
          <div key={i} className="text-[10px] font-semibold text-slate-400 py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de Dias */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {matrix.flat().map((cell, idx) => {
          const hasEvents = getEventsForDate(cell.dateStr, 'all').length > 0;

          return (
            <button
              key={`${cell.dateStr}-${idx}`}
              onClick={() => handleSelectDay(cell.date)}
              className={`relative py-1 text-[11px] rounded-lg transition-all flex flex-col items-center justify-center cursor-pointer group ${
                cell.isSelected
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : cell.isInCurrentWeek
                  ? 'bg-blue-50/70 text-blue-900 font-semibold'
                  : cell.isCurrentMonth
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center rounded-full ${
                cell.isToday && !cell.isSelected ? 'border border-blue-600 font-bold text-blue-600' : ''
              }`}>
                {cell.dayNum}
              </span>

              {/* Indicador de evento no dia */}
              {hasEvents && !cell.isSelected && (
                <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dica amigável */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        Clique em um dia para navegar na grade semanal
      </div>

    </div>
  );
};
