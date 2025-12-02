import { NextRequest, NextResponse } from 'next/server';
import { 
  calculatePvPBattle, 
  calculateHonorPoints, 
  getRankFromPoints,
  getRankIcon 
} from '@/data/gameData';
import { getUserById, getUsersByIds, updateUser } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const { player1Id, player2Id } = await request.json();

    if (!player1Id || !player2Id) {
      return NextResponse.json({ error: 'Missing player IDs' }, { status: 400 });
    }

    // Prevent self-battle
    if (player1Id === player2Id) {
      return NextResponse.json({ error: 'Cannot battle yourself' }, { status: 400 });
    }

    // PvP Cooldown: 10 minutes (600 seconds)
    const PVP_COOLDOWN_SECONDS = 600;

    // Get both players
    const players = await getUsersByIds([player1Id, player2Id]);
    
    if (players.length !== 2) {
      return NextResponse.json({ error: 'One or both players not found' }, { status: 404 });
    }

    const player1 = players.find(p => p.id === player1Id)!;
    const player2 = players.find(p => p.id === player2Id)!;

    // Initialize PvP stats if they don't exist
    // Check cooldown for player1 (attacker)
    if (player1.pvpStats?.lastBattleTime) {
      const lastBattleTime = typeof player1.pvpStats.lastBattleTime === 'number' 
        ? player1.pvpStats.lastBattleTime 
        : parseInt(String(player1.pvpStats.lastBattleTime));
      
      const timeSinceLastBattle = Math.floor((Date.now() - lastBattleTime) / 1000);
      
      if (timeSinceLastBattle < PVP_COOLDOWN_SECONDS) {
        const remainingSeconds = PVP_COOLDOWN_SECONDS - timeSinceLastBattle;
        return NextResponse.json({ 
          error: `Cooldown ativo. Aguarde ${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')} minutos.` 
        }, { status: 400 });
      }
    }
    if (!player1.pvpStats) {
      player1.pvpStats = {
        honorPoints: 0,
        wins: 0,
        losses: 0,
        winStreak: 0,
        bestWinStreak: 0,
        totalBattles: 0,
        rank: 'Bronze'
      };
    }

    if (!player2.pvpStats) {
      player2.pvpStats = {
        honorPoints: 0,
        wins: 0,
        losses: 0,
        winStreak: 0,
        bestWinStreak: 0,
        totalBattles: 0,
        rank: 'Bronze'
      };
    }

    // Prepare player data for battle
    const p1Data = {
      id: player1.id,
      nickname: player1.nickname,
      characterClass: player1.characterClass!,
      level: player1.stats?.level || player1.level || 1,
      health: player1.stats?.health || player1.health || 100,
      maxHealth: player1.stats?.maxHealth || player1.maxHealth || 100,
      stats: player1.stats || {
        level: player1.level || 1,
        health: player1.health || 100,
        maxHealth: player1.maxHealth || 100,
        attack: 20,
        defense: 15,
        criticalChance: 5,
        dodgeChance: 4
      }
    };

    const p2Data = {
      id: player2.id,
      nickname: player2.nickname,
      characterClass: player2.characterClass!,
      level: player2.stats?.level || player2.level || 1,
      health: player2.stats?.health || player2.health || 100,
      maxHealth: player2.stats?.maxHealth || player2.maxHealth || 100,
      stats: player2.stats || {
        level: player2.level || 1,
        health: player2.health || 100,
        maxHealth: player2.maxHealth || 100,
        attack: 20,
        defense: 15,
        criticalChance: 5,
        dodgeChance: 4
      }
    };

    // Calculate battle
    const { winner, battleLog } = calculatePvPBattle(p1Data, p2Data);

    // Determine winner and loser
    const winnerPlayer = winner === player1.id ? player1 : player2;
    const loserPlayer = winner === player1.id ? player2 : player1;

    // Calculate honor points
    const { winnerPoints, loserPoints } = calculateHonorPoints(
      winnerPlayer, 
      loserPlayer, 
      winnerPlayer.pvpStats!, 
      loserPlayer.pvpStats!
    );

    // Update winner stats
    winnerPlayer.pvpStats!.honorPoints += winnerPoints;
    winnerPlayer.pvpStats!.wins += 1;
    winnerPlayer.pvpStats!.winStreak += 1;
    winnerPlayer.pvpStats!.totalBattles += 1;
    winnerPlayer.pvpStats!.lastBattleTime = Date.now();
    
    if (winnerPlayer.pvpStats!.winStreak > winnerPlayer.pvpStats!.bestWinStreak) {
      winnerPlayer.pvpStats!.bestWinStreak = winnerPlayer.pvpStats!.winStreak;
    }
    
    winnerPlayer.pvpStats!.rank = getRankFromPoints(winnerPlayer.pvpStats!.honorPoints);

    // Update loser stats
    loserPlayer.pvpStats!.honorPoints = Math.max(0, loserPlayer.pvpStats!.honorPoints + loserPoints);
    loserPlayer.pvpStats!.losses += 1;
    loserPlayer.pvpStats!.winStreak = 0;
    loserPlayer.pvpStats!.totalBattles += 1;
    loserPlayer.pvpStats!.lastBattleTime = Date.now();
    loserPlayer.pvpStats!.rank = getRankFromPoints(loserPlayer.pvpStats!.honorPoints);

    // Save updated data
    await updateUser(winnerPlayer);
    await updateUser(loserPlayer);

    // Create battle result
    const battleResult = {
      id: `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      player1: p1Data,
      player2: p2Data,
      winner: winner,
      battleLog: battleLog,
      startTime: Date.now(),
      endTime: Date.now(),
      status: 'completed' as const,
      honorPointsGained: winner === player1.id ? winnerPoints : loserPoints,
      honorPointsLost: winner === player1.id ? loserPoints : winnerPoints
    };

    return NextResponse.json({
      success: true,
      battle: battleResult,
      winner: {
        id: winnerPlayer.id,
        nickname: winnerPlayer.nickname,
        honorPointsGained: winnerPoints,
        newHonorPoints: winnerPlayer.pvpStats!.honorPoints,
        newRank: winnerPlayer.pvpStats!.rank,
        rankIcon: getRankIcon(winnerPlayer.pvpStats!.rank)
      },
      loser: {
        id: loserPlayer.id,
        nickname: loserPlayer.nickname,
        honorPointsLost: Math.abs(loserPoints),
        newHonorPoints: loserPlayer.pvpStats!.honorPoints,
        newRank: loserPlayer.pvpStats!.rank,
        rankIcon: getRankIcon(loserPlayer.pvpStats!.rank)
      }
    });

  } catch (error) {
    console.error('Start PvP battle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

