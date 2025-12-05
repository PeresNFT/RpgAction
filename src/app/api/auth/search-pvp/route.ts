import { NextRequest, NextResponse } from 'next/server';
import { PvPSearchResult } from '@/types/game';
import { getUserById, getAllUsersWithClass } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const currentUser = await getUserById(userId);

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

    // Get all users with character class (excluding current user)
    const allUsers = await getAllUsersWithClass();
    
    // Filter out current user and get available opponents
    const availableOpponents = allUsers
      .filter((user) => {
        // Skip current user - cannot battle yourself
        if (user.id === userId) return false;
        
        // Only include users with character class
        if (!user.characterClass) return false;
        
        return true;
      })
      .map((user) => ({
        playerId: user.id,
        nickname: user.nickname,
        characterClass: user.characterClass!,
        level: user.stats?.level || user.level || 1,
        honorPoints: user.pvpStats?.honorPoints || 0,
        profileImage: user.profileImage,
        estimatedWaitTime: 0 // Not used anymore
      }));

    // Shuffle opponents randomly
    const shuffledOpponents = [...availableOpponents].sort(() => Math.random() - 0.5);
    
    const targetCount = 4;
    
    if (shuffledOpponents.length === 0) {
      // No opponents available
      return NextResponse.json({
        success: true,
        opponents: [],
        currentUserStats: {
          level: currentUser.stats?.level || currentUser.level || 1,
          honorPoints: currentUserPvP.honorPoints,
          rank: currentUserPvP.rank
        }
      });
    }
    
    // Get exactly 4 unique opponents (no repetitions)
    // If there are fewer than 4 available, return all unique opponents
    const selectedOpponents = shuffledOpponents.slice(0, Math.min(targetCount, shuffledOpponents.length));

    return NextResponse.json({
      success: true,
      opponents: selectedOpponents,
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

