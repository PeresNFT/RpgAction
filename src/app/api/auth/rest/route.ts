import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

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

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
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

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
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
