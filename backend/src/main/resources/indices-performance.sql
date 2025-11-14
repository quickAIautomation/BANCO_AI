-- Script para criar índices que melhoram a performance das queries
-- Execute este script no banco de dados PostgreSQL em produção

-- Índices para a tabela carros (mais usada)
CREATE INDEX IF NOT EXISTS idx_carros_empresa_id ON carros(empresa_id);
CREATE INDEX IF NOT EXISTS idx_carros_placa ON carros(UPPER(placa));
CREATE INDEX IF NOT EXISTS idx_carros_modelo ON carros(UPPER(modelo));
CREATE INDEX IF NOT EXISTS idx_carros_marca ON carros(UPPER(marca));
CREATE INDEX IF NOT EXISTS idx_carros_data_cadastro ON carros(data_cadastro DESC);
CREATE INDEX IF NOT EXISTS idx_carros_quilometragem ON carros(quilometragem);
CREATE INDEX IF NOT EXISTS idx_carros_valor ON carros(valor);
CREATE INDEX IF NOT EXISTS idx_carros_empresa_placa ON carros(empresa_id, UPPER(placa));

-- Índices para a tabela usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Índices para a tabela auditoria (para relatórios)
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa_data ON auditoria(empresa_id, data_acao DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_email);

-- Índices para a tabela api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_chave ON api_keys(chave);
CREATE INDEX IF NOT EXISTS idx_api_keys_usuario ON api_keys(usuario_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_ativa ON api_keys(ativa);

-- Índices para a tabela reset_tokens
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_email ON reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expiracao ON reset_tokens(data_expiracao);

-- Analisar tabelas para otimizar estatísticas
ANALYZE carros;
ANALYZE usuarios;
ANALYZE auditoria;
ANALYZE api_keys;
ANALYZE reset_tokens;

