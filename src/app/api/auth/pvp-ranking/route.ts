import { NextRequest, NextResponse } from 'next/server';
import { PvPRanking } from '@/types/game';
import { getAllUsersWithClass } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all users with character class
    const allUsers = await getAllUsersWithClass();

    // Filter users with PvP stats
    const pvpUsersData = allUsers
      .filter((user) => user.pvpStats)
      .map((user) => ({
        playerId: user.id,
        nickname: user.nickname,
        characterClass: user.characterClass!,
        level: user.stats?.level || user.level || 1,
        honorPoints: user.pvpStats!.honorPoints,
        wins: user.pvpStats!.wins,
        losses: user.pvpStats!.losses,
        winRate: user.pvpStats!.totalBattles > 0 
          ? Math.round((user.pvpStats!.wins / user.pvpStats!.totalBattles) * 100) 
          : 0
      }));
    
    const pvpUsers = pvpUsersData.sort((a, b) => {
        // Sort by honor points (descending), then by win rate, then by wins
        if (a.honorPoints !== b.honorPoints) {
          return b.honorPoints - a.honorPoints;
        }
        if (a.winRate !== b.winRate) {
          return b.winRate - a.winRate;
        }
        return b.wins - a.wins;
      });

    // Add rank numbers
    const rankedUsers = pvpUsers.map((user, index: number): PvPRanking => ({
      ...user,
      rank: offset + index + 1
    }));

    // Apply pagination
    const paginatedUsers = rankedUsers.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      rankings: paginatedUsers,
      total: pvpUsers.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('PvP ranking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

