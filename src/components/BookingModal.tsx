import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  Cpu, 
  Copy, 
  Check, 
  ShieldAlert,
  Sparkles,
  LogIn,
  Wrench,
  HelpCircle,
  Repeat,
  Lock,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { useLab } from '../context/LabContext';
import { LabId, PurposeType, UserRole } from '../types';
import { formatDateBR } from '../utils/dateHelpers';
import { validateEmailStrict } from '../services/authSecurity';

export const BookingModal: React.FC = () => {
  const { 
    isBookingOpen, 
    setIsBookingOpen, 
    labs, 
    equipments, 
    checkAvailability, 
    createReservation,
    bookingPreselection,
    currentUser,
    setIsAuthModalOpen
  } = useLab();

  // Form states
  const [labId, setLabId] = useState<LabId>('laser');
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [purposeType, setPurposeType] = useState<PurposeType>('tcc');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [applicantRole, setApplicantRole] = useState<UserRole>('aluno');
  const [applicantId, setApplicantId] = useState<string>('');
  const [supervisorName, setSupervisorName] = useState<string>('');
  const [responsibleTeacher, setResponsibleTeacher] = useState<string>('');
  const [userTeacher, setUserTeacher] = useState<string>('');
  const [expectedAttendees, setExpectedAttendees] = useState<number>(1);
  const [requestedEquipments, setRequestedEquipments] = useState<string[]>([]);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [needsTechSupport, setNeedsTechSupport] = useState<boolean>(false);

  // Estados de Recorrência Semanal
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceWeeks, setRecurrenceWeeks] = useState<number>(16); // Padrão: 16 semanas (semestre completo)
  const [recurrenceDates, setRecurrenceDates] = useState<string[]>([]);
  const [recurringConflict, setRecurringConflict] = useState<string | null>(null);
  const [totalCreatedCount, setTotalCreatedCount] = useState<number>(1);

  // Status de conflito e submissão
  const [conflictStatus, setConflictStatus] = useState<{ available: boolean; conflictReason?: string }>({ available: true });
  const [generatedProtocol, setGeneratedProtocol] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Preenchimento automático com dados do usuário logado
  useEffect(() => {
    if (currentUser) {
      setApplicantName(currentUser.name);
      setApplicantEmail(currentUser.email);
      setApplicantRole(currentUser.role);
      setApplicantId(currentUser.documentId);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isBookingOpen) {
      if (bookingPreselection.labId) setLabId(bookingPreselection.labId);
      if (bookingPreselection.date) setDate(bookingPreselection.date);
      if (bookingPreselection.startTime) {
        setStartTime(bookingPreselection.startTime);
        const [h, m] = bookingPreselection.startTime.split(':').map(Number);
        const endH = Math.min(22, h + 3);
        setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
      }
      setGeneratedProtocol(null);
      setTotalCreatedCount(1);
    }
  }, [isBookingOpen, bookingPreselection]);

  // Efeito para verificação de conflitos (considerando todas as semanas caso recorrente)
  useEffect(() => {
    if (date && startTime && endTime) {
      const result = checkAvailability(labId, date, startTime, endTime);
      setConflictStatus(result);

      if (isRecurring && recurrenceWeeks > 1) {
        const initialDate = new Date(date + 'T00:00:00');
        const calculatedDates: string[] = [];
        let conflictFound: string | null = null;

        for (let w = 0; w < recurrenceWeeks; w++) {
          const nextDate = new Date(initialDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);
          const dStr = nextDate.toISOString().split('T')[0];
          calculatedDates.push(dStr);

          if (!conflictFound && w > 0) {
            const chk = checkAvailability(labId, dStr, startTime, endTime);
            if (!chk.available) {
              conflictFound = `Semana ${w + 1} (${formatDateBR(dStr)}): ${chk.conflictReason || 'Horário já ocupado nesta data'}`;
            }
          }
        }
        setRecurrenceDates(calculatedDates);
        setRecurringConflict(conflictFound);
      } else {
        setRecurrenceDates([date]);
        setRecurringConflict(null);
      }
    }
  }, [labId, date, startTime, endTime, isRecurring, recurrenceWeeks]);

  const toggleEquipment = (eqId: string) => {
    setRequestedEquipments(prev => 
      prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
    );
  };

  const handleCopyProtocol = () => {
    if (generatedProtocol) {
      navigator.clipboard.writeText(generatedProtocol);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('É necessário concordar com os termos de uso dos laboratórios.');
      return;
    }

    const targetEmail = (applicantEmail || currentUser?.email || '').trim();
    const emailValidation = validateEmailStrict(targetEmail);
    if (!emailValidation.isValid) {
      alert(emailValidation.error || 'E-mail inválido para recebimento das notificações do SILAB.');
      return;
    }

    if (!conflictStatus.available) {
      alert('Horário indisponível devido a conflito de ocupação.');
      return;
    }

    if (isRecurring && recurringConflict) {
      alert(`Conflito detectado na série recorrente:\n${recurringConflict}\nPor favor, escolha outro horário ou reduza a quantidade de semanas.`);
      return;
    }

    const fullDescription = needsTechSupport 
      ? `[SOLICITAÇÃO DE APOIO TÉCNICO PRESENCIAL (SALA 1B308) INCLUSA]\n${description}`
      : description;

    const res = createReservation(
      {
        labId,
        date,
        startTime,
        endTime,
        purposeType,
        title,
        description: fullDescription,
        applicantName: applicantName || currentUser?.name || 'Solicitante',
        applicantEmail: targetEmail,
        applicantPhone,
        applicantRole: applicantRole || currentUser?.role || 'aluno',
        applicantId: applicantId || currentUser?.documentId || 'Pendente',
        supervisorName: responsibleTeacher || supervisorName || undefined,
        responsibleTeacher: responsibleTeacher || supervisorName || undefined,
        userTeacher: userTeacher || undefined,
        expectedAttendees,
        requestedEquipments
      },
      isRecurring ? { isRecurring: true, weeksCount: recurrenceWeeks } : undefined
    );

    if (res.success && res.protocol) {
      setGeneratedProtocol(res.protocol);
      setTotalCreatedCount(res.totalCreated || 1);
    } else if (res.error) {
      alert(`Não foi possível registrar a reserva:\n${res.error}`);
    }
  };

  if (!isBookingOpen) return null;

  const labEquipments = equipments.filter(eq => eq.labId === labId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative border-b border-slate-800">
          <button
            onClick={() => setIsBookingOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Solicitação de Horário & Apoio Técnico</h3>
              <p className="text-xs text-slate-400 mt-0.5">Reserva de espaço ou auxílio prático de técnicos no Laser / Sigeo</p>
            </div>
          </div>
        </div>

        {/* Tela de Sucesso */}
        {generatedProtocol ? (
          <div className="p-8 text-center space-y-5 animate-scale-up">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">Solicitação Enviada para Análise</h4>
              <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto">
                Sua solicitação no <strong>{labs[labId].name}</strong> foi registrada e enviada para a fila de avaliação dos técnicos responsáveis.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-sm mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Protocolo de Rastreamento</span>
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="font-mono text-xl font-black text-blue-700">
                  {generatedProtocol}
                </span>
                <button
                  onClick={handleCopyProtocol}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer border border-blue-200"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {totalCreatedCount > 1 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 max-w-sm mx-auto text-xs text-indigo-950 flex items-center justify-center gap-2 font-bold shadow-xs">
                <Repeat className="w-4 h-4 text-indigo-600 flex-shrink-0 animate-spin-slow" />
                <span>Série de {totalCreatedCount} semanas registradas com sucesso!</span>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  setIsBookingOpen(false);
                  setGeneratedProtocol(null);
                }}
                className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Voltar aos Horários
              </button>
            </div>
          </div>
        ) : (
          /* Formulário */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Aviso de Usuário Conectado */}
            {currentUser ? (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-center justify-between text-blue-900">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Solicitando como: <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})</span>
                </div>
                <span className="text-[11px] text-blue-600 font-semibold">{currentUser.documentId}</span>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-900">
                <span>Você está solicitando sem login prévio.</span>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3" /> Fazer Login Institucional
                </button>
              </div>
            )}

            {/* 1. SELEÇÃO DO LABORATÓRIO */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Escolha o Laboratório:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setLabId('laser')}
                  className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                    labId === 'laser'
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900">LABORATÓRIO LASER</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Capacidade: {labs.laser.capacity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sensores, Laser Scanner 3D, GNSS e Topografia</p>
                </div>

                <div
                  onClick={() => setLabId('sigeo')}
                  className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                    labId === 'sigeo'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-900">LABORATÓRIO SIGEO</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Capacidade: {labs.sigeo.capacity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">24 Workstations com QGIS, ArcGIS e Metashape</p>
                </div>
              </div>
            </div>

            {/* 2. DATA E INTERVALO */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                2. Data e Horário Desejado:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Data:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Início:</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Término:</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status de Validação */}
              <div className="mt-2.5">
                {conflictStatus.available ? (
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Horário disponível para reserva no {labs[labId].name}!</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{conflictStatus.conflictReason}</span>
                  </div>
                )}
              </div>

              {/* OPÇÃO: REPETIR TODA SEMANA (RECORRÊNCIA SEMANAL) */}
              <div className="mt-3.5 p-3.5 bg-indigo-50/40 border border-indigo-200/80 rounded-2xl space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                      Repetir toda semana neste mesmo dia e horário
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      Evite solicitar semanalmente de forma manual. Ideal para TCC, pesquisa, projetos contínuos ou monitoria.
                    </p>
                  </div>
                </label>

                {isRecurring && (
                  <div className="pt-2.5 border-t border-indigo-200/60 space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Duração da Repetição:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { weeks: 4, label: '4 Semanas', desc: '~1 Mês' },
                          { weeks: 8, label: '8 Semanas', desc: '~2 Meses' },
                          { weeks: 12, label: '12 Semanas', desc: '~3 Meses' },
                          { weeks: 16, label: '16 Semanas', desc: 'Semestre Todo', badge: 'Recomendado' },
                        ].map((opt) => (
                          <button
                            key={opt.weeks}
                            type="button"
                            onClick={() => setRecurrenceWeeks(opt.weeks)}
                            className={`p-2 rounded-xl border text-left transition cursor-pointer relative ${
                              recurrenceWeeks === opt.weeks
                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {opt.badge && (
                              <span className={`absolute -top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                                recurrenceWeeks === opt.weeks ? 'bg-amber-400 text-slate-900' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {opt.badge}
                              </span>
                            )}
                            <div className="text-xs">{opt.label}</div>
                            <div className={`text-[10px] font-normal ${recurrenceWeeks === opt.weeks ? 'text-indigo-100' : 'text-slate-400'}`}>
                              {opt.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Resumo do Período e Conflito */}
                    {recurrenceDates.length > 0 && (
                      <div className="p-3 bg-white rounded-xl border border-indigo-200/70 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-indigo-950 font-bold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            Série Recorrente ({recurrenceWeeks} semanas)
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                            {recurrenceWeeks} semanas vinculadas
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          De <strong>{formatDateBR(recurrenceDates[0])}</strong> até{' '}
                          <strong>{formatDateBR(recurrenceDates[recurrenceDates.length - 1])}</strong>, toda semana das{' '}
                          <strong>{startTime} às {endTime}</strong>.
                        </p>

                        {/* Status de Conflito em Qualquer Semana */}
                        {recurringConflict ? (
                          <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-start gap-1.5 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                            <span><strong>Conflito na série:</strong> {recurringConflict}</span>
                          </div>
                        ) : conflictStatus.available ? (
                          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>Todas as {recurrenceWeeks} semanas consecutivas estão 100% livres e disponíveis!</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. FINALIDADE E OPÇÃO DE APOIO TÉCNICO */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                3. Finalidade & Apoio Técnico:
              </label>

              {/* Checkbox de Apoio Técnico */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needsTechSupport}
                    onChange={(e) => setNeedsTechSupport(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      Solicitar Apoio Técnico / Presença de Técnico de Laboratório
                    </span>
                    <p className="text-[11px] text-blue-800/80 mt-0.5 leading-tight">
                      Marque se você precisa de auxílio para calibração de instrumentos (Laser Scanner, RTK) ou suporte em softwares SIG (QGIS, ArcGIS, Metashape).
                    </p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tipo de Atividade:</label>
                  <select
                    value={purposeType}
                    onChange={(e) => setPurposeType(e.target.value as PurposeType)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="tcc">Trabalho de Conclusão de Curso (TCC)</option>
                    <option value="iniciacao_cientifica">Iniciação Científica / Pesquisa</option>
                    <option value="projeto_extensao">Projeto de Extensão</option>
                    <option value="reposicao">Aula Prática Extra / Reposição</option>
                    <option value="apoio_tecnico">Apoio Técnico / Plantão de Dúvidas</option>
                    <option value="reuniao">Reunião de Grupo de Pesquisa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Qtd. Estimada de Pessoas:</label>
                  <input
                    type="number"
                    min={1}
                    max={labs[labId].capacity}
                    value={expectedAttendees}
                    onChange={(e) => setExpectedAttendees(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* DOCENTES: PROFESSOR EM USO (PÚBLICO) E PROFESSOR RESPONSÁVEL (INTERNO) */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Professores Vinculados à Atividade:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Controle de Visibilidade
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Professor em Uso - Público */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Nome do Professor em Uso (Público):</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Prof. Dr. João Silva"
                      value={userTeacher}
                      onChange={(e) => setUserTeacher(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                      <strong className="text-emerald-700">Público:</strong> Aparece na grade de horários para todos identificarem quem estará ministrando/usando.
                    </p>
                  </div>

                  {/* Professor Responsável - Interno */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Professor Responsável (Uso Interno):</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Prof. Carlos Eduardo (Orientador)"
                      value={responsibleTeacher}
                      onChange={(e) => setResponsibleTeacher(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 font-medium focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-amber-800/80 mt-1 leading-tight">
                      <strong className="text-amber-800">Interno:</strong> Visível apenas para a equipe técnica e coordenadores para autorizações.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Título Resumido da Atividade:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coleta e calibração de miras para escaneamento 3D"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Descrição dos Procedimentos:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva o que será realizado e quais recursos serão necessários..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 4. EQUIPAMENTOS */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                4. Instrumentos Necessários (Opcional):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                {labEquipments.map(eq => (
                  <label
                    key={eq.id}
                    className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                      requestedEquipments.includes(eq.id)
                        ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={requestedEquipments.includes(eq.id)}
                      onChange={() => toggleEquipment(eq.id)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="leading-tight">
                      <div>{eq.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{eq.code}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. DADOS DO SOLICITANTE */}
            {!currentUser && (
              <div className="space-y-2.5 pt-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  5. Seus Dados de Contato:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nome Completo:</label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">E-mail Institucional:</label>
                    <input
                      type="email"
                      required
                      placeholder="email@universidade.edu.br"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Matrícula / SIAPE:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 20240192"
                      value={applicantId}
                      onChange={(e) => setApplicantId(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Termos de Uso */}
            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="leading-tight font-medium">
                  Declaro que li e concordo com o <strong>Regulamento de Uso e Segurança</strong> dos laboratórios, comprometendo-me a zelar pelos instrumentos de precisão.
                </span>
              </label>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={!conflictStatus.available || !agreedTerms || (isRecurring && Boolean(recurringConflict))}
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enviar Solicitação</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
