import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LabId, 
  LabInfo, 
  FixedClass, 
  Reservation, 
  Equipment, 
  ScheduleEvent, 
  UserRole,
  UserAccount,
  AuditLog,
  ParsedPdfClass,
  CloudConfig,
  ReservationStatus
} from '../types';
import { 
  LABS_INFO, 
  INITIAL_FIXED_CLASSES, 
  INITIAL_RESERVATIONS, 
  INITIAL_EQUIPMENTS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import { 
  checkTimeOverlap, 
  generateProtocol, 
  formatDateBR 
} from '../utils/dateHelpers';
import { getSavedCloudConfig, saveCloudConfig } from '../services/supabaseClient';

interface CheckAvailabilityResult {
  available: boolean;
  conflictReason?: string;
  conflictingEvent?: string;
}

interface LabContextType {
  labs: Record<LabId, LabInfo>;
  selectedLab: 'all' | LabId;
  setSelectedLab: (lab: 'all' | LabId) => void;
  referenceDate: Date;
  setReferenceDate: (date: Date) => void;
  fixedClasses: FixedClass[];
  reservations: Reservation[];
  equipments: Equipment[];
  auditLogs: AuditLog[];
  usersList: UserAccount[];
  
  // Autenticação & Usuário Ativo (Inicia SEMPRE deslogado como visitante)
  currentUser: UserAccount | null;
  currentProfile: UserRole;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password?: string, directUser?: UserAccount) => boolean;
  logout: () => void;
  registerUser: (user: UserAccount) => void;
  approveUserAccount: (userId: string) => void;
  rejectUserAccount: (userId: string) => void;

  // Nuvem / Supabase
  cloudConfig: CloudConfig;
  setCloudConfig: (cfg: CloudConfig) => void;
  
  // Modais de Reserva e Regras
  isBookingOpen: boolean;
  setIsBookingOpen: (open: boolean) => void;
  isRulesOpen: boolean;
  setIsRulesOpen: (open: boolean) => void;
  selectedEventDetail: ScheduleEvent | null;
  setSelectedEventDetail: (event: ScheduleEvent | null) => void;

  // Modal de Edição / Criação de Aula
  isClassModalOpen: boolean;
  setIsClassModalOpen: (open: boolean) => void;
  editingClass: FixedClass | null;
  openClassModalForEdit: (fixedClass: FixedClass) => void;
  openClassModalForNew: (labId?: LabId, dayOfWeek?: number, startTime?: string) => void;
  
  // Pré-seleção ao clicar na grade
  bookingPreselection: {
    labId?: LabId;
    date?: string;
    startTime?: string;
  };
  openBookingWithPreselection: (labId?: LabId, date?: string, startTime?: string) => void;

  // Ações de Reserva (Abertas a todos para solicitar; aprovação restrita)
  checkAvailability: (
    labId: LabId, 
    date: string, 
    startTime: string, 
    endTime: string, 
    excludeReservationId?: string
  ) => CheckAvailabilityResult;
  
  createReservation: (data: Omit<Reservation, 'id' | 'protocol' | 'status' | 'createdAt' | 'updatedAt'>) => {
    success: boolean;
    protocol?: string;
    error?: string;
  };

  approveReservation: (id: string, adminNotes?: string) => void;
  rejectReservation: (id: string, reason: string) => void;
  cancelReservation: (id: string) => void;

  // Ações de Aulas Fixas (Apenas Coordenadores e Técnicos)
  addFixedClass: (classData: Omit<FixedClass, 'id'>) => void;
  editFixedClass: (id: string, updatedData: Partial<Omit<FixedClass, 'id'>>) => void;
  deleteFixedClass: (id: string) => void;
  bulkImportPdfClasses: (classes: ParsedPdfClass[], sourceDocument: string) => void;

  // Ações de Equipamentos (Apenas Técnicos/Monitores e Coordenadores)
  updateEquipmentStatus: (id: string, status: Equipment['status']) => void;

  // Utilitários
  getEventsForDate: (dateStr: string, labFilter?: 'all' | LabId) => ScheduleEvent[];
  getPendingRequestsCount: () => number;
  getPendingUsersCount: () => number;
  resetToDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLASSES: 'laser_sigeo_classes_official_v4',
  RESERVATIONS: 'laser_sigeo_reservations_v4',
  EQUIPMENTS: 'laser_sigeo_equipments_v4',
  AUDIT: 'laser_sigeo_audit_v4',
  USERS_LIST: 'laser_sigeo_users_list_v4'
};

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labs] = useState<Record<LabId, LabInfo>>(LABS_INFO);
  const [selectedLab, setSelectedLab] = useState<'all' | LabId>('all');
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  
  // SEMPRE INICIA DESLOGADO (VISITANTE)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cloudConfig, setCloudConfigState] = useState<CloudConfig>(getSavedCloudConfig());

  const setCloudConfig = (cfg: CloudConfig) => {
    setCloudConfigState(cfg);
    saveCloudConfig(cfg);
  };

  const currentProfile: UserRole = currentUser ? currentUser.role : 'visitante';

  const [fixedClasses, setFixedClasses] = useState<FixedClass[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : INITIAL_FIXED_CLASSES;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EQUIPMENTS);
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Modais
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<ScheduleEvent | null>(null);
  
  // Modal de Edição de Aulas
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<FixedClass | null>(null);

  const [bookingPreselection, setBookingPreselection] = useState<{ labId?: LabId; date?: string; startTime?: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(fixedClasses));
  }, [fixedClasses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(equipments));
  }, [equipments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(usersList));
  }, [usersList]);

  // Auth methods
  const login = (email: string, password?: string, directUser?: UserAccount): boolean => {
    if (directUser) {
      if (directUser.status === 'pendente') {
        showToast('Esta conta está aguardando aprovação dos gestores.');
        return false;
      }
      setCurrentUser(directUser);
      showToast(`Bem-vindo, ${directUser.name}! (${directUser.role.toUpperCase()})`);
      return true;
    }

    const found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.status === 'pendente') {
        showToast('Sua conta ainda está pendente de confirmação pela coordenação.');
        return false;
      }
      setCurrentUser(found);
      showToast(`Bem-vindo, ${found.name}! (${found.role.toUpperCase()})`);
      return true;
    }

    // Se cadastrou na hora, entra como pendente
    const autoUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: 'aluno',
      documentId: 'Matrícula Pendente',
      department: 'Engenharia de Agrimensura',
      status: 'pendente',
      createdAt: new Date().toISOString()
    };
    setUsersList(prev => [...prev, autoUser]);
    showToast(`Conta criada! Aguarde a aprovação do coordenador/técnico.`);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Você saiu. Modo público ativo.');
  };

  const registerUser = (user: UserAccount) => {
    setUsersList(prev => [...prev, user]);
    showToast(`Cadastro recebido! A conta de ${user.name} aguarda confirmação dos gestores.`);
  };

  const approveUserAccount = (userId: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas coordenadores e técnicos podem aprovar contas.');
      return;
    }

    const target = usersList.find(u => u.id === userId);
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: 'ativo' } : u));
    
    if (target) {
      logAudit(
        'usuario_aprovado',
        target.id,
        'usuario',
        `Conta: ${target.name} (${target.email})`,
        `Cadastro de usuário APROVADO pelo gestor ${currentUser.name}. Perfil liberado: ${target.role}.`
      );
    }

    showToast(`Conta de ${target?.name} aprovada com sucesso!`);
  };

  const rejectUserAccount = (userId: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas coordenadores e técnicos podem rejeitar contas.');
      return;
    }

    const target = usersList.find(u => u.id === userId);
    setUsersList(prev => prev.filter(u => u.id !== userId));

    if (target) {
      logAudit(
        'usuario_recusado',
        target.id,
        'usuario',
        `Conta: ${target.name} (${target.email})`,
        `Cadastro de usuário RECUSADO/REMOVIDO pelo gestor ${currentUser.name}.`
      );
    }

    showToast(`Cadastro de ${target?.name} recusado.`);
  };

  const logAudit = (
    actionType: AuditLog['actionType'],
    targetId: string,
    targetType: AuditLog['targetType'],
    targetTitle: string,
    details: string,
    applicantDetails?: AuditLog['applicantDetails']
  ) => {
    const actor = currentUser || {
      id: 'usr-visitante',
      name: 'Visitante (Sem Login)',
      email: 'publico@universidade.edu.br',
      role: 'visitante' as UserRole
    };

    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actionType,
      targetId,
      targetType,
      targetTitle,
      performedBy: {
        id: actor.id,
        name: actor.name,
        email: actor.email,
        role: actor.role
      },
      applicantDetails,
      details,
      timestamp: new Date().toISOString()
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const openBookingWithPreselection = (labId?: LabId, date?: string, startTime?: string) => {
    // Qualquer pessoa pode solicitar
    setBookingPreselection({ labId, date, startTime });
    setIsBookingOpen(true);
  };

  const openClassModalForEdit = (fixedClass: FixedClass) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas coordenadores e técnicos podem editar aulas da grade.');
      return;
    }
    setEditingClass(fixedClass);
    setIsClassModalOpen(true);
  };

  const openClassModalForNew = (labId: LabId = 'sigeo', dayOfWeek: number = 1, startTime: string = '08:50') => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas coordenadores e técnicos podem cadastrar aulas.');
      return;
    }
    setEditingClass({
      id: '',
      labId,
      dayOfWeek,
      startTime,
      endTime: '12:20',
      courseCode: '',
      courseName: '',
      professor: '',
      semester: '2026/1'
    });
    setIsClassModalOpen(true);
  };

  const checkAvailability = (
    labId: LabId, 
    date: string, 
    startTime: string, 
    endTime: string, 
    excludeReservationId?: string
  ): CheckAvailabilityResult => {
    const targetDate = new Date(date + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();

    if (dayOfWeek === 0) {
      return {
        available: false,
        conflictReason: 'Os laboratórios não abrem aos domingos.'
      };
    }

    const classConflict = fixedClasses.find(fc => 
      fc.labId === labId &&
      fc.dayOfWeek === dayOfWeek &&
      checkTimeOverlap(startTime, endTime, fc.startTime, fc.endTime)
    );

    if (classConflict) {
      return {
        available: false,
        conflictReason: `Conflito com aula da grade: ${classConflict.courseName} (${classConflict.startTime} - ${classConflict.endTime})`,
        conflictingEvent: classConflict.courseName
      };
    }

    const reservationConflict = reservations.find(res => 
      res.id !== excludeReservationId &&
      res.labId === labId &&
      res.date === date &&
      res.status === 'aprovada' &&
      checkTimeOverlap(startTime, endTime, res.startTime, res.endTime)
    );

    if (reservationConflict) {
      return {
        available: false,
        conflictReason: `Conflito com reserva já aprovada: "${reservationConflict.title}" (${reservationConflict.startTime} - ${reservationConflict.endTime})`,
        conflictingEvent: reservationConflict.title
      };
    }

    return { available: true };
  };

  const createReservation = (data: Omit<Reservation, 'id' | 'protocol' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const check = checkAvailability(data.labId, data.date, data.startTime, data.endTime);
    if (!check.available) {
      return {
        success: false,
        error: check.conflictReason || 'Horário indisponível devido a conflito de ocupação.'
      };
    }

    const newProtocol = generateProtocol();
    const nowIso = new Date().toISOString();
    const newReservation: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      protocol: newProtocol,
      status: 'pendente',
      createdById: currentUser?.id,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setReservations(prev => [newReservation, ...prev]);

    logAudit(
      'solicitacao_criada',
      newReservation.id,
      'reserva',
      `${data.title} (${newProtocol})`,
      `Solicitação enviada por ${data.applicantName} (${data.applicantRole}) para o Lab ${data.labId.toUpperCase()} em ${formatDateBR(data.date)} (${data.startTime} às ${data.endTime}).`,
      {
        name: data.applicantName,
        email: data.applicantEmail,
        id: data.applicantId,
        role: data.applicantRole
      }
    );

    showToast(`Solicitação enviada! Protocolo: ${newProtocol}`);
    return {
      success: true,
      protocol: newProtocol
    };
  };

  const approveReservation = (id: string, adminNotes?: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos/monitores e coordenadores têm permissão para aprovar reservas.');
      return;
    }

    const target = reservations.find(r => r.id === id);
    if (!target) return;

    const reviewer = currentUser;

    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        return {
          ...res,
          status: 'aprovada' as ReservationStatus,
          adminNotes: adminNotes || res.adminNotes,
          reviewedBy: {
            userId: reviewer.id,
            userName: reviewer.name,
            userEmail: reviewer.email,
            userRole: reviewer.role,
            actionDate: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
      }
      return res;
    }));

    logAudit(
      'solicitacao_aprovada',
      target.id,
      'reserva',
      `${target.title} (${target.protocol})`,
      `Reserva APROVADA pelo responsável ${reviewer.name} (${reviewer.role}). Inserida na grade do Lab ${target.labId.toUpperCase()} em ${formatDateBR(target.date)}.`,
      {
        name: target.applicantName,
        email: target.applicantEmail,
        id: target.applicantId,
        role: target.applicantRole
      }
    );

    showToast(`Reserva aprovada por ${reviewer.name}!`);
  };

  const rejectReservation = (id: string, reason: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos/monitores e coordenadores têm permissão para recusar reservas.');
      return;
    }

    const target = reservations.find(r => r.id === id);
    if (!target) return;

    const reviewer = currentUser;

    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        return {
          ...res,
          status: 'recusada' as ReservationStatus,
          rejectionReason: reason,
          reviewedBy: {
            userId: reviewer.id,
            userName: reviewer.name,
            userEmail: reviewer.email,
            userRole: reviewer.role,
            actionDate: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
      }
      return res;
    }));

    logAudit(
      'solicitacao_recusada',
      target.id,
      'reserva',
      `${target.title} (${target.protocol})`,
      `Reserva RECUSADA pelo responsável ${reviewer.name} (${reviewer.role}). Motivo: "${reason}".`,
      {
        name: target.applicantName,
        email: target.applicantEmail,
        id: target.applicantId,
        role: target.applicantRole
      }
    );

    showToast('Solicitação recusada e registrada na auditoria.');
  };

  const cancelReservation = (id: string) => {
    const target = reservations.find(r => r.id === id);
    if (!target) return;

    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        return {
          ...res,
          status: 'cancelada' as ReservationStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return res;
    }));

    logAudit(
      'solicitacao_cancelada',
      target.id,
      'reserva',
      `${target.title} (${target.protocol})`,
      `Solicitação cancelada.`,
      {
        name: target.applicantName,
        email: target.applicantEmail,
        id: target.applicantId,
        role: target.applicantRole
      }
    );

    showToast('Reserva cancelada.');
  };

  const addFixedClass = (classData: Omit<FixedClass, 'id'>) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas a Coordenação e Técnicos podem cadastrar disciplinas na grade.');
      return;
    }

    const newClass: FixedClass = {
      ...classData,
      id: `fc-${Date.now()}`
    };
    setFixedClasses(prev => [...prev, newClass]);

    logAudit(
      'aula_adicionada',
      newClass.id,
      'aula_fixa',
      `${classData.courseCode} - ${classData.courseName}`,
      `Disciplina adicionada à grade do Lab ${classData.labId.toUpperCase()} (${classData.startTime} - ${classData.endTime}) por ${currentUser?.name}.`
    );

    showToast(`Disciplina "${classData.courseName}" adicionada à grade!`);
  };

  const editFixedClass = (id: string, updatedData: Partial<Omit<FixedClass, 'id'>>) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas a Coordenação e Técnicos podem editar aulas da grade.');
      return;
    }

    const target = fixedClasses.find(c => c.id === id);
    if (!target) return;

    setFixedClasses(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));

    logAudit(
      'aula_editada',
      target.id,
      'aula_fixa',
      `${updatedData.courseCode || target.courseCode} - ${updatedData.courseName || target.courseName}`,
      `Informações da aula modificadas por ${currentUser?.name} (${currentUser?.role}). Horário: ${updatedData.startTime || target.startTime} às ${updatedData.endTime || target.endTime}.`
    );

    showToast(`Aula "${updatedData.courseName || target.courseName}" atualizada com sucesso!`);
  };

  const deleteFixedClass = (id: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas a Coordenação e Técnicos podem remover disciplinas da grade.');
      return;
    }

    const target = fixedClasses.find(c => c.id === id);
    if (target) {
      logAudit(
        'aula_removida',
        target.id,
        'aula_fixa',
        `${target.courseCode} - ${target.courseName}`,
        `Disciplina removida da grade pelo gestor ${currentUser?.name}.`
      );
    }
    setFixedClasses(prev => prev.filter(c => c.id !== id));
    showToast('Aula removida da grade semestral.');
  };

  const bulkImportPdfClasses = (classes: ParsedPdfClass[], sourceDocument: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas a Coordenação e Técnicos podem importar novas grades via PDF.');
      return;
    }

    const newFixedClasses: FixedClass[] = classes.map((c, idx) => ({
      id: `fc-pdf-${Date.now()}-${idx}`,
      labId: c.suggestedLab,
      dayOfWeek: c.dayOfWeek,
      startTime: c.startTime,
      endTime: c.endTime,
      courseCode: c.courseCode,
      courseName: c.courseName,
      professor: c.professor,
      semester: c.semester,
      importedFromPdf: true
    }));

    setFixedClasses(prev => [...prev, ...newFixedClasses]);

    logAudit(
      'pdf_importado',
      `import-${Date.now()}`,
      'sistema',
      `Importação de Grade PDF (${sourceDocument})`,
      `${newFixedClasses.length} disciplinas cadastradas via leitor de PDF por ${currentUser?.name}.`
    );

    showToast(`${newFixedClasses.length} disciplinas importadas com sucesso!`);
  };

  const updateEquipmentStatus = (id: string, status: Equipment['status']) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos/monitores e coordenadores podem alterar status de equipamentos.');
      return;
    }

    setEquipments(prev => prev.map(eq => eq.id === id ? { ...eq, status } : eq));
    showToast('Status do equipamento atualizado!');
  };

  const getEventsForDate = (dateStr: string, labFilter: 'all' | LabId = selectedLab): ScheduleEvent[] => {
    const targetDate = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = targetDate.getDay();
    const events: ScheduleEvent[] = [];

    fixedClasses
      .filter(fc => (labFilter === 'all' || fc.labId === labFilter) && fc.dayOfWeek === dayOfWeek)
      .forEach(fc => {
        events.push({
          id: `event-${fc.id}`,
          originType: 'fixed_class',
          labId: fc.labId,
          title: fc.courseName,
          subtitle: `${fc.courseCode} • ${fc.professor}`,
          dayOfWeek: fc.dayOfWeek,
          startTime: fc.startTime,
          endTime: fc.endTime,
          type: 'aula_regular',
          responsible: fc.professor,
          highlightColor: fc.highlightColor,
          rawItem: fc
        });
      });

    reservations
      .filter(res => (labFilter === 'all' || res.labId === labFilter) && res.date === dateStr && res.status === 'aprovada')
      .forEach(res => {
        events.push({
          id: `event-${res.id}`,
          originType: 'reservation',
          labId: res.labId,
          title: res.title,
          subtitle: `${res.applicantName} (${res.applicantRole})`,
          date: res.date,
          dayOfWeek: dayOfWeek,
          startTime: res.startTime,
          endTime: res.endTime,
          type: res.purposeType,
          responsible: res.applicantName,
          status: res.status,
          rawItem: res
        });
      });

    return events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getPendingRequestsCount = () => {
    return reservations.filter(r => r.status === 'pendente').length;
  };

  const getPendingUsersCount = () => {
    return usersList.filter(u => u.status === 'pendente').length;
  };

  const resetToDemoData = () => {
    setFixedClasses(INITIAL_FIXED_CLASSES);
    setReservations(INITIAL_RESERVATIONS);
    setEquipments(INITIAL_EQUIPMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setUsersList(INITIAL_USERS);
    setCurrentUser(null);
    localStorage.clear();
    showToast('Dados restaurados para a grade horária oficial. Modo visitante ativo.');
  };

  return (
    <LabContext.Provider
      value={{
        labs,
        selectedLab,
        setSelectedLab,
        referenceDate,
        setReferenceDate,
        fixedClasses,
        reservations,
        equipments,
        auditLogs,
        usersList,
        currentUser,
        currentProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        logout,
        registerUser,
        approveUserAccount,
        rejectUserAccount,
        cloudConfig,
        setCloudConfig,
        isBookingOpen,
        setIsBookingOpen,
        isRulesOpen,
        setIsRulesOpen,
        selectedEventDetail,
        setSelectedEventDetail,
        isClassModalOpen,
        setIsClassModalOpen,
        editingClass,
        openClassModalForEdit,
        openClassModalForNew,
        bookingPreselection,
        openBookingWithPreselection,
        checkAvailability,
        createReservation,
        approveReservation,
        rejectReservation,
        cancelReservation,
        addFixedClass,
        editFixedClass,
        deleteFixedClass,
        bulkImportPdfClasses,
        updateEquipmentStatus,
        getEventsForDate,
        getPendingRequestsCount,
        getPendingUsersCount,
        resetToDemoData,
        toastMessage,
        showToast
      }}
    >
      {children}
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab deve ser utilizado dentro de um LabProvider');
  }
  return context;
};
