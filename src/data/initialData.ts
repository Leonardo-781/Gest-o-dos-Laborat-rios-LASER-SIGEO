import { LabInfo, Equipment, FixedClass, Reservation, UserAccount, AuditLog, MaintenanceRequest, SoftwareRequest } from '../types';
import { MASTER_USER_CONFIG, DEFAULT_TEST_PASSWORD_HASH, DEFAULT_INSTITUTIONAL_SALT } from '../services/authSecurity';

export const LABS_INFO: Record<'laser' | 'sigeo', LabInfo> = {
  laser: {
    id: 'laser',
    name: 'LASER',
    fullName: 'Laboratório de Sensoriamento Remoto (LASER)',
    description: 'Espaço especializado para calibração, operação de sensores ópticos e a laser (LiDAR), estações totais robotizadas, receptores GNSS, modelagem 3D e fotogrametria.',
    location: 'Sala 1B209 (Sala dos Técnicos: 1B308)',
    capacity: 25,
    workstationsCount: 6,
    responsibleTeacher: 'Coordenação dos Laboratórios',
    responsibleEmail: 'laser.agrimensura@ufu.br',
    accentColor: '#2563eb',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    rules: [
      'Uso obrigatório de jaleco ou vestimenta adequada ao manusear sensores ópticos e miras.',
      'Proibido consumir alimentos ou bebidas nas bancadas de calibração.',
      'A retirada de instrumentos para campo exige assinatura do termo de cautela.',
      'Desligar e recolher todos os alvos e cabos após o término da sessão.',
      'Atendimento e apoio técnico na Sala 1B308 com o técnico de plantão.'
    ],
    equipmentSummary: [
      'Laser Scanner Terrestre 3D',
      'Estações Totais de Alta Precisão (1" e 2")',
      'Pares GNSS RTK Multi-Frequência',
      'Nível Digital de Precisão',
      'Sensores LiDAR embarcados'
    ]
  },
  sigeo: {
    id: 'sigeo',
    name: 'SIGEO',
    fullName: 'Laboratório de SIG e Geoprocessamento (SIGEO)',
    description: 'Laboratório computacional de alta performance para processamento digital de imagens de satélite, dados geoespaciais, SIG, fotogrametria digital e desenho topográfico.',
    location: 'Sala 1B307 (Sala dos Técnicos: 1B308)',
    capacity: 35,
    workstationsCount: 24,
    responsibleTeacher: 'Coordenação dos Laboratórios',
    responsibleEmail: 'sigeo.agrimensura@ufu.br',
    accentColor: '#16a34a',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    rules: [
      'Proibido instalar softwares externos sem autorização expressa do administrador de rede.',
      'Salvar projetos no diretório de trabalho designado ou na nuvem.',
      'Manter os periféricos (mouses, teclados e mesas digitalizadoras) organizados.',
      'Não alterar configurações de rede ou licenças flutuantes (QGIS, ArcGIS, Metashape).',
      'Atendimento e suporte presencial de técnicos na Sala 1B308.'
    ],
    equipmentSummary: [
      '24 Workstations com GPUs dedicadas (RTX)',
      'Plotter Formato A0 para Mapas e Plantas',
      'Licenças ArcGIS Pro, ENVI, Agisoft Metashape, QGIS',
      'Óculos e Monitores 3D para Estereoscopia',
      'Servidor Local de Dados Geoespaciais (NAS)'
    ]
  }
};

export const INITIAL_USERS: UserAccount[] = [
  // 1. USUÁRIO MASTER / ADMINISTRADOR OFICIAL
  {
    id: MASTER_USER_CONFIG.id,
    name: MASTER_USER_CONFIG.name,
    email: MASTER_USER_CONFIG.email,
    role: 'tecnico',
    roleTitle: MASTER_USER_CONFIG.roleTitle,
    documentId: MASTER_USER_CONFIG.documentId,
    department: MASTER_USER_CONFIG.department,
    status: 'ativo',
    avatarInitials: 'LC',
    passwordSalt: DEFAULT_INSTITUTIONAL_SALT,
    passwordHash: MASTER_USER_CONFIG.passwordHash,
    emailVerified: true,
    permissions: {
      canViewEmails: true,
      canApproveBookings: true,
      canManageTechnicians: true,
      canManageEquipment: true,
      canManageSoftware: true,
      canViewAudit: true,
    },
    createdAt: '2026-01-01T08:00:00Z'
  }
];

export const INITIAL_EQUIPMENTS: Equipment[] = [
  // Equipamentos LASER
  {
    id: 'eq-laser-01',
    labId: 'laser',
    name: 'Laser Scanner 3D Terrestre Leica BLK360 G2',
    code: 'LS-01',
    category: 'laser_scanner',
    status: 'disponivel',
    description: 'Scanner laser de alta velocidade com captura esférica HDR de 360° e alcance de até 45m.',
    specs: 'Precisão 4mm @ 10m / Peso 1.05kg'
  },
  {
    id: 'eq-laser-02',
    labId: 'laser',
    name: 'Laser Scanner Terrestre FARO Focus Premium',
    code: 'LS-02',
    category: 'laser_scanner',
    status: 'disponivel',
    description: 'Scanner de longo alcance até 150m, resolução milimétrica para escaneamento arquitetônico e de encostas.',
    specs: 'Alcance 150m / Taxa até 2M pts/s'
  },
  {
    id: 'eq-laser-03',
    labId: 'laser',
    name: 'Estação Total Leica TS07 (Precisão 1")',
    code: 'ET-01',
    category: 'topografia',
    status: 'manutencao',
    description: 'Estação total manual de precisão angular 1 segundo com software FlexField integrado.',
    specs: 'Leitura com prisma até 3500m / Laser 500m',
    maintenanceReason: 'Descalibração no compensador de eixo duplo e verificação de prisma',
    maintenanceSince: '2026-08-28T09:00:00Z',
    assignedTechnician: 'Corpo Técnico (Sala 1B308)'
  },
  {
    id: 'eq-laser-04',
    labId: 'laser',
    name: 'Par de Receptores GNSS RTK Trimble R8s (Base e Rover)',
    code: 'GNSS-01',
    category: 'gnss',
    status: 'disponivel',
    description: 'Sistema GNSS multi-constelação (GPS, GLONASS, Galileo, BeiDou) com rádio interno UHF.',
    specs: '440 Canais / Rádio UHF integrado'
  },
  {
    id: 'eq-laser-05',
    labId: 'laser',
    name: 'Nível Digital de Alta Precisão Leica DNA03',
    code: 'NV-01',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível para nivelamento geométrico de 1ª ordem com mira de invar com código de barras.',
    specs: 'Desvio padrão 0.3mm/km duplo'
  },
  {
    id: 'eq-laser-06',
    labId: 'laser',
    name: 'Drone DJI Matrice 300 RTK + Sensor LiDAR Zenmuse L1',
    code: 'UAV-01',
    category: 'drone',
    status: 'em_campo',
    description: 'Aeronave não tripulada com sensor LiDAR e câmera RGB para aerofotogrametria e nuvem de pontos.',
    specs: 'LiDAR + Câmera 20MP / RTK Integrado'
  },

  // Equipamentos SIGEO
  {
    id: 'eq-sigeo-01',
    labId: 'sigeo',
    name: 'Workstations SIG de Alto Desempenho (Bancadas 01 a 24)',
    code: 'WS-01-24',
    category: 'workstation',
    status: 'disponivel',
    description: '24 computadores equipados com processadores Intel Core i7 / 32GB RAM / GPU RTX 4070.',
    specs: 'Intel i7 13th Gen / 32GB DDR5 / RTX 4070 12GB'
  },
  {
    id: 'eq-sigeo-02',
    labId: 'sigeo',
    name: 'Plotter Colorida A0 HP DesignJet T830',
    code: 'PLT-01',
    category: 'periferico',
    status: 'disponivel',
    description: 'Impressora e scanner de grandes formatos (até formato A0) para mapas, cartas topográficas e plantas.',
    specs: 'Largura 36 pol / Resolução 2400x1200 dpi'
  },
  {
    id: 'eq-sigeo-03',
    labId: 'sigeo',
    name: 'Servidor Central de Processamento Fotogramétrico (Metashape Server)',
    code: 'SRV-01',
    category: 'workstation',
    status: 'disponivel',
    description: 'Servidor dedicado para alinhamento e processamento pesado de fotos aéreas e geração de ortomosaicos.',
    specs: 'Dual Xeon / 128GB RAM / Dual RTX 4090'
  },
  {
    id: 'eq-sigeo-04',
    labId: 'sigeo',
    name: 'Kits de Estereoscopia 3D com Monitores Polarizados',
    code: 'EST-01',
    category: 'periferico',
    status: 'disponivel',
    description: 'Estações para fotointerpretação e restituição fotogramétrica 3D com óculos 3D passivos/ativos.',
    specs: 'Monitores 144Hz + Óculos 3D Vision'
  }
];

// ==============================================================================
// GRADE HORÁRIA OFICIAL EXTRAÍDA DIRETAMENTE DAS FOTOS DO SIGEO E LASER
// (Apenas disciplinas oficiais das fotos das planilhas, sem docentes inventados)
// ==============================================================================
export const INITIAL_FIXED_CLASSES: FixedClass[] = [
  // ----------------------------------------------------------------------------
  // 1. LABORATÓRIO SIGEO (Conforme Imagem 1)
  // ----------------------------------------------------------------------------
  {
    id: 'fc-sigeo-1',
    labId: 'sigeo',
    dayOfWeek: 1, // Segunda
    startTime: '08:50',
    endTime: '12:20',
    courseCode: 'AGR-SIG',
    courseName: 'SIG (Sistemas de Informação Geográfica)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 08:50 às 12:20 (4 tempos)'
  },
  {
    id: 'fc-sigeo-2',
    labId: 'sigeo',
    dayOfWeek: 2, // Terça
    startTime: '07:10',
    endTime: '08:50',
    courseCode: 'AGR-SNF',
    courseName: 'Senso Flores (Sensoriamento Remoto Florestal)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 07:10 às 08:50 (2 tempos)'
  },
  {
    id: 'fc-sigeo-3',
    labId: 'sigeo',
    dayOfWeek: 2, // Terça
    startTime: '08:50',
    endTime: '12:20',
    courseCode: 'AGR-DTOP',
    courseName: 'Des. Top (Desenho Topográfico)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 08:50 às 12:20 (4 tempos)'
  },
  {
    id: 'fc-sigeo-4',
    labId: 'sigeo',
    dayOfWeek: 2, // Terça
    startTime: '14:50',
    endTime: '17:40',
    courseCode: 'ENG-FLOR',
    courseName: 'Florestal (Engenharia Florestal)',
    professor: '',
    semester: '2026/1',
    highlightColor: 'bg-rose-100 text-rose-950 border-rose-300',
    notes: 'Turma de Engenharia Florestal (3 tempos à tarde)'
  },
  {
    id: 'fc-sigeo-5',
    labId: 'sigeo',
    dayOfWeek: 3, // Quarta
    startTime: '07:10',
    endTime: '10:40',
    courseCode: 'AGR-CDIG',
    courseName: 'Cart. Dig (Cartografia Digital)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 07:10 às 10:40 (4 tempos)'
  },
  {
    id: 'fc-sigeo-6',
    labId: 'sigeo',
    dayOfWeek: 4, // Quinta
    startTime: '07:10',
    endTime: '08:50',
    courseCode: 'AGR-PDI',
    courseName: 'PDI (Processamento Digital de Imagens)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 07:10 às 08:50 (2 tempos)'
  },
  {
    id: 'fc-sigeo-7',
    labId: 'sigeo',
    dayOfWeek: 4, // Quinta
    startTime: '08:50',
    endTime: '11:30',
    courseCode: 'ENG-FLOR',
    courseName: 'Florestal (Engenharia Florestal)',
    professor: '',
    semester: '2026/1',
    highlightColor: 'bg-rose-100 text-rose-950 border-rose-300',
    notes: 'Turma de Engenharia Florestal (3 tempos pela manhã)'
  },
  {
    id: 'fc-sigeo-8',
    labId: 'sigeo',
    dayOfWeek: 5, // Sexta
    startTime: '10:40',
    endTime: '12:20',
    courseCode: 'AGR-PINT',
    courseName: 'Prog. Inter (Programação / Interpretação)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 10:40 às 12:20 (2 tempos)'
  },
  {
    id: 'fc-sigeo-9',
    labId: 'sigeo',
    dayOfWeek: 5, // Sexta
    startTime: '13:10',
    endTime: '16:50',
    courseCode: 'AGR-IPC',
    courseName: 'IPC (Introdução à Programação de Computadores)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 13:10 às 16:50 (4 tempos à tarde)'
  },

  // ----------------------------------------------------------------------------
  // 2. LABORATÓRIO LASER (Conforme Imagem 2)
  // ----------------------------------------------------------------------------
  {
    id: 'fc-laser-1',
    labId: 'laser',
    dayOfWeek: 1, // Segunda
    startTime: '07:10',
    endTime: '08:50',
    courseCode: 'AGR-MOD3D',
    courseName: 'Modelagem (Modelagem 3D e Topográfica)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 07:10 às 08:50 (2 tempos)'
  },
  {
    id: 'fc-laser-2',
    labId: 'laser',
    dayOfWeek: 1, // Segunda
    startTime: '08:50',
    endTime: '12:20',
    courseCode: 'AGR-SENSO',
    courseName: 'Senso (Sensoriamento Remoto)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 08:50 às 12:20 (4 tempos)'
  },
  {
    id: 'fc-laser-3',
    labId: 'laser',
    dayOfWeek: 1, // Segunda
    startTime: '14:50',
    endTime: '17:40',
    courseCode: 'ENG-AGRO',
    courseName: 'Agronomia (Topografia p/ Agronomia)',
    professor: '',
    semester: '2026/1',
    highlightColor: 'bg-rose-100 text-rose-950 border-rose-300',
    notes: 'Turma de Agronomia (3 tempos à tarde)'
  },
  {
    id: 'fc-laser-4',
    labId: 'laser',
    dayOfWeek: 2, // Terça
    startTime: '07:10',
    endTime: '10:40',
    courseCode: 'AGR-FDIG',
    courseName: 'Foto. Digital (Fotogrametria Digital)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 07:10 às 10:40 (4 tempos)'
  },
  {
    id: 'fc-laser-5',
    labId: 'laser',
    dayOfWeek: 2, // Terça
    startTime: '10:40',
    endTime: '12:20',
    courseCode: 'AGR-FOTO',
    courseName: 'Foto (Fotogrametria Prática)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 10:40 às 12:20 (2 tempos)'
  },
  {
    id: 'fc-laser-6',
    labId: 'laser',
    dayOfWeek: 2, // Terça
    startTime: '13:10',
    endTime: '16:50',
    courseCode: 'AGR-FDIG2',
    courseName: 'Foto Dig (Fotogrametria Digital Prática)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 13:10 às 16:50 (4 tempos à tarde)'
  },
  {
    id: 'fc-laser-7',
    labId: 'laser',
    dayOfWeek: 3, // Quarta
    startTime: '07:10',
    endTime: '08:50',
    courseCode: 'AGR-PARC',
    courseName: 'Parcelamento (Parcelamento do Solo)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 07:10 às 08:50 (2 tempos)'
  },
  {
    id: 'fc-laser-8',
    labId: 'laser',
    dayOfWeek: 3, // Quarta
    startTime: '08:50',
    endTime: '10:40',
    courseCode: 'AGR-MODGEO',
    courseName: 'Modelagem (Modelagem Geoespacial)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 08:50 às 10:40 (2 tempos)'
  },
  {
    id: 'fc-laser-9',
    labId: 'laser',
    dayOfWeek: 3, // Quarta
    startTime: '10:40',
    endTime: '12:20',
    courseCode: 'AGR-FOTO2',
    courseName: 'Foto (Fotogrametria Aplicada)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 10:40 às 12:20 (2 tempos)'
  },
  {
    id: 'fc-laser-10',
    labId: 'laser',
    dayOfWeek: 4, // Quinta
    startTime: '08:50',
    endTime: '12:20',
    courseCode: 'AGR-HIDRO',
    courseName: 'Hidroclima (Hidroclimatologia)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 08:50 às 12:20 (4 tempos)'
  },
  {
    id: 'fc-laser-11',
    labId: 'laser',
    dayOfWeek: 5, // Sexta
    startTime: '07:10',
    endTime: '10:40',
    courseCode: 'AGR-PLAMB',
    courseName: 'Pla. Amb (Planejamento Ambiental)',
    professor: '',
    semester: '2026/1',
    notes: 'Aulas práticas das 07:10 às 10:40 (4 tempos)'
  }
];

// Dados operacionais limpos (zero registros fictícios)
export const INITIAL_RESERVATIONS: Reservation[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [];
export const INITIAL_SOFTWARE_REQUESTS: SoftwareRequest[] = [];
