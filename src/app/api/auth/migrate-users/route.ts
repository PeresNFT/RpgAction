import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import fs from 'fs';
import path from 'path';
import { GAME_FORMULAS } from '@/data/gameData';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Load users from JSON file
function loadUsers(): any[] {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}

// Save users to JSON file
function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const oldUsers = loadUsers();
    const migratedUsers: User[] = [];

    for (const oldUser of oldUsers) {
      // Migrate old user to new format
      const migratedUser: User = {
        ...oldUser,
        // Game data
        characterClass: null,
        attributes: {
          strength: oldUser.strength || 10,
          magic: oldUser.intelligence || 10,
          dexterity: 10,
          agility: oldUser.agility || 10,
        },
        availablePoints: 0,
        stats: {
          level: oldUser.level || 1,
          experience: oldUser.experience || 0,
          experienceToNext: (oldUser.level || 1) * 100,
          health: oldUser.health || 100,
          maxHealth: GAME_FORMULAS.maxHealth(10, oldUser.level || 1), // Usar HP base sem classe específica
          mana: oldUser.mana || 50,
          maxMana: oldUser.maxMana || 50,
          attack: 20,
          defense: 15,
          criticalChance: 5,
          dodgeChance: 4,
        },
        inventory: [],
        battle: {
          isActive: false,
          player: {
            health: oldUser.health || 100,
            maxHealth: oldUser.maxHealth || 100,
            mana: oldUser.mana || 50,
            maxMana: oldUser.maxMana || 50,
          },
          monster: null,
          turn: 'player' as const,
          battleLog: [],
        },
        collection: {
          isActive: false,
          lastCollection: 0,
          collectionInterval: 30,
          skills: [],
          resources: [],
        },
        equippedItems: {},
        gold: oldUser.gold || 100,
        // Keep legacy fields for backward compatibility
        level: oldUser.level || 1,
        experience: oldUser.experience || 0,
        health: oldUser.health || 100,
        maxHealth: oldUser.maxHealth || 100,
        mana: oldUser.mana || 50,
        maxMana: oldUser.maxMana || 50,
        strength: oldUser.strength || 10,
        agility: oldUser.agility || 10,
        intelligence: oldUser.intelligence || 10,
      };

      migratedUsers.push(migratedUser);
    }

    saveUsers(migratedUsers);

    return NextResponse.json({
      success: true,
      message: `Migrated ${migratedUsers.length} users successfully`,
      migratedCount: migratedUsers.length
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
