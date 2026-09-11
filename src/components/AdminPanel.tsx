import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  User, 
  Cpu, 
  PlusCircle, 
  Trash2, 
  Layers, 
  FileSpreadsheet, 
  AlertTriangle,
  Download,
  FileUp,
  Sparkles,
  Cloud,
  Lock,
  Globe,
  CheckCircle2,
  Edit3,
  Users,
  UserCheck,
  UserX,
  Flame,
  Database,
  ExternalLink,
  RefreshCw,
  Crown,
  Mail,
  Key,
  Repeat,
  Building2
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { LabId, FixedClass, FirebaseConfig, UserPermissions, UserAccount } from '../types';
import { formatDateBR, formatDateTimeBR, getPurposeBadge } from '../utils/dateHelpers';
import { testSupabaseConnection } from '../services/supabaseClient';
import { testFirebaseConnection } from '../services/firebaseClient';

export const AdminPanel: React.FC = () => {
  const { 
    reservations, 
    approveReservation, 
    approveRecurringGroup,
    rejectReservation, 
    rejectRecurringGroup,
    deleteReservation,
    openReservationModalForEdit,
    fixedClasses, 
    openClassModalForEdit,
    openClassModalForNew,
    deleteFixedClass,
    usersList,
    approveUserAccount,
    rejectUserAccount,
    updateUserPermissions,
    labs,
    equipments,
    currentUser,
    canUserManageLab,
    checkAvailability,
    cloudConfig,
    setCloudConfig,
    firebaseConfig,
    setFirebaseConfig,
    pushAllToFirebase,
    showToast
  } = useLab();

  const isMaster = currentUser?.id === 'usr-master' || currentUser?.email?.toLowerCase() === 'leonardo.cardoso@ufu.br';
  const [activeAdminTab, setActiveAdminTab] = useState<'fila' | 'aulas' | 'usuarios' | 'nuvem' | 'historico' | 'permissoes'>('fila');
  
  // Modal de rejeição
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectWholeSeries, setRejectWholeSeries] = useState<boolean>(false);

  // Configuração Firebase
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(firebaseConfig.projectId || 'silab-5f612');
  const [fbAuthDomain, setFbAuthDomain] = useState(firebaseConfig.authDomain || 'silab-5f612.firebaseapp.com');
  const [fbStorageBucket, setFbStorageBucket] = useState(firebaseConfig.storageBucket || 'silab-5f612.firebasestorage.app');
  const [fbAppId, setFbAppId] = useState(firebaseConfig.appId || '');
  const [fbSnippet, setFbSnippet] = useState('');
  const [isTestingFb, setIsTestingFb] = useState(false);
  const [isSeedingFb, setIsSeedingFb] = useState(false);
  const [fbTestResult, setFbTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Configuração Supabase
  const [sbUrl, setSbUrl] = useState(cloudConfig.supabaseUrl);
  const [sbKey, setSbKey] = useState(cloudConfig.supabaseAnonKey);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudTestResult, setCloudTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const pendingRequests = reservations.filter(r => r.status === 'pendente' && canUserManageLab(r.labId));
  const processedRequests = reservations.filter(r => r.status !== 'pendente' && canUserManageLab(r.labId));
  const pendingUsers = usersList.filter(u => u.status === 'pendente');

  const [pendingLabsMap, setPendingLabsMap] = useState<Record<string, LabId[]>>({});

  const getSelectedLabsForPending = (u: UserAccount): LabId[] => {
    if (pendingLabsMap[u.id]) {
      return pendingLabsMap[u.id];
    }
    if (u.requestedLabs && u.requestedLabs.length > 0) {
      return u.requestedLabs;
    }
    if (u.assignedLabs && u.assignedLabs.length > 0) {
      return u.assignedLabs;
    }
    return ['laser', 'sigeo'];
  };

  const togglePendingLab = (userId: string, labId: LabId, currentLabs: LabId[]) => {
    const hasLab = currentLabs.includes(labId);
    let nextLabs: LabId[];
    if (hasLab) {
      if (currentLabs.length === 1) {
        showToast('O técnico precisa ter autorização em pelo menos um laboratório.');
        return;
      }
      nextLabs = currentLabs.filter(l => l !== labId);
    } else {
      nextLabs = [...currentLabs, labId];
    }
    setPendingLabsMap(prev => ({ ...prev, [userId]: nextLabs }));
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingId && rejectReason.trim()) {
      const target = reservations.find(r => r.id === rejectingId);
      if (rejectWholeSeries && target?.recurrenceGroupId) {
        rejectRecurringGroup(target.recurrenceGroupId, rejectReason);
      } else {
        rejectReservation(rejectingId, rejectReason);
      }
      setRejectingId(null);
      setRejectReason('');
      setRejectWholeSeries(false);
    }
  };

  const handleTestCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingCloud(true);
    setCloudTestResult(null);

    const result = await testSupabaseConnection(sbUrl, sbKey);
    setCloudTestResult(result);
    setIsTestingCloud(false);

    if (result.success) {
      setCloudConfig({
        supabaseUrl: sbUrl,
        supabaseAnonKey: sbKey,
        isConnected: true,
        autoSync: true
      });
      showToast('Configurações de nuvem salvas!');
    }
  };

  const handleParseSnippet = (text: string) => {
    setFbSnippet(text);
    if (!text.trim()) return;

    const apiKeyMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
    const projectIdMatch = text.match(/projectId:\s*["']([^"']+)["']/);
    const authDomainMatch = text.match(/authDomain:\s*["']([^"']+)["']/);
    const storageBucketMatch = text.match(/storageBucket:\s*["']([^"']+)["']/);
    const appIdMatch = text.match(/appId:\s*["']([^"']+)["']/);

    if (apiKeyMatch) setFbApiKey(apiKeyMatch[1]);
    if (projectIdMatch) setFbProjectId(projectIdMatch[1]);
    if (authDomainMatch) setFbAuthDomain(authDomainMatch[1]);
    if (storageBucketMatch) setFbStorageBucket(storageBucketMatch[1]);
    if (appIdMatch) setFbAppId(appIdMatch[1]);

    if (apiKeyMatch || projectIdMatch) {
      showToast('Campos do Firebase extraídos com sucesso!');
    }
  };

  const handleTestFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingFb(true);
    setFbTestResult(null);

    const cfg: FirebaseConfig = {
      apiKey: fbApiKey.trim(),
      projectId: fbProjectId.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
      storageBucket: fbStorageBucket.trim(),
      appId: fbAppId.trim(),
      isConnected: false,
      autoSync: true
    };

    const res = await testFirebaseConnection(cfg);
    setIsTestingFb(false);
    setFbTestResult(res);

    if (res.success) {
      setFirebaseConfig({
        ...cfg,
        isConnected: true
      });
      showToast('Firebase conectado e pronto para a apresentação!');
    }
  };

  const handlePushAllToFirebase = async () => {
    setIsSeedingFb(true);
    await pushAllToFirebase();
    setIsSeedingFb(false);
  };

  const handleDisconnectFirebase = () => {
    setFirebaseConfig({
      ...firebaseConfig,
      isConnected: false
    });
    setFbTestResult(null);
    showToast('Firebase desconectado. Modo Local ativo.');
  };

  const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  return (
    <div className="space-y-6">
      
      {/* Header do Painel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Painel de Gestão & Coordenação</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Logado como: {currentUser?.name} ({currentUser?.role.toUpperCase()})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Aprovação de reservas, modificação de horários de aulas e confirmação de usuários
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveAdminTab('fila')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeAdminTab === 'fila' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <span>Fila de Pedidos</span>
            {pendingRequests.length > 0 && (
              <span className="h-4 px-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('aulas')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              activeAdminTab === 'aulas' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gerenciar Aulas ({fixedClasses.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('usuarios')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeAdminTab === 'usuarios' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuários</span>
            {pendingUsers.length > 0 && (
              <span className="h-4 px-1.5 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('nuvem')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeAdminTab === 'nuvem' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Banco Online (Firebase)</span>
            {firebaseConfig.isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Firebase Conectado"></span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('historico')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeAdminTab === 'historico' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Histórico ({processedRequests.length})
          </button>

          {/* Aba Exclusiva do Master Leonardo Cardoso */}
          {isMaster && (
            <button
              onClick={() => setActiveAdminTab('permissoes')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeAdminTab === 'permissoes'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-xs'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold border border-amber-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-700" />
              <span>Permissões Técnicas (Master)</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. ABA: FILA DE PENDÊNCIAS COM AUDITORIA DO RESPONSÁVEL */}
      {activeAdminTab === 'fila' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Solicitações Aguardando Decisão ({pendingRequests.length})
            </h4>
            <span className="text-xs text-slate-400">
              Ao aprovar ou recusar, a decisão fica registrada na auditoria com o carimbo do seu usuário ({currentUser?.name}).
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h5 className="text-sm font-bold text-slate-900">Tudo em dia! Nenhuma solicitação pendente.</h5>
              <p className="text-xs text-slate-400">Todas as reservas submetidas foram analisadas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(res => {
                const isLaser = res.labId === 'laser';
                const lab = labs[res.labId];
                const badge = getPurposeBadge(res.purposeType);
                const allocatedEquipments = equipments.filter(eq => res.requestedEquipments?.includes(eq.id));
                const availCheck = checkAvailability(res.labId, res.date, res.startTime, res.endTime, res.id);

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition"
                  >
                    {/* Header do Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {res.protocol}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                          res.labId === 'laser' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : res.labId === 'sigeo'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        }`}>
                          LAB {lab.name}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>

                        {res.isRecurring && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded border bg-indigo-50 text-indigo-800 border-indigo-200 flex items-center gap-1">
                            <Repeat className="w-3 h-3 text-indigo-600" />
                            Recorrência ({res.recurrenceWeekIndex ? `Semana ${res.recurrenceWeekIndex} de ${res.recurrenceTotalWeeks}` : 'Semanal'})
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Recebida em: {formatDateTimeBR(res.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{res.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    {/* Metadados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-2.5 bg-slate-50 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Data & Horário</span>
                        <span className="font-bold text-slate-800">{formatDateBR(res.date)} • {res.startTime} às {res.endTime}</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Solicitante ({res.applicantRole})</span>
                        <span className="font-bold text-slate-800">{res.applicantName}</span>
                        <span className="text-[10px] text-slate-500 block">{res.applicantEmail} • Doc: {res.applicantId}</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-700 block flex items-center gap-1">
                          <Globe className="w-3 h-3 text-blue-600" /> Prof. em Uso (Público)
                        </span>
                        <span className="font-bold text-slate-800">{res.userTeacher || 'Não informado'}</span>
                        <span className="text-[9px] text-emerald-700 block">Visível na grade</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 block flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-600" /> Prof. Responsável (Interno)
                        </span>
                        <span className="font-bold text-slate-800">{res.responsibleTeacher || res.supervisorName || 'Não informado'}</span>
                        <span className="text-[9px] text-amber-700 block">Apenas gestão</span>
                      </div>
                    </div>

                    {/* Equipamentos Solicitados */}
                    {allocatedEquipments.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-blue-600" /> Equipamentos:
                        </span>
                        {allocatedEquipments.map(eq => (
                          <span key={eq.id} className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px] font-semibold border border-blue-200">
                            {eq.name} ({eq.patrimonio ? `Pat. ${eq.patrimonio}` : eq.code})
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Alerta de Conflito */}
                    {!availCheck.available && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span><strong>Atenção:</strong> {availCheck.conflictReason}</span>
                      </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setRejectingId(res.id);
                          setRejectReason('');
                          setRejectWholeSeries(false);
                        }}
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 hover:bg-rose-100 transition cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Recusar com Justificativa
                      </button>

                      <button
                        onClick={() => approveReservation(res.id)}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> {res.isRecurring ? 'Aprovar Esta Semana' : 'Aprovar Reserva'}
                      </button>

                      {res.isRecurring && res.recurrenceGroupId && (
                        <button
                          onClick={() => approveRecurringGroup(res.recurrenceGroupId!)}
                          className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Aprovar todas as semanas restantes desta série com 1 clique"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <span>Aprovar Toda a Série ({res.recurrenceTotalWeeks || 'Todas'} Semanas)</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. ABA: GERENCIADOR E EDITOR DE AULAS DA GRADE */}
      {activeAdminTab === 'aulas' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">Grade Semestral de Aulas Oficiais</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique no botão <strong>"Editar"</strong> de qualquer disciplina para modificar horários, professores ou transferir de laboratório.
              </p>
            </div>

            <button
              onClick={() => openClassModalForNew()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Nova Disciplina</span>
            </button>
          </div>

          {/* Tabela de Aulas com Botão de Edição */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Dia</th>
                    <th className="p-3">Horário</th>
                    <th className="p-3">Laboratório</th>
                    <th className="p-3">Código</th>
                    <th className="p-3">Disciplina</th>
                    <th className="p-3">Docente</th>
                    <th className="p-3">Destaque</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {fixedClasses.map(fc => (
                    <tr key={fc.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{dayNames[fc.dayOfWeek - 1]}</td>
                      <td className="p-3 font-mono font-semibold">{fc.startTime} - {fc.endTime}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                          fc.labId === 'laser' 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : fc.labId === 'sigeo' 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        }`}>
                          {fc.labId.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{fc.courseCode}</td>
                      <td className="p-3 font-bold text-slate-900">{fc.courseName}</td>
                      <td className="p-3 text-slate-500">{fc.professor || '—'}</td>
                      <td className="p-3">
                        {(fc.isExternal || fc.customColor === 'vermelho' || fc.highlightColor?.includes('rose')) ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                            Ext (Vermelho)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Interna ({fc.customColor || 'Padrão'})</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {canUserManageLab(fc.labId) ? (
                          <>
                            <button
                              onClick={() => openClassModalForEdit(fc)}
                              className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg font-bold transition cursor-pointer inline-flex items-center gap-1 border border-blue-200"
                              title="Editar informações da aula"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                if (confirm(`Remover "${fc.courseName}" da grade semestral?`)) {
                                  deleteFixedClass(fc.id);
                                }
                              }}
                              className="p-1 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 transition cursor-pointer inline-block"
                              title="Excluir disciplina"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-lg">
                            Somente leitura
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA: GESTÃO DE USUÁRIOS E APROVAÇÃO DE CADASTROS */}
      {activeAdminTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Controle de Contas e Confirmação de Acessos</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Gerencie quem tem permissão para solicitar ou aprovar reservas no sistema.
            </p>
          </div>

          {/* Usuários Pendentes de Confirmação */}
          {pendingUsers.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Cadastros Aguardando Confirmação ({pendingUsers.length}):</span>
              </div>

              <div className="divide-y divide-amber-200/60 bg-white rounded-xl border border-amber-200 overflow-hidden">
                {pendingUsers.map(u => {
                  const isTech = u.role === 'tecnico';
                  const selectedLabs = isTech ? getSelectedLabsForPending(u) : [];

                  return (
                    <div key={u.id} className="p-4 space-y-3 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'coordenador' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : u.role === 'tecnico'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.role === 'tecnico' ? 'Técnico de Laboratório' : u.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {u.email} • Matrícula/SIAPE: {u.documentId}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => rejectUserAccount(u.id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl font-bold hover:bg-rose-100 transition cursor-pointer border border-rose-200 flex items-center gap-1.5"
                          >
                            <UserX className="w-3.5 h-3.5" /> Recusar
                          </button>
                          <button
                            type="button"
                            onClick={() => approveUserAccount(u.id, isTech ? selectedLabs : undefined)}
                            className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Confirmar Conta
                          </button>
                        </div>
                      </div>

                      {/* Controle de Jurisdição do Técnico pelo Master */}
                      {isTech && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>Jurisdição Solicitada / Concedida na Aprovação:</span>
                            </span>
                            <span className="text-[10px] text-amber-800 font-medium">
                              {isMaster ? 'O Master pode ajustar os laboratórios antes de aprovar' : 'Ajuste reservado ao Master'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {(['laser', 'sigeo', 'ltgeo'] as LabId[]).map((labId) => {
                              const isGranted = selectedLabs.includes(labId);
                              const wasRequested = u.requestedLabs ? u.requestedLabs.includes(labId) : false;
                              const labInfo = {
                                laser: { name: 'LASER', room: '1B309', activeBg: 'bg-blue-600 border-blue-700 text-white' },
                                sigeo: { name: 'SIGEO', room: '1B307', activeBg: 'bg-emerald-600 border-emerald-700 text-white' },
                                ltgeo: { name: 'LTGEO', room: '1B210', activeBg: 'bg-orange-600 border-orange-700 text-white' },
                              }[labId];

                              return (
                                <button
                                  key={labId}
                                  type="button"
                                  disabled={!isMaster}
                                  onClick={() => togglePendingLab(u.id, labId, selectedLabs)}
                                  className={`p-2 rounded-lg border text-left transition flex items-center justify-between ${
                                    isGranted
                                      ? `${labInfo.activeBg} shadow-xs font-bold`
                                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 font-normal'
                                  } ${!isMaster ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                  title={
                                    isMaster
                                      ? wasRequested
                                        ? `Solicitado no cadastro pelo técnico. Clique para ${isGranted ? 'remover' : 'conceder'}.`
                                        : `Não foi solicitado no cadastro. Clique para ${isGranted ? 'remover' : 'conceder'}.`
                                      : 'Apenas o Master pode modificar laboratórios concedidos'
                                  }
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold">{labInfo.name}</span>
                                      <span className="text-[10px] opacity-80 font-normal">({labInfo.room})</span>
                                    </div>
                                    <div className="text-[9px] mt-0.5">
                                      {wasRequested ? '★ Solicitado no cadastro' : 'Não solicitado'}
                                    </div>
                                  </div>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                                    isGranted ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                                  }`}>
                                    {isGranted ? 'Autorizado ✓' : 'Bloqueado ✕'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <p className="text-[10px] text-amber-900/80 leading-relaxed">
                            💡 <strong>Garantia de Jurisdição:</strong> Este técnico só poderá aprovar reservas, gerenciar instrumentos e editar horários nos laboratórios com status <strong>Autorizado ✓</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lista de Contas Ativas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              Usuários Registrados no Sistema ({usersList.length})
            </div>
            
            <div className="divide-y divide-slate-100 text-xs">
              {usersList.map(u => (
                <div key={u.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {u.avatarInitials || u.name[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[11px] text-slate-500 block">{u.email} • {u.documentId}</span>
                      {u.role === 'tecnico' && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-400 font-medium">Laboratórios:</span>
                          {(u.assignedLabs && u.assignedLabs.length > 0 ? u.assignedLabs : ['laser', 'sigeo']).map(l => (
                            <span 
                              key={l} 
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                l === 'laser' ? 'bg-blue-100 text-blue-800' :
                                l === 'sigeo' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'coordenador' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : u.role === 'tecnico'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {u.role}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA: BANCO ONLINE (FIREBASE & SUPABASE) */}
      {activeAdminTab === 'nuvem' && (
        <div className="space-y-6 max-w-3xl">
          
          {/* CARD PRINCIPAL: GOOGLE FIREBASE FIRESTORE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">Banco de Dados em Nuvem (Google Firebase Firestore)</h4>
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Recomendado para Apresentação
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sincronização em tempo real: qualquer pessoa que abrir o sistema pelo celular ou computador atualiza a tela do apresentador instantaneamente.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {firebaseConfig.isConnected ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-800">Conectado ({firebaseConfig.projectId})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-xs font-semibold text-slate-600">Modo Local (LocalStorage)</span>
                </div>
              )}
            </div>

            {/* Ações quando conectado */}
            {firebaseConfig.isConnected ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">Conexão Ativa com o Firestore</span>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5">
                      Projeto: <strong>{firebaseConfig.projectId}</strong> • Sincronização em tempo real habilitada.
                    </p>
                  </div>

                  <button
                    onClick={handleDisconnectFirebase}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition cursor-pointer"
                  >
                    Desconectar
                  </button>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-[11px] text-emerald-900 font-medium">
                    Clique abaixo para enviar todas as aulas, chamados e equipamentos locais para a nuvem:
                  </span>

                  <button
                    onClick={handlePushAllToFirebase}
                    disabled={isSeedingFb}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSeedingFb ? 'animate-spin' : ''}`} />
                    <span>{isSeedingFb ? 'Sincronizando...' : 'Sincronizar Todas as Tabelas com o Firebase'}</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Formulário de Configuração do Firebase */}
            <form onSubmit={handleTestFirebase} className="space-y-4">
              
              {/* Opção Rápida de Colar Código */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Opção Rápida: Cole aqui o bloco do Firebase Console:</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "seu-projeto-123",\n  authDomain: "seu-projeto.firebaseapp.com"\n};`}
                  value={fbSnippet}
                  onChange={(e) => handleParseSnippet(e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 block">
                  Ao colar o bloco de código gerado no console do Firebase, os campos abaixo são preenchidos automaticamente.
                </span>
              </div>

              {/* Campos Manuais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Project ID (Firebase):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: gestao-laser-sigeo"
                    value={fbProjectId}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Web API Key (apiKey):</label>
                  <input
                    type="password"
                    required
                    placeholder="AIzaSy..."
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Auth Domain (Opcional):</label>
                  <input
                    type="text"
                    placeholder="projeto.firebaseapp.com"
                    value={fbAuthDomain}
                    onChange={(e) => setFbAuthDomain(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">App ID (Opcional):</label>
                  <input
                    type="text"
                    placeholder="1:123456:web:..."
                    value={fbAppId}
                    onChange={(e) => setFbAppId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              {fbTestResult && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  fbTestResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {fbTestResult.message}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isTestingFb}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Flame className="w-4 h-4" />
                  <span>{isTestingFb ? 'Testando Conexão...' : 'Testar e Conectar ao Firebase'}</span>
                </button>
              </div>
            </form>

            {/* Guia Rápido de 2 Minutos para Criar o Banco */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>📖 Como criar o banco gratuito no Firebase em 2 minutos:</span>
                </span>
                <a 
                  href="https://console.firebase.google.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-600 hover:underline flex items-center gap-1 font-bold text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" /> Abrir Firebase Console
                </a>
              </div>

              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600 leading-relaxed">
                <li>Acesse <strong>console.firebase.google.com</strong> e clique em <strong>Adicionar projeto</strong> (ex: <em>laser-sigeo</em>).</li>
                <li>No menu lateral, clique em <strong>Firestore Database</strong> &gt; <strong>Criar banco de dados</strong> e marque a opção <strong>Modo de teste (Test mode)</strong> para permitir gravação imediata na apresentação.</li>
                <li>Clique no ícone de engrenagem ⚙️ (Configurações do projeto) &gt; Role até <strong>Seus aplicativos</strong> &gt; Clique no ícone Web <strong>&lt;/&gt;</strong>.</li>
                <li>Copie o trecho <code>const firebaseConfig = &#123; ... &#125;</code> e cole no campo acima!</li>
              </ol>
            </div>
          </div>

          {/* CARD SECUNDÁRIO: SUPABASE / POSTGRESQL (OPCIONAL) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Cloud className="w-5 h-5 text-blue-600" />
                <span>Opção Alternativa: Banco de Dados Relacional (Supabase / PostgreSQL)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Caso prefira banco SQL relacional para armazenamento permanente em servidor da universidade.
              </p>
            </div>

            <form onSubmit={handleTestCloud} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project URL (Supabase):</label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Anon API Key:</label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={sbKey}
                    onChange={(e) => setSbKey(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              {cloudTestResult && (
                <div className={`p-3 rounded-xl border text-xs font-semibold ${
                  cloudTestResult.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {cloudTestResult.message}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isTestingCloud}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isTestingCloud ? 'Testando Conexão...' : 'Testar Conexão Supabase'}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* 5. ABA: HISTÓRICO GERAL */}
      {activeAdminTab === 'historico' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-700">
            Histórico Geral de Solicitações
          </div>

          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Protocolo</th>
                <th className="p-3">Data</th>
                <th className="p-3">Lab</th>
                <th className="p-3">Atividade</th>
                <th className="p-3">Solicitante</th>
                <th className="p-3">Decisão / Responsável</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {processedRequests.map(res => (
                <tr key={res.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-blue-700">{res.protocol}</td>
                  <td className="p-3">{formatDateBR(res.date)} ({res.startTime}-{res.endTime})</td>
                  <td className="p-3 uppercase font-bold">{res.labId}</td>
                  <td className="p-3 font-bold text-slate-900">{res.title}</td>
                  <td className="p-3">{res.applicantName}</td>
                  <td className="p-3">
                    {res.userTeacher && (
                      <span className="text-[10px] text-blue-700 font-semibold block">
                        Uso: <strong>{res.userTeacher}</strong>
                      </span>
                    )}
                    {(res.responsibleTeacher || res.supervisorName) && (
                      <span className="text-[10px] text-amber-800 font-medium block">
                        Resp: {res.responsibleTeacher || res.supervisorName}
                      </span>
                    )}
                    {res.reviewedBy ? (
                      <span className="text-[10px] text-slate-500 block">
                        Por: <strong>{res.reviewedBy.userName}</strong> ({res.reviewedBy.userRole})
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block">Automático</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      res.status === 'aprovada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openReservationModalForEdit(res)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition cursor-pointer"
                        title="Modificar dados ou horário da reserva"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          const isRec = Boolean(res.isRecurring && res.recurrenceGroupId);
                          const deleteWhole = isRec ? confirm(`Esta reserva faz parte de uma série recorrente.\n\nClique em OK para excluir TODAS as ${res.recurrenceTotalWeeks || ''} semanas.\nClique em CANCELAR para excluir apenas esta reserva de ${formatDateBR(res.date)}.`) : false;
                          deleteReservation(res.id, deleteWhole);
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                        title="Excluir definitivamente do banco de dados"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. ABA EXCLUSIVA DO MASTER: CONTROLE E DELEGAÇÃO DE PERMISSÕES TÉCNICAS */}
      {activeAdminTab === 'permissoes' && isMaster && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-3xl text-white border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-md">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold">Painel de Governança & Delegação Técnica</h4>
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded uppercase">
                    Exclusivo Leonardo Cardoso
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Como Administrador Master, somente você tem autoridade para declarar e revogar quais técnicos ou usuários possuem permissão para inspecionar a Central de E-mails, aprovar reservas, atender manutenções e homologar softwares.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 bg-slate-800/80 border border-slate-700 p-3 rounded-2xl text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400">Usuários no Sistema</div>
              <div className="text-lg font-black text-amber-400">{usersList.length} cadastrados</div>
            </div>
          </div>

          {/* Lista de Usuários e Suas Permissões Granulares */}
          <div className="space-y-4">
            {usersList
              .filter(u => u.id !== 'usr-master' && u.email.toLowerCase() !== 'leonardo.cardoso@ufu.br')
              .map(u => {
                const perms = u.permissions || {};
                return (
                  <div 
                    key={u.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
                  >
                    {/* Cabeçalho do Usuário */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                          {u.avatarInitials || u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{u.name}</span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                              {u.roleTitle || u.role}
                            </span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                              u.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {u.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {u.email} • {u.documentId}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {u.department}
                      </div>
                    </div>

                    {/* Atribuição de Laboratórios para Técnicos */}
                    {u.role === 'tecnico' && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            Laboratórios sob Atuação deste Técnico:
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Permissão de aprovação, edição e equipamentos vinculada aos labs selecionados
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {/* LASER */}
                          <button
                            type="button"
                            onClick={() => {
                              const current = u.assignedLabs || ['laser', 'sigeo'];
                              const next: LabId[] = current.includes('laser') 
                                ? current.filter(l => l !== 'laser') 
                                : [...current, 'laser'];
                              updateUserPermissions(u.id, perms, next);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                              (u.assignedLabs || ['laser', 'sigeo']).includes('laser')
                                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                              <div>
                                <span className="text-xs block">LASER</span>
                                <span className="text-[10px] text-slate-400 font-normal">Sala 1B309</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                              (u.assignedLabs || ['laser', 'sigeo']).includes('laser') 
                                ? 'bg-blue-200 text-blue-900' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {(u.assignedLabs || ['laser', 'sigeo']).includes('laser') ? 'Ativo ✓' : 'Inativo'}
                            </span>
                          </button>

                          {/* SIGEO */}
                          <button
                            type="button"
                            onClick={() => {
                              const current = u.assignedLabs || ['laser', 'sigeo'];
                              const next: LabId[] = current.includes('sigeo') 
                                ? current.filter(l => l !== 'sigeo') 
                                : [...current, 'sigeo'];
                              updateUserPermissions(u.id, perms, next);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                              (u.assignedLabs || ['laser', 'sigeo']).includes('sigeo')
                                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                              <div>
                                <span className="text-xs block">SIGEO</span>
                                <span className="text-[10px] text-slate-400 font-normal">Sala 1B307</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                              (u.assignedLabs || ['laser', 'sigeo']).includes('sigeo') 
                                ? 'bg-emerald-200 text-emerald-900' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {(u.assignedLabs || ['laser', 'sigeo']).includes('sigeo') ? 'Ativo ✓' : 'Inativo'}
                            </span>
                          </button>

                          {/* LTGEO */}
                          <button
                            type="button"
                            onClick={() => {
                              const current = u.assignedLabs || ['laser', 'sigeo'];
                              const next: LabId[] = current.includes('ltgeo') 
                                ? current.filter(l => l !== 'ltgeo') 
                                : [...current, 'ltgeo'];
                              updateUserPermissions(u.id, perms, next);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                              (u.assignedLabs || ['laser', 'sigeo']).includes('ltgeo')
                                ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20 text-orange-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 shrink-0" />
                              <div>
                                <span className="text-xs block">LTGEO</span>
                                <span className="text-[10px] text-slate-400 font-normal">Sala 1B210</span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                              (u.assignedLabs || ['laser', 'sigeo']).includes('ltgeo') 
                                ? 'bg-orange-200 text-orange-900' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {(u.assignedLabs || ['laser', 'sigeo']).includes('ltgeo') ? 'Ativo ✓' : 'Inativo'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Matriz de Permissões Toggles */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Permissões Atribuídas por Leonardo Cardoso:
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        
                        {/* 1. Central de E-mails */}
                        <button
                          type="button"
                          onClick={() => updateUserPermissions(u.id, { canViewEmails: !perms.canViewEmails })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                            perms.canViewEmails 
                              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 text-blue-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${perms.canViewEmails ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>Central de E-mails</span>
                              <span className={`text-[10px] font-black uppercase ${perms.canViewEmails ? 'text-blue-700' : 'text-slate-400'}`}>
                                {perms.canViewEmails ? 'Liberado ✓' : 'Bloqueado'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                              Permite ler e inspecionar e-mails e protocolos de todos os solicitantes.
                            </p>
                          </div>
                        </button>

                        {/* 2. Homologar Reservas */}
                        <button
                          type="button"
                          onClick={() => updateUserPermissions(u.id, { canApproveBookings: !perms.canApproveBookings })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                            perms.canApproveBookings 
                              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${perms.canApproveBookings ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>Aprovar / Recusar Horários</span>
                              <span className={`text-[10px] font-black uppercase ${perms.canApproveBookings ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {perms.canApproveBookings ? 'Liberado ✓' : 'Bloqueado'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                              Permite aceitar ou indeferir agendamentos de salas LASER e SIGEO.
                            </p>
                          </div>
                        </button>

                        {/* 3. Atender Manutenções */}
                        <button
                          type="button"
                          onClick={() => updateUserPermissions(u.id, { canManageEquipment: !perms.canManageEquipment })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                            perms.canManageEquipment 
                              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 text-purple-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${perms.canManageEquipment ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <Cpu className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>Gestão de Máquinas</span>
                              <span className={`text-[10px] font-black uppercase ${perms.canManageEquipment ? 'text-purple-700' : 'text-slate-400'}`}>
                                {perms.canManageEquipment ? 'Liberado ✓' : 'Bloqueado'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                              Permite intervir em computadores e instrumentos com chamado técnico.
                            </p>
                          </div>
                        </button>

                        {/* 4. Homologar Softwares */}
                        <button
                          type="button"
                          onClick={() => updateUserPermissions(u.id, { canManageSoftware: !perms.canManageSoftware })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                            perms.canManageSoftware 
                              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${perms.canManageSoftware ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>Homologar Softwares</span>
                              <span className={`text-[10px] font-black uppercase ${perms.canManageSoftware ? 'text-indigo-700' : 'text-slate-400'}`}>
                                {perms.canManageSoftware ? 'Liberado ✓' : 'Bloqueado'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                              Permite instalar programas solicitados por docentes e alunos nas bancadas.
                            </p>
                          </div>
                        </button>

                        {/* 5. Trilha de Auditoria */}
                        <button
                          type="button"
                          onClick={() => updateUserPermissions(u.id, { canViewAudit: !perms.canViewAudit })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                            perms.canViewAudit 
                              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 text-amber-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${perms.canViewAudit ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>Trilha de Auditoria</span>
                              <span className={`text-[10px] font-black uppercase ${perms.canViewAudit ? 'text-amber-700' : 'text-slate-400'}`}>
                                {perms.canViewAudit ? 'Liberado ✓' : 'Bloqueado'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                              Permite exportar e auditar todas as ações executadas no SILAB.
                            </p>
                          </div>
                        </button>

                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Modal de Recusa com Justificativa */}
      {rejectingId && (() => {
        const targetRes = reservations.find(r => r.id === rejectingId);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Justificativa da Recusa</h4>
              <p className="text-xs text-slate-500">
                A justificativa será gravada na trilha de auditoria sob seu nome ({currentUser?.name}).
              </p>

              <form onSubmit={handleConfirmReject} className="space-y-3">
                <textarea
                  required
                  rows={3}
                  placeholder="Informe o motivo da recusa para o solicitante..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 font-medium"
                />

                {targetRes?.isRecurring && targetRes.recurrenceGroupId && (
                  <label className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rejectWholeSeries}
                      onChange={(e) => setRejectWholeSeries(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold flex items-center gap-1">
                        <Repeat className="w-3.5 h-3.5 text-rose-600" />
                        Recusar toda a série ({targetRes.recurrenceTotalWeeks || 'todas'} semanas)
                      </span>
                      <p className="text-[10px] text-rose-700 font-normal">
                        Se desmarcado, apenas esta data pontual será recusada.
                      </p>
                    </div>
                  </label>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingId(null);
                      setRejectWholeSeries(false);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-500 cursor-pointer"
                  >
                    Confirmar Recusa
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
