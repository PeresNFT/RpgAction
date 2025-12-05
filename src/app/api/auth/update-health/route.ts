import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, health, mana } = body;

    if (!userId || (health === undefined && mana === undefined)) {
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
    
    // Atualizar vida e/ou mana do jogador
    const updatedStats: any = { ...user.stats };
    
    if (health !== undefined) {
      updatedStats.health = Math.max(0, Math.min(health, user.stats?.maxHealth || user.maxHealth || 100));
    }
    
    if (mana !== undefined) {
      updatedStats.mana = Math.max(0, Math.min(mana, user.stats?.maxMana || user.maxMana || 50));
    }
    
    const updatedUser: User = {
      ...user,
      stats: updatedStats
    };

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser)
    });

  } catch (error) {
    console.error('Update health error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
