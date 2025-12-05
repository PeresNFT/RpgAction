-- Adicionar coluna diamonds à tabela users
-- Execute este SQL no SQL Editor do Supabase

-- Adicionar coluna diamonds se não existir
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS diamonds INTEGER DEFAULT 0;

-- Criar tabela de mercado (market_items)
CREATE TABLE IF NOT EXISTS market_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_nickname TEXT NOT NULL,
  item JSONB NOT NULL, -- Item completo (Item type)
  price INTEGER NOT NULL, -- Preço em gold
  price_diamonds INTEGER, -- Preço opcional em diamonds
  currency_type TEXT NOT NULL CHECK (currency_type IN ('gold', 'diamonds')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Opcional: data de expiração
  is_sold BOOLEAN DEFAULT FALSE,
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sold_at TIMESTAMPTZ,
  
  -- Constraints
  CHECK (price > 0 OR price_diamonds > 0),
  CHECK (currency_type = 'gold' AND price > 0 OR currency_type = 'diamonds' AND price_diamonds > 0)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_market_items_seller_id ON market_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_market_items_is_sold ON market_items(is_sold);
CREATE INDEX IF NOT EXISTS idx_market_items_created_at ON market_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_items_currency_type ON market_items(currency_type);

-- Índice composto para buscar itens disponíveis
CREATE INDEX IF NOT EXISTS idx_market_items_available ON market_items(is_sold, created_at DESC) WHERE is_sold = FALSE;

-- RLS (Row Level Security)
ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (ajuste conforme necessário)
DROP POLICY IF EXISTS "Allow all operations on market_items" ON market_items;
CREATE POLICY "Allow all operations on market_items" ON market_items
  FOR ALL USING (true) WITH CHECK (true);

