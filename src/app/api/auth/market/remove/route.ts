import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, marketItemId } = body;

    if (!userId || !marketItemId) {
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
      .single();

    if (fetchError || !marketItemRow) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Verificar se o usuário é o dono do item
    if (marketItemRow.seller_id !== userId) {
      return NextResponse.json(
        { error: 'You are not the owner of this item' },
        { status: 403 }
      );
    }

    // Verificar se o item já foi vendido
    if (marketItemRow.is_sold) {
      return NextResponse.json(
        { error: 'Item already sold' },
        { status: 400 }
      );
    }

    // Buscar o usuário
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Devolver o item ao inventário
    const updatedUser = {
      ...user,
      inventory: [...(user.inventory || []), marketItemRow.item]
    };

    // Remover do mercado
    const { error: deleteError } = await supabaseAdmin
      .from('market_items')
      .delete()
      .eq('id', marketItemId);

    if (deleteError) {
      console.error('Market remove error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove item from market' },
        { status: 500 }
      );
    }

    // Atualizar inventário do usuário
    await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Item removed from market and returned to inventory',
      user: userWithoutPassword(updatedUser)
    });

  } catch (error) {
    console.error('Market remove error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

