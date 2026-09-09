import React, { useState } from 'react';
import { 
  Cpu, 
  Search, 
  Filter, 
  Radio, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Truck
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { Equipment } from '../types';
import { getEquipmentCategoryLabel, getEquipmentStatusBadge } from '../utils/dateHelpers';

export const EquipmentManager: React.FC = () => {
  const { equipments, updateEquipmentStatus, currentUser, labs, canUserManageLab } = useLab();
  const [selectedLabFilter, setSelectedLabFilter] = useState<'all' | 'laser' | 'sigeo' | 'ltgeo'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEquipments = equipments.filter(eq => {
    const matchesLab = selectedLabFilter === 'all' || eq.labId === selectedLabFilter;
    const matchesSearch = 
      !searchTerm ||
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLab && matchesSearch;
  });

  const canEditStatus = currentUser?.role === 'coordenador' || currentUser?.role === 'tecnico';

  return (
    <div className="space-y-6">
      
      {/* Header e Filtros */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Inventário de Equipamentos & Recursos</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulte e gerencie a disponibilidade de instrumentos de alta precisão do LASER, estações e receptores GNSS do LTGEO e Workstations do SIGEO
            </p>
          </div>

          {canEditStatus && (
            <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 self-start sm:self-auto">
              ✓ Edição de status habilitada ({currentUser?.role || 'gestão'})
            </span>
          )}
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar por nome do instrumento, código (ex: LS-01, GNSS, LT-01) ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedLabFilter('all')}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedLabFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({equipments.length})
            </button>
            <button
              onClick={() => setSelectedLabFilter('laser')}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedLabFilter === 'laser'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              LASER
            </button>
            <button
              onClick={() => setSelectedLabFilter('sigeo')}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedLabFilter === 'sigeo'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              SIGEO
            </button>
            <button
              onClick={() => setSelectedLabFilter('ltgeo')}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedLabFilter === 'ltgeo'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
              }`}
            >
              LTGEO
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Equipamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEquipments.map(eq => {
          const isLaser = eq.labId === 'laser';
          const statusBadge = getEquipmentStatusBadge(eq.status);

          return (
            <div
              key={eq.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header do Equipamento */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider border ${
                      eq.labId === 'laser' 
                        ? 'bg-blue-100 text-blue-800 border-blue-200' 
                        : eq.labId === 'sigeo' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-orange-100 text-orange-800 border-orange-200'
                    }`}>
                      {eq.labId.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {eq.code}
                    </span>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900">{eq.name}</h4>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {getEquipmentCategoryLabel(eq.category)}
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {eq.description}
                </p>

                {eq.specs && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 font-mono">
                    ⚡ {eq.specs}
                  </div>
                )}
              </div>

              {/* Ação de Modificar Status para Técnicos / Coordenação */}
              {canEditStatus ? (
                canUserManageLab(eq.labId) ? (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-semibold text-slate-400">Alterar Status:</span>
                    <div className="flex items-center gap-1">
                      {(['disponivel', 'em_uso', 'em_campo', 'manutencao'] as const).map(st => (
                        <button
                          key={st}
                          onClick={() => updateEquipmentStatus(eq.id, st)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                            eq.status === st
                              ? 'bg-slate-900 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st === 'disponivel' ? 'Livre' : st === 'em_uso' ? 'Em Uso' : st === 'em_campo' ? 'Campo' : 'Manutenção'}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 italic">
                    Restrito ao técnico responsável pelo {eq.labId.toUpperCase()} ({labs[eq.labId]?.location})
                  </div>
                )
              ) : (
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                  Localização: {labs[eq.labId].location}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
