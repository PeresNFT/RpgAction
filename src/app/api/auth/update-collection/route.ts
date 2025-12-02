import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User } from '@/types/user';
import { CollectionType } from '@/types/game';

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

function calculateCollectionLevelUp(currentLevel: number, currentExp: number, expGained: number): {
  newLevel: number;
  newExperience: number;
  experienceToNext: number;
  levelUp: boolean;
} {
  let newExperience = currentExp + expGained;
  let newLevel = currentLevel;
  let levelUp = false;
  
  // Fórmula de experiência para coleta (mais fácil que combate)
  const experienceToNext = newLevel * 50;
  
  while (newExperience >= experienceToNext) {
    newExperience -= experienceToNext;
    newLevel++;
    levelUp = true;
  }
  
  const newExperienceToNext = newLevel * 50;
  
  return {
    newLevel,
    newExperience,
    experienceToNext: newExperienceToNext,
    levelUp
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, collectionType, experienceGained, resourcesGained } = body;

    if (!userId || !collectionType || experienceGained === undefined) {
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
    
    // Inicializar skills de coleta se não existirem
    const currentSkills = user.collection?.skills || [];
    let skillIndex = currentSkills.findIndex(s => s.type === collectionType);
    
    if (skillIndex === -1) {
      // Criar nova skill
      currentSkills.push({
        type: collectionType as CollectionType,
        level: 1,
        experience: 0,
        experienceToNext: 50
      });
      skillIndex = currentSkills.length - 1;
    }
    
    const currentSkill = currentSkills[skillIndex];
    const levelUpData = calculateCollectionLevelUp(
      currentSkill.level,
      currentSkill.experience,
      experienceGained
    );
    
    // Atualizar a skill
    currentSkills[skillIndex] = {
      ...currentSkill,
      level: levelUpData.newLevel,
      experience: levelUpData.newExperience,
      experienceToNext: levelUpData.experienceToNext
    };
    
    // Atualizar recursos no inventário
    const currentInventory = user.inventory || [];
    const updatedInventory = [...currentInventory];
    
    if (resourcesGained && resourcesGained.length > 0) {
      resourcesGained.forEach((resource: any) => {
        const existingItem = updatedInventory.find(item => item.id === resource.id);
        if (existingItem) {
          existingItem.amount = (existingItem.amount || 1) + resource.amount;
        } else {
          updatedInventory.push({
            id: resource.id,
            name: resource.name,
            description: `Recurso coletado`,
            type: 'material',
            rarity: 'common',
            level: 1,
            value: 1,
            icon: resource.icon,
            amount: resource.amount
          });
        }
      });
    }

    // Atualizar usuário
    const updatedUser: User = {
      ...user,
      collection: {
        ...user.collection,
        skills: currentSkills
      },
      inventory: updatedInventory
    };

    users[userIndex] = updatedUser;
    saveUsers(users);

    // Remover password da resposta
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      levelUp: levelUpData.levelUp,
      experienceGained,
      resourcesGained: resourcesGained || []
    });

  } catch (error) {
    console.error('Update collection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
