import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Calendar, 
  Wrench, 
  Code, 
  ExternalLink,
  Trash2,
  Inbox,
  Send,
  Eye
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { EmailNotification } from '../types';

export const EmailNotificationsModal: React.FC = () => {
  const { 
    isEmailModalOpen, 
    setIsEmailModalOpen, 
    emails, 
    markEmailAsRead, 
    clearEmails,
    currentUser
  } = useLab();

  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'login' | 'solicitacao_criada' | 'solicitacao_atualizada' | 'manutencao' | 'software'>('all');

  if (!isEmailModalOpen) return null;

  const isMaster = currentUser?.id === 'usr-master' || currentUser?.email?.toLowerCase() === 'leonardo.cardoso@ufu.br';
  const canViewEmails = isMaster || currentUser?.permissions?.canViewEmails === true;

  if (!canViewEmails) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Acesso Restrito à Central de E-mails</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            A visualização das mensagens e notificações institucionais é restrita ao Administrador Master (<strong>Leonardo Cardoso</strong>) e técnicos expressamente autorizados.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
            Para consultar o andamento da sua solicitação individual, utilize a aba <strong>Rastrear</strong> com seu protocolo (ex: REQ-2026-XXXX).
          </div>
          <button
            onClick={() => setIsEmailModalOpen(false)}
            className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const filteredEmails = emails.filter(e => {
    if (filterCategory === 'all') return true;
    return e.category === filterCategory;
  });

  const getCategoryBadge = (category: EmailNotification['category']) => {
    switch (category) {
      case 'solicitacao_criada':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Calendar className="w-3 h-3 text-blue-600" /> Nova Solicitação
          </span>
        );
      case 'solicitacao_atualizada':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Status da Reserva
          </span>
        );
      case 'manutencao':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Wrench className="w-3 h-3 text-purple-600" /> Manutenção
          </span>
        );
      case 'software':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Code className="w-3 h-3 text-indigo-600" /> Software
          </span>
        );
      default:
        return null;
    }
  };

  const handleSelectEmail = (eml: EmailNotification) => {
    setSelectedEmail(eml);
    if (!eml.read) {
      markEmailAsRead(eml.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 relative border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Central de Notificações por E-mail</h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[11px] font-bold">
                  {emails.length} disparados
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SILAB • Disparos automatizados para usuários validados (UFU / Agrimensura)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emails.length > 0 && (
              <button
                onClick={clearEmails}
                title="Limpar histórico"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer text-xs flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
            <button
              onClick={() => setIsEmailModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros por Categoria */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 px-6 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-bold text-slate-500 mr-2 uppercase tracking-wider">Filtrar:</span>
          {[
            { id: 'all', label: 'Todos os E-mails' },
            { id: 'solicitacao_criada', label: 'Novas Solicitações' },
            { id: 'solicitacao_atualizada', label: 'Status de Horário' },
            { id: 'manutencao', label: 'Manutenções' },
            { id: 'software', label: 'Softwares' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                filterCategory === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Conteúdo: Lista de E-mails e Visualizador */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Lista à Esquerda (5 colunas) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">Nenhum e-mail disparado nesta categoria</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Faça login, envie uma solicitação de horário ou abra um chamado para ver o e-mail sendo gerado em tempo real!
                </p>
              </div>
            ) : (
              filteredEmails.map(eml => {
                const isSelected = selectedEmail?.id === eml.id;
                const formattedTime = new Date(eml.sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const formattedDate = new Date(eml.sentAt).toLocaleDateString('pt-BR');

                return (
                  <button
                    key={eml.id}
                    onClick={() => handleSelectEmail(eml)}
                    className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer block ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                        : !eml.read
                        ? 'bg-white border-blue-200 shadow-xs'
                        : 'bg-white/70 border-slate-200 opacity-90 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      {getCategoryBadge(eml.category)}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formattedDate} às {formattedTime}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 line-clamp-1">
                      {eml.subject}
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {eml.preview}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate font-mono">Para: {eml.to}</span>
                      {!eml.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Visualizador do E-mail à Direita (7 colunas) */}
          <div className="md:col-span-7 flex flex-col bg-white overflow-hidden">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Cabeçalho do E-mail Selecionado */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {selectedEmail.subject}
                      </h4>
                      <div className="text-xs text-slate-600 mt-1">
                        <strong>Destinatário:</strong> {selectedEmail.recipientName} &lt;<span className="font-mono text-blue-600">{selectedEmail.to}</span>&gt;
                      </div>
                    </div>
                    {getCategoryBadge(selectedEmail.category)}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Disparado em: {new Date(selectedEmail.sentAt).toLocaleString('pt-BR')}</span>
                    {selectedEmail.protocol && (
                      <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-bold">
                        {selectedEmail.protocol}
                      </span>
                    )}
                  </div>
                </div>

                {/* Corpo do E-mail Renderizado */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
                  <div 
                    className="email-render-wrapper"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 text-slate-300">
                  <Eye className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Selecione um e-mail para visualizar</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Visualize o layout oficial em HTML enviado pelo SILAB para os alunos, docentes e técnicos.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer Informativo */}
        <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Motor de notificações ativo • 100% dos e-mails são validados para atualização</span>
          </div>
          <button
            onClick={() => setIsEmailModalOpen(false)}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer text-xs"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
