-- Adicionar coluna skills à tabela users
-- Execute este SQL no SQL Editor do Supabase

-- Adicionar coluna skills (JSONB) se não existir
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;

-- Inicializar skills para usuários que já têm uma classe mas não têm skills
-- Isso inicializa todas as skills da classe no nível 1
UPDATE users
SET skills = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'skillId', skill.id,
      'level', 1,
      'lastUsed', NULL
    )
  )
  FROM (
    SELECT id FROM (
      VALUES 
        ('warrior_damage'),
        ('warrior_defense'),
        ('warrior_heal'),
        ('archer_damage'),
        ('archer_burst'),
        ('archer_buff'),
        ('mage_damage'),
        ('mage_burn'),
        ('mage_shield')
    ) AS skills(id)
    WHERE 
      (character_class = 'warrior' AND id IN ('warrior_damage', 'warrior_defense', 'warrior_heal'))
      OR
      (character_class = 'archer' AND id IN ('archer_damage', 'archer_burst', 'archer_buff'))
      OR
      (character_class = 'mage' AND id IN ('mage_damage', 'mage_burn', 'mage_shield'))
  ) AS skill
)
WHERE character_class IS NOT NULL 
  AND (skills IS NULL OR skills = '[]'::jsonb);

