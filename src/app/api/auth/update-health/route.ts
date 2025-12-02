import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, health } = body;

    if (!userId || health === undefined) {
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
    
    // Atualizar vida do jogador
    const updatedUser: User = {
      ...user,
      stats: {
        ...user.stats,
        health: Math.max(0, health) // Garantir que não fique negativo
      }
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
