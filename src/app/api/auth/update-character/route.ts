import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { CharacterClass, Attributes } from '@/types/game';
import { CHARACTER_CLASSES, GAME_FORMULAS } from '@/data/gameData';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

// Calculate stats based on attributes and level
function calculateStats(attributes: Attributes, level: number, characterClass?: CharacterClass) {
  return {
    level,
    experience: 0,
    experienceToNext: GAME_FORMULAS.experienceToNext(level),
    health: GAME_FORMULAS.maxHealth(attributes.vitality, level, characterClass),
    maxHealth: GAME_FORMULAS.maxHealth(attributes.vitality, level, characterClass),
    mana: GAME_FORMULAS.maxMana(attributes.magic, level),
    maxMana: GAME_FORMULAS.maxMana(attributes.magic, level),
    attack: GAME_FORMULAS.attack(attributes.strength, attributes.magic, level),
    defense: GAME_FORMULAS.defense(attributes.vitality, level),
    criticalChance: GAME_FORMULAS.criticalChance(attributes.dexterity),
    dodgeChance: GAME_FORMULAS.dodgeChance(attributes.agility)
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, characterClass, attributes } = body;
    
    if (!userId || !characterClass || !attributes) {
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

    const stats = calculateStats(attributes, 1, characterClass);

    // Update user with character class and attributes
    const updatedUser: User = {
      ...user,
      characterClass,
      attributes,
      availablePoints: 0,
      stats,
      battle: {
        ...user.battle,
        player: {
          health: stats.maxHealth,
          maxHealth: stats.maxHealth,
          mana: stats.maxMana,
          maxMana: stats.maxMana,
        }
      }
    };

    const savedUser = await updateUser(updatedUser);
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser)
    });
    
  } catch (error) {
    console.error('Update character error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
