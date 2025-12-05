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
    
    // Cooldown: Level 1-4 = 1 minuto, depois a cada 5 níveis +1 minuto
    const calculateRestCooldown = (level: number): number => {
      if (level <= 4) {
        return 60; // 1 minuto
      }
      return 60 + Math.floor((level - 1) / 5) * 60; // 1 minuto base + 1 minuto a cada 5 níveis
    };
    
    const restCooldownSeconds = calculateRestCooldown(userLevel);
    
    // Verificar cooldown
    const lastRestTime = typeof user.stats?.lastRestTime === 'number' 
      ? user.stats.lastRestTime 
      : (user.stats?.lastRestTime ? parseInt(String(user.stats.lastRestTime)) : 0);
    
    if (lastRestTime > 0) {
      const now = Date.now();
      const timeSinceLastRest = Math.floor((now - lastRestTime) / 1000); // em segundos
      
      if (timeSinceLastRest < restCooldownSeconds) {
        const remainingSeconds = restCooldownSeconds - timeSinceLastRest;
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return NextResponse.json({ 
          error: `Cooldown ativo. Aguarde ${minutes}:${seconds.toString().padStart(2, '0')} minutos.` 
        }, { status: 400 });
      }
    }
    
    // Recuperar HP e MP completos
    const maxHealth = user.stats?.maxHealth || user.maxHealth || 100;
    const maxMana = user.stats?.maxMana || user.maxMana || 50;
    
    const updatedUser: User = {
      ...user,
      stats: {
        ...user.stats,
        health: maxHealth,
        mana: maxMana,
        lastRestTime: Date.now()
      }
    };

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
      restCooldownSeconds,
      message: `Descansou e recuperou HP/MP completos!`
    });

  } catch (error) {
    console.error('Rest error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
