import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Compass, 
  Globe 
} from 'lucide-react';
import { useLab } from '../context/LabContext';

export const StatsView: React.FC = () => {
  const { fixedClasses, reservations, equipments, labs } = useLab();

  const totalClasses = fixedClasses.length;
  const totalReservations = reservations.length;
  const approvedReservations = reservations.filter(r => r.status === 'aprovada').length;
  const pendingReservations = reservations.filter(r => r.status === 'pendente').length;
  const approvalRate = totalReservations > 0 ? Math.round((approvedReservations / totalReservations) * 100) : 100;

  const laserClasses = fixedClasses.filter(c => c.labId === 'laser').length;
  const sigeoClasses = fixedClasses.filter(c => c.labId === 'sigeo').length;

  const laserReservations = reservations.filter(r => r.labId === 'laser').length;
  const sigeoReservations = reservations.filter(r => r.labId === 'sigeo').length;

  // Finalidades de reservas
  const purposeCounts: Record<string, number> = {};
  reservations.forEach(r => {
    purposeCounts[r.purposeType] = (purposeCounts[r.purposeType] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Indicadores de Utilização e Relatórios</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Estatísticas de ocupação, taxas de atendimento de reservas e perfil de uso dos laboratórios
        </p>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Disciplinas Fixas</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalClasses}</div>
            <span className="text-[10px] text-slate-500">{laserClasses} Laser • {sigeoClasses} Sigeo</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Taxa de Aprovação</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{approvalRate}%</div>
            <span className="text-[10px] text-emerald-600 font-semibold">{approvedReservations} aprovadas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fila Pendente</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{pendingReservations}</div>
            <span className="text-[10px] text-amber-600 font-semibold">Aguardando monitor</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total de Reservas</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalReservations}</div>
            <span className="text-[10px] text-slate-500">{laserReservations} Laser • {sigeoReservations} Sigeo</span>
          </div>
        </div>

      </div>

      {/* Gráficos de Comparação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Comparativo LASER vs SIGEO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Volume de Ocupação por Laboratório</span>
          </h4>

          <div className="space-y-4 pt-2">
            {/* Barra LASER */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <Compass className="w-4 h-4 text-blue-600" /> LAB LASER (Sensores & Topografia)
                </span>
                <span className="text-slate-600">{laserClasses + laserReservations} atividades</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((laserClasses + laserReservations) / (totalClasses + totalReservations || 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Barra SIGEO */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-900">
                  <Globe className="w-4 h-4 text-emerald-600" /> LAB SIGEO (Geoprocessamento & SIG)
                </span>
                <span className="text-slate-600">{sigeoClasses + sigeoReservations} atividades</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((sigeoClasses + sigeoReservations) / (totalClasses + totalReservations || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
            💡 <strong>Análise de Ocupação:</strong> O <strong>SIGEO</strong> concentra a maior demanda de aulas práticas curriculares no período vespertino, enquanto o <strong>LASER</strong> possui grande volume de solicitações pontuais de pesquisa (TCC e ensaios com Laser Scanner e GNSS).
          </div>
        </div>

        {/* Distribuição por Finalidade */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <span>Perfil das Reservas Solicitadas</span>
          </h4>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-900">Trabalhos de Conclusão de Curso (TCC)</span>
              <span className="font-mono font-black text-amber-900">{purposeCounts['tcc'] || 1} solicitações</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl">
              <span className="font-bold text-purple-900">Iniciação Científica & Projetos de Pesquisa</span>
              <span className="font-mono font-black text-purple-900">{purposeCounts['iniciacao_cientifica'] || 1} solicitações</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <span className="font-bold text-emerald-900">Projetos de Extensão & Oficinas</span>
              <span className="font-mono font-black text-emerald-900">{purposeCounts['projeto_extensao'] || 1} solicitações</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-cyan-50/70 border border-cyan-200 rounded-xl">
              <span className="font-bold text-cyan-900">Aulas Extras e Reposições</span>
              <span className="font-mono font-black text-cyan-900">{purposeCounts['reposicao'] || 1} solicitações</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
