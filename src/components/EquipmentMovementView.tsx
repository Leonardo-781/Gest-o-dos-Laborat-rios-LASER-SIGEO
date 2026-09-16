import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Download, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Cpu, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { EquipmentMovement, LabId } from '../types';
import { formatDateTimeBR } from '../utils/dateHelpers';

export const EquipmentMovementView: React.FC = () => {
  const { 
    movements, 
    addMovement, 
    updateMovement, 
    deleteMovement, 
    markMovementReturned, 
    equipments, 
    currentUser, 
    labs, 
    canUserManageLab,
    canUserManageMovements
  } = useLab();

  // Estados de Busca e Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'em_transito' | 'concluido' | 'remanejado'>('todos');
  const [labFilter, setLabFilter] = useState<'todos' | 'ltgeo' | 'laser' | 'sigeo'>('todos');

  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<EquipmentMovement | null>(null);

  // Modal de Devolução Rápida
  const [returnModalMovement, setReturnModalMovement] = useState<EquipmentMovement | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnReceiver, setReturnReceiver] = useState('');

  // Formulário Principal
  const [formData, setFormData] = useState<{
    equipmentId?: string;
    patrimonio: string;
    equipmentName: string;
    labId?: LabId;
    date: string;
    originLocation: string;
    destinationLocation: string;
    responsibleTechnician: string;
    purpose: string;
    generalNotes: string;
    status: 'em_transito' | 'concluido' | 'remanejado';
    updateEquipStatus: boolean;
  }>({
    equipmentId: '',
    patrimonio: '',
    equipmentName: '',
    labId: 'ltgeo',
    date: new Date().toISOString().slice(0, 16),
    originLocation: 'LTGEO - Sala 1B210',
    destinationLocation: '',
    responsibleTechnician: currentUser?.name || 'Leonardo Cardoso',
    purpose: '',
    generalNotes: '',
    status: 'em_transito',
    updateEquipStatus: true
  });

  const isManager = currentUser?.role === 'coordenador' || currentUser?.role === 'tecnico';

  // Estatísticas
  const totalMovements = movements.length;
  const inTransitCount = movements.filter(m => m.status === 'em_transito').length;
  const completedCount = movements.filter(m => m.status === 'concluido').length;
  const relocatedCount = movements.filter(m => m.status === 'remanejado').length;

  // Filtragem
  const filteredMovements = movements.filter(m => {
    const matchesSearch = 
      !searchTerm ||
      m.patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.responsibleTechnician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.originLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.destinationLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.generalNotes && m.generalNotes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || m.status === statusFilter;
    const matchesLab = labFilter === 'todos' || m.labId === labFilter;

    return matchesSearch && matchesStatus && matchesLab;
  });

  // Abrir Modal de Criação
  const handleOpenCreateModal = () => {
    setEditingMovement(null);
    setFormData({
      equipmentId: '',
      patrimonio: '',
      equipmentName: '',
      labId: 'ltgeo',
      date: new Date().toISOString().slice(0, 16),
      originLocation: 'LTGEO - Sala 1B210',
      destinationLocation: '',
      responsibleTechnician: currentUser?.name || 'Leonardo Cardoso',
      purpose: '',
      generalNotes: '',
      status: 'em_transito',
      updateEquipStatus: true
    });
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (mov: EquipmentMovement) => {
    setEditingMovement(mov);
    setFormData({
      equipmentId: mov.equipmentId || '',
      patrimonio: mov.patrimonio,
      equipmentName: mov.equipmentName,
      labId: mov.labId,
      date: mov.date,
      originLocation: mov.originLocation,
      destinationLocation: mov.destinationLocation,
      responsibleTechnician: mov.responsibleTechnician,
      purpose: mov.purpose,
      generalNotes: mov.generalNotes || '',
      status: mov.status,
      updateEquipStatus: false
    });
    setIsModalOpen(true);
  };

  // Seleção Inteligente de Equipamento Cadastrado
  const handleSelectEquipment = (equipId: string) => {
    if (!equipId) {
      setFormData(prev => ({
        ...prev,
        equipmentId: '',
        patrimonio: '',
        equipmentName: ''
      }));
      return;
    }

    const eq = equipments.find(e => e.id === equipId);
    if (!eq) return;

    const defaultOrigin = eq.labId === 'ltgeo' 
      ? 'LTGEO - Sala 1B210' 
      : eq.labId === 'laser' 
      ? 'LASER - Sala 1B309' 
      : 'SIGEO - Sala 1B307';

    setFormData(prev => ({
      ...prev,
      equipmentId: eq.id,
      patrimonio: eq.patrimonio || eq.code,
      equipmentName: eq.name,
      labId: eq.labId,
      originLocation: defaultOrigin
    }));
  };

  // Submissão do Formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patrimonio.trim()) {
      alert('Informe o patrimônio ou identificador do equipamento.');
      return;
    }

    if (!formData.equipmentName.trim()) {
      alert('Informe o nome do equipamento.');
      return;
    }

    if (!formData.originLocation.trim()) {
      alert('Informe o local de saída.');
      return;
    }

    if (!formData.destinationLocation.trim()) {
      alert('Informe o local de destino.');
      return;
    }

    if (!formData.responsibleTechnician.trim()) {
      alert('Informe o técnico responsável.');
      return;
    }

    if (!formData.purpose.trim()) {
      alert('Informe a motivação de uso / justificativa da movimentação.');
      return;
    }

    if (editingMovement) {
      updateMovement(editingMovement.id, {
        equipmentId: formData.equipmentId || undefined,
        patrimonio: formData.patrimonio.trim(),
        equipmentName: formData.equipmentName.trim(),
        labId: formData.labId,
        date: formData.date,
        originLocation: formData.originLocation.trim(),
        destinationLocation: formData.destinationLocation.trim(),
        responsibleTechnician: formData.responsibleTechnician.trim(),
        purpose: formData.purpose.trim(),
        generalNotes: formData.generalNotes.trim() || undefined,
        status: formData.status
      });
    } else {
      addMovement({
        equipmentId: formData.equipmentId || undefined,
        patrimonio: formData.patrimonio.trim(),
        equipmentName: formData.equipmentName.trim(),
        labId: formData.labId,
        date: formData.date,
        originLocation: formData.originLocation.trim(),
        destinationLocation: formData.destinationLocation.trim(),
        responsibleTechnician: formData.responsibleTechnician.trim(),
        purpose: formData.purpose.trim(),
        generalNotes: formData.generalNotes.trim() || undefined,
        status: formData.status
      });
    }

    setIsModalOpen(false);
  };

  // Confirmar Devolução
  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalMovement) return;

    markMovementReturned(
      returnModalMovement.id, 
      returnNotes.trim() || 'Devolvido ao laboratório de origem sem avarias registradas.',
      returnReceiver.trim() || currentUser?.name || 'Técnico Responsável'
    );

    setReturnModalMovement(null);
    setReturnNotes('');
    setReturnReceiver('');
  };

  // Exclusão com confirmação
  const handleDelete = (mov: EquipmentMovement) => {
    if (confirm(`Deseja realmente excluir o registro de movimentação do patrimônio "${mov.patrimonio}" para "${mov.destinationLocation}"?`)) {
      deleteMovement(mov.id);
    }
  };

  // Exportar Relatório CSV
  const handleExportCSV = () => {
    const headers = 'Data;Patrimônio;Equipamento;Laboratório;Local de Saída;Local de Destino;Técnico Responsável;Motivação de Uso;Status;Data de Retorno;Recebido Por;Observações Gerais\n';
    const rows = filteredMovements.map(m => {
      const statusLabel = m.status === 'em_transito' ? 'Em Campo / Trânsito' : m.status === 'concluido' ? 'Devolvido / Concluído' : 'Remanejado';
      const cleanNotes = (m.generalNotes || '').replace(/"/g, '""');
      const cleanReturnNotes = (m.returnNotes || '').replace(/"/g, '""');
      const allNotes = [cleanNotes, cleanReturnNotes ? `[Retorno]: ${cleanReturnNotes}` : ''].filter(Boolean).join(' | ');

      return `"${m.date}";"${m.patrimonio}";"${m.equipmentName}";"${(m.labId || 'N/A').toUpperCase()}";"${m.originLocation}";"${m.destinationLocation}";"${m.responsibleTechnician}";"${m.purpose.replace(/"/g, '""')}";"${statusLabel}";"${m.returnDate || 'N/A'}";"${m.returnedBy || 'N/A'}";"${allNotes}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-movimentacoes-equipamentos-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Verificação de permissão estrita: Apenas Leonardo Master e técnicos/coordenadores autorizados por ele
  if (!canUserManageMovements()) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs text-center max-w-2xl mx-auto my-12 space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Acesso Restrito: Módulo Interno de Movimentações</h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
          O controle e histórico de saídas de campo, transferências e modificações de máquinas é de <strong>uso estritamente interno</strong>, acessível exclusivamente a técnicos e coordenadores com <strong>autorização concedida pelo Administrador Master Leonardo Cardoso</strong>.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 font-mono inline-block">
          Status: Usuário sem permissão ativa ({currentUser ? `${currentUser.name} • ${currentUser.role.toUpperCase()}` : 'Visitante Deslogado'})
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Principal */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200 shrink-0">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Controle de Movimentações & Modificações de Máquinas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Registro auditável de saídas para aulas práticas, trabalho de campo, empréstimos entre setores e remanejamentos entre salas dos laboratórios.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              title="Exportar planilha completa para prestação de contas de patrimônio"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Exportar CSV</span>
            </button>

            {isManager && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Nova Movimentação</span>
              </button>
            )}
          </div>
        </div>

        {/* Cards de Resumo & Indicadores Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Total de Registros</div>
              <div className="text-lg font-black text-slate-900">{totalMovements}</div>
            </div>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-amber-700">Em Campo / Trânsito</div>
              <div className="text-lg font-black text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                {inTransitCount}
              </div>
            </div>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-emerald-700">Devolvidos / Concluídos</div>
              <div className="text-lg font-black text-emerald-900">{completedCount}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-indigo-700">Remanejamentos</div>
              <div className="text-lg font-black text-indigo-900">{relocatedCount}</div>
            </div>
            <RefreshCw className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar por patrimônio (ex: 081814), equipamento, técnico, destino ou motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'todos' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({movements.length})
            </button>
            <button
              onClick={() => setStatusFilter('em_transito')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'em_transito' 
                  ? 'bg-amber-500 text-white shadow-xs' 
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Em Campo ({inTransitCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('concluido')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'concluido' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Devolvidos ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('remanejado')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'remanejado' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              Remanejados ({relocatedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Movimentações */}
      {filteredMovements.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Nenhuma movimentação encontrada</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'todos' 
              ? 'Tente alterar os termos da busca ou os filtros aplicados.' 
              : 'Nenhum deslocamento ou modificação de equipamento foi registrado até o momento.'}
          </p>
          {isManager && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Primeira Movimentação</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredMovements.map(mov => {
            const isCompleted = mov.status === 'concluido';
            const isRelocated = mov.status === 'remanejado';

            return (
              <div 
                key={mov.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-3.5 ${
                  mov.status === 'em_transito' 
                    ? 'border-amber-300/80 bg-gradient-to-r from-amber-50/20 via-white to-white hover:border-amber-400' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Linha Superior: Badges, Patrimônio e Ações */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    {mov.status === 'em_transito' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        <span>Em Campo / Trânsito</span>
                      </span>
                    )}
                    {mov.status === 'concluido' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Devolvido ao Laboratório</span>
                      </span>
                    )}
                    {mov.status === 'remanejado' && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Remanejamento Definitivo</span>
                      </span>
                    )}

                    {/* Tag de Patrimônio UFPR */}
                    <span className="font-mono text-xs font-black text-amber-950 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-lg shadow-2xs flex items-center gap-1">
                      <span className="text-[9px] uppercase tracking-wider text-amber-700 font-bold">Pat.</span>
                      {mov.patrimonio}
                    </span>

                    {/* Laboratório */}
                    {mov.labId && (
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider border ${
                        mov.labId === 'laser' 
                          ? 'bg-blue-100 text-blue-800 border-blue-200' 
                          : mov.labId === 'sigeo' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                          : 'bg-orange-100 text-orange-800 border-orange-200'
                      }`}>
                        {mov.labId.toUpperCase()}
                      </span>
                    )}

                    {/* Data */}
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {mov.date.includes('T') 
                        ? `${mov.date.split('T')[0].split('-').reverse().join('/')} às ${mov.date.split('T')[1]}` 
                        : mov.date}
                    </span>
                  </div>

                  {/* Ações Técnicas */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {mov.status === 'em_transito' && isManager && (
                      <button
                        onClick={() => {
                          setReturnModalMovement(mov);
                          setReturnNotes('');
                          setReturnReceiver(currentUser?.name || 'Leonardo Cardoso');
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        title="Registrar devolução e retorno deste equipamento"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registrar Retorno</span>
                      </button>
                    )}

                    {isManager && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(mov)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Editar movimentação"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mov)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Excluir movimentação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Nome do Equipamento e Rota */}
                  <div className="lg:col-span-6 space-y-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {mov.equipmentName}
                      </h4>
                    </div>

                    {/* Trajeto Origem ➔ Destino */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Local de Saída</span>
                          <span className="font-bold text-slate-800">{mov.originLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-400 shrink-0 px-2">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      </div>

                      <div className="flex items-center gap-2 min-w-0 text-right">
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Local de Destino</span>
                          <span className="font-bold text-emerald-800">{mov.destinationLocation}</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                      </div>
                    </div>
                  </div>

                  {/* Técnico, Motivo e Observações */}
                  <div className="lg:col-span-6 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">Técnico Responsável:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        {mov.responsibleTechnician}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Motivação de Uso:
                      </span>
                      <p className="text-xs text-slate-700 font-medium">
                        {mov.purpose}
                      </p>
                    </div>

                    {mov.generalNotes && (
                      <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-700">Observações & Acessórios:</span> {mov.generalNotes}
                      </div>
                    )}

                    {/* Dados de Devolução / Retorno */}
                    {mov.status === 'concluido' && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-emerald-900">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Retorno Concluído em: {mov.returnDate ? mov.returnDate.replace('T', ' às ') : 'Data confirmada'}
                          </span>
                          <span>Receptor: {mov.returnedBy || mov.responsibleTechnician}</span>
                        </div>
                        {mov.returnNotes && (
                          <div className="text-emerald-800 text-[10px] italic pt-0.5">
                            "{mov.returnNotes}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição de Movimentação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Header do Modal */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
                  {editingMovement ? <Edit3 className="w-5 h-5" /> : <ArrowLeftRight className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingMovement ? 'Editar Registro de Movimentação' : 'Registrar Nova Movimentação'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Controle de saída, cautela e destinação de equipamentos e máquinas
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
              
              {/* Seleção Rápida de Equipamento do Acervo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecionar Equipamento do Acervo (Opcional)
                </label>
                <select
                  value={formData.equipmentId || ''}
                  onChange={(e) => handleSelectEquipment(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 cursor-pointer"
                >
                  <option value="">-- Digitar dados manualmente ou selecionar abaixo --</option>
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.labId.toUpperCase()}] {eq.patrimonio ? `Pat. ${eq.patrimonio} • ` : ''}{eq.name} ({eq.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patrimônio e Nome do Equipamento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nº Patrimônio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 081814"
                    value={formData.patrimonio}
                    onChange={(e) => setFormData({ ...formData, patrimonio: e.target.value })}
                    className="w-full text-xs font-mono font-bold text-amber-900 bg-amber-50/40 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Equipamento / Máquina *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Estação Total Leica TS06 Plus"
                    value={formData.equipmentName}
                    onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Data/Hora e Técnico Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data & Hora da Saída *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Técnico Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do técnico"
                    value={formData.responsibleTechnician}
                    onChange={(e) => setFormData({ ...formData, responsibleTechnician: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Local de Saída (Origem) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Local de Saída (Origem) *
                  </label>
                  <span className="text-[10px] text-slate-400">Atalhos rápidos:</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: LTGEO - Sala 1B210"
                  value={formData.originLocation}
                  onChange={(e) => setFormData({ ...formData, originLocation: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {[
                    'LTGEO - Sala 1B210',
                    'LASER - Sala 1B309',
                    'SIGEO - Sala 1B307',
                    'Sala dos Técnicos 1B308',
                    'Almoxarifado'
                  ].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setFormData({ ...formData, originLocation: loc })}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Local de Destino */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Local de Destino *
                  </label>
                  <span className="text-[10px] text-slate-400">Atalhos rápidos:</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campo de Topografia (Pátio Bloco 1B)"
                  value={formData.destinationLocation}
                  onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {[
                    'Campo de Topografia (Bloco 1B)',
                    'Fazenda Experimental do Glória',
                    'Bloco 1B (Salas de Aula)',
                    'Manutenção Externa Autorizada',
                    'Gabinete Docente'
                  ].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setFormData({ ...formData, destinationLocation: loc })}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motivação de Uso */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivação de Uso / Finalidade *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Aula prática de levantamento planialtimétrico da turma de Topografia 2..."
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 resize-none"
                />
              </div>

              {/* Observações Gerais e Acessórios */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações Gerais & Acessórios Inclusos
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Acompanha tripé de alumínio, prisma com bastão, 2 baterias recarregadas e estojo rígido..."
                  value={formData.generalNotes}
                  onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 resize-none"
                />
              </div>

              {/* Status da Movimentação */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Situação do Deslocamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'em_transito' })}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.status === 'em_transito' 
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Em Campo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'concluido' })}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.status === 'concluido' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Já Devolvido</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'remanejado' })}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.status === 'remanejado' 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Remanejamento</span>
                  </button>
                </div>
              </div>

              {/* Botões do Rodapé */}
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
                  <span>{editingMovement ? 'Salvar Alterações' : 'Confirmar Movimentação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Registro de Devolução / Retorno */}
      {returnModalMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Registrar Devolução de Equipamento</h3>
                  <p className="text-xs text-emerald-100">
                    Confirmação de recebimento no laboratório de origem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReturnModalMovement(null)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Equipamento:</span>
                  <span className="font-bold text-slate-800">{returnModalMovement.equipmentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Patrimônio:</span>
                  <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Pat. {returnModalMovement.patrimonio}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Estava em:</span>
                  <span className="font-bold text-slate-700">{returnModalMovement.destinationLocation}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Técnico que Recebeu a Devolução *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do técnico responsável pela conferência"
                  value={returnReceiver}
                  onChange={(e) => setReturnReceiver(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Condições de Retorno & Observações da Conferência
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Equipamento conferido e limpo, baterias descarregadas, tripé e prisma íntegros..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnModalMovement(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Recebimento / Devolução</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
