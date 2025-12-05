import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { MarketItem } from '@/types/game';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const currencyType = searchParams.get('currencyType'); // 'gold' ou 'diamonds'
    const sellerId = searchParams.get('sellerId'); // Filtrar por vendedor

    let query = supabaseAdmin
      .from('market_items')
      .select('*')
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por tipo de moeda se especificado
    if (currencyType && (currencyType === 'gold' || currencyType === 'diamonds')) {
      query = query.eq('currency_type', currencyType);
    }

    // Filtrar por vendedor se especificado
    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Market list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch market items' },
        { status: 500 }
      );
    }

    // Converter para formato MarketItem
    const marketItems: MarketItem[] = (data || []).map((row: any) => ({
      id: row.id,
      sellerId: row.seller_id,
      sellerNickname: row.seller_nickname,
      item: row.item,
      amount: row.item.amount || 1,
      price: row.price,
      priceDiamonds: row.price_diamonds,
      currencyType: row.currency_type,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      isSold: row.is_sold,
      buyerId: row.buyer_id
    }));

    return NextResponse.json({
      success: true,
      items: marketItems,
      total: marketItems.length
    });

  } catch (error) {
    console.error('Market list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

