-- Schema para Sistema de Guilds
-- Execute este SQL no SQL Editor do Supabase
-- Este script é idempotente (pode ser executado múltiplas vezes)

-- Tabela de Guilds
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🛡️', -- Emoji ou código de ícone
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  experience_to_next INTEGER DEFAULT 100,
  gold INTEGER DEFAULT 0, -- Guild Bank
  max_members INTEGER DEFAULT 20,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{
    "buffs": {},
    "upgrades": {},
    "joinType": "open"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_guilds_name ON guilds(name);
CREATE INDEX IF NOT EXISTS idx_guilds_leader_id ON guilds(leader_id);
CREATE INDEX IF NOT EXISTS idx_guilds_level ON guilds(level DESC);
CREATE INDEX IF NOT EXISTS idx_guilds_experience ON guilds(experience DESC);

-- Índice para buscar usuários por guild
CREATE INDEX IF NOT EXISTS idx_users_guild_id ON users(guild_id) WHERE guild_id IS NOT NULL;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_guilds_updated_at ON guilds;
CREATE TRIGGER update_guilds_updated_at
  BEFORE UPDATE ON guilds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

-- Política básica (permitir tudo por enquanto)
DROP POLICY IF EXISTS "Allow all operations on guilds" ON guilds;
CREATE POLICY "Allow all operations on guilds" ON guilds
  FOR ALL USING (true) WITH CHECK (true);

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Guild schema aplicado com sucesso! ✅';
END $$;

