import { NextRequest, NextResponse } from 'next/server';
import { User, RegisterFormData } from '@/types/user';
import { supabaseAdmin, dbRowToUser, userToDbRow } from '@/lib/supabase';
import crypto from 'crypto';

// Hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterFormData = await request.json();
    
    // Validation
    if (!body.email || !body.password || !body.confirmPassword || !body.nickname) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }
    
    // Check if email already exists
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single();
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Check if nickname already exists
    const { data: existingNickname } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('nickname', body.nickname)
      .single();
    
    if (existingNickname) {
      return NextResponse.json(
        { error: 'Nickname already taken' },
        { status: 400 }
      );
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email: body.email,
      nickname: body.nickname,
      password: hashPassword(body.password),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      // Game data
      characterClass: null,
      attributes: {
        strength: 10,
        magic: 10,
        dexterity: 10,
        agility: 10,
        luck: 5,
      },
      availablePoints: 0,
      stats: {
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        attack: 20,
        defense: 15,
        accuracy: 80,
        dodgeChance: 4,
        criticalChance: 1.5,
        criticalResist: 1,
      },
      inventory: [],
      battle: {
        isActive: false,
        player: {
          health: 100,
          maxHealth: 100,
          mana: 50,
          maxMana: 50,
        },
        monster: null,
        turn: 'player',
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
      gold: 100,
      diamonds: 0,
      // Legacy fields
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      strength: 10,
      agility: 10,
      intelligence: 10,
    };
    
    // Insert user into database
    const { data: insertedUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert(userToDbRow(newUser))
      .select()
      .single();
    
    if (insertError || !insertedUser) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = dbRowToUser(insertedUser);
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
