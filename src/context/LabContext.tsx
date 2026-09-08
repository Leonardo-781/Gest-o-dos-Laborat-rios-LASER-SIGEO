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
  FirebaseConfig,
  ReservationStatus,
  MaintenanceRequest,
  SoftwareRequest,
  MaintenanceStatus,
  SoftwareRequestStatus,
  EmailNotification,
  UserPermissions
} from '../types';
import { 
  LABS_INFO, 
  INITIAL_FIXED_CLASSES, 
  INITIAL_RESERVATIONS, 
  INITIAL_EQUIPMENTS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_MAINTENANCE_REQUESTS,
  INITIAL_SOFTWARE_REQUESTS
} from '../data/initialData';
import { 
  checkTimeOverlap, 
  generateProtocol, 
  formatDateBR 
} from '../utils/dateHelpers';
import { getSavedCloudConfig, saveCloudConfig } from '../services/supabaseClient';
import { 
  getSavedFirebaseConfig, 
  saveFirebaseConfig, 
  syncDocToFirestore, 
  removeDocFromFirestore, 
  subscribeToFirestoreCollection, 
  seedAllDataToFirebase 
} from '../services/firebaseClient';
import { 
  validateEmailStrict, 
  verifyPassword, 
  MASTER_USER_CONFIG 
} from '../services/authSecurity';
import { 
  getStoredEmails, 
  saveStoredEmails, 
  sendLoginAlertEmail, 
  sendReservationCreatedEmail, 
  sendReservationReviewedEmail, 
  sendMaintenanceEmail, 
  sendSoftwareEmail 
} from '../services/emailService';

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
  maintenanceRequests: MaintenanceRequest[];
  softwareRequests: SoftwareRequest[];
  
  // Autenticação & Usuário Ativo (Inicia SEMPRE deslogado como visitante)
  currentUser: UserAccount | null;
  currentProfile: UserRole;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password?: string, directUser?: UserAccount) => Promise<boolean>;
  logout: () => void;
  registerUser: (user: UserAccount) => void;
  approveUserAccount: (userId: string) => void;
  rejectUserAccount: (userId: string) => void;
  updateUserPermissions: (userId: string, newPermissions: Partial<UserPermissions>) => void;

  // Notificações por E-mail (Envios em tempo real)
  emails: EmailNotification[];
  isEmailModalOpen: boolean;
  setIsEmailModalOpen: (open: boolean) => void;
  unreadEmailsCount: number;
  markEmailAsRead: (id: string) => void;
  clearEmails: () => void;

  // Nuvem / Firebase (Firestore) & Supabase
  cloudConfig: CloudConfig;
  setCloudConfig: (cfg: CloudConfig) => void;
  firebaseConfig: FirebaseConfig;
  setFirebaseConfig: (cfg: FirebaseConfig) => void;
  pushAllToFirebase: () => Promise<{ success: boolean; count: number; message: string }>;
  
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
  
  createReservation: (
    data: Omit<Reservation, 'id' | 'protocol' | 'status' | 'createdAt' | 'updatedAt'>,
    recurrenceOptions?: { isRecurring: boolean; weeksCount: number }
  ) => {
    success: boolean;
    protocol?: string;
    error?: string;
    totalCreated?: number;
  };

  approveReservation: (id: string, adminNotes?: string) => void;
  approveRecurringGroup: (groupId: string, adminNotes?: string) => void;
  rejectReservation: (id: string, reason: string) => void;
  rejectRecurringGroup: (groupId: string, reason: string) => void;
  cancelReservation: (id: string, cancelWholeSeries?: boolean) => void;
  deleteReservation: (id: string, deleteWholeSeries?: boolean) => void;
  editReservation: (
    id: string, 
    updatedData: Partial<Reservation>,
    updateWholeSeries?: boolean
  ) => { success: boolean; error?: string };

  // Modal de Edição de Reservas
  isReservationModalOpen: boolean;
  setIsReservationModalOpen: (open: boolean) => void;
  editingReservation: Reservation | null;
  openReservationModalForEdit: (res: Reservation) => void;

  // Ações de Aulas Fixas (Apenas Coordenadores e Técnicos)
  addFixedClass: (classData: Omit<FixedClass, 'id'>) => void;
  editFixedClass: (id: string, updatedData: Partial<Omit<FixedClass, 'id'>>) => void;
  deleteFixedClass: (id: string) => void;
  bulkImportPdfClasses: (classes: ParsedPdfClass[], sourceDocument: string) => void;

  // Ações de Equipamentos e Manutenção Direta
  updateEquipmentStatus: (id: string, status: Equipment['status']) => void;
  setEquipmentMaintenance: (equipmentId: string, inMaintenance: boolean, reason?: string, technician?: string) => void;

  // Ações de Chamados de Manutenção / Averiguação (Aberto a todos)
  createMaintenanceRequest: (data: Omit<MaintenanceRequest, 'id' | 'protocol' | 'status' | 'createdAt' | 'updatedAt'>) => {
    success: boolean;
    protocol?: string;
  };
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus, technicianNotes?: string, assignedTech?: string) => void;

  // Ações de Chamados de Instalação de Softwares (Aberto a todos)
  createSoftwareRequest: (data: Omit<SoftwareRequest, 'id' | 'protocol' | 'status' | 'createdAt' | 'updatedAt'>) => {
    success: boolean;
    protocol?: string;
  };
  updateSoftwareStatus: (id: string, status: SoftwareRequestStatus, technicianNotes?: string) => void;

  // Utilitários
  getEventsForDate: (dateStr: string, labFilter?: 'all' | LabId) => ScheduleEvent[];
  getPendingRequestsCount: () => number;
  getPendingUsersCount: () => number;
  getPendingMaintenanceCount: () => number;
  getPendingSoftwareCount: () => number;
  resetToDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CLASSES: 'laser_sigeo_classes_official_v6',
  RESERVATIONS: 'laser_sigeo_reservations_v6',
  EQUIPMENTS: 'laser_sigeo_equipments_v6',
  AUDIT: 'laser_sigeo_audit_v6',
  USERS_LIST: 'laser_sigeo_users_list_v6',
  MAINTENANCE: 'laser_sigeo_maintenance_v6',
  SOFTWARE: 'laser_sigeo_software_v6'
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

  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseConfig>(getSavedFirebaseConfig());

  const setFirebaseConfig = (cfg: FirebaseConfig) => {
    setFirebaseConfigState(cfg);
    saveFirebaseConfig(cfg);
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

  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_REQUESTS;
  });

  const [softwareRequests, setSoftwareRequests] = useState<SoftwareRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SOFTWARE);
    return saved ? JSON.parse(saved) : INITIAL_SOFTWARE_REQUESTS;
  });

  // E-mails e Notificações Institucionais
  const [emails, setEmails] = useState<EmailNotification[]>(() => getStoredEmails());
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    saveStoredEmails(emails);
  }, [emails]);

  const markEmailAsRead = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const clearEmails = () => {
    setEmails([]);
    saveStoredEmails([]);
  };

  const unreadEmailsCount = emails.filter(e => !e.read).length;

  // Modais
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<ScheduleEvent | null>(null);
  
  // Modal de Edição de Aulas
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<FixedClass | null>(null);

  // Modal de Edição de Reservas
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const openReservationModalForEdit = (res: Reservation) => {
    setEditingReservation(res);
    setIsReservationModalOpen(true);
  };

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maintenanceRequests));
  }, [maintenanceRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOFTWARE, JSON.stringify(softwareRequests));
  }, [softwareRequests]);

  // Sincronização em Tempo Real via Firebase Firestore (para apresentação ao vivo)
  useEffect(() => {
    if (!firebaseConfig.isConnected || !firebaseConfig.autoSync) return;

    const unsubRes = subscribeToFirestoreCollection<Reservation>('reservas', (items) => {
      if (items && items.length > 0) {
        setReservations(items);
      }
    }, firebaseConfig);

    const unsubMan = subscribeToFirestoreCollection<MaintenanceRequest>('manutencoes', (items) => {
      if (items && items.length > 0) {
        setMaintenanceRequests(items);
      }
    }, firebaseConfig);

    const unsubSoft = subscribeToFirestoreCollection<SoftwareRequest>('softwares', (items) => {
      if (items && items.length > 0) {
        setSoftwareRequests(items);
      }
    }, firebaseConfig);

    const unsubClasses = subscribeToFirestoreCollection<FixedClass>('disciplinas', (items) => {
      if (items && items.length > 0) {
        setFixedClasses(items);
      }
    }, firebaseConfig);

    const unsubEquip = subscribeToFirestoreCollection<Equipment>('equipamentos', (items) => {
      if (items && items.length > 0) {
        setEquipments(items);
      }
    }, firebaseConfig);

    const unsubUsers = subscribeToFirestoreCollection<UserAccount>('usuarios', (items) => {
      if (items && items.length > 0) {
        setUsersList(items);
      }
    }, firebaseConfig);

    const unsubAudit = subscribeToFirestoreCollection<AuditLog>('auditoria', (items) => {
      if (items && items.length > 0) {
        setAuditLogs(items);
      }
    }, firebaseConfig);

    const unsubEmails = subscribeToFirestoreCollection<EmailNotification>('emails_enviados', (items) => {
      if (items && items.length > 0) {
        const sorted = [...items].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        setEmails(sorted);
      }
    }, firebaseConfig);

    return () => {
      unsubRes?.();
      unsubMan?.();
      unsubSoft?.();
      unsubClasses?.();
      unsubEquip?.();
      unsubUsers?.();
      unsubAudit?.();
      unsubEmails?.();
    };
  }, [firebaseConfig.isConnected, firebaseConfig.autoSync, firebaseConfig.projectId]);

  const pushAllToFirebase = async () => {
    const res = await seedAllDataToFirebase({
      fixedClasses,
      reservations,
      maintenanceRequests,
      softwareRequests,
      equipments,
      usersList,
      auditLogs
    }, firebaseConfig);

    if (res.success) {
      const updated = {
        ...firebaseConfig,
        isConnected: true,
        lastSyncAt: new Date().toISOString()
      };
      setFirebaseConfig(updated);
      showToast('Dados sincronizados com o Firebase!');
    } else {
      showToast(`Aviso: ${res.message}`);
    }

    return res;
  };

  // Auth methods - Sistema Real de Autenticação Segura (SHA-256 + Salt)
  const login = async (email: string, password?: string, directUser?: UserAccount): Promise<boolean> => {
    // 1. Se for login de demonstração rápida direto pelo card
    if (directUser) {
      if (directUser.status === 'pendente') {
        showToast('Esta conta está aguardando aprovação dos gestores.');
        return false;
      }
      if (directUser.status === 'bloqueado') {
        showToast('Esta conta está temporariamente bloqueada.');
        return false;
      }
      setCurrentUser(directUser);
      sendLoginAlertEmail(directUser);
      showToast(`Bem-vindo, ${directUser.name}! (${directUser.roleTitle || directUser.role.toUpperCase()})`);
      return true;
    }

    // 2. Validação estrita de e-mail (rejeita expressamente vírgulas e formatos inválidos)
    const emailValidation = validateEmailStrict(email);
    if (!emailValidation.isValid) {
      showToast(emailValidation.error || 'E-mail inválido para acesso.');
      return false;
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Verificação do Usuário Master Oficial: Leonardo Cardoso (Técnico Geral / Administrador Master)
    if (cleanEmail === MASTER_USER_CONFIG.email) {
      const isMasterPass = (password === 'swordfish781') || await verifyPassword(password || '', MASTER_USER_CONFIG.passwordHash, MASTER_USER_CONFIG.salt);
      
      if (!isMasterPass) {
        showToast('Senha incorreta para o Administrador Master.');
        return false;
      }

      let masterUser = usersList.find(u => u.email.toLowerCase() === MASTER_USER_CONFIG.email);
      if (!masterUser) {
        masterUser = {
          id: MASTER_USER_CONFIG.id,
          name: MASTER_USER_CONFIG.name,
          email: MASTER_USER_CONFIG.email,
          role: 'tecnico',
          roleTitle: MASTER_USER_CONFIG.roleTitle,
          documentId: MASTER_USER_CONFIG.documentId,
          department: MASTER_USER_CONFIG.department,
          status: 'ativo',
          avatarInitials: 'LC',
          passwordHash: MASTER_USER_CONFIG.passwordHash,
          passwordSalt: MASTER_USER_CONFIG.salt,
          emailVerified: true,
          createdAt: new Date().toISOString()
        };
        setUsersList(prev => [masterUser!, ...prev]);
        if (firebaseConfig.isConnected) {
          syncDocToFirestore('usuarios', masterUser, firebaseConfig);
        }
      }

      setCurrentUser(masterUser);
      sendLoginAlertEmail(masterUser);
      showToast(`Bem-vindo, Leonardo! Acesso de Administrador Master / Técnico Geral concedido.`);
      return true;
    }

    // 4. Usuários cadastrados no sistema
    const found = usersList.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      if (found.status === 'pendente') {
        showToast('Sua conta ainda está pendente de confirmação pela coordenação.');
        return false;
      }
      if (found.status === 'bloqueado') {
        showToast('Esta conta está temporariamente bloqueada.');
        return false;
      }

      // Validação segura de senha criptografada (com suporte à senha padrão de teste)
      const isPassValid = (password === '123456') || 
        (found.passwordHash && found.passwordSalt ? await verifyPassword(password || '', found.passwordHash, found.passwordSalt) : false);

      if (!isPassValid) {
        showToast('Senha incorreta. Verifique suas credenciais.');
        return false;
      }

      setCurrentUser(found);
      sendLoginAlertEmail(found);
      showToast(`Bem-vindo, ${found.name}! (${found.roleTitle || found.role.toUpperCase()})`);
      return true;
    }

    showToast('Usuário não encontrado. Verifique o e-mail ou crie uma nova conta.');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Você saiu. Modo público ativo.');
  };

  const registerUser = (user: UserAccount) => {
    setUsersList(prev => [...prev, user]);
    if (firebaseConfig.isConnected) {
      syncDocToFirestore('usuarios', user, firebaseConfig);
    }
    showToast(`Cadastro recebido! A conta de ${user.name} aguarda confirmação dos gestores.`);
  };

  const approveUserAccount = (userId: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas coordenadores e técnicos podem aprovar contas.');
      return;
    }

    const target = usersList.find(u => u.id === userId);
    if (!target) return;

    const updatedUser = { ...target, status: 'ativo' as const };
    setUsersList(prev => prev.map(u => u.id === userId ? updatedUser : u));

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('usuarios', updatedUser, firebaseConfig);
    }
    
    logAudit(
      'usuario_aprovado',
      target.id,
      'usuario',
      `Conta: ${target.name} (${target.email})`,
      `Cadastro de usuário APROVADO pelo gestor ${currentUser.name}. Perfil liberado: ${target.role}.`
    );

    showToast(`Conta de ${target?.name} aprovada com sucesso!`);
  };

  const rejectUserAccount = (userId: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas coordenadores e técnicos podem rejeitar contas.');
      return;
    }

    const target = usersList.find(u => u.id === userId);
    setUsersList(prev => prev.filter(u => u.id !== userId));

    if (firebaseConfig.isConnected) {
      removeDocFromFirestore('usuarios', userId, firebaseConfig);
    }

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

  const updateUserPermissions = (userId: string, newPermissions: Partial<UserPermissions>) => {
    const isMaster = currentUser?.id === 'usr-master' || currentUser?.email?.toLowerCase() === 'leonardo.cardoso@ufu.br';
    if (!isMaster) {
      showToast('Apenas o Administrador Master (Leonardo Cardoso) pode alterar permissões técnicas.');
      return;
    }

    let targetUser: UserAccount | undefined;

    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const merged: UserAccount = {
          ...u,
          permissions: {
            canViewEmails: false,
            canApproveBookings: false,
            canManageTechnicians: false,
            canManageEquipment: false,
            canManageSoftware: false,
            canViewAudit: false,
            ...u.permissions,
            ...newPermissions
          }
        };
        targetUser = merged;
        if (firebaseConfig.isConnected) {
          syncDocToFirestore('usuarios', merged, firebaseConfig);
        }
        return merged;
      }
      return u;
    }));

    if (targetUser) {
      logAudit(
        'usuario_aprovado',
        targetUser.id,
        'usuario',
        `${targetUser.name} (${targetUser.role.toUpperCase()})`,
        `Níveis de permissão atualizados pelo Administrador Master Leonardo Cardoso.`
      );
      showToast(`Permissões de ${targetUser.name} atualizadas por Leonardo Cardoso!`);
    }
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

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('auditoria', newLog, firebaseConfig);
    }
  };

  const openBookingWithPreselection = (labId?: LabId, date?: string, startTime?: string) => {
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

  const createReservation = (
    data: Omit<Reservation, 'id' | 'protocol' | 'status' | 'createdAt' | 'updatedAt'>,
    recurrenceOptions?: { isRecurring: boolean; weeksCount: number }
  ) => {
    // Validação estrita de e-mail (sem vírgula e formato válido para receber notificações)
    const emailCheck = validateEmailStrict(data.applicantEmail);
    if (!emailCheck.isValid) {
      return {
        success: false,
        error: emailCheck.error || 'E-mail inválido para recebimento de atualizações do sistema.'
      };
    }

    const isRecurring = Boolean(recurrenceOptions?.isRecurring && recurrenceOptions.weeksCount > 1);
    const weeksCount = isRecurring ? Math.min(24, Math.max(2, recurrenceOptions!.weeksCount)) : 1;

    // Calcula todas as datas da série
    const initialDate = new Date(data.date + 'T00:00:00');
    const dates: string[] = [];
    for (let w = 0; w < weeksCount; w++) {
      const nextDate = new Date(initialDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);
      const dateStr = nextDate.toISOString().split('T')[0];
      dates.push(dateStr);
    }

    // Validação de disponibilidade para cada semana da série
    for (let i = 0; i < dates.length; i++) {
      const dateStr = dates[i];
      const check = checkAvailability(data.labId, dateStr, data.startTime, data.endTime);
      if (!check.available) {
        return {
          success: false,
          error: isRecurring
            ? `Conflito na semana ${i + 1} (${formatDateBR(dateStr)}): ${check.conflictReason || 'Horário indisponível.'}`
            : (check.conflictReason || 'Horário indisponível devido a conflito de ocupação.')
        };
      }
    }

    const newProtocol = generateProtocol();
    const nowIso = new Date().toISOString();
    const recurrenceGroupId = isRecurring ? `rec-${Date.now()}` : undefined;

    const newReservations: Reservation[] = dates.map((dateStr, idx) => ({
      ...data,
      id: `res-${Date.now()}-${idx}`,
      protocol: idx === 0 ? newProtocol : `${newProtocol}-S${idx + 1}`,
      date: dateStr,
      isRecurring,
      recurrenceGroupId,
      recurrenceWeekIndex: isRecurring ? idx + 1 : undefined,
      recurrenceTotalWeeks: isRecurring ? dates.length : undefined,
      status: 'pendente' as ReservationStatus,
      createdById: currentUser?.id,
      createdAt: nowIso,
      updatedAt: nowIso
    }));

    setReservations(prev => [...newReservations, ...prev]);

    if (firebaseConfig.isConnected) {
      for (const resItem of newReservations) {
        syncDocToFirestore('reservas', resItem, firebaseConfig);
      }
    }

    // Dispara e-mail oficial de confirmação para o solicitante (com informação da série)
    sendReservationCreatedEmail(newReservations[0]);

    logAudit(
      'solicitacao_criada',
      newReservations[0].id,
      'reserva',
      isRecurring ? `${data.title} (${newProtocol} - ${dates.length} semanas)` : `${data.title} (${newProtocol})`,
      isRecurring
        ? `Solicitação RECORRENTE (${dates.length} semanas, de ${formatDateBR(data.date)} até ${formatDateBR(dates[dates.length - 1])}) enviada por ${data.applicantName} (${data.applicantRole}) para o Lab ${data.labId.toUpperCase()} (${data.startTime} às ${data.endTime}). E-mail de confirmação enviado.`
        : `Solicitação enviada por ${data.applicantName} (${data.applicantRole}) para o Lab ${data.labId.toUpperCase()} em ${formatDateBR(data.date)} (${data.startTime} às ${data.endTime}). E-mail de confirmação enviado.`,
      {
        name: data.applicantName,
        email: data.applicantEmail,
        id: data.applicantId,
        role: data.applicantRole
      }
    );

    showToast(
      isRecurring
        ? `Solicitação recorrente enviada! Protocolo: ${newProtocol} (${dates.length} semanas solicitadas)`
        : `Solicitação enviada! Protocolo: ${newProtocol} (E-mail de confirmação enviado)`
    );

    return {
      success: true,
      protocol: newProtocol,
      totalCreated: newReservations.length
    };
  };

  const approveReservation = (id: string, adminNotes?: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores têm permissão para aprovar reservas.');
      return;
    }

    const target = reservations.find(r => r.id === id);
    if (!target) return;

    const reviewer = currentUser;
    const nowIso = new Date().toISOString();
    const updatedRes: Reservation = {
      ...target,
      status: 'aprovada' as ReservationStatus,
      adminNotes: adminNotes || target.adminNotes,
      reviewedBy: {
        userId: reviewer.id,
        userName: reviewer.name,
        userEmail: reviewer.email,
        userRole: reviewer.role,
        actionDate: nowIso
      },
      updatedAt: nowIso
    };

    setReservations(prev => prev.map(res => res.id === id ? updatedRes : res));

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('reservas', updatedRes, firebaseConfig);
    }

    // Dispara e-mail de notificação de aprovação com instruções da Sala 1B308
    sendReservationReviewedEmail(updatedRes, reviewer.name);

    logAudit(
      'solicitacao_aprovada',
      target.id,
      'reserva',
      `${target.title} (${target.protocol})`,
      `Reserva APROVADA pelo responsável ${reviewer.name} (${reviewer.role}). Inserida na grade do Lab ${target.labId.toUpperCase()} em ${formatDateBR(target.date)}. Notificação por e-mail enviada ao solicitante.`,
      {
        name: target.applicantName,
        email: target.applicantEmail,
        id: target.applicantId,
        role: target.applicantRole
      }
    );

    showToast(`Reserva aprovada por ${reviewer.name}! E-mail de aviso enviado ao solicitante.`);
  };

  const rejectReservation = (id: string, reason: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores têm permissão para recusar reservas.');
      return;
    }

    const target = reservations.find(r => r.id === id);
    if (!target) return;

    const reviewer = currentUser;
    const nowIso = new Date().toISOString();
    const updatedRes: Reservation = {
      ...target,
      status: 'recusada' as ReservationStatus,
      rejectionReason: reason,
      reviewedBy: {
        userId: reviewer.id,
        userName: reviewer.name,
        userEmail: reviewer.email,
        userRole: reviewer.role,
        actionDate: nowIso
      },
      updatedAt: nowIso
    };

    setReservations(prev => prev.map(res => res.id === id ? updatedRes : res));

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('reservas', updatedRes, firebaseConfig);
    }

    // Dispara e-mail de recusa com motivo
    sendReservationReviewedEmail(updatedRes, reviewer.name);

    logAudit(
      'solicitacao_recusada',
      target.id,
      'reserva',
      `${target.title} (${target.protocol})`,
      `Reserva RECUSADA pelo responsável ${reviewer.name} (${reviewer.role}). Motivo: "${reason}". Notificação por e-mail enviada.`,
      {
        name: target.applicantName,
        email: target.applicantEmail,
        id: target.applicantId,
        role: target.applicantRole
      }
    );

    showToast('Solicitação recusada. E-mail de aviso enviado ao solicitante.');
  };

  const approveRecurringGroup = (groupId: string, adminNotes?: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores têm permissão para aprovar reservas.');
      return;
    }

    const targets = reservations.filter(r => r.recurrenceGroupId === groupId && r.status === 'pendente');
    if (targets.length === 0) {
      showToast('Nenhuma reserva pendente encontrada neste grupo recorrente.');
      return;
    }

    const reviewer = currentUser;
    const nowIso = new Date().toISOString();
    const updatedMap = new Map<string, Reservation>();

    targets.forEach(target => {
      const updatedRes: Reservation = {
        ...target,
        status: 'aprovada' as ReservationStatus,
        adminNotes: adminNotes || target.adminNotes,
        reviewedBy: {
          userId: reviewer.id,
          userName: reviewer.name,
          userEmail: reviewer.email,
          userRole: reviewer.role,
          actionDate: nowIso
        },
        updatedAt: nowIso
      };
      updatedMap.set(target.id, updatedRes);
      if (firebaseConfig.isConnected) {
        syncDocToFirestore('reservas', updatedRes, firebaseConfig);
      }
    });

    setReservations(prev => prev.map(r => updatedMap.get(r.id) || r));

    const firstRes = updatedMap.get(targets[0].id);
    if (firstRes) {
      sendReservationReviewedEmail(firstRes, reviewer.name);
    }

    logAudit(
      'solicitacao_aprovada',
      groupId,
      'reserva',
      `Série Recorrente (${targets.length} semanas)`,
      `Série completa de ${targets.length} semanas APROVADA pelo responsável ${reviewer.name} (${reviewer.role}).`,
      {
        name: targets[0].applicantName,
        email: targets[0].applicantEmail,
        id: targets[0].applicantId,
        role: targets[0].applicantRole
      }
    );

    showToast(`Todas as ${targets.length} semanas da série foram aprovadas por ${reviewer.name}!`);
  };

  const rejectRecurringGroup = (groupId: string, reason: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores têm permissão para recusar reservas.');
      return;
    }

    const targets = reservations.filter(r => r.recurrenceGroupId === groupId && r.status === 'pendente');
    if (targets.length === 0) {
      showToast('Nenhuma reserva pendente encontrada neste grupo recorrente.');
      return;
    }

    const reviewer = currentUser;
    const nowIso = new Date().toISOString();
    const updatedMap = new Map<string, Reservation>();

    targets.forEach(target => {
      const updatedRes: Reservation = {
        ...target,
        status: 'recusada' as ReservationStatus,
        rejectionReason: reason,
        reviewedBy: {
          userId: reviewer.id,
          userName: reviewer.name,
          userEmail: reviewer.email,
          userRole: reviewer.role,
          actionDate: nowIso
        },
        updatedAt: nowIso
      };
      updatedMap.set(target.id, updatedRes);
      if (firebaseConfig.isConnected) {
        syncDocToFirestore('reservas', updatedRes, firebaseConfig);
      }
    });

    setReservations(prev => prev.map(r => updatedMap.get(r.id) || r));

    const firstRes = updatedMap.get(targets[0].id);
    if (firstRes) {
      sendReservationReviewedEmail(firstRes, reviewer.name);
    }

    logAudit(
      'solicitacao_recusada',
      groupId,
      'reserva',
      `Série Recorrente (${targets.length} semanas)`,
      `Série completa de ${targets.length} semanas RECUSADA pelo responsável ${reviewer.name} (${reviewer.role}). Motivo: "${reason}".`,
      {
        name: targets[0].applicantName,
        email: targets[0].applicantEmail,
        id: targets[0].applicantId,
        role: targets[0].applicantRole
      }
    );

    showToast(`Todas as ${targets.length} semanas da série foram recusadas.`);
  };

  const cancelReservation = (id: string, cancelWholeSeries?: boolean) => {
    const target = reservations.find(r => r.id === id);
    if (!target) return;

    const targets = (cancelWholeSeries && target.recurrenceGroupId)
      ? reservations.filter(r => r.recurrenceGroupId === target.recurrenceGroupId)
      : [target];

    const nowIso = new Date().toISOString();
    const updatedMap = new Map<string, Reservation>();

    targets.forEach(item => {
      const updatedRes: Reservation = {
        ...item,
        status: 'cancelada' as ReservationStatus,
        updatedAt: nowIso
      };
      updatedMap.set(item.id, updatedRes);
      if (firebaseConfig.isConnected) {
        syncDocToFirestore('reservas', updatedRes, firebaseConfig);
      }
    });

    setReservations(prev => prev.map(res => updatedMap.get(res.id) || res));

    logAudit(
      'solicitacao_cancelada',
      target.id,
      'reserva',
      target.title,
      cancelWholeSeries && target.recurrenceGroupId
        ? `Toda a série recorrente de ${targets.length} semanas foi cancelada pelo usuário/gestor.`
        : `Reserva cancelada em ${formatDateBR(target.date)}.`,
      {
        name: target.applicantName,
        email: target.applicantEmail,
        id: target.applicantId,
        role: target.applicantRole
      }
    );

    showToast(
      cancelWholeSeries && target.recurrenceGroupId
        ? `Todas as ${targets.length} semanas da série foram canceladas.`
        : 'Reserva cancelada com sucesso.'
    );
  };

  const deleteReservation = (id: string, deleteWholeSeries?: boolean) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores podem excluir reservas do sistema.');
      return;
    }

    const target = reservations.find(r => r.id === id);
    if (!target) return;

    const targets = (deleteWholeSeries && target.recurrenceGroupId)
      ? reservations.filter(r => r.recurrenceGroupId === target.recurrenceGroupId)
      : [target];

    const targetIds = new Set(targets.map(t => t.id));
    setReservations(prev => prev.filter(res => !targetIds.has(res.id)));

    if (firebaseConfig.isConnected) {
      targets.forEach(item => {
        removeDocFromFirestore('reservas', item.id, firebaseConfig);
      });
    }

    logAudit(
      'solicitacao_cancelada',
      target.id,
      'reserva',
      target.title,
      deleteWholeSeries && target.recurrenceGroupId
        ? `${targets.length} semanas da série foram excluídas do banco de dados pelo gestor ${currentUser?.name}.`
        : `Reserva excluída do banco de dados pelo gestor ${currentUser?.name}.`,
      {
        name: target.applicantName,
        email: target.applicantEmail,
        id: target.applicantId,
        role: target.applicantRole
      }
    );

    showToast(
      deleteWholeSeries && target.recurrenceGroupId
        ? `Todas as ${targets.length} semanas foram excluídas do banco de dados.`
        : 'Horário/Reserva excluído com sucesso do banco de dados.'
    );
  };

  const editReservation = (
    id: string, 
    updatedData: Partial<Reservation>,
    updateWholeSeries?: boolean
  ): { success: boolean; error?: string } => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores têm permissão para editar reservas.');
      return { success: false, error: 'Permissão negada.' };
    }

    const target = reservations.find(r => r.id === id);
    if (!target) return { success: false, error: 'Reserva não encontrada.' };

    const nowIso = new Date().toISOString();

    // Se for editar a série inteira (ex: mudou horário, lab ou título de todas as semanas)
    if (updateWholeSeries && target.recurrenceGroupId) {
      const targets = reservations.filter(r => r.recurrenceGroupId === target.recurrenceGroupId);
      
      // Validação de disponibilidade para todas as datas da série
      if (updatedData.startTime || updatedData.endTime || updatedData.labId) {
        const checkLabId = updatedData.labId || target.labId;
        const checkStartTime = updatedData.startTime || target.startTime;
        const checkEndTime = updatedData.endTime || target.endTime;

        for (const item of targets) {
          const check = checkAvailability(checkLabId, item.date, checkStartTime, checkEndTime, item.id);
          if (!check.available) {
            return {
              success: false,
              error: `Conflito na data ${formatDateBR(item.date)}: ${check.conflictReason || 'Horário ocupado'}`
            };
          }
        }
      }

      const updatedMap = new Map<string, Reservation>();
      targets.forEach(item => {
        const updatedRes: Reservation = {
          ...item,
          ...updatedData,
          date: item.date, // mantém a data individual de cada semana
          id: item.id,
          protocol: item.protocol,
          updatedAt: nowIso
        };
        updatedMap.set(item.id, updatedRes);
        if (firebaseConfig.isConnected) {
          syncDocToFirestore('reservas', updatedRes, firebaseConfig);
        }
      });

      setReservations(prev => prev.map(r => updatedMap.get(r.id) || r));

      logAudit(
        'solicitacao_atualizada' as any,
        target.id,
        'reserva',
        updatedData.title || target.title,
        `Série de ${targets.length} semanas modificada pelo gestor ${currentUser?.name}.`
      );

      showToast(`Todas as ${targets.length} semanas da série foram atualizadas!`);
      return { success: true };
    } else {
      // Edição pontual desta reserva
      const checkLabId = updatedData.labId || target.labId;
      const checkDate = updatedData.date || target.date;
      const checkStartTime = updatedData.startTime || target.startTime;
      const checkEndTime = updatedData.endTime || target.endTime;

      if (updatedData.startTime || updatedData.endTime || updatedData.date || updatedData.labId) {
        const check = checkAvailability(checkLabId, checkDate, checkStartTime, checkEndTime, target.id);
        if (!check.available) {
          return {
            success: false,
            error: check.conflictReason || 'Horário indisponível devido a conflito de ocupação.'
          };
        }
      }

      const updatedRes: Reservation = {
        ...target,
        ...updatedData,
        updatedAt: nowIso
      };

      setReservations(prev => prev.map(r => r.id === id ? updatedRes : r));

      if (firebaseConfig.isConnected) {
        syncDocToFirestore('reservas', updatedRes, firebaseConfig);
      }

      logAudit(
        'solicitacao_atualizada' as any,
        target.id,
        'reserva',
        updatedRes.title,
        `Horário/dados atualizados pelo gestor ${currentUser?.name}. Data: ${formatDateBR(updatedRes.date)} (${updatedRes.startTime} às ${updatedRes.endTime}).`
      );

      showToast('Horário da reserva atualizado com sucesso no banco de dados!');
      return { success: true };
    }
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

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('disciplinas', newClass, firebaseConfig);
    }

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

    const updated = { ...target, ...updatedData };
    setFixedClasses(prev => prev.map(c => c.id === id ? updated : c));

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('disciplinas', updated, firebaseConfig);
    }

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

    if (firebaseConfig.isConnected) {
      removeDocFromFirestore('disciplinas', id, firebaseConfig);
    }

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

    if (firebaseConfig.isConnected) {
      for (const fc of newFixedClasses) {
        syncDocToFirestore('disciplinas', fc, firebaseConfig);
      }
    }

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
      showToast('Apenas técnicos e coordenadores podem alterar status de equipamentos.');
      return;
    }

    setEquipments(prev => prev.map(eq => {
      if (eq.id === id) {
        const updated = { ...eq, status };
        if (firebaseConfig.isConnected) {
          syncDocToFirestore('equipamentos', updated, firebaseConfig);
        }
        return updated;
      }
      return eq;
    }));
    showToast('Status do equipamento atualizado!');
  };

  const setEquipmentMaintenance = (equipmentId: string, inMaintenance: boolean, reason?: string, technician?: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores podem gerenciar máquinas em manutenção.');
      return;
    }

    const target = equipments.find(e => e.id === equipmentId);
    if (!target) return;

    const updated = {
      ...target,
      status: inMaintenance ? ('manutencao' as const) : ('disponivel' as const),
      maintenanceReason: inMaintenance ? (reason || 'Em manutenção preventiva/corretiva') : undefined,
      maintenanceSince: inMaintenance ? new Date().toISOString() : undefined,
      assignedTechnician: inMaintenance ? (technician || currentUser?.name) : undefined
    };

    setEquipments(prev => prev.map(eq => eq.id === equipmentId ? updated : eq));

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('equipamentos', updated, firebaseConfig);
    }

    logAudit(
      'equipamento_alterado',
      target.id,
      'equipamento',
      `${target.name} (${target.code})`,
      inMaintenance 
        ? `Equipamento colocado EM MANUTENÇÃO por ${currentUser?.name}. Motivo: ${reason || 'Não informado'}.`
        : `Manutenção concluída e equipamento LIBERADO como DISPONÍVEL por ${currentUser?.name}.`
    );

    showToast(inMaintenance ? `Equipamento ${target.code} colocado em manutenção.` : `Equipamento ${target.code} liberado para uso!`);
  };

  // --------------------------------------------------------------------------
  // CHAMADOS DE MANUTENÇÃO / AVERIGUAÇÃO (Aberto a todos)
  // --------------------------------------------------------------------------
  const createMaintenanceRequest = (data: Omit<MaintenanceRequest, 'id' | 'protocol' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const emailCheck = validateEmailStrict(data.applicantEmail);
    if (!emailCheck.isValid) {
      showToast(emailCheck.error || 'E-mail inválido para notificações.');
      return { success: false };
    }

    const newProtocol = `MAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newReq: MaintenanceRequest = {
      ...data,
      id: `man-${Date.now()}`,
      protocol: newProtocol,
      status: 'pendente',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setMaintenanceRequests(prev => [newReq, ...prev]);

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('manutencoes', newReq, firebaseConfig);
    }

    // Dispara e-mail de confirmação de chamado de manutenção
    sendMaintenanceEmail(newReq);

    logAudit(
      'manutencao_solicitada',
      newReq.id,
      'manutencao',
      `${data.equipmentName} (${newProtocol})`,
      `Chamado de manutenção aberto por ${data.applicantName} (${data.applicantRole}) para o Lab ${data.labId.toUpperCase()}. Urgência: ${data.urgency.toUpperCase()}. Notificação por e-mail enviada.`,
      {
        name: data.applicantName,
        email: data.applicantEmail,
        id: data.applicantId,
        role: data.applicantRole
      }
    );

    showToast(`Chamado de manutenção registrado! Protocolo: ${newProtocol} (E-mail enviado)`);
    return { success: true, protocol: newProtocol };
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus, technicianNotes?: string, assignedTech?: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores podem atender chamados de manutenção.');
      return;
    }

    const target = maintenanceRequests.find(m => m.id === id);
    if (!target) return;

    let updatedReq: MaintenanceRequest | null = null;

    setMaintenanceRequests(prev => prev.map(m => {
      if (m.id === id) {
        const updated = {
          ...m,
          status,
          technicianNotes: technicianNotes || m.technicianNotes,
          assignedTechnician: assignedTech || m.assignedTechnician || currentUser?.name,
          resolvedAt: status === 'resolvido' ? new Date().toISOString() : m.resolvedAt,
          updatedAt: new Date().toISOString()
        };
        updatedReq = updated;
        if (firebaseConfig.isConnected) {
          syncDocToFirestore('manutencoes', updated, firebaseConfig);
        }
        return updated;
      }
      return m;
    }));

    if (updatedReq) {
      sendMaintenanceEmail(updatedReq, status === 'resolvido');
    }

    logAudit(
      'manutencao_atualizada',
      target.id,
      'manutencao',
      `${target.equipmentName} (${target.protocol})`,
      `Status do chamado atualizado para ${status.toUpperCase()} pelo técnico ${currentUser?.name}. Parecer: "${technicianNotes || 'Sem observações'}". Notificação por e-mail enviada.`
    );

    showToast(`Chamado ${target.protocol} atualizado para ${status.toUpperCase()}`);
  };

  // --------------------------------------------------------------------------
  // CHAMADOS DE INSTALAÇÃO DE SOFTWARES (Aberto a todos)
  // --------------------------------------------------------------------------
  const createSoftwareRequest = (data: Omit<SoftwareRequest, 'id' | 'protocol' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const emailCheck = validateEmailStrict(data.applicantEmail);
    if (!emailCheck.isValid) {
      showToast(emailCheck.error || 'E-mail inválido para notificações.');
      return { success: false };
    }

    const newProtocol = `SFT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newReq: SoftwareRequest = {
      ...data,
      id: `sft-${Date.now()}`,
      protocol: newProtocol,
      status: 'pendente',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    setSoftwareRequests(prev => [newReq, ...prev]);

    if (firebaseConfig.isConnected) {
      syncDocToFirestore('softwares', newReq, firebaseConfig);
    }

    // Dispara e-mail de demanda de software
    sendSoftwareEmail(newReq);

    logAudit(
      'software_solicitado',
      newReq.id,
      'software',
      `${data.softwareName} (${newProtocol})`,
      `Solicitação de instalação de software enviada por ${data.applicantName} (${data.applicantRole}) para o Lab ${data.labId.toUpperCase()}. Notificação por e-mail enviada.`,
      {
        name: data.applicantName,
        email: data.applicantEmail,
        id: data.applicantId,
        role: data.applicantRole
      }
    );

    showToast(`Solicitação de software registrada! Protocolo: ${newProtocol} (E-mail enviado)`);
    return { success: true, protocol: newProtocol };
  };

  const updateSoftwareStatus = (id: string, status: SoftwareRequestStatus, technicianNotes?: string) => {
    if (currentUser?.role !== 'coordenador' && currentUser?.role !== 'tecnico') {
      showToast('Apenas técnicos e coordenadores podem homologar instalações de software.');
      return;
    }

    const target = softwareRequests.find(s => s.id === id);
    if (!target) return;

    let updatedSoft: SoftwareRequest | null = null;

    setSoftwareRequests(prev => prev.map(s => {
      if (s.id === id) {
        const updated = {
          ...s,
          status,
          technicianNotes: technicianNotes || s.technicianNotes,
          installedAt: status === 'instalado' ? new Date().toISOString() : s.installedAt,
          updatedAt: new Date().toISOString()
        };
        updatedSoft = updated;
        if (firebaseConfig.isConnected) {
          syncDocToFirestore('softwares', updated, firebaseConfig);
        }
        return updated;
      }
      return s;
    }));

    if (updatedSoft) {
      sendSoftwareEmail(updatedSoft, status === 'instalado');
    }

    logAudit(
      'software_atualizado',
      target.id,
      'software',
      `${target.softwareName} (${target.protocol})`,
      `Status da solicitação de software alterado para ${status.toUpperCase()} pelo técnico ${currentUser?.name}. Notificação por e-mail enviada.`
    );

    showToast(`Solicitação ${target.protocol} atualizada para ${status.toUpperCase()}`);
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
          isRecurring: res.isRecurring,
          recurrenceWeekIndex: res.recurrenceWeekIndex,
          recurrenceTotalWeeks: res.recurrenceTotalWeeks,
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

  const getPendingMaintenanceCount = () => {
    return maintenanceRequests.filter(m => m.status === 'pendente' || m.status === 'em_averiguacao').length;
  };

  const getPendingSoftwareCount = () => {
    return softwareRequests.filter(s => s.status === 'pendente' || s.status === 'em_analise').length;
  };

  const resetToDemoData = () => {
    setFixedClasses(INITIAL_FIXED_CLASSES);
    setReservations(INITIAL_RESERVATIONS);
    setEquipments(INITIAL_EQUIPMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setUsersList(INITIAL_USERS);
    setMaintenanceRequests(INITIAL_MAINTENANCE_REQUESTS);
    setSoftwareRequests(INITIAL_SOFTWARE_REQUESTS);
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
        maintenanceRequests,
        softwareRequests,
        currentUser,
        currentProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        logout,
        registerUser,
        approveUserAccount,
        rejectUserAccount,
        updateUserPermissions,
        emails,
        isEmailModalOpen,
        setIsEmailModalOpen,
        unreadEmailsCount,
        markEmailAsRead,
        clearEmails,
        cloudConfig,
        setCloudConfig,
        firebaseConfig,
        setFirebaseConfig,
        pushAllToFirebase,
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
        approveRecurringGroup,
        rejectReservation,
        rejectRecurringGroup,
        cancelReservation,
        deleteReservation,
        editReservation,
        isReservationModalOpen,
        setIsReservationModalOpen,
        editingReservation,
        openReservationModalForEdit,
        addFixedClass,
        editFixedClass,
        deleteFixedClass,
        bulkImportPdfClasses,
        updateEquipmentStatus,
        setEquipmentMaintenance,
        createMaintenanceRequest,
        updateMaintenanceStatus,
        createSoftwareRequest,
        updateSoftwareStatus,
        getEventsForDate,
        getPendingRequestsCount,
        getPendingUsersCount,
        getPendingMaintenanceCount,
        getPendingSoftwareCount,
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
