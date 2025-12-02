import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PvPSearchResult } from '@/types/game';
import { PVP_BATTLE_SETTINGS } from '@/data/gameData';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Read users data
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const currentUser = usersData.find((u: any) => u.id === userId);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current user's PvP stats
    const currentUserPvP = currentUser.pvpStats || {
      honorPoints: 0,
      wins: 0,
      losses: 0,
      winStreak: 0,
      bestWinStreak: 0,
      totalBattles: 0,
      rank: 'Bronze'
    };

    // Find potential opponents
    const potentialOpponents: PvPSearchResult[] = usersData
      .filter((user: any) => {
        // Skip current user
        if (user.id === userId) return false;
        
        // Skip users without character class
        if (!user.characterClass) return false;
        
        // Skip users without PvP stats
        if (!user.pvpStats) return false;
        
        // Check level difference
        const levelDiff = Math.abs((user.stats?.level || user.level || 1) - (currentUser.stats?.level || currentUser.level || 1));
        if (levelDiff > PVP_BATTLE_SETTINGS.MIN_LEVEL_DIFFERENCE) return false;
        
        // Check honor points difference
        const honorDiff = Math.abs(user.pvpStats.honorPoints - currentUserPvP.honorPoints);
        if (honorDiff > PVP_BATTLE_SETTINGS.MIN_HONOR_DIFFERENCE) return false;
        
        return true;
      })
      .map((user: any) => ({
        playerId: user.id,
        nickname: user.nickname,
        characterClass: user.characterClass,
        level: user.stats?.level || user.level || 1,
        honorPoints: user.pvpStats.honorPoints,
        estimatedWaitTime: Math.floor(Math.random() * 10) + 5 // 5-15 seconds
      }))
      .sort((a: PvPSearchResult, b: PvPSearchResult) => {
        // Sort by closest honor points, then by closest level
        const honorDiffA = Math.abs(a.honorPoints - currentUserPvP.honorPoints);
        const honorDiffB = Math.abs(b.honorPoints - currentUserPvP.honorPoints);
        
        if (honorDiffA !== honorDiffB) {
          return honorDiffA - honorDiffB;
        }
        
        const levelDiffA = Math.abs(a.level - (currentUser.stats?.level || currentUser.level || 1));
        const levelDiffB = Math.abs(b.level - (currentUser.stats?.level || currentUser.level || 1));
        
        return levelDiffA - levelDiffB;
      })
      .slice(0, 10); // Return top 10 matches

    return NextResponse.json({
      success: true,
      opponents: potentialOpponents,
      currentUserStats: {
        level: currentUser.stats?.level || currentUser.level || 1,
        honorPoints: currentUserPvP.honorPoints,
        rank: currentUserPvP.rank
      }
    });

  } catch (error) {
    console.error('Search PvP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
