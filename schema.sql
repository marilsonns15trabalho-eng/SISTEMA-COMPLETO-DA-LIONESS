-- Script de Criação de Tabelas do Sistema

-- 1. Tabela de Planos
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Alunos
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    cpf TEXT,
    rg TEXT,
    data_nascimento DATE,
    genero TEXT,
    estado_civil TEXT,
    profissao TEXT,
    telefone TEXT,
    celular TEXT,
    email TEXT, -- Tornando opcional
    cep TEXT,
    endereco TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    contato_emergencia_nome TEXT,
    contato_emergencia_telefone TEXT,
    contato_emergencia_parentesco TEXT,
    plano_id UUID REFERENCES plans(id),
    data_matricula DATE,
    dia_vencimento INTEGER,
    status TEXT DEFAULT 'ativo',
    observacoes TEXT,
    objetivos TEXT[],
    peso_desejado NUMERIC,
    grupo TEXT,
    modalidade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- 3. Tabela Financeiro
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

-- 4. Tabela de Boletos (Bills)
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

-- 5. Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS assinaturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    plan_id UUID REFERENCES plans(id),
    plan_name TEXT,
    plan_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID
);

-- Ajustes necessários (caso as colunas já existam mas estejam como NOT NULL)
ALTER TABLE students ALTER COLUMN email DROP NOT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS bairro TEXT;
