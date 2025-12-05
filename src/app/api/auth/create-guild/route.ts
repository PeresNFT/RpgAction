import { NextRequest, NextResponse } from 'next/server';
import { createGuild, getUserById } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const { userId, name, description, icon } = await request.json();

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length < 3 || name.length > 30) {
      return NextResponse.json(
        { error: 'Guild name must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a guild
    if (user.guildId) {
      return NextResponse.json(
        { error: 'You are already in a guild. Leave your current guild first.' },
        { status: 400 }
      );
    }

    // Check if user has character class
    if (!user.characterClass) {
      return NextResponse.json(
        { error: 'You must choose a character class first' },
        { status: 400 }
      );
    }

    // Check if guild name already exists
    const { supabaseAdmin } = await import('@/lib/supabase');
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: existingGuild } = await supabaseAdmin
      .from('guilds')
      .select('id')
      .eq('name', name)
      .single();

    if (existingGuild) {
      return NextResponse.json(
        { error: 'Guild name already exists' },
        { status: 400 }
      );
    }

    // Create guild
    const guild = await createGuild({
      name: name.trim(),
      description: description?.trim(),
      icon: icon || 'guild1',
      leaderId: userId
    });

    return NextResponse.json({
      success: true,
      guild
    });

  } catch (error: any) {
    console.error('Create guild error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

