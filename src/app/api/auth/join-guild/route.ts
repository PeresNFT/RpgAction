import { NextRequest, NextResponse } from 'next/server';
import { getGuildById, getUserById, updateUser } from '@/lib/db-helpers';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, guildId } = await request.json();

    if (!userId || !guildId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Get guild
    const guild = await getGuildById(guildId);
    if (!guild) {
      return NextResponse.json(
        { error: 'Guild not found' },
        { status: 404 }
      );
    }

    // Check if guild is full
    if (guild.memberCount && guild.memberCount >= guild.maxMembers) {
      return NextResponse.json(
        { error: 'Guild is full' },
        { status: 400 }
      );
    }

    // Check join type
    if (guild.settings.joinType === 'closed') {
      return NextResponse.json(
        { error: 'Guild is not accepting new members' },
        { status: 400 }
      );
    }

    // Join guild
    const updatedUser = {
      ...user,
      guildId: guildId,
      guildRole: 'member' as const
    };

    await updateUser(updatedUser);

    // Get updated guild with new member count
    const updatedGuild = await getGuildById(guildId);

    return NextResponse.json({
      success: true,
      guild: updatedGuild
    });

  } catch (error: any) {
    console.error('Join guild error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

