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
  documentId: string; // Matrícula ou SIAPE
  department: string;
  status: AccountStatus;
  avatarInitials?: string;
  createdAt: string;
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
  | 'equipamento_alterado';

export interface AuditLog {
  id: string;
  actionType: AuditActionType;
  targetId: string;
  targetType: 'reserva' | 'aula_fixa' | 'equipamento' | 'usuario' | 'sistema';
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

export type ViewMode = 'week' | 'day' | 'table';
export type ActiveTab = 'grade' | 'solicitar' | 'rastrear' | 'admin' | 'equipamentos' | 'indicadores' | 'auditoria' | 'importar_pdf';
export type AppProfile = UserRole;
