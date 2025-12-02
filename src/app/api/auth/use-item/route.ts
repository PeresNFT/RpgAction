import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { ITEMS } from '@/data/gameData';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemId } = body;

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Encontrar o item no inventário
    const itemIndex = user.inventory?.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1 || itemIndex === undefined) {
      return NextResponse.json(
        { error: 'Item not found in inventory' },
        { status: 404 }
      );
    }

    const item = user.inventory[itemIndex];
    
    // Verificar se é um item usável (poção)
    if (item.type !== 'consumable') {
      return NextResponse.json(
        { error: 'Item is not usable' },
        { status: 400 }
      );
    }

    // Aplicar efeitos da poção
    let updatedUser = { ...user };
    let effectsApplied = [];

    // Recuperar vida
    if (item.healAmount) {
      const currentHealth = user.stats?.health || user.health || 100;
      const maxHealth = user.stats?.maxHealth || user.maxHealth || 100;
      const newHealth = Math.min(maxHealth, currentHealth + item.healAmount);
      
      updatedUser = {
        ...updatedUser,
        stats: {
          ...updatedUser.stats,
          health: newHealth
        }
      };
      
      effectsApplied.push(`Recuperou ${item.healAmount} de vida`);
    }

    // Recuperar mana
    if (item.manaAmount) {
      const currentMana = user.stats?.mana || user.mana || 50;
      const maxMana = user.stats?.maxMana || user.maxMana || 50;
      const newMana = Math.min(maxMana, currentMana + item.manaAmount);
      
      updatedUser = {
        ...updatedUser,
        stats: {
          ...updatedUser.stats,
          mana: newMana
        }
      };
      
      effectsApplied.push(`Recuperou ${item.manaAmount} de mana`);
    }

    // Remover o item do inventário
    const newInventory = [...(user.inventory || [])];
    if (item.amount && item.amount > 1) {
      newInventory[itemIndex] = { ...item, amount: item.amount - 1 };
    } else {
      newInventory.splice(itemIndex, 1);
    }
    
    updatedUser.inventory = newInventory;

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
      effectsApplied,
      itemUsed: item.name
    });

  } catch (error) {
    console.error('Use item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
