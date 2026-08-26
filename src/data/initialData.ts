import { LabInfo, Equipment, FixedClass, Reservation, UserAccount, AuditLog } from '../types';

export const LABS_INFO: Record<'laser' | 'sigeo', LabInfo> = {
  laser: {
    id: 'laser',
    name: 'LASER',
    fullName: 'Laboratório de Sensoriamento Remoto (LASER)',
    description: 'Espaço especializado para calibração, operação de sensores ópticos e a laser (LiDAR), estações totais robotizadas, receptores GNSS, modelagem 3D e fotogrametria.',
    location: 'Sala 1B209 (Sala dos Técnicos: 1B308)',
    capacity: 25,
    workstationsCount: 6,
    responsibleTeacher: 'Prof. Dr. Marcos Vinicius R.',
    responsibleEmail: 'laser.agrimensura@universidade.edu.br',
    accentColor: '#2563eb',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    rules: [
      'Uso obrigatório de jaleco ou vestimenta adequada ao manusear sensores ópticos e miras.',
      'Proibido consumir alimentos ou bebidas nas bancadas de calibração.',
      'A retirada de instrumentos para campo exige assinatura do termo de cautela.',
      'Desligar e recolher todos os alvos e cabos após o término da sessão.',
      'Atendimento e apoio técnico na Sala 1B308 com o monitor de plantão.'
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
    responsibleTeacher: 'Profa. Dra. Helena S. Guimarães',
    responsibleEmail: 'sigeo.agrimensura@universidade.edu.br',
    accentColor: '#16a34a',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    rules: [
      'Proibido instalar softwares externos sem autorização expressa do administrador de rede.',
      'Salvar projetos no diretório de trabalho designado ou na nuvem.',
      'Manter os periféricos (mouses, teclados e mesas digitalizadoras) organizados.',
      'Não alterar configurações de rede ou licenças flutuantes (QGIS, ArcGIS, Metashape).',
      'Atendimento e suporte presencial de monitores na Sala 1B308.'
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
  {
    id: 'usr-coord',
    name: 'Prof. Dr. Marcos Vinicius (Coordenador)',
    email: 'marcos.vinicius@universidade.edu.br',
    role: 'coordenador',
    documentId: 'SIAPE 1849201',
    department: 'Depto. de Engenharia de Agrimensura',
    status: 'ativo',
    avatarInitials: 'MV',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'usr-mon',
    name: 'Gabriel Alencar (Técnico de Laboratório)',
    email: 'gabriel.tecnico@universidade.edu.br',
    role: 'tecnico',
    documentId: 'SIAPE 20230012',
    department: 'Corpo Técnico dos Laboratórios',
    status: 'ativo',
    avatarInitials: 'GA',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'usr-prof',
    name: 'Profa. Dra. Helena S. Guimarães',
    email: 'helena.guimaraes@universidade.edu.br',
    role: 'professor',
    documentId: 'SIAPE 2019482',
    department: 'Depto. de Engenharia de Agrimensura',
    status: 'ativo',
    avatarInitials: 'HG',
    createdAt: '2026-01-15T08:30:00Z'
  },
  {
    id: 'usr-aluno',
    name: 'Lucas Ferreira dos Santos',
    email: 'lucas.santos@aluno.universidade.edu.br',
    role: 'aluno',
    documentId: 'Matrícula 2022014589',
    department: 'Engenharia de Agrimensura',
    status: 'ativo',
    avatarInitials: 'LS',
    createdAt: '2026-02-10T14:00:00Z'
  },
  {
    id: 'usr-pendente-1',
    name: 'Carolina Mendes (Nova Aluna)',
    email: 'carolina.mendes@aluno.universidade.edu.br',
    role: 'aluno',
    documentId: 'Matrícula 2026004112',
    department: 'Engenharia de Agrimensura',
    status: 'pendente',
    avatarInitials: 'CM',
    createdAt: '2026-08-25T19:00:00Z'
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
    status: 'disponivel',
    description: 'Estação total manual de precisão angular 1 segundo com software FlexField integrado.',
    specs: 'Leitura com prisma até 3500m / Laser 500m'
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
    professor: 'Profa. Dra. Helena S. Guimarães',
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
    professor: 'Prof. Carlos Eduardo Mendes',
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
    professor: 'Prof. Roberto F. Alcantara',
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
    professor: 'Prof. Convidado - Depto. Florestal',
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
    professor: 'Profa. Dra. Helena S. Guimarães',
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
    professor: 'Prof. Carlos Eduardo Mendes',
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
    professor: 'Prof. Convidado - Depto. Florestal',
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
    professor: 'Prof. Carlos Eduardo Mendes',
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
    professor: 'Prof. Dr. Marcos Vinicius',
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
    professor: 'Prof. Dr. Marcos Vinicius',
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
    professor: 'Profa. Dra. Helena S. Guimarães',
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
    professor: 'Prof. Roberto F. Alcantara',
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
    professor: 'Prof. Dr. Marcos Vinicius',
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
    professor: 'Prof. Dr. Marcos Vinicius',
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
    professor: 'Profa. Dra. Helena S. Guimarães',
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
    professor: 'Prof. Roberto F. Alcantara',
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
    professor: 'Prof. Dr. Marcos Vinicius',
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
    professor: 'Prof. Dr. Marcos Vinicius',
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
    professor: 'Prof. Carlos Eduardo Mendes',
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
    professor: 'Profa. Dra. Helena S. Guimarães',
    semester: '2026/1',
    notes: 'Aulas práticas das 07:10 às 10:40 (4 tempos)'
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-001',
    protocol: 'REQ-2026-0801',
    labId: 'laser',
    date: '2026-08-28',
    startTime: '16:00',
    endTime: '18:30',
    purposeType: 'tcc',
    title: 'Calibração do Scanner 3D para Levantamento de Patrimônio',
    description: 'Ensaio prático e teste de calibração geométrica das miras de referência para coleta de dados de TCC.',
    applicantName: 'Lucas Ferreira dos Santos',
    applicantEmail: 'lucas.santos@aluno.universidade.edu.br',
    applicantPhone: '(41) 98765-4321',
    applicantRole: 'aluno',
    applicantId: '2022014589',
    supervisorName: 'Prof. Dr. Marcos Vinicius',
    expectedAttendees: 3,
    requestedEquipments: ['eq-laser-01'],
    status: 'aprovada',
    createdById: 'usr-aluno',
    reviewedBy: {
      userId: 'usr-coord',
      userName: 'Prof. Dr. Marcos Vinicius',
      userEmail: 'marcos.vinicius@universidade.edu.br',
      userRole: 'coordenador',
      actionDate: '2026-08-24T14:30:00Z'
    },
    adminNotes: 'Aprovado. O solicitante deve retirar a chave com o técnico Gabriel na Sala 1B308.',
    createdAt: '2026-08-24T10:15:00Z',
    updatedAt: '2026-08-24T14:30:00Z'
  },
  {
    id: 'res-002',
    protocol: 'REQ-2026-0802',
    labId: 'sigeo',
    date: '2026-08-27',
    startTime: '13:10',
    endTime: '16:00',
    purposeType: 'iniciacao_cientifica',
    title: 'Processamento de Mosaico Ortorretificado com Agisoft Metashape',
    description: 'Renderização em lote de 1.400 fotos de drone do projeto de monitoramento de bacias hidrográficas.',
    applicantName: 'Mariana Costa Lima',
    applicantEmail: 'mariana.lima@aluno.universidade.edu.br',
    applicantPhone: '(41) 99123-8877',
    applicantRole: 'aluno',
    applicantId: '2021039811',
    supervisorName: 'Profa. Dra. Helena S. Guimarães',
    expectedAttendees: 2,
    requestedEquipments: ['eq-sigeo-03'],
    status: 'aprovada',
    reviewedBy: {
      userId: 'usr-mon',
      userName: 'Gabriel Alencar (Técnico de Laboratório)',
      userEmail: 'gabriel.tecnico@universidade.edu.br',
      userRole: 'tecnico',
      actionDate: '2026-08-23T16:20:00Z'
    },
    adminNotes: 'Estação de trabalho Servidor 01 liberada para processamento.',
    createdAt: '2026-08-23T11:00:00Z',
    updatedAt: '2026-08-23T16:20:00Z'
  },
  {
    id: 'res-003',
    protocol: 'REQ-2026-0803',
    labId: 'laser',
    date: '2026-08-29',
    startTime: '08:00',
    endTime: '12:00',
    purposeType: 'projeto_extensao',
    title: 'Treinamento de Equipe em Receptores GNSS RTK',
    description: 'Capacitação prática para bolsistas do projeto de demarcação fundiária e regularização de assentamentos rurais.',
    applicantName: 'Felipe Augusto Nogueira',
    applicantEmail: 'felipe.nogueira@universidade.edu.br',
    applicantPhone: '(41) 99888-1122',
    applicantRole: 'professor',
    applicantId: 'SIAPE 1849201',
    expectedAttendees: 10,
    requestedEquipments: ['eq-laser-04', 'eq-laser-05'],
    status: 'pendente',
    createdAt: '2026-08-25T15:45:00Z',
    updatedAt: '2026-08-25T15:45:00Z'
  },
  {
    id: 'res-004',
    protocol: 'REQ-2026-0804',
    labId: 'sigeo',
    date: '2026-08-28',
    startTime: '16:50',
    endTime: '18:30',
    purposeType: 'apoio_tecnico',
    title: 'Plantão Técnico e Oficinas de QGIS',
    description: 'Atendimento técnico aberto para a comunidade acadêmica sobre introdução ao geoprocessamento em software livre.',
    applicantName: 'Gabriel Alencar (Técnico de Laboratório)',
    applicantEmail: 'gabriel.tecnico@universidade.edu.br',
    applicantPhone: '(41) 98877-6655',
    applicantRole: 'tecnico',
    applicantId: 'SIAPE 20230012',
    expectedAttendees: 20,
    requestedEquipments: ['eq-sigeo-01'],
    status: 'pendente',
    createdAt: '2026-08-25T20:00:00Z',
    updatedAt: '2026-08-25T20:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    actionType: 'solicitacao_aprovada',
    targetId: 'res-001',
    targetType: 'reserva',
    targetTitle: 'Calibração do Scanner 3D (REQ-2026-0801)',
    performedBy: {
      id: 'usr-coord',
      name: 'Prof. Dr. Marcos Vinicius',
      email: 'marcos.vinicius@universidade.edu.br',
      role: 'coordenador'
    },
    applicantDetails: {
      name: 'Lucas Ferreira dos Santos',
      email: 'lucas.santos@aluno.universidade.edu.br',
      id: '2022014589',
      role: 'aluno'
    },
    details: 'Reserva no Laboratório LASER para 28/08 APROVADA pelo coordenador.',
    timestamp: '2026-08-24T14:30:00Z'
  },
  {
    id: 'aud-002',
    actionType: 'solicitacao_aprovada',
    targetId: 'res-002',
    targetType: 'reserva',
    targetTitle: 'Processamento Agisoft Metashape (REQ-2026-0802)',
    performedBy: {
      id: 'usr-mon',
      name: 'Gabriel Alencar (Técnico de Laboratório)',
      email: 'gabriel.tecnico@universidade.edu.br',
      role: 'tecnico'
    },
    applicantDetails: {
      name: 'Mariana Costa Lima',
      email: 'mariana.lima@aluno.universidade.edu.br',
      id: '2021039811',
      role: 'aluno'
    },
    details: 'Reserva no Laboratório SIGEO para 27/08 APROVADA pelo técnico responsável.',
    timestamp: '2026-08-23T16:20:00Z'
  }
];
