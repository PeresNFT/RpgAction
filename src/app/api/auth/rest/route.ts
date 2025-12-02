import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User } from '@/types/user';

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
    const { userId } = body;

    if (!userId) {
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
    
    // Calcular tempo de descanso baseado no nível
    const userLevel = user.stats?.level || user.level || 1;
    const restTimeMinutes = Math.floor(userLevel / 5) + 1; // 1 minuto base + 1 minuto a cada 5 níveis
    
    // Recuperar HP e MP completos
    const maxHealth = user.stats?.maxHealth || user.maxHealth || 100;
    const maxMana = user.stats?.maxMana || user.maxMana || 50;
    
    const updatedUser: User = {
      ...user,
      stats: {
        ...user.stats,
        health: maxHealth,
        mana: maxMana
      }
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    // Remover password da resposta
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      restTimeMinutes,
      message: `Descansou por ${restTimeMinutes} minuto(s) e recuperou HP/MP completos!`
    });

  } catch (error) {
    console.error('Rest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
