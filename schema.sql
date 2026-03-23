-- Script de Criação e Atualização de Tabelas do Sistema
-- Este script reflete o estado ideal do banco de dados para o funcionamento de todos os módulos.

-- 1. Tabela de Planos
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    duration_months INTEGER DEFAULT 1,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Alunos (Students)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cellphone TEXT,
    cpf TEXT,
    rg TEXT,
    birth_date DATE,
    gender TEXT,
    marital_status TEXT,
    profession TEXT,
    zip_code TEXT,
    address TEXT,
    number TEXT,
    complement TEXT,
    bairro TEXT,
    city TEXT,
    state TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    emergency_relationship TEXT,
    plan TEXT, -- Nome do plano (texto)
    plan_name TEXT, -- Nome do plano (texto)
    plan_id UUID REFERENCES plans(id),
    join_date DATE,
    start_date DATE,
    due_day INTEGER,
    status TEXT DEFAULT 'ativo',
    notes TEXT,
    objectives TEXT[],
    desired_weight NUMERIC,
    amount_paid NUMERIC,
    "group" TEXT,
    modality TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- 3. Tabela de Treinos
CREATE TABLE IF NOT EXISTS treinos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    nome TEXT NOT NULL,
    objetivo TEXT,
    nivel TEXT,
    duracao_minutos INTEGER,
    descricao TEXT,
    exercicios JSONB,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- 4. Tabela de Avaliações Físicas
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    data DATE NOT NULL,
    peso NUMERIC,
    altura NUMERIC,
    
    -- Perímetros
    ombro NUMERIC,
    torax NUMERIC,
    braco_direito NUMERIC,
    braco_esquerdo NUMERIC,
    antebraco_direito NUMERIC,
    antebraco_esquerdo NUMERIC,
    cintura NUMERIC,
    abdome NUMERIC,
    quadril NUMERIC,
    coxa_direita NUMERIC,
    coxa_esquerda NUMERIC,
    panturrilha_direita NUMERIC,
    panturrilha_esquerda NUMERIC,

    -- Dobras Cutâneas
    tricipital NUMERIC,
    subescapular NUMERIC,
    peitoral NUMERIC,
    axilar_media NUMERIC,
    supra_iliaca NUMERIC,
    abdominal NUMERIC,
    coxa NUMERIC,
    panturrilha NUMERIC,

    -- Dados de Saúde
    pressao_arterial_sistolica NUMERIC,
    pressao_arterial_diastolica NUMERIC,
    frequencia_cardiaca_repouso NUMERIC,
    
    observacoes TEXT,
    
    -- Resultados (calculados)
    imc NUMERIC,
    percentual_gordura NUMERIC,
    massa_gorda NUMERIC,
    massa_magra NUMERIC,
    protocolo TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- 5. Tabela de Anamneses
CREATE TABLE IF NOT EXISTS anamneses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    data_anamnese DATE NOT NULL,
    peso NUMERIC,
    altura NUMERIC,
    objetivo_nutricional TEXT,
    restricoes_alimentares TEXT,
    alergias TEXT,
    medicamentos TEXT,
    historico_familiar TEXT,
    habitos_alimentares TEXT,
    consumo_agua TEXT,
    atividade_fisica TEXT,
    observacoes TEXT,
    circunferencia_abdominal TEXT,
    circunferencia_quadril TEXT,
    medidas_corpo TEXT,
    doencas_cronicas TEXT,
    problemas_saude TEXT,
    cirurgias TEXT,
    condicoes_hormonais TEXT,
    acompanhamento_psicologico TEXT,
    disturbios_alimentares TEXT,
    gravida_amamentando TEXT,
    acompanhamento_previo TEXT,
    frequencia_refeicoes TEXT,
    horarios_refeicoes TEXT,
    consumo_fastfood TEXT,
    consumo_doces TEXT,
    consumo_bebidas_acucaradas TEXT,
    consumo_alcool TEXT,
    gosta_cozinhar TEXT,
    preferencia_alimentos TEXT,
    consumo_cafe TEXT,
    uso_suplementos TEXT,
    frequencia_atividade_fisica TEXT,
    objetivos_treino TEXT,
    rotina_sono TEXT,
    nivel_estresse TEXT,
    tempo_sentado TEXT,
    dificuldade_dietas TEXT,
    lanches_fora TEXT,
    come_emocional TEXT,
    beliscar TEXT,
    compulsao_alimentar TEXT,
    fome_fora_horario TEXT,
    estrategias_controle_peso TEXT,
    alimentos_preferidos TEXT,
    alimentos_evitados TEXT,
    meta_peso_medidas TEXT,
    disposicao_mudancas TEXT,
    preferencia_dietas TEXT,
    expectativas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- 6. Tabela de Financeiro (Transações)
CREATE TABLE IF NOT EXISTS financeiro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    valor NUMERIC NOT NULL,
    data_vencimento DATE NOT NULL,
    status TEXT NOT NULL,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    forma_pagamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- 7. Tabela de Boletos (Bills)
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- 8. Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS assinaturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    plan_id UUID REFERENCES plans(id),
    plan_name TEXT,
    plan_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- 9. Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_academia TEXT NOT NULL,
    cnpj TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    logo_url TEXT,
    cor_primaria TEXT DEFAULT '#3b82f6',
    cor_secundaria TEXT DEFAULT '#18181b',
    mensagem_boas_vindas TEXT,
    termos_contrato TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);
