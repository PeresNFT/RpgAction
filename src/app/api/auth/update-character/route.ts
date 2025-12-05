import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { CharacterClass, Attributes } from '@/types/game';
import { CHARACTER_CLASSES, GAME_FORMULAS, getSkillsByClass } from '@/data/gameData';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

// Calculate stats based on attributes and level (novo sistema)
function calculateStats(attributes: Attributes, level: number, characterClass?: CharacterClass) {
  return {
    level,
    experience: 0,
    experienceToNext: GAME_FORMULAS.experienceToNext(level),
    health: GAME_FORMULAS.maxHealth(attributes.strength, level, characterClass),
    maxHealth: GAME_FORMULAS.maxHealth(attributes.strength, level, characterClass),
    mana: GAME_FORMULAS.maxMana(attributes.magic, level),
    maxMana: GAME_FORMULAS.maxMana(attributes.magic, level),
    attack: GAME_FORMULAS.attack(attributes.strength, attributes.magic, attributes.dexterity, level, characterClass),
    defense: GAME_FORMULAS.defense(attributes.strength, level, characterClass),
    accuracy: GAME_FORMULAS.accuracy(attributes.dexterity),
    dodgeChance: GAME_FORMULAS.dodgeChance(attributes.agility),
    criticalChance: GAME_FORMULAS.criticalChance(attributes.luck),
    criticalResist: GAME_FORMULAS.criticalResist(attributes.luck)
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

    // Initialize skills for the character class (all start at level 1)
    const classSkills = getSkillsByClass(characterClass);
    const initialSkills = classSkills.map(skill => ({
      skillId: skill.id,
      level: 1, // All skills start at level 1
      lastUsed: undefined
    }));

    // Update user with character class and attributes
    const updatedUser: User = {
      ...user,
      characterClass,
      attributes,
      availablePoints: 0,
      stats,
      skills: initialSkills, // Initialize all skills at level 1
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
