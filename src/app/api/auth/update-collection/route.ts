import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { CollectionType } from '@/types/game';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';
import { ITEMS } from '@/data/gameData';

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

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
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
          // Try to find the item template in ITEMS array
          const itemTemplate = ITEMS.find(item => item.id === resource.id);
          
          updatedInventory.push({
            id: resource.id,
            name: resource.name,
            description: itemTemplate?.description || `Recurso coletado`,
            type: 'material',
            rarity: itemTemplate?.rarity || 'common',
            level: itemTemplate?.level || 1,
            value: itemTemplate?.value || 1,
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
        isActive: false, // Reset active state
        lastCollection: Date.now(), // Update last collection timestamp
        skills: currentSkills
      },
      inventory: updatedInventory
    };

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
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
