import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User } from '@/types/user';
import { Attributes } from '@/types/game';
import { GAME_FORMULAS } from '@/data/gameData';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

function loadUsers(): User[] {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
}

function saveUsers(users: User[]): void {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

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

    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[userIndex];
    
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

    // Recalcular stats com os novos atributos
    const newStats = {
      ...user.stats,
      maxHealth: GAME_FORMULAS.maxHealth(attributes.vitality, user.stats.level, user.characterClass || undefined),
      maxMana: GAME_FORMULAS.maxMana(attributes.magic, user.stats.level),
      attack: GAME_FORMULAS.attack(attributes.strength, attributes.magic, user.stats.level),
      defense: GAME_FORMULAS.defense(attributes.vitality, user.stats.level),
      criticalChance: GAME_FORMULAS.criticalChance(attributes.dexterity),
      dodgeChance: GAME_FORMULAS.dodgeChance(attributes.agility)
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

    users[userIndex] = updatedUser;
    saveUsers(users);

    // Remover password da resposta
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Update attributes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
