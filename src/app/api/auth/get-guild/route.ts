import { NextRequest, NextResponse } from 'next/server';
import { getGuildById, getGuildMembers } from '@/lib/db-helpers';
import { GuildMember } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const { guildId } = await request.json();

    if (!guildId) {
      return NextResponse.json(
        { error: 'Missing guildId' },
        { status: 400 }
      );
    }

    const guild = await getGuildById(guildId);
    if (!guild) {
      return NextResponse.json(
        { error: 'Guild not found' },
        { status: 404 }
      );
    }

    const members = await getGuildMembers(guildId);

    return NextResponse.json({
      success: true,
      guild,
      members
    });

  } catch (error: any) {
    console.error('Get guild error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

