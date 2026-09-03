export type LabId = 'laser' | 'sigeo';

export interface LabInfo {
  id: LabId;
  name: string;
  fullName: string;
  description: string;
  location: string;
  capacity: number;
  workstationsCount: number;
  responsibleTeacher: string;
  responsibleEmail: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  rules: string[];
  equipmentSummary: string[];
}

export type PurposeType = 
  | 'aula_regular'
  | 'reposicao'
  | 'tcc'
  | 'iniciacao_cientifica'
  | 'projeto_extensao'
  | 'apoio_tecnico'
  | 'reuniao'
  | 'manutencao';

export type ReservationStatus = 'pendente' | 'aprovada' | 'recusada' | 'cancelada';

export type UserRole = 'visitante' | 'aluno' | 'professor' | 'tecnico' | 'coordenador';

export type AccountStatus = 'ativo' | 'pendente' | 'bloqueado';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle?: string; // Título descritivo como "Administrador Master / Técnico Geral"
  documentId: string; // Matrícula ou SIAPE
  department: string;
  status: AccountStatus;
  avatarInitials?: string;
  passwordHash?: string;
  passwordSalt?: string;
  emailVerified?: boolean;
  verificationCode?: string;
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  preview: string;
  htmlBody: string;
  category: 'login' | 'solicitacao_criada' | 'solicitacao_atualizada' | 'manutencao' | 'software' | 'verificacao_email';
  sentAt: string;
  read: boolean;
  protocol?: string;
}

export interface Equipment {
  id: string;
  labId: LabId;
  name: string;
  code: string;
  category: 'topografia' | 'laser_scanner' | 'gnss' | 'workstation' | 'drone' | 'periferico';
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'em_campo';
  description: string;
  specs?: string;
  maintenanceReason?: string;
  maintenanceSince?: string;
  assignedTechnician?: string;
}

export interface FixedClass {
  id: string;
  labId: LabId;
  dayOfWeek: number; // 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  startTime: string; // "07:10", "08:50", etc.
  endTime: string;   // "12:20", "17:40", etc.
  courseCode: string;
  courseName: string;
  professor: string;
  semester: string;  // Ex: "2026/1"
  highlightColor?: string; // Cor personalizada de destaque (ex: vermelho/laranja para cursos externos)
  notes?: string;
  importedFromPdf?: boolean;
}

export interface Reservation {
  id: string;
  protocol: string; // Ex: "REQ-2026-0812"
  labId: LabId;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "14:00"
  endTime: string;   // "17:00"
  purposeType: PurposeType;
  title: string;
  description: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantRole: UserRole;
  applicantId: string;
  supervisorName?: string;
  expectedAttendees: number;
  requestedEquipments: string[];
  status: ReservationStatus;
  rejectionReason?: string;
  adminNotes?: string;
  
  createdById?: string;
  reviewedBy?: {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: UserRole;
    actionDate: string;
  };

  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// CHAMADOS DE MANUTENÇÃO / AVERIGUAÇÃO DE MÁQUINAS
// ----------------------------------------------------------------------------
export type MaintenanceUrgency = 'baixa' | 'media' | 'alta' | 'critica';
export type MaintenanceStatus = 'pendente' | 'em_averiguacao' | 'em_manutencao' | 'resolvido' | 'recusado';

export interface MaintenanceRequest {
  id: string;
  protocol: string; // Ex: "MAN-2026-1042"
  labId: LabId;
  equipmentId?: string; // ID do equipamento se selecionado da lista
  equipmentName: string; // Nome ou identificação (ex: "Workstation 07", "Plotter A0", "Leica TS07")
  urgency: MaintenanceUrgency;
  problemDescription: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantRole: UserRole;
  applicantId: string;
  status: MaintenanceStatus;
  assignedTechnician?: string;
  technicianNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// CHAMADOS DE INSTALAÇÃO / ATUALIZAÇÃO DE SOFTWARES
// ----------------------------------------------------------------------------
export type SoftwareScope = 'todas_maquinas' | 'maquinas_especificas' | 'servidor';
export type SoftwareLicenseType = 'open_source_gratuito' | 'institucional' | 'licenca_propria' | 'trial';
export type SoftwareRequestStatus = 'pendente' | 'em_analise' | 'em_instalacao' | 'instalado' | 'recusado';

export interface SoftwareRequest {
  id: string;
  protocol: string; // Ex: "SFT-2026-0521"
  labId: LabId;
  softwareName: string;
  softwareVersion?: string;
  targetScope: SoftwareScope;
  specificWorkstations?: string; // Ex: "Bancadas 01 a 12"
  licenseType: SoftwareLicenseType;
  licenseKey?: string; // Código/chave de ativação, serial ou chave de licença institucional/projeto
  downloadUrl?: string;
  justification: string;
  courseOrProject?: string; // Ex: "TCC Fotogrametria", "AGR-SIG"
  deadlineDate?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantRole: UserRole;
  applicantId: string;
  status: SoftwareRequestStatus;
  technicianNotes?: string;
  installedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleEvent {
  id: string;
  originType: 'fixed_class' | 'reservation';
  labId: LabId;
  title: string;
  subtitle: string;
  date?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: PurposeType;
  responsible: string;
  status?: ReservationStatus;
  highlightColor?: string;
  rawItem: FixedClass | Reservation;
}

export type AuditActionType = 
  | 'solicitacao_criada'
  | 'solicitacao_aprovada'
  | 'solicitacao_recusada'
  | 'solicitacao_cancelada'
  | 'aula_adicionada'
  | 'aula_editada'
  | 'aula_removida'
  | 'usuario_aprovado'
  | 'usuario_recusado'
  | 'pdf_importado'
  | 'equipamento_alterado'
  | 'manutencao_solicitada'
  | 'manutencao_atualizada'
  | 'software_solicitado'
  | 'software_atualizado';

export interface AuditLog {
  id: string;
  actionType: AuditActionType;
  targetId: string;
  targetType: 'reserva' | 'aula_fixa' | 'equipamento' | 'usuario' | 'manutencao' | 'software' | 'sistema';
  targetTitle: string;
  performedBy: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  applicantDetails?: {
    name: string;
    email: string;
    id: string;
    role: string;
  };
  details: string;
  rejectionReason?: string;
  timestamp: string;
}

export interface ParsedPdfClass {
  id: string;
  courseCode: string;
  courseName: string;
  professor: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  suggestedLab: LabId;
  semester: string;
  confidence: number;
  selected: boolean;
}

export interface CloudConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  autoSync: boolean;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncAt?: string;
}

export type ViewMode = 'week' | 'day' | 'table';
export type ActiveTab = 
  | 'grade' 
  | 'solicitar' 
  | 'rastrear' 
  | 'solicitar_manutencao' 
  | 'solicitar_software' 
  | 'gestao_manutencao' 
  | 'admin' 
  | 'equipamentos' 
  | 'indicadores' 
  | 'auditoria' 
  | 'importar_pdf';

export type AppProfile = UserRole;
