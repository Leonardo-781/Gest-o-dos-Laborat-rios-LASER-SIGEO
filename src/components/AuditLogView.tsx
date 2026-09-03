import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  FileUp, 
  Clock, 
  User, 
  Download, 
  FileSpreadsheet,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { AuditLog, AuditActionType } from '../types';
import { formatDateTimeBR } from '../utils/dateHelpers';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useLab();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('todas');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      !searchTerm ||
      log.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.applicantDetails?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'todas' || log.actionType === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (type: AuditActionType) => {
    switch (type) {
      case 'solicitacao_aprovada':
        return { label: 'Reserva Aprovada', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> };
      case 'solicitacao_recusada':
        return { label: 'Reserva Recusada', bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: <XCircle className="w-3.5 h-3.5 text-rose-600" /> };
      case 'solicitacao_criada':
        return { label: 'Solicitação Criada', bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: <PlusCircle className="w-3.5 h-3.5 text-blue-600" /> };
      case 'solicitacao_cancelada':
        return { label: 'Reserva Cancelada', bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: <Clock className="w-3.5 h-3.5 text-slate-500" /> };
      case 'pdf_importado':
        return { label: 'Grade PDF Importada', bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: <FileUp className="w-3.5 h-3.5 text-purple-600" /> };
      case 'aula_adicionada':
        return { label: 'Aula Regular Cadastrada', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200', icon: <Layers className="w-3.5 h-3.5 text-cyan-600" /> };
      case 'aula_removida':
        return { label: 'Aula Regular Removida', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: <Clock className="w-3.5 h-3.5 text-amber-600" /> };
      default:
        return { label: 'Ação do Sistema', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> };
    }
  };

  const handleExportAuditCSV = () => {
    const headers = 'Data e Hora;Tipo de Ação;Item/Alvo;Solicitante;Responsável pela Ação;Perfil do Responsável;Detalhes e Justificativa\n';
    const rows = filteredLogs.map(log => {
      const applicant = log.applicantDetails ? `${log.applicantDetails.name} (${log.applicantDetails.role})` : 'N/A';
      return `"${formatDateTimeBR(log.timestamp)}";"${log.actionType}";"${log.targetTitle}";"${applicant}";"${log.performedBy.name}";"${log.performedBy.role}";"${log.details.replace(/"/g, '""')}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trilha-auditoria-laboratorios-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Trilha de Auditoria & Governança Institucional
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registro auditável completo de todas as solicitações, quem solicitou, e o responsável (técnico/coordenador) que aprovou ou recusou.
            </p>
          </div>

          <button
            onClick={handleExportAuditCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório de Auditoria</span>
          </button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar por solicitante, responsável, protocolo ou disciplina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium cursor-pointer"
            >
              <option value="todas">Todas as Ações ({auditLogs.length})</option>
              <option value="solicitacao_aprovada">Apenas Aprovações</option>
              <option value="solicitacao_recusada">Apenas Recusas</option>
              <option value="solicitacao_criada">Apenas Criações</option>
              <option value="pdf_importado">Importações de PDF</option>
              <option value="aula_adicionada">Aulas da Grade</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Registros Auditáveis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>Registros de Governança ({filteredLogs.length})</span>
          <span className="text-[11px] text-slate-400 font-normal">Ordenados por data mais recente</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map(log => {
            const badge = getActionBadge(log.actionType);

            return (
              <div key={log.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                
                {/* Linha 1: Header do Log */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.bg}`}>
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    <span className="font-bold text-sm text-slate-900">
                      {log.targetTitle}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateTimeBR(log.timestamp)}
                  </span>
                </div>

                {/* Linha 2: Detalhes e Justificativa */}
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {log.details}
                </p>

                {/* Linha 3: Card com Solicitante e Decisor Responsável */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  
                  {/* Solicitante */}
                  {log.applicantDetails ? (
                    <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Solicitante da Reserva</span>
                        <span className="font-bold text-slate-900">{log.applicantDetails.name}</span>
                        <span className="text-[10px] text-slate-500 block">{log.applicantDetails.email} • {log.applicantDetails.id}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
                      Ação institucional de gerenciamento da grade
                    </div>
                  )}

                  {/* Responsável que executou a ação */}
                  <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsável pela Ação / Decisão</span>
                      <span className="font-bold text-slate-900">{log.performedBy.name}</span>
                      <span className="text-[10px] text-slate-500 block">{log.performedBy.email} • Perfil: {log.performedBy.role}</span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
