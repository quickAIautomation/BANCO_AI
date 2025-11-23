-- Índices para otimização de performance e escalabilidade
-- Execute este script após criar as tabelas

-- ============================================
-- ÍNDICES PARA TABELA CARROS
-- ============================================

-- Índice para busca por empresa (mais comum)
CREATE INDEX IF NOT EXISTS idx_carro_empresa_id ON carros(empresa_id);

-- Índice para busca por placa (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_carro_placa_upper ON carros(UPPER(placa));

-- Índice composto para marca e modelo (busca comum)
CREATE INDEX IF NOT EXISTS idx_carro_marca_modelo ON carros(marca, modelo);

-- Índice para ordenação por data de cadastro (mais recentes primeiro)
CREATE INDEX IF NOT EXISTS idx_carro_data_cadastro_desc ON carros(data_cadastro DESC);

-- Índice para filtros de valor (range queries)
CREATE INDEX IF NOT EXISTS idx_carro_valor ON carros(valor) WHERE valor IS NOT NULL;

-- Índice para filtros de quilometragem (range queries)
CREATE INDEX IF NOT EXISTS idx_carro_quilometragem ON carros(quilometragem);

-- Índice composto para empresa + data (queries combinadas)
CREATE INDEX IF NOT EXISTS idx_carro_empresa_data ON carros(empresa_id, data_cadastro DESC);

-- ============================================
-- ÍNDICES PARA TABELA USUARIOS
-- ============================================

-- Índice único para email (já deve existir, mas garantindo)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_email_unique ON usuarios(email);

-- Índice para busca por empresa
CREATE INDEX IF NOT EXISTS idx_usuario_empresa_id ON usuarios(empresa_id);

-- Índice para filtro de usuários ativos
CREATE INDEX IF NOT EXISTS idx_usuario_ativo ON usuarios(ativo) WHERE ativo = true;

-- Índice composto para empresa + ativo (queries comuns)
CREATE INDEX IF NOT EXISTS idx_usuario_empresa_ativo ON usuarios(empresa_id, ativo);

-- ============================================
-- ÍNDICES PARA TABELA EMPRESAS
-- ============================================

-- Índice único para CNPJ (se não existir)
CREATE UNIQUE INDEX IF NOT EXISTS idx_empresa_cnpj_unique ON empresas(cnpj) WHERE cnpj IS NOT NULL;

-- Índice para filtro de empresas ativas
CREATE INDEX IF NOT EXISTS idx_empresa_ativa ON empresas(ativa) WHERE ativa = true;

-- Índice para busca por nome (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_empresa_nome_upper ON empresas(UPPER(nome));

-- ============================================
-- ÍNDICES PARA TABELA AUDITORIA
-- ============================================

-- Índice para busca por empresa e data (queries de relatório)
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_data ON auditoria(empresa_id, data_acao DESC);

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_email);

-- Índice para busca por entidade
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(entidade, entidade_id);

-- ============================================
-- ÍNDICES PARA TABELA API_KEYS
-- ============================================

-- Índice para busca por chave (lookup rápido)
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_key_chave_unique ON api_keys(chave);

-- Índice para filtro de chaves ativas
CREATE INDEX IF NOT EXISTS idx_api_key_ativa ON api_keys(ativa) WHERE ativa = true;

-- Índice para busca por usuário
CREATE INDEX IF NOT EXISTS idx_api_key_usuario_id ON api_keys(usuario_id);

-- ============================================
-- ANÁLISE DE ÍNDICES
-- ============================================

-- Para verificar índices criados:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'carros';

-- Para analisar uso de índices:
-- EXPLAIN ANALYZE SELECT * FROM carros WHERE empresa_id = 1 ORDER BY data_cadastro DESC LIMIT 20;

