import React from 'react';
import { 
  Compass, 
  MapPin, 
  Users, 
  Laptop, 
  Mail, 
  PlusCircle, 
  Radio, 
  Globe, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { LabId } from '../types';

export const LabHeader: React.FC = () => {
  const { 
    labs, 
    selectedLab, 
    setSelectedLab, 
    openBookingWithPreselection, 
    getEventsForDate 
  } = useLab();

  // Obter status em tempo real para hoje
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getLabCurrentStatus = (labId: LabId) => {
    const todayEvents = getEventsForDate(todayStr, labId);
    
    // Procura evento acontecendo agora
    const currentEvent = todayEvents.find(e => {
      const [sh, sm] = e.startTime.split(':').map(Number);
      const [eh, em] = e.endTime.split(':').map(Number);
      const sMin = sh * 60 + sm;
      const eMin = eh * 60 + em;
      return currentMinutes >= sMin && currentMinutes <= eMin;
    });

    if (currentEvent) {
      return {
        occupied: true,
        text: `Ocupado até ${currentEvent.endTime}`,
        details: currentEvent.title,
        bg: 'bg-rose-50 border-rose-200 text-rose-700',
        dot: 'bg-rose-500 animate-ping'
      };
    }

    // Próximo evento hoje
    const nextEvent = todayEvents.find(e => {
      const [sh, sm] = e.startTime.split(':').map(Number);
      return sh * 60 + sm > currentMinutes;
    });

    if (nextEvent) {
      return {
        occupied: false,
        text: `Livre até ${nextEvent.startTime}`,
        details: `Próximo: ${nextEvent.title}`,
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        dot: 'bg-emerald-500'
      };
    }

    return {
      occupied: false,
      text: 'Livre pelo restante do dia',
      details: 'Sem mais atividades programadas',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500'
    };
  };

  const laserStatus = getLabCurrentStatus('laser');
  const sigeoStatus = getLabCurrentStatus('sigeo');

  return (
    <div className="space-y-6">
      {/* Grid de Apresentação dos 2 Laboratórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD DO LABORATÓRIO LASER */}
        <div 
          className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 bg-white p-6 shadow-sm ${
            selectedLab === 'laser' 
              ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-lg' 
              : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/30">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{labs.laser.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                    Sensores & Topografia
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{labs.laser.fullName}</p>
              </div>
            </div>

            {/* Status em tempo real */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${laserStatus.bg}`}>
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${laserStatus.dot}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${laserStatus.occupied ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              </span>
              <span>{laserStatus.text}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed line-clamp-2">
            {labs.laser.description}
          </p>

          {/* Dados rápidos */}
          <div className="grid grid-cols-3 gap-2 mt-5 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{labs.laser.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Capacidade: <strong>{labs.laser.capacity}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Radio className="w-4 h-4 text-blue-600" />
              <span>LiDAR & GNSS</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setSelectedLab(selectedLab === 'laser' ? 'all' : 'laser')}
              className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                selectedLab === 'laser'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {selectedLab === 'laser' ? 'Exibindo Apenas LASER ✓' : 'Filtrar Grade: LASER'}
            </button>

            <button
              onClick={() => openBookingWithPreselection('laser')}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Solicitar Horário no LASER</span>
            </button>
          </div>
        </div>

        {/* CARD DO LABORATÓRIO SIGEO */}
        <div 
          className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 bg-white p-6 shadow-sm ${
            selectedLab === 'sigeo' 
              ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg' 
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/30">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{labs.sigeo.name}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    Geoprocessamento & SIG
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{labs.sigeo.fullName}</p>
              </div>
            </div>

            {/* Status em tempo real */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${sigeoStatus.bg}`}>
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${sigeoStatus.dot}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${sigeoStatus.occupied ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              </span>
              <span>{sigeoStatus.text}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed line-clamp-2">
            {labs.sigeo.description}
          </p>

          {/* Dados rápidos */}
          <div className="grid grid-cols-3 gap-2 mt-5 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{labs.sigeo.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Capacidade: <strong>{labs.sigeo.capacity}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Laptop className="w-4 h-4 text-emerald-600" />
              <span><strong>{labs.sigeo.workstationsCount}</strong> Workstations</span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setSelectedLab(selectedLab === 'sigeo' ? 'all' : 'sigeo')}
              className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                selectedLab === 'sigeo'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {selectedLab === 'sigeo' ? 'Exibindo Apenas SIGEO ✓' : 'Filtrar Grade: SIGEO'}
            </button>

            <button
              onClick={() => openBookingWithPreselection('sigeo')}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Solicitar Horário no SIGEO</span>
            </button>
          </div>
        </div>

      </div>

      {/* Seletor Rápido de Abas de Laboratório */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">Filtro Rápido da Grade:</span>
          <button
            onClick={() => setSelectedLab('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedLab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Visão Geral (Ambos os Labs)
          </button>
          <button
            onClick={() => setSelectedLab('laser')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLab === 'laser'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Apenas LASER
          </button>
          <button
            onClick={() => setSelectedLab('sigeo')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedLab === 'sigeo'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Apenas SIGEO
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-500"></span> LASER
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500"></span> SIGEO
          </span>
        </div>
      </div>
    </div>
  );
};
