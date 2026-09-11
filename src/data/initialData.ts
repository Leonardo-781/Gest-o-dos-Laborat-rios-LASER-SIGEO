import { LabId, LabInfo, Equipment, FixedClass, Reservation, UserAccount, AuditLog, MaintenanceRequest, SoftwareRequest } from '../types';
import { MASTER_USER_CONFIG, DEFAULT_TEST_PASSWORD_HASH, DEFAULT_INSTITUTIONAL_SALT } from '../services/authSecurity';

export const LABS_INFO: Record<LabId, LabInfo> = {
  laser: {
    id: 'laser',
    name: 'LASER',
    fullName: 'Laboratório de Sensoriamento Remoto (LASER)',
    description: 'Espaço especializado para calibração, operação de sensores ópticos e a laser (LiDAR), estações totais robotizadas, receptores GNSS, modelagem 3D e fotogrametria.',
    location: 'Sala 1B309 (Sala dos Técnicos: 1B308)',
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
  },
  ltgeo: {
    id: 'ltgeo',
    name: 'LTGEO',
    fullName: 'Laboratório de Topografia e Geodésia (LTGEO)',
    description: 'Laboratório especializado em instrumentação topográfica, geodésica e de campo. Acervo completo de estações totais, níveis ópticos e digitais, teodolitos eletrônicos, receptores GNSS geodésicos e acessórios para práticas de campo e levantamentos cadastrais.',
    location: 'Sala 1B210',
    capacity: 30,
    workstationsCount: 4,
    responsibleTeacher: 'Coordenação dos Laboratórios',
    responsibleEmail: 'ltgeo.agrimensura@ufu.br',
    accentColor: '#ea580c',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-200',
    badgeText: 'text-orange-700',
    rules: [
      'A retirada de instrumentos para aulas práticas exige assinatura obrigatória do termo de cautela pelo docente ou discente responsável.',
      'Conferir o estado das baterias, cabos, prismas e travas antes de sair para o campo.',
      'Ao retornar de atividade em campo, limpar os equipamentos e acondicionar nas maletas originais.',
      'Comunicar imediatamente à equipe técnica qualquer impacto, queda ou descalibração observada.',
      'Atendimento e suporte técnico na Sala 1B210 com os técnicos do LTGEO.'
    ],
    equipmentSummary: [
      'Estações Totais Eletrônicas (Leica / Topcon)',
      'Níveis Ópticos Automáticos e Digitais',
      'Teodolitos Eletrônicos de Precisão',
      'Receptores GNSS Geodésicos RTK',
      'Kits de Prismas, Miras de Alumínio e Ínvar'
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
    assignedLabs: ['laser', 'sigeo', 'ltgeo'],
    permissions: {
      canViewEmails: true,
      canApproveBookings: true,
      canManageTechnicians: true,
      canManageEquipment: true,
      canManageSoftware: true,
      canViewAudit: true,
      assignedLabs: ['laser', 'sigeo', 'ltgeo'],
    },
    createdAt: '2026-01-01T08:00:00Z'
  },
  // 2. TÉCNICO EXCLUSIVO DO LTGEO (Sala 1B210)
  {
    id: 'usr-tech-ltgeo',
    name: 'Marcos Vinícius (Técnico LTGEO)',
    email: 'marcos.ltgeo@ufu.br',
    role: 'tecnico',
    roleTitle: 'Técnico de Laboratório • LTGEO (Sala 1B210)',
    documentId: 'TEC-2101',
    department: 'Laboratório de Topografia e Geodésia (1B210) - UFU',
    status: 'ativo',
    avatarInitials: 'MV',
    passwordSalt: DEFAULT_INSTITUTIONAL_SALT,
    passwordHash: MASTER_USER_CONFIG.passwordHash,
    emailVerified: true,
    assignedLabs: ['ltgeo'],
    requestedLabs: ['ltgeo'],
    permissions: {
      canViewEmails: false,
      canApproveBookings: true,
      canManageTechnicians: false,
      canManageEquipment: true,
      canManageSoftware: true,
      canViewAudit: false,
      assignedLabs: ['ltgeo'],
    },
    createdAt: '2026-02-01T08:00:00Z'
  },
  // 3. TÉCNICO DOS LABORATÓRIOS LASER E SIGEO (Salas 1B309 & 1B307)
  {
    id: 'usr-tech-laser',
    name: 'Gabriel Santos (Técnico LASER/SIGEO)',
    email: 'gabriel.laser@ufu.br',
    role: 'tecnico',
    roleTitle: 'Técnico de Laboratório • LASER & SIGEO',
    documentId: 'TEC-3081',
    department: 'Laboratórios LASER (1B309) & SIGEO (1B307) - UFU',
    status: 'ativo',
    avatarInitials: 'GS',
    passwordSalt: DEFAULT_INSTITUTIONAL_SALT,
    passwordHash: MASTER_USER_CONFIG.passwordHash,
    emailVerified: true,
    assignedLabs: ['laser', 'sigeo'],
    requestedLabs: ['laser', 'sigeo'],
    permissions: {
      canViewEmails: false,
      canApproveBookings: true,
      canManageTechnicians: false,
      canManageEquipment: true,
      canManageSoftware: true,
      canViewAudit: false,
      assignedLabs: ['laser', 'sigeo'],
    },
    createdAt: '2026-02-01T08:00:00Z'
  },
  // 4. COORDENADOR GERAL DOS LABORATÓRIOS
  {
    id: 'usr-coord',
    name: 'Prof. Dr. Coordenador',
    email: 'coordenacao.agrimensura@ufu.br',
    role: 'coordenador',
    roleTitle: 'Coordenação Geral de Laboratórios',
    documentId: 'SIAPE-99881',
    department: 'Coordenação de Curso de Eng. de Agrimensura - UFU',
    status: 'ativo',
    avatarInitials: 'CD',
    passwordSalt: DEFAULT_INSTITUTIONAL_SALT,
    passwordHash: MASTER_USER_CONFIG.passwordHash,
    emailVerified: true,
    assignedLabs: ['laser', 'sigeo', 'ltgeo'],
    permissions: {
      canViewEmails: true,
      canApproveBookings: true,
      canManageTechnicians: true,
      canManageEquipment: true,
      canManageSoftware: true,
      canViewAudit: true,
      assignedLabs: ['laser', 'sigeo', 'ltgeo'],
    },
    createdAt: '2026-01-10T08:00:00Z'
  },
  // 5. ALUNO DE GRADUAÇÃO
  {
    id: 'usr-aluno',
    name: 'Lucas Ferreira (Aluno)',
    email: 'lucas.aluno@ufu.br',
    role: 'aluno',
    roleTitle: 'Aluno de Graduação',
    documentId: '12011AGR042',
    department: 'Graduação em Eng. de Agrimensura - UFU',
    status: 'ativo',
    avatarInitials: 'LF',
    passwordSalt: DEFAULT_INSTITUTIONAL_SALT,
    passwordHash: MASTER_USER_CONFIG.passwordHash,
    emailVerified: true,
    createdAt: '2026-02-15T08:00:00Z'
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
  },
  // Equipamentos LTGEO (Sala 1B210)
  {
    id: 'eq-ltgeo-01',
    labId: 'ltgeo',
    name: 'Estação Total Topcon GM-52 (Precisão 2")',
    code: 'ET-GEO-01',
    category: 'topografia',
    status: 'disponivel',
    description: 'Estação total de alta precisão angular para levantamentos topográficos, poligonais e irradiações.',
    specs: 'Alcance 4000m com prisma / 500m sem prisma / Compensador de eixo duplo'
  },
  {
    id: 'eq-ltgeo-02',
    labId: 'ltgeo',
    name: 'Estação Total Leica FlexLine TS03 (Precisão 2")',
    code: 'ET-GEO-02',
    category: 'topografia',
    status: 'disponivel',
    description: 'Estação total com software de bordo FlexField para agrimensura, implantação e controle de obras.',
    specs: 'Leitura com prisma / USB / Baterias Li-Ion de longa duração'
  },
  {
    id: 'eq-ltgeo-03',
    labId: 'ltgeo',
    name: 'Nível Óptico Automático Leica NA324',
    code: 'NIV-GEO-01',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível de alta robustez com aumento de 24x e compensador magnético para nivelamento geométrico.',
    specs: 'Desvio padrão por km duplo: 2.0 mm / Proteção IP54'
  },
  {
    id: 'eq-ltgeo-04',
    labId: 'ltgeo',
    name: 'Teodolito Eletrônico Digital Topcon DT-209',
    code: 'TEO-GEO-01',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito digital para medição de ângulos horizontais e verticais em aulas práticas de campo.',
    specs: 'Precisão angular 9" / Display LCD duplo / Bateria até 140h'
  },
  {
    id: 'eq-ltgeo-05',
    labId: 'ltgeo',
    name: 'Par de Receptores GNSS RTK Geodésico CHCNAV i73 (Base & Rover)',
    code: 'GNSS-GEO-01',
    category: 'gnss',
    status: 'disponivel',
    description: 'Receptores GNSS multiconstelação com rádio UHF interno e tecnologia IMU anti-inclinação para georreferenciamento de imóveis rurais.',
    specs: '1408 canais / Rastreamento GPS, GLONASS, Galileo, BeiDou / Precisão RTK horizontal 8mm'
  },
  {
    id: 'eq-ltgeo-06',
    labId: 'ltgeo',
    name: 'Kit de Acessórios Topográficos (Tripés, Balizas, Prismas e Miras de Alumínio)',
    code: 'ACES-GEO-01',
    category: 'topografia',
    status: 'disponivel',
    description: 'Conjunto completo de apoio de campo com tripés de alumínio/madeira, prismas com suporte e miras de 4 metros.',
    specs: 'Tripés pesados com travas duplas / Miras milimetradas'
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
    isExternal: true,
    customColor: 'vermelho',
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
    isExternal: true,
    customColor: 'vermelho',
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
