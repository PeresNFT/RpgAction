import { NextRequest, NextResponse } from 'next/server';
import { getAllGuilds } from '@/lib/db-helpers';
import { GuildRanking } from '@/types/game';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const guilds = await getAllGuilds(limit + offset, 0);

    // Sort by level and experience
    const sortedGuilds = guilds.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      return b.experience - a.experience;
    });

    // Add rank numbers
    const rankedGuilds: GuildRanking[] = sortedGuilds.map((guild, index) => ({
      rank: index + 1,
      guildId: guild.id,
      name: guild.name,
      icon: guild.icon,
      level: guild.level,
      experience: guild.experience,
      memberCount: guild.memberCount || 0,
      leaderNickname: guild.leaderNickname || 'Unknown'
    }));

    // Apply pagination
    const paginatedGuilds = rankedGuilds.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      rankings: paginatedGuilds,
      total: rankedGuilds.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Guild ranking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

