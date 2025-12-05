import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { Attributes } from '@/types/game';
import { GAME_FORMULAS } from '@/data/gameData';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, attributes } = body;

    if (!userId || !attributes) {
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
    
    // Verificar se os atributos foram realmente alterados
    const hasChanges = Object.keys(attributes).some(key => {
      const attrKey = key as keyof Attributes;
      return attributes[attrKey] !== (user.attributes as Attributes)[attrKey];
    });

    if (!hasChanges) {
      return NextResponse.json(
        { error: 'No changes detected in attributes' },
        { status: 400 }
      );
    }

    // Recalcular stats com os novos atributos (novo sistema)
    const newStats = {
      ...user.stats,
      maxHealth: GAME_FORMULAS.maxHealth(attributes.strength, user.stats.level, user.characterClass || undefined),
      maxMana: GAME_FORMULAS.maxMana(attributes.magic, user.stats.level),
      attack: GAME_FORMULAS.attack(attributes.strength, attributes.magic, attributes.dexterity, user.stats.level, user.characterClass || undefined),
      defense: GAME_FORMULAS.defense(attributes.strength, user.stats.level, user.characterClass || undefined),
      accuracy: GAME_FORMULAS.accuracy(attributes.dexterity),
      dodgeChance: GAME_FORMULAS.dodgeChance(attributes.agility),
      criticalChance: GAME_FORMULAS.criticalChance(attributes.luck),
      criticalResist: GAME_FORMULAS.criticalResist(attributes.luck)
    };

    // Atualizar vida e mana para o máximo se os atributos aumentaram
    const oldMaxHealth = user.stats.maxHealth;
    const oldMaxMana = user.stats.maxMana;
    
    if (newStats.maxHealth > oldMaxHealth) {
      newStats.health = newStats.maxHealth;
    }
    
    if (newStats.maxMana > oldMaxMana) {
      newStats.mana = newStats.maxMana;
    }

    // Atualizar usuário
    const updatedUser: User = {
      ...user,
      attributes,
      stats: newStats,
      availablePoints: 0 // Resetar pontos disponíveis
    };

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser)
    });

  } catch (error) {
    console.error('Update attributes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
