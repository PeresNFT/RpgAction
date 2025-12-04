import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { GAME_FORMULAS } from '@/data/gameData';
import { getUserById, updateUser, userWithoutPassword, getGuildById, updateGuild } from '@/lib/db-helpers';

function calculateLevelUp(user: User, experienceGained: number): {
  newLevel: number;
  newExperience: number;
  experienceToNext: number;
  levelUp: boolean;
  availablePoints: number;
} {
  const currentLevel = user.stats?.level || user.level || 1;
  const currentExperience = user.stats?.experience || user.experience || 0;
  const currentAvailablePoints = user.availablePoints || 0;
  
  let newExperience = currentExperience + experienceGained;
  let newLevel = currentLevel;
  let levelUp = false;
  let availablePoints = currentAvailablePoints;
  
  // Calcular experiência necessária para o próximo nível
  const experienceToNext = GAME_FORMULAS.experienceToNext(newLevel);
  
  // Verificar se subiu de nível (apenas se ganhou experiência)
  if (experienceGained > 0) {
    while (newExperience >= experienceToNext) {
      newExperience -= experienceToNext;
      newLevel++;
      levelUp = true;
      availablePoints += 5; // Ganha 5 pontos por nível
    }
  }
  
  // Garantir que a experiência não fique negativa
  if (newExperience < 0) {
    newExperience = 0;
  }
  
  const newExperienceToNext = GAME_FORMULAS.experienceToNext(newLevel);
  
  return {
    newLevel,
    newExperience,
    experienceToNext: newExperienceToNext,
    levelUp,
    availablePoints
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, experienceGained, goldGained, itemsGained } = body;

    if (!userId || experienceGained === undefined) {
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

    // Check for guild bonus (level 1 = +25% experience)
    let finalExperienceGained = experienceGained;
    let guildBonus = 0;
    
    if (user.guildId) {
      const guild = await getGuildById(user.guildId);
      if (guild) {
        // Apply +25% experience bonus if guild is level 1
        if (guild.level === 1) {
          guildBonus = Math.floor(experienceGained * 0.25);
          finalExperienceGained = experienceGained + guildBonus;
        }
        
        // Auto-contribute 10% of base experience to guild
        if (experienceGained > 0) {
          const guildContribution = Math.floor(experienceGained * 0.1);
          if (guildContribution > 0) {
            try {
              let newGuildExperience = guild.experience + guildContribution;
              let newGuildLevel = guild.level;
              let newGuildExperienceToNext = guild.experienceToNext;

              // Level up guild if needed
              while (newGuildExperience >= newGuildExperienceToNext) {
                newGuildExperience -= newGuildExperienceToNext;
                newGuildLevel += 1;
                newGuildExperienceToNext = Math.floor(100 * Math.pow(1.5, newGuildLevel - 1));
              }

              await updateGuild(user.guildId, {
                level: newGuildLevel,
                experience: newGuildExperience,
                experienceToNext: newGuildExperienceToNext
              });
            } catch (error) {
              console.error('Failed to auto-contribute to guild:', error);
              // Continue even if guild contribution fails
            }
          }
        }
      }
    }
    
    // Calcular level up with final experience (including bonus)
    const levelUpData = calculateLevelUp(user, finalExperienceGained);
    
    // Atualizar stats baseado no novo nível
    const newStats = {
      ...user.stats,
      level: levelUpData.newLevel,
      experience: levelUpData.newExperience,
      experienceToNext: levelUpData.experienceToNext,
      // Recalcular stats baseado no novo nível
      maxHealth: GAME_FORMULAS.maxHealth(user.attributes?.vitality || 10, levelUpData.newLevel, user.characterClass || undefined),
      maxMana: GAME_FORMULAS.maxMana(user.attributes?.magic || 10, levelUpData.newLevel),
      attack: GAME_FORMULAS.attack(user.attributes?.strength || 10, user.attributes?.magic || 10, levelUpData.newLevel),
      defense: GAME_FORMULAS.defense(user.attributes?.vitality || 10, levelUpData.newLevel),
      criticalChance: GAME_FORMULAS.criticalChance(user.attributes?.dexterity || 10),
      dodgeChance: GAME_FORMULAS.dodgeChance(user.attributes?.agility || 10)
    };

    // Atualizar vida e mana para o máximo se subiu de nível
    if (levelUpData.levelUp) {
      newStats.health = newStats.maxHealth;
      newStats.mana = newStats.maxMana;
    }

    // Atualizar usuário
    const updatedUser: User = {
      ...user,
      stats: newStats,
      availablePoints: levelUpData.availablePoints,
      gold: (user.gold || 0) + (goldGained || 0),
      inventory: [
        ...(user.inventory || []),
        ...(itemsGained || [])
      ]
    };

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
      levelUp: levelUpData.levelUp,
      experienceGained: finalExperienceGained,
      baseExperienceGained: experienceGained,
      guildBonus: guildBonus,
      goldGained: goldGained || 0,
      itemsGained: itemsGained || []
    });

  } catch (error) {
    console.error('Update experience error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
