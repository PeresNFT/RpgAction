import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { SKILL_FORMULAS, getSkillById, getSkillsByClass } from '@/data/gameData';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, skillId } = body;

    if (!userId || !skillId) {
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

    // Verificar se o jogador tem a classe necessária
    if (!user.characterClass) {
      return NextResponse.json(
        { error: 'Character class not selected' },
        { status: 400 }
      );
    }

    // Buscar a skill
    const skill = getSkillById(skillId);
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Verificar se a skill pertence à classe do jogador
    if (skill.characterClass !== user.characterClass) {
      return NextResponse.json(
        { error: 'Skill does not belong to your character class' },
        { status: 400 }
      );
    }

    // Buscar a skill do jogador
    let playerSkills = user.skills || [];
    
    // Se o usuário não tem skills mas tem uma classe, inicializar as skills
    if (playerSkills.length === 0 && user.characterClass) {
      const classSkills = getSkillsByClass(user.characterClass);
      playerSkills = classSkills.map(skill => ({
        skillId: skill.id,
        level: 1,
        lastUsed: undefined
      }));
      
      // Salvar as skills inicializadas
      const updatedUserWithSkills: User = {
        ...user,
        skills: playerSkills
      };
      await updateUser(updatedUserWithSkills);
      user.skills = playerSkills; // Atualizar user local para continuar
    }
    
    const playerSkill = playerSkills.find(ps => ps.skillId === skillId);

    if (!playerSkill) {
      return NextResponse.json(
        { error: 'Skill not unlocked' },
        { status: 400 }
      );
    }

    // Calcular custo de upgrade
    const upgradeCost = SKILL_FORMULAS.calculateSkillUpgradeCost(playerSkill.level);

    // Verificar se o jogador tem gold suficiente
    if (user.gold < upgradeCost) {
      return NextResponse.json(
        { error: 'Insufficient gold', required: upgradeCost, current: user.gold },
        { status: 400 }
      );
    }

    // Atualizar a skill
    const updatedSkills = playerSkills.map(ps => {
      if (ps.skillId === skillId) {
        return {
          ...ps,
          level: ps.level + 1
        };
      }
      return ps;
    });

    // Atualizar o usuário
    const updatedUser: User = {
      ...user,
      skills: updatedSkills,
      gold: user.gold - upgradeCost
    };

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
      skillLevel: playerSkill.level + 1,
      goldSpent: upgradeCost
    });

  } catch (error) {
    console.error('Upgrade skill error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

