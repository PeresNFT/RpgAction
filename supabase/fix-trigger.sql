-- Script para corrigir o erro de trigger duplicado
-- Execute este SQL ANTES de executar o schema.sql novamente

-- Remover o trigger se ele existir
DROP TRIGGER IF EXISTS update_pvp_stats_updated_at ON pvp_stats;

-- Remover as políticas se elas existirem (para recriar sem erro)
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on pvp_stats" ON pvp_stats;

-- Agora você pode executar o schema.sql novamente sem erros

