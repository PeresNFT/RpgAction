import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';
import { Item } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { buyerId, marketItemId } = body;

    if (!buyerId || !marketItemId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Buscar o item no mercado
    const { data: marketItemRow, error: fetchError } = await supabaseAdmin
      .from('market_items')
      .select('*')
      .eq('id', marketItemId)
      .eq('is_sold', false)
      .single();

    if (fetchError || !marketItemRow) {
      return NextResponse.json(
        { error: 'Item not found or already sold' },
        { status: 404 }
      );
    }

    // Verificar se o comprador não é o vendedor
    if (marketItemRow.seller_id === buyerId) {
      return NextResponse.json(
        { error: 'You cannot buy your own item' },
        { status: 400 }
      );
    }

    // Buscar comprador e vendedor
    const buyer = await getUserById(buyerId);
    if (!buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      );
    }

    const seller = await getUserById(marketItemRow.seller_id);
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Verificar se o comprador tem recursos suficientes
    const currencyType = marketItemRow.currency_type;
    const price = currencyType === 'gold' ? marketItemRow.price : marketItemRow.price_diamonds;

    if (currencyType === 'gold' && (buyer.gold || 0) < price) {
      return NextResponse.json(
        { error: 'Insufficient gold' },
        { status: 400 }
      );
    }

    if (currencyType === 'diamonds' && (buyer.diamonds || 0) < price) {
      return NextResponse.json(
        { error: 'Insufficient diamonds' },
        { status: 400 }
      );
    }

    // Realizar a compra
    // 1. Adicionar item ao inventário do comprador (agrupando se já existe)
    const purchasedItem: Item = marketItemRow.item;
    const purchasedAmount = purchasedItem.amount || 1;
    const buyerInventory = [...(buyer.inventory || [])];
    
    // Verificar se o comprador já tem este item
    const existingItemIndex = buyerInventory.findIndex(item => item.id === purchasedItem.id);
    
    if (existingItemIndex !== -1) {
      // Se já tem, aumentar a quantidade
      const existingItem = buyerInventory[existingItemIndex];
      buyerInventory[existingItemIndex] = {
        ...existingItem,
        amount: (existingItem.amount || 1) + purchasedAmount
      };
    } else {
      // Se não tem, adicionar novo item
      buyerInventory.push(purchasedItem);
    }
    
    const updatedBuyer = {
      ...buyer,
      gold: currencyType === 'gold' ? (buyer.gold || 0) - price : buyer.gold,
      diamonds: currencyType === 'diamonds' ? (buyer.diamonds || 0) - price : buyer.diamonds,
      inventory: buyerInventory
    };

    // 2. Adicionar recursos ao vendedor
    const updatedSeller = {
      ...seller,
      gold: currencyType === 'gold' ? (seller.gold || 0) + price : seller.gold,
      diamonds: currencyType === 'diamonds' ? (seller.diamonds || 0) + price : seller.diamonds
    };

    // 3. Marcar item como vendido
    const { error: updateError } = await supabaseAdmin
      .from('market_items')
      .update({
        is_sold: true,
        buyer_id: buyerId,
        sold_at: new Date().toISOString()
      })
      .eq('id', marketItemId);

    if (updateError) {
      console.error('Market buy error:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete purchase' },
        { status: 500 }
      );
    }

    // 4. Atualizar comprador e vendedor
    await updateUser(updatedBuyer);
    await updateUser(updatedSeller);

    return NextResponse.json({
      success: true,
      message: `Item purchased for ${price} ${currencyType === 'gold' ? 'gold' : 'diamonds'}!`,
      buyer: userWithoutPassword(updatedBuyer),
      seller: userWithoutPassword(updatedSeller)
    });

  } catch (error) {
    console.error('Market buy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

