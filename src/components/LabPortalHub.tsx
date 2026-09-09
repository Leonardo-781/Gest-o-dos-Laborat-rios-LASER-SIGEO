import React from 'react';
import { 
  Monitor, 
  MapPin, 
  Users, 
  Layers, 
  Compass, 
  Calendar, 
  PlusCircle, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  Shield,
  Cpu
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { LabGroupId } from '../types';
import { formatDateToYYYYMMDD } from '../utils/dateHelpers';

interface LabPortalHubProps {
  onSelectGroup: (group: LabGroupId) => void;
}

export const LabPortalHub: React.FC<LabPortalHubProps> = ({ onSelectGroup }) => {
  const { 
    setActiveLabGroup, 
    setSelectedLab, 
    setIsBookingOpen, 
    setIsRulesOpen,
    getEventsForDate
  } = useLab();

  const todayStr = formatDateToYYYYMMDD(new Date());
  
  // Contagem de atividades hoje para cada grupo
  const todayLaserSigeoEvents = getEventsForDate(todayStr, 'all').filter(
    e => e.labId === 'laser' || e.labId === 'sigeo'
  );
  const todayLtgeoEvents = getEventsForDate(todayStr, 'ltgeo').filter(
    e => e.labId === 'ltgeo'
  );

  const handleEnterGroup = (group: LabGroupId) => {
    setActiveLabGroup(group);
    if (group === 'ltgeo') {
      setSelectedLab('ltgeo');
    } else if (group === 'laser_sigeo') {
      setSelectedLab('all');
    }
    onSelectGroup(group);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero / Boas-vindas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-8 md:p-10 shadow-xl border border-slate-700/50">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hub Central de Laboratórios • UFU Monte Carmelo</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Gestão Integrada de Laboratórios e Equipamentos
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Acesse as grades horárias oficiais, reserve estações de trabalho e equipamentos geodésicos 
            para aulas, projetos de pesquisa ou extensão nos laboratórios de Engenharia de Agrimensura e Cartográfica.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-900/40 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Solicitar Reserva de Horário / Máquinas</span>
            </button>

            <button
              onClick={() => setIsRulesOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 backdrop-blur-md transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Normas & Procedimentos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seção Principal: Seleção de Laboratórios */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Laboratórios Disponíveis
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Escolha uma unidade para acessar a grade horária dedicada e a disponibilidade de estações.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Complexo LASER & SIGEO */}
          <div className="group relative bg-white rounded-3xl border-2 border-slate-200/90 hover:border-blue-500 transition-all duration-300 shadow-xs hover:shadow-xl overflow-hidden flex flex-col justify-between">
            {/* Top Accent Gradient */}
            <div className="h-2.5 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 w-full" />

            <div className="p-7 flex-1 flex flex-col justify-between">
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      Salas 1B309 & 1B307
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Bloco 1B
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    {todayLaserSigeoEvents.length} atividades hoje
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition tracking-tight mb-2">
                  Complexo Integrado LASER & SIGEO
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  Laboratórios integrados de Sensoriamento Remoto e Sistemas de Informação Geográfica com 
                  estações de alta performance para processamento cartográfico, espacial e aerofotogramétrico.
                </p>

                {/* Destaques Técnicos */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
                      <Monitor className="w-3.5 h-3.5 text-blue-600" />
                      40 Estações c/ GPU
                    </div>
                    <div className="text-[11px] text-slate-500">20 estações no LASER + 20 no SIGEO</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
                      <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                      Softwares Especializados
                    </div>
                    <div className="text-[11px] text-slate-500">ArcGIS Pro, QGIS, Metashape, AutoCAD</div>
                  </div>
                </div>

                {/* Tags de Softwares */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {['ArcGIS Pro', 'QGIS 3.x', 'Agisoft Metashape', 'AutoCAD Civil 3D', 'SNAP ESA', 'Envi'].map((sw) => (
                    <span key={sw} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {sw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botão de Acesso */}
              <button
                onClick={() => handleEnterGroup('laser_sigeo')}
                className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md group-hover:shadow-blue-500/20"
              >
                <span>Acessar Grade Compartilhada LASER / SIGEO</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 2: LTGEO - Laboratório de Topografia e Geodésia */}
          <div className="group relative bg-white rounded-3xl border-2 border-orange-200 hover:border-orange-500 transition-all duration-300 shadow-xs hover:shadow-xl overflow-hidden flex flex-col justify-between">
            {/* Top Accent Gradient Laranja */}
            <div className="h-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 w-full" />

            <div className="p-7 flex-1 flex flex-col justify-between">
              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 text-xs font-bold flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-orange-600" />
                      Sala 1B210
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                      Bloco 1B • Térreo
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-orange-800 bg-orange-100/70 px-2 py-1 rounded-md">
                    {todayLtgeoEvents.length} atividades hoje
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition tracking-tight mb-2">
                  LTGEO • Topografia e Geodésia
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  Laboratório com acervo e instrumentos geodésicos de alta precisão para aulas práticas, 
                  levantamentos topográficos, nivelamentos geométricos e rastreio por satélite GNSS RTK.
                </p>

                {/* Destaques Técnicos */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs">
                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/60">
                    <div className="font-bold text-orange-950 flex items-center gap-1.5 mb-0.5">
                      <Compass className="w-3.5 h-3.5 text-orange-600" />
                      Instrumentos de Campo
                    </div>
                    <div className="text-[11px] text-slate-600">Estações Totais, GNSS RTK, Níveis Ópticos</div>
                  </div>

                  <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/60">
                    <div className="font-bold text-orange-950 flex items-center gap-1.5 mb-0.5">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      Capacidade: 30 Vagas
                    </div>
                    <div className="text-[11px] text-slate-600">Bancadas de planejamento e calibração</div>
                  </div>
                </div>

                {/* Tags de Instrumentos */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {[
                    'Estação Total Topcon GM-52', 
                    'Estação Total Leica TS06', 
                    'Par GNSS RTK CHCNAV i73', 
                    'Nível Óptico Leica NA324', 
                    'Teodolito Topcon DT-209',
                    'Prismas e Jalões'
                  ].map((eq) => (
                    <span key={eq} className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-900 border border-orange-200/50 text-[10px] font-medium">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botão de Acesso */}
              <button
                onClick={() => handleEnterGroup('ltgeo')}
                className="w-full py-3.5 px-5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md group-hover:shadow-orange-500/20"
              >
                <span>Acessar Grade Dedicada do LTGEO</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco Informativo de Apoio Técnico e Gestão */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm sm:text-base">Sala de Apoio Técnico e Gestão</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">Sala 1B308</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Responsável Técnico: <strong className="text-slate-700">Leonardo Cardoso</strong> • Retirada de chaves, 
              empréstimo de equipamentos geodésicos e suporte de softwares.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => handleEnterGroup('laser_sigeo')}
            className="flex-1 md:flex-none text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition cursor-pointer text-center"
          >
            LASER & SIGEO (1B309 / 1B307)
          </button>
          <button
            onClick={() => handleEnterGroup('ltgeo')}
            className="flex-1 md:flex-none text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3.5 py-2 rounded-xl transition cursor-pointer text-center"
          >
            LTGEO (1B210)
          </button>
        </div>
      </div>
    </div>
  );
};
