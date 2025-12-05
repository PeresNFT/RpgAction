-- Adicionar campos para Shop e Profile Image
-- Execute este SQL no SQL Editor do Supabase

-- Adicionar coluna purchased_items (itens comprados da loja)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS purchased_items JSONB DEFAULT '[]'::jsonb;

-- Adicionar coluna profile_image (foto de perfil selecionada)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Campos de Shop adicionados com sucesso! ✅';
END $$;

