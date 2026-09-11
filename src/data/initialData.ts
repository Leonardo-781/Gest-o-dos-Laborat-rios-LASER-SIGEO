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
  // ============================================================================
  // EQUIPAMENTOS OFICIAIS DO LTGEO (Sala 1B210)
  // Transcritos fielmente das Planilhas 01 e 02 de controle patrimonial da UFU
  // ============================================================================

  // --- TEODOLITOS ÓPTICOS (Planilha 01) ---
  {
    id: 'eq-ltgeo-teo-081804',
    labId: 'ltgeo',
    name: 'Teodolito Óptico',
    code: 'TEO-081804',
    patrimonio: '081804',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito óptico de precisão para medição angular horizontal e vertical em aulas práticas e levantamentos.',
    specs: 'Leitura angular direta / Círculo graduado / Luneta com aumento de 30x'
  },
  {
    id: 'eq-ltgeo-teo-081805',
    labId: 'ltgeo',
    name: 'Teodolito Óptico',
    code: 'TEO-081805',
    patrimonio: '081805',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito óptico para levantamentos topográficos, caminhamento e determinação de azimutes.',
    specs: 'Leitura angular direta / Nível tubular / Luneta com aumento de 30x'
  },
  {
    id: 'eq-ltgeo-teo-081806',
    labId: 'ltgeo',
    name: 'Teodolito Óptico',
    code: 'TEO-081806',
    patrimonio: '081806',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito óptico-mecânico para treinamento prático de campo em agrimensura e engenharia.',
    specs: 'Micrômetro óptico / Trava de movimentos horizontal e vertical'
  },
  {
    id: 'eq-ltgeo-teo-081807',
    labId: 'ltgeo',
    name: 'Teodolito Óptico',
    code: 'TEO-081807',
    patrimonio: '081807',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito óptico para medições de ângulos zenitais e azimutais em práticas acadêmicas.',
    specs: 'Aumento da luneta 30x / Prumo óptico integrado'
  },
  {
    id: 'eq-ltgeo-teo-081808',
    labId: 'ltgeo',
    name: 'Teodolito Óptico',
    code: 'TEO-081808',
    patrimonio: '081808',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito óptico de precisão para poligonais e triangulações topográficas de campo.',
    specs: 'Resolução angular com nônio / Foco fino e rápido'
  },
  {
    id: 'eq-ltgeo-teo-081810',
    labId: 'ltgeo',
    name: 'Teodolito Óptico',
    code: 'TEO-081810',
    patrimonio: '081810',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito óptico para atividades práticas de topografia clássica e agrimensura.',
    specs: 'Círculo horizontal graduado / Sensibilidade de bolha de alta precisão'
  },
  {
    id: 'eq-ltgeo-teo-081811',
    labId: 'ltgeo',
    name: 'Teodolito Óptico',
    code: 'TEO-081811',
    patrimonio: '081811',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito óptico para aulas de campo e levantamentos planimétricos e altimétricos.',
    specs: 'Óptica tratada antirreflexo / Sistema de pontaria de precisão'
  },
  {
    id: 'eq-ltgeo-teo-081812',
    labId: 'ltgeo',
    name: 'Teodolito Óptico',
    code: 'TEO-081812',
    patrimonio: '081812',
    category: 'topografia',
    status: 'disponivel',
    description: 'Teodolito óptico para medições de direções e ângulos em levantamentos topográficos.',
    specs: 'Base nivelante com parafusos calantes / Prumo óptico'
  },

  // --- NÍVEIS ÓPTICOS / AUTOMÁTICOS (Planilha 01) ---
  {
    id: 'eq-ltgeo-niv-095174',
    labId: 'ltgeo',
    name: 'Nível Óptico Automático',
    code: 'NIV-095174',
    patrimonio: '095174',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível óptico automático com compensador amortecido para transporte altimétrico e nivelamento geométrico.',
    specs: 'Compensador automático / Ampliação 24x / Desvio padrão 1.5mm/km duplo'
  },
  {
    id: 'eq-ltgeo-niv-095175',
    labId: 'ltgeo',
    name: 'Nível Óptico Automático',
    code: 'NIV-095175',
    patrimonio: '095175',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível topográfico automático para determinação de desníveis, perfis longitudinais e seções transversais.',
    specs: 'Ampliação 24x / Precisão milimétrica com mira graduada / Proteção IP54'
  },
  {
    id: 'eq-ltgeo-niv-095176',
    labId: 'ltgeo',
    name: 'Nível Óptico Automático',
    code: 'NIV-095176',
    patrimonio: '095176',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível de luneta automático para aulas práticas de nivelamento geométrico simples e composto.',
    specs: 'Compensador magnético / Círculo horizontal 360°'
  },
  {
    id: 'eq-ltgeo-niv-095177',
    labId: 'ltgeo',
    name: 'Nível Óptico Automático',
    code: 'NIV-095177',
    patrimonio: '095177',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível óptico automático para nivelamento de eixos viários, terraplenagem e implantação de cotas.',
    specs: 'Aumento óptico 24x / Diâmetro da objetiva 36mm / Retículo com fios estadimétricos'
  },
  {
    id: 'eq-ltgeo-niv-095178',
    labId: 'ltgeo',
    name: 'Nível Óptico Automático',
    code: 'NIV-095178',
    patrimonio: '095178',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível topográfico automático com compensador estável para práticas de nivelamento de referência (RN).',
    specs: 'Erro quilométrico de nivelamento duplo < 2.0mm / Visada mínima 0.3m'
  },
  {
    id: 'eq-ltgeo-niv-095179',
    labId: 'ltgeo',
    name: 'Nível Óptico Automático',
    code: 'NIV-095179',
    patrimonio: '095179',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível óptico automático para controle altimétrico em levantamentos cadastrais e de engenharia.',
    specs: 'Precisão milimétrica / Prisma com espelho para leitura da bolha esférica'
  },
  {
    id: 'eq-ltgeo-niv-095180',
    labId: 'ltgeo',
    name: 'Nível Óptico Automático',
    code: 'NIV-095180',
    patrimonio: '095180',
    category: 'topografia',
    status: 'disponivel',
    description: 'Nível de precisão automático com compensador pendular para medição de desníveis com miras de alumínio.',
    specs: 'Ampliação 24x / Parafuso de chamada horizontal infinito / Rosca 5/8" padrão'
  },

  // --- TEODOLITO / ESTAÇÃO TOTAL (Planilha 02) ---
  {
    id: 'eq-ltgeo-teo-et-081813',
    labId: 'ltgeo',
    name: 'Teodolito / Estação Total',
    code: 'ET-081813',
    patrimonio: '081813',
    category: 'topografia',
    status: 'disponivel',
    description: 'Equipamento de medição angular digital e distanciômetro eletrônico para práticas de campo.',
    specs: 'Display digital / Medição com prisma / Eixo duplo'
  },

  // --- ESTAÇÕES TOTAIS ELETRÔNICAS (Planilha 02) ---
  {
    id: 'eq-ltgeo-et-081814',
    labId: 'ltgeo',
    name: 'Estação Total Eletrônica',
    code: 'ET-081814',
    patrimonio: '081814',
    category: 'topografia',
    status: 'disponivel',
    description: 'Estação total de precisão para levantamento de poligonais fechadas e abertas, irradiação e cadastro.',
    specs: 'Alcance 3.000m com prisma / Precisão angular 2" / Display gráfico duplo'
  },
  {
    id: 'eq-ltgeo-et-081815',
    labId: 'ltgeo',
    name: 'Estação Total Eletrônica',
    code: 'ET-081815',
    patrimonio: '081815',
    category: 'topografia',
    status: 'disponivel',
    description: 'Estação total para práticas de campo, cálculo de coordenadas, estaqueamento e medição de distâncias.',
    specs: 'EDM de alta precisão / Memória interna / Compensador biaxial'
  },
  {
    id: 'eq-ltgeo-et-081816',
    labId: 'ltgeo',
    name: 'Estação Total Eletrônica',
    code: 'ET-081816',
    patrimonio: '081816',
    category: 'topografia',
    status: 'disponivel',
    description: 'Estação total com programas integrados para levantamento topográfico, locação e cálculo de área.',
    specs: 'Precisão angular 2" / Alcance até 3500m com prisma / Interface serial/USB'
  },
  {
    id: 'eq-ltgeo-et-081817',
    labId: 'ltgeo',
    name: 'Estação Total Eletrônica',
    code: 'ET-081817',
    patrimonio: '081817',
    category: 'topografia',
    status: 'disponivel',
    description: 'Estação total para trabalhos de campo e aulas práticas de topografia e geodésia.',
    specs: 'Medição rápida de distâncias / Teclado alfanumérico / Prumo óptico'
  },
  {
    id: 'eq-ltgeo-et-704532',
    labId: 'ltgeo',
    name: 'Estação Total Robótica / Motorizada',
    code: 'ET-704532',
    patrimonio: '704532',
    category: 'topografia',
    status: 'disponivel',
    description: 'Estação total motorizada com rastreamento automático de prisma (robótica) para levantamentos de alta produtividade.',
    specs: 'Servomotores de alta velocidade / Autotargeting / Comunicação sem fio de longo alcance'
  },
  {
    id: 'eq-ltgeo-et-734169',
    labId: 'ltgeo',
    name: 'Estação Total Leica (Estação LEICA)',
    code: 'ET-734169',
    patrimonio: '734169',
    category: 'topografia',
    status: 'disponivel',
    description: 'Estação total Leica de precisão suíça com leitura a laser com e sem prisma e software Leica FlexField.',
    specs: 'Óptica Leica / Medição sem prisma até 500m / Display de alta resolução'
  },

  // --- RECEPTORES GNSS GEODÉSICOS (Planilha 02) ---
  {
    id: 'eq-ltgeo-gnss-084408',
    labId: 'ltgeo',
    name: 'Receptor GNSS Geodésico Promark 500',
    code: 'GNSS-084408',
    patrimonio: '084408',
    category: 'gnss',
    status: 'disponivel',
    description: 'Receptor geodésico multi-frequência (GPS/GLONASS) para levantamentos estáticos pós-processados e RTK.',
    specs: 'Rastreamento L1/L2/L5 GPS + GLONASS / Operação Base e Rover / Precisão milimétrica'
  },
  {
    id: 'eq-ltgeo-gnss-084410',
    labId: 'ltgeo',
    name: 'Receptor GNSS Geodésico Promark 500',
    code: 'GNSS-084410',
    patrimonio: '084410',
    category: 'gnss',
    status: 'disponivel',
    description: 'Receptor GNSS geodésico multi-frequência para implantação de marcos, georreferenciamento e redes geodésicas.',
    specs: 'Multi-frequência / Rádio UHF / Precisão estática pós-processada milimétrica'
  },
  {
    id: 'eq-ltgeo-gnss-099995',
    labId: 'ltgeo',
    name: 'Receptor GNSS Promark 200',
    code: 'GNSS-099995',
    patrimonio: '099995',
    category: 'gnss',
    status: 'disponivel',
    description: 'Receptor e coletor de dados GNSS de dupla frequência compacto com tecnologia Blade para RTK e pós-processamento.',
    specs: 'GPS L1/L2, GLONASS / Coletor integrado / Software de campo em tempo real'
  },
  {
    id: 'eq-ltgeo-gnss-099996',
    labId: 'ltgeo',
    name: 'Receptor GNSS Promark 100',
    code: 'GNSS-099996',
    patrimonio: '099996',
    category: 'gnss',
    status: 'disponivel',
    description: 'Receptor GNSS submétrico e pós-processado para cadastro, mapeamento e suporte a aulas de GNSS.',
    specs: 'Rastreamento L1 GPS/GLONASS / Coletor portátil integrado'
  },
  {
    id: 'eq-ltgeo-gnss-703274',
    labId: 'ltgeo',
    name: 'Receptor GNSS Geodésico Topcon HiPer (Topcon Hyper)',
    code: 'GNSS-703274',
    patrimonio: '703274',
    category: 'gnss',
    status: 'disponivel',
    description: 'Receptor geodésico integrado Topcon HiPer com antena, receptor e rádio UHF integrados para medições RTK e estático.',
    specs: 'Tecnologia Paradigm multi-frequência / Rádio UHF interno / Precisão estática 3mm + 0.5ppm'
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
