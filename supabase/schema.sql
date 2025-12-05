-- Schema para o jogo RPG
-- Execute este SQL no SQL Editor do Supabase

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  
  -- Game data (JSONB para flexibilidade)
  character_class TEXT,
  attributes JSONB DEFAULT '{"strength": 10, "magic": 10, "dexterity": 10, "agility": 10, "vitality": 10}'::jsonb,
  available_points INTEGER DEFAULT 0,
  stats JSONB DEFAULT '{"level": 1, "experience": 0, "experienceToNext": 100, "health": 100, "maxHealth": 100, "mana": 50, "maxMana": 50, "attack": 20, "defense": 15, "criticalChance": 5, "dodgeChance": 4}'::jsonb,
  inventory JSONB DEFAULT '[]'::jsonb,
  battle JSONB DEFAULT '{"isActive": false, "player": {"health": 100, "maxHealth": 100, "mana": 50, "maxMana": 50}, "monster": null, "turn": "player", "battleLog": []}'::jsonb,
  collection JSONB DEFAULT '{"isActive": false, "lastCollection": 0, "collectionInterval": 30, "skills": [], "resources": []}'::jsonb,
  equipped_items JSONB DEFAULT '{}'::jsonb,
  gold INTEGER DEFAULT 100,
  diamonds INTEGER DEFAULT 0, -- Premium currency (cash/R$)
  pvp_stats JSONB,
  skills JSONB DEFAULT '[]'::jsonb,
  purchased_items JSONB DEFAULT '[]'::jsonb, -- Items purchased from shop (profile images, etc)
  profile_image TEXT, -- Selected profile image path
  
  -- Legacy fields (para compatibilidade)
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  health INTEGER DEFAULT 100,
  max_health INTEGER DEFAULT 100,
  mana INTEGER DEFAULT 50,
  max_mana INTEGER DEFAULT 50,
  strength INTEGER DEFAULT 10,
  agility INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  guild_id TEXT,
  guild_role TEXT CHECK (guild_role IN ('member', 'officer', 'leader'))
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);

-- Tabela de estatísticas PvP
CREATE TABLE IF NOT EXISTS pvp_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  total_battles INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_win_streak INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 1000,
  last_battle_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para PvP
CREATE INDEX IF NOT EXISTS idx_pvp_stats_rating ON pvp_stats(rating DESC);
CREATE INDEX IF NOT EXISTS idx_pvp_stats_user_id ON pvp_stats(user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela pvp_stats
DROP TRIGGER IF EXISTS update_pvp_stats_updated_at ON pvp_stats;
CREATE TRIGGER update_pvp_stats_updated_at
  BEFORE UPDATE ON pvp_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Desabilitado por padrão para facilitar desenvolvimento
-- Você pode habilitar depois se precisar de segurança adicional
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_stats ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo por enquanto - ajuste conforme necessário)
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on pvp_stats" ON pvp_stats;
CREATE POLICY "Allow all operations on pvp_stats" ON pvp_stats
  FOR ALL USING (true) WITH CHECK (true);

-- Tabela de Guilds
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🛡️',
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  experience_to_next INTEGER DEFAULT 100,
  gold INTEGER DEFAULT 0,
  max_members INTEGER DEFAULT 20,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{"buffs": {}, "upgrades": {}, "joinType": "open"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Guilds
CREATE INDEX IF NOT EXISTS idx_guilds_name ON guilds(name);
CREATE INDEX IF NOT EXISTS idx_guilds_leader_id ON guilds(leader_id);
CREATE INDEX IF NOT EXISTS idx_guilds_level ON guilds(level DESC);
CREATE INDEX IF NOT EXISTS idx_guilds_experience ON guilds(experience DESC);
CREATE INDEX IF NOT EXISTS idx_users_guild_id ON users(guild_id) WHERE guild_id IS NOT NULL;

-- Trigger para atualizar updated_at na tabela guilds
DROP TRIGGER IF EXISTS update_guilds_updated_at ON guilds;
CREATE TRIGGER update_guilds_updated_at
  BEFORE UPDATE ON guilds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para Guilds
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on guilds" ON guilds;
CREATE POLICY "Allow all operations on guilds" ON guilds
  FOR ALL USING (true) WITH CHECK (true);

