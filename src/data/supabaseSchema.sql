-- ==============================================================================
-- SISTEMA DE GESTÃO E AGENDAMENTO DE LABORATÓRIOS (LASER & SIGEO - AGRIMENSURA)
-- Script DDL para PostgreSQL / Supabase
-- ==============================================================================

-- 1. ENUMS E TIPOS
CREATE TYPE lab_identifier AS ENUM ('laser', 'sigeo');
CREATE TYPE user_profile_type AS ENUM ('aluno', 'professor', 'pesquisador', 'monitor', 'admin');
CREATE TYPE reservation_status_type AS ENUM ('pendente', 'aprovada', 'recusada', 'cancelada');
CREATE TYPE purpose_type_enum AS ENUM (
    'aula_regular', 
    'reposicao', 
    'tcc', 
    'iniciacao_cientifica', 
    'projeto_extensao', 
    'monitoria', 
    'reuniao', 
    'manutencao'
);
CREATE TYPE equipment_status_type AS ENUM ('disponivel', 'em_uso', 'manutencao', 'em_campo');

-- 2. TABELA DE LABORATÓRIOS
CREATE TABLE IF NOT EXISTS laboratorios (
    id VARCHAR(20) PRIMARY KEY, -- 'laser' ou 'sigeo'
    nome VARCHAR(50) NOT NULL,
    nome_completo TEXT NOT NULL,
    descricao TEXT,
    localizacao VARCHAR(100) NOT NULL,
    capacidade INTEGER NOT NULL DEFAULT 30,
    qtd_estacoes_trabalho INTEGER NOT NULL DEFAULT 10,
    professor_responsavel VARCHAR(150),
    email_responsavel VARCHAR(150),
    cor_tema VARCHAR(20) DEFAULT '#2563eb',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir dados dos laboratórios
INSERT INTO laboratorios (id, nome, nome_completo, localizacao, capacidade, qtd_estacoes_trabalho, professor_responsavel, email_responsavel, cor_tema)
VALUES 
('laser', 'LASER', 'Laboratório de Sensores, Laser Scanning e Topografia de Alta Precisão', 'Bloco C - Sala 102', 25, 6, 'Prof. Dr. Marcos Vinicius', 'laser.agrimensura@universidade.edu.br', '#2563eb'),
('sigeo', 'SIGEO', 'Laboratório de Sistemas de Informação Geográfica e Sensoriamento Remoto', 'Bloco C - Sala 204', 35, 24, 'Profa. Dra. Helena S. Guimarães', 'sigeo.agrimensura@universidade.edu.br', '#16a34a')
ON CONFLICT (id) DO NOTHING;

-- 3. TABELA DE EQUIPAMENTOS E INSTRUMENTOS
CREATE TABLE IF NOT EXISTS equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id VARCHAR(20) REFERENCES laboratorios(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    status equipment_status_type DEFAULT 'disponivel',
    descricao TEXT,
    especificacoes TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE AULAS FIXAS DO SEMESTRE (GRADE REGULAR)
CREATE TABLE IF NOT EXISTS aulas_fixas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id VARCHAR(20) REFERENCES laboratorios(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 6), -- 1: Seg, 2: Ter, ..., 6: Sab
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    codigo_disciplina VARCHAR(30) NOT NULL,
    nome_disciplina VARCHAR(150) NOT NULL,
    professor VARCHAR(150) NOT NULL,
    semestre VARCHAR(20) NOT NULL, -- Ex: '2026/1'
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE SOLICITAÇÕES / RESERVAS
CREATE TABLE IF NOT EXISTS reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo VARCHAR(30) NOT NULL UNIQUE,
    laboratorio_id VARCHAR(20) REFERENCES laboratorios(id) ON DELETE RESTRICT,
    data_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    tipo_finalidade purpose_type_enum NOT NULL,
    titulo VARCHAR(250) NOT NULL,
    descricao TEXT NOT NULL,
    solicitante_nome VARCHAR(150) NOT NULL,
    solicitante_email VARCHAR(150) NOT NULL,
    solicitante_telefone VARCHAR(30),
    solicitante_perfil user_profile_type NOT NULL,
    solicitante_documento VARCHAR(50) NOT NULL, -- Matrícula ou SIAPE
    professor_orientador VARCHAR(150),
    qtd_participantes INTEGER DEFAULT 1,
    equipamentos_solicitados TEXT[], -- Array de IDs de equipamentos
    status reservation_status_type DEFAULT 'pendente',
    motivo_recusa TEXT,
    notas_admin TEXT,
    aprovado_por VARCHAR(150),
    aprovado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reservas_data_lab ON reservas (data_reserva, laboratorio_id);
CREATE INDEX IF NOT EXISTS idx_reservas_status ON reservas (status);
CREATE INDEX IF NOT EXISTS idx_aulas_fixas_dia_lab ON aulas_fixas (dia_semana, laboratorio_id);
CREATE INDEX IF NOT EXISTS idx_equipamentos_lab ON equipamentos (laboratorio_id);

-- 7. POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
ALTER TABLE laboratorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas_fixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

-- Leitura pública para a grade de horários
CREATE POLICY "Permitir leitura pública de laboratórios" ON laboratorios FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de equipamentos" ON equipamentos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de aulas fixas" ON aulas_fixas FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de reservas aprovadas" ON reservas FOR SELECT USING (status = 'aprovada' OR auth.role() = 'authenticated');

-- Qualquer um pode submeter uma reserva
CREATE POLICY "Permitir inserção de reservas por qualquer pessoa" ON reservas FOR INSERT WITH CHECK (true);
