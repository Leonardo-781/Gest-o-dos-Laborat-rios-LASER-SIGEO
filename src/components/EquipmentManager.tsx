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
  Truck,
  PlusCircle,
  Edit3,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Layers,
  Compass,
  Globe
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { Equipment, LabId } from '../types';
import { getEquipmentCategoryLabel, getEquipmentStatusBadge } from '../utils/dateHelpers';

export const EquipmentManager: React.FC = () => {
  const { 
    equipments, 
    updateEquipmentStatus, 
    addEquipment, 
    editEquipment, 
    deleteEquipment, 
    currentUser, 
    labs, 
    canUserManageLab 
  } = useLab();

  const [selectedLabFilter, setSelectedLabFilter] = useState<'all' | 'laser' | 'sigeo' | 'ltgeo'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // Campos do formulário
  const [formData, setFormData] = useState<{
    labId: LabId;
    name: string;
    code: string;
    patrimonio: string;
    category: Equipment['category'];
    status: Equipment['status'];
    description: string;
    specs: string;
  }>({
    labId: 'ltgeo',
    name: '',
    code: '',
    patrimonio: '',
    category: 'topografia',
    status: 'disponivel',
    description: '',
    specs: ''
  });

  const filteredEquipments = equipments.filter(eq => {
    const matchesLab = selectedLabFilter === 'all' || eq.labId === selectedLabFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      eq.name.toLowerCase().includes(term) ||
      eq.code.toLowerCase().includes(term) ||
      (eq.patrimonio && eq.patrimonio.toLowerCase().includes(term)) ||
      eq.category.toLowerCase().includes(term) ||
      (eq.description && eq.description.toLowerCase().includes(term));

    return matchesLab && matchesSearch;
  });

  const canEditStatus = currentUser?.role === 'coordenador' || currentUser?.role === 'tecnico';

  // Determinar qual laboratório padrão usar ao abrir o modal de criação
  const getDefaultLabForUser = (): LabId => {
    if (selectedLabFilter !== 'all' && canUserManageLab(selectedLabFilter)) {
      return selectedLabFilter;
    }
    if (canUserManageLab('ltgeo')) return 'ltgeo';
    if (canUserManageLab('laser')) return 'laser';
    if (canUserManageLab('sigeo')) return 'sigeo';
    return 'ltgeo';
  };

  const handleOpenCreateModal = () => {
    setEditingEquipment(null);
    setFormData({
      labId: getDefaultLabForUser(),
      name: '',
      code: '',
      patrimonio: '',
      category: 'topografia',
      status: 'disponivel',
      description: '',
      specs: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({
      labId: eq.labId,
      name: eq.name,
      code: eq.code,
      patrimonio: eq.patrimonio || '',
      category: eq.category,
      status: eq.status,
      description: eq.description,
      specs: eq.specs || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (eq: Equipment) => {
    const identifier = eq.patrimonio ? `Pat. ${eq.patrimonio}` : eq.code;
    if (confirm(`Deseja realmente remover o equipamento "${eq.name}" (${identifier}) do acervo oficial?`)) {
      deleteEquipment(eq.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Informe o nome do equipamento.');
      return;
    }

    if (!formData.code.trim()) {
      alert('Informe o código identificador do equipamento (ex: TEO-081804, ET-01).');
      return;
    }

    if (editingEquipment) {
      editEquipment(editingEquipment.id, {
        labId: formData.labId,
        name: formData.name.trim(),
        code: formData.code.trim(),
        patrimonio: formData.patrimonio.trim() || undefined,
        category: formData.category,
        status: formData.status,
        description: formData.description.trim(),
        specs: formData.specs.trim() || undefined
      });
    } else {
      addEquipment({
        labId: formData.labId,
        name: formData.name.trim(),
        code: formData.code.trim(),
        patrimonio: formData.patrimonio.trim() || undefined,
        category: formData.category,
        status: formData.status,
        description: formData.description.trim(),
        specs: formData.specs.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header e Filtros */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Inventário de Equipamentos & Recursos</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulte e gerencie a disponibilidade de instrumentos de alta precisão do LASER, estações e receptores GNSS do LTGEO e Workstations do SIGEO
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {canEditStatus && (
              <button
                onClick={handleOpenCreateModal}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Novo Equipamento</span>
              </button>
            )}

            {canEditStatus && (
              <span className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200">
                ✓ Modo Gestão ({currentUser?.role || 'gestão'})
              </span>
            )}
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar por nome, patrimônio (ex: 081804, 703274, 095174), código ou tipo..."
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
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                    {eq.patrimonio && (
                      <span className="font-mono text-[11px] font-black text-amber-900 bg-amber-50 border border-amber-300/80 px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                        <span className="text-[9px] uppercase tracking-wider text-amber-700 font-bold">Pat.</span>
                        {eq.patrimonio}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                    {canEditStatus && canUserManageLab(eq.labId) && (
                      <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200">
                        <button
                          onClick={() => handleOpenEditModal(eq)}
                          title="Editar Equipamento"
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(eq)}
                          title="Excluir Equipamento"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Modal de Criação / Edição de Equipamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Header do Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
                  {editingEquipment ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingEquipment 
                      ? `Alterando dados do equipamento ${editingEquipment.name}` 
                      : 'Cadastre um novo recurso ou instrumento no inventário dos laboratórios'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Seleção do Laboratório */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Laboratório Pertencente *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ltgeo', 'laser', 'sigeo'] as const).map(labKey => {
                    const hasPerm = canUserManageLab(labKey);
                    const isSelected = formData.labId === labKey;

                    return (
                      <button
                        key={labKey}
                        type="button"
                        disabled={!hasPerm}
                        onClick={() => setFormData({ ...formData, labId: labKey })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                          !hasPerm
                            ? 'opacity-40 bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                            : isSelected
                            ? labKey === 'laser'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : labKey === 'sigeo'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-orange-600 text-white border-orange-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer'
                        }`}
                      >
                        <span className="uppercase tracking-wider font-extrabold">{labKey}</span>
                        <span className="text-[10px] font-normal opacity-80">
                          {hasPerm ? labs[labKey]?.location.split('-')[0] : '🔒 Sem Permissão'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nome do Equipamento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Equipamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Estação Total Leica TS06 Plus, Workstation Dell..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              {/* Código Identificador e Patrimônio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código Interno / Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TEO-081804, ET-01, WS-08"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nº Patrimônio UFPR (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 081804, 703274, 095174"
                    value={formData.patrimonio}
                    onChange={(e) => setFormData({ ...formData, patrimonio: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-amber-900 font-bold"
                  />
                </div>
              </div>

              {/* Categoria e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Equipment['category'] })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="topografia">Topografia & Geodésia</option>
                    <option value="gnss">Receptores GNSS / RTK</option>
                    <option value="laser_scanner">Laser Scanner 3D</option>
                    <option value="workstation">Estações de Trabalho SIG</option>
                    <option value="drone">VANT / Drones & LiDAR</option>
                    <option value="periferico">Periféricos & Impressão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Operacional *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Equipment['status'] })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="disponivel">Disponível / Livre</option>
                    <option value="em_uso">Em Uso Interno</option>
                    <option value="em_campo">Em Campo</option>
                    <option value="manutencao">Em Manutenção</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição & Aplicação
                </label>
                <textarea
                  rows={2}
                  placeholder="Finalidade de uso, acessórios inclusos (estojo, tripé, baterias), etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 resize-none"
                />
              </div>

              {/* Especificações Técnicas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Especificações Técnicas (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Precisão angular 2 segundos, alcance 500m, memória interna..."
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              {/* Ações do Formulário */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEquipment ? 'Salvar Alterações' : 'Cadastrar Equipamento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

