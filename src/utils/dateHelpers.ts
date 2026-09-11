import { PurposeType, ReservationStatus, Equipment } from '../types';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function checkTimeOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

export function formatDateToYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayOfWeekFromDateStr(dateStr: string): number {
  if (!dateStr) return 1;
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return 1;
  }
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  return d.getDay();
}

export function addWeeksToDateStr(dateStr: string, weeks: number): string {
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  const target = new Date(year, month - 1, day);
  target.setDate(target.getDate() + weeks * 7);
  return formatDateToYYYYMMDD(target);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateTimeBR(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} às ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return isoString;
  }
}

/**
 * Verifica se um evento (ex: solicitação/reserva pontual) já terminou em relação ao momento atual.
 */
export function isEventEnded(dateStr?: string, endTime?: string): boolean {
  if (!dateStr || !endTime) return false;
  try {
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 3) return false;
    const [year, month, day] = parts;
    const [hours, minutes] = endTime.split(':').map(Number);
    const eventEnd = new Date(year, month - 1, day, hours || 0, minutes || 0, 0);
    return new Date() > eventEnd;
  } catch {
    return false;
  }
}

/**
 * Retorna a próxima data a partir de hoje (ou de baseDate) que coincida com o dia da semana especificado.
 * dayOfWeek: 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado.
 */
export function getNextDayOfWeekDate(targetDayOfWeek: number, baseDate: Date = new Date()): string {
  const currentDay = baseDate.getDay(); // 0 = Domingo, 1 = Segunda...
  // Converte Domingo (0) para 7 para simplificar aritmética de semanas letivas
  const currentNormalized = currentDay === 0 ? 7 : currentDay;
  
  let diff = targetDayOfWeek - currentNormalized;
  if (diff <= 0) {
    diff += 7; // Sempre avança para a próxima semana para reativação futura
  }
  const next = new Date(baseDate);
  next.setDate(baseDate.getDate() + diff);
  return formatDateToYYYYMMDD(next);
}

export function getWeekDays(referenceDate: Date = new Date()) {
  const current = new Date(referenceDate);
  const day = current.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Calculate Monday of the current week (if Sunday, go back 6 days)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const days = [];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayStr = formatDateToYYYYMMDD(new Date());

  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDateToYYYYMMDD(d);
    
    days.push({
      dayOfWeek: i + 1, // 1 to 6
      dayName: dayNames[i],
      dateStr,
      dateObj: d,
      formattedShort: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      isToday: todayStr === dateStr
    });
  }

  return {
    monday,
    saturday: days[5].dateObj,
    days
  };
}

export interface MonthDayCell {
  date: Date;
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInCurrentWeek: boolean;
}

export function getMonthMatrix(year: number, month: number, selectedDate: Date): MonthDayCell[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo
  
  // Start from Sunday of the first week of the month view
  const startDate = new Date(year, month, 1 - startDayOfWeek);
  
  const todayStr = formatDateToYYYYMMDD(new Date());
  const selectedStr = formatDateToYYYYMMDD(selectedDate);
  
  // Get active week range
  const currentWeekInfo = getWeekDays(selectedDate);
  const currentWeekStartStr = currentWeekInfo.days[0].dateStr;
  const currentWeekEndStr = currentWeekInfo.days[5].dateStr;

  const matrix: MonthDayCell[][] = [];
  let currentDay = new Date(startDate);

  for (let row = 0; row < 6; row++) {
    const week: MonthDayCell[] = [];
    for (let col = 0; col < 7; col++) {
      const dStr = formatDateToYYYYMMDD(currentDay);
      const isCurrentMonth = currentDay.getMonth() === month;
      const isToday = dStr === todayStr;
      const isSelected = dStr === selectedStr;
      const isInCurrentWeek = dStr >= currentWeekStartStr && dStr <= currentWeekEndStr;

      week.push({
        date: new Date(currentDay),
        dateStr: dStr,
        dayNum: currentDay.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        isInCurrentWeek
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }
    matrix.push(week);
  }

  return matrix;
}

export function generateProtocol(): string {
  const now = new Date();
  const year = now.getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${year}-${randomNum}`;
}

export function getPurposeBadge(type: PurposeType): { label: string; bg: string; text: string; border: string } {
  switch (type) {
    case 'aula_regular':
      return { label: 'Aula Regular', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'reposicao':
      return { label: 'Aula Extra', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'tcc':
      return { label: 'TCC', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'iniciacao_cientifica':
      return { label: 'Pesquisa / IC', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' };
    case 'projeto_extensao':
      return { label: 'Extensão', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'apoio_tecnico':
      return { label: 'Apoio Técnico', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'reuniao':
      return { label: 'Reunião', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    case 'manutencao':
      return { label: 'Manutenção', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { label: 'Outro', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getStatusBadge(status: ReservationStatus): { label: string; bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'aprovada':
      return { label: 'Aprovada', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'pendente':
      return { label: 'Em Análise', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'recusada':
      return { label: 'Recusada', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
    case 'cancelada':
      return { label: 'Cancelada', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' };
  }
}

export function getEquipmentStatusBadge(status: Equipment['status']): { label: string; bg: string; text: string } {
  switch (status) {
    case 'disponivel':
      return { label: 'Disponível', bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', text: 'text-emerald-700' };
    case 'em_uso':
      return { label: 'Em Uso', bg: 'bg-blue-50 text-blue-700 border border-blue-200', text: 'text-blue-700' };
    case 'manutencao':
      return { label: 'Manutenção', bg: 'bg-amber-50 text-amber-700 border border-amber-200', text: 'text-amber-700' };
    case 'em_campo':
      return { label: 'Em Campo', bg: 'bg-purple-50 text-purple-700 border border-purple-200', text: 'text-purple-700' };
  }
}

export function getEquipmentCategoryLabel(cat: Equipment['category']): string {
  switch (cat) {
    case 'topografia': return 'Topografia & Geodésia';
    case 'laser_scanner': return 'Laser Scanner 3D';
    case 'gnss': return 'Receptores GNSS / RTK';
    case 'workstation': return 'Estações de Trabalho SIG';
    case 'drone': return 'VANT / Drones & LiDAR';
    case 'periferico': return 'Periféricos & Impressão';
  }
}
