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
    const { userId, itemId, amount, price, priceDiamonds, currencyType } = body;

    if (!userId || !itemId || !currencyType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (currencyType === 'gold' && (!price || price <= 0)) {
      return NextResponse.json(
        { error: 'Invalid gold price' },
        { status: 400 }
      );
    }

    if (currencyType === 'diamonds' && (!priceDiamonds || priceDiamonds <= 0)) {
      return NextResponse.json(
        { error: 'Invalid diamonds price' },
        { status: 400 }
      );
    }

    // Verificar se o jogador tem o item no inventário
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Quantidade padrão é 1 se não especificada
    const sellAmount = amount || 1;
    if (sellAmount < 1) {
      return NextResponse.json(
        { error: 'Quantidade inválida' },
        { status: 400 }
      );
    }

    // Calcular a quantidade total do item no inventário (pode estar em múltiplas entradas)
    const inventoryItems = user.inventory?.filter(item => item.id === itemId) || [];
    
    if (inventoryItems.length === 0) {
      return NextResponse.json(
        { error: 'Item não encontrado no inventário' },
        { status: 404 }
      );
    }

    // Calcular quantidade total disponível (somando todas as entradas do mesmo item)
    const totalAvailableAmount = inventoryItems.reduce((total, item) => {
      return total + (item.amount || 1);
    }, 0);

    if (sellAmount > totalAvailableAmount) {
      return NextResponse.json(
        { error: `Você não tem quantidade suficiente. Você tem ${totalAvailableAmount} deste item.` },
        { status: 400 }
      );
    }

    // Pegar o primeiro item como template (para manter todas as propriedades)
    const itemTemplate: Item = inventoryItems[0];

    // Remover a quantidade vendida do inventário (começando pelas primeiras entradas)
    const updatedInventory = [...(user.inventory || [])];
    let remainingToRemove = sellAmount;
    
    // Processar todas as entradas deste item até remover a quantidade necessária
    for (let i = updatedInventory.length - 1; i >= 0 && remainingToRemove > 0; i--) {
      if (updatedInventory[i].id === itemId) {
        const itemAmount = updatedInventory[i].amount || 1;
        
        if (itemAmount <= remainingToRemove) {
          // Remover esta entrada completamente
          remainingToRemove -= itemAmount;
          updatedInventory.splice(i, 1);
        } else {
          // Reduzir apenas o necessário
          updatedInventory[i] = {
            ...updatedInventory[i],
            amount: itemAmount - remainingToRemove
          };
          remainingToRemove = 0;
        }
      }
    }

    // Criar item para venda com a quantidade
    const itemForSale: Item = {
      ...itemTemplate,
      amount: sellAmount
    };

    // Adicionar ao mercado
    const { data: marketItem, error: insertError } = await supabaseAdmin
      .from('market_items')
      .insert({
        seller_id: userId,
        seller_nickname: user.nickname,
        item: itemForSale,
        price: price || 0,
        price_diamonds: priceDiamonds || null,
        currency_type: currencyType
      })
      .select()
      .single();

    if (insertError) {
      console.error('Market add error:', insertError);
      return NextResponse.json(
        { error: 'Failed to add item to market' },
        { status: 500 }
      );
    }

    // Atualizar inventário do usuário
    const updatedUser = {
      ...user,
      inventory: updatedInventory
    };
    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      marketItem: {
        id: marketItem.id,
        sellerId: marketItem.seller_id,
        sellerNickname: marketItem.seller_nickname,
        item: marketItem.item,
        amount: marketItem.item.amount || 1,
        price: marketItem.price,
        priceDiamonds: marketItem.price_diamonds,
        currencyType: marketItem.currency_type,
        createdAt: marketItem.created_at,
        expiresAt: marketItem.expires_at,
        isSold: marketItem.is_sold,
        buyerId: marketItem.buyer_id
      },
      user: userWithoutPassword(savedUser)
    });

  } catch (error) {
    console.error('Market add error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

