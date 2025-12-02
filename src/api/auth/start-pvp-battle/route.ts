import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { 
  calculatePvPBattle, 
  calculateHonorPoints, 
  getRankFromPoints,
  getRankIcon 
} from '@/data/gameData';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function POST(request: NextRequest) {
  try {
    const { player1Id, player2Id } = await request.json();

    // Read users data
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const player1 = usersData.find((u: any) => u.id === player1Id);
    const player2 = usersData.find((u: any) => u.id === player2Id);

    if (!player1 || !player2) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Initialize PvP stats if they don't exist
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
      characterClass: player1.characterClass,
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
      characterClass: player2.characterClass,
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
      winnerPlayer.pvpStats, 
      loserPlayer.pvpStats
    );

    // Update winner stats
    winnerPlayer.pvpStats.honorPoints += winnerPoints;
    winnerPlayer.pvpStats.wins += 1;
    winnerPlayer.pvpStats.winStreak += 1;
    winnerPlayer.pvpStats.totalBattles += 1;
    winnerPlayer.pvpStats.lastBattleTime = Date.now();
    
    if (winnerPlayer.pvpStats.winStreak > winnerPlayer.pvpStats.bestWinStreak) {
      winnerPlayer.pvpStats.bestWinStreak = winnerPlayer.pvpStats.winStreak;
    }
    
    winnerPlayer.pvpStats.rank = getRankFromPoints(winnerPlayer.pvpStats.honorPoints);

    // Update loser stats
    loserPlayer.pvpStats.honorPoints = Math.max(0, loserPlayer.pvpStats.honorPoints + loserPoints);
    loserPlayer.pvpStats.losses += 1;
    loserPlayer.pvpStats.winStreak = 0;
    loserPlayer.pvpStats.totalBattles += 1;
    loserPlayer.pvpStats.lastBattleTime = Date.now();
    loserPlayer.pvpStats.rank = getRankFromPoints(loserPlayer.pvpStats.honorPoints);

    // Save updated data
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));

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
        newHonorPoints: winnerPlayer.pvpStats.honorPoints,
        newRank: winnerPlayer.pvpStats.rank,
        rankIcon: getRankIcon(winnerPlayer.pvpStats.rank)
      },
      loser: {
        id: loserPlayer.id,
        nickname: loserPlayer.nickname,
        honorPointsLost: Math.abs(loserPoints),
        newHonorPoints: loserPlayer.pvpStats.honorPoints,
        newRank: loserPlayer.pvpStats.rank,
        rankIcon: getRankIcon(loserPlayer.pvpStats.rank)
      }
    });

  } catch (error) {
    console.error('Start PvP battle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
