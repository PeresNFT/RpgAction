'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sword, 
  Trophy, 
  Users, 
  Search, 
  Target, 
  Zap, 
  Crown,
  TrendingUp,
  TrendingDown,
  Star,
  Clock
} from 'lucide-react';
import { CHARACTER_CLASSES, getRankIcon } from '@/data/gameData';
import { PvPSearchResult, PvPRanking } from '@/types/game';

interface PvPSystemProps {
  onSearchOpponents: () => Promise<{ success: boolean; opponents?: PvPSearchResult[]; currentUserStats?: any }>;
  onStartBattle: (opponentId: string) => Promise<{ success: boolean; battle?: any; winner?: any; loser?: any }>;
  onGetRanking: (limit?: number, offset?: number) => Promise<{ success: boolean; rankings?: PvPRanking[]; total?: number }>;
  userPvPStats?: any;
  userId?: string;
}

export function PvPSystem({ onSearchOpponents, onStartBattle, onGetRanking, userPvPStats, userId }: PvPSystemProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'ranking'>('search');
  const [opponents, setOpponents] = useState<PvPSearchResult[]>([]);
  const [rankings, setRankings] = useState<PvPRanking[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [currentBattle, setCurrentBattle] = useState<any>(null);
  const [battleResult, setBattleResult] = useState<any>(null);
  const [currentUserStats, setCurrentUserStats] = useState<any>(null);
  const [pvpCooldown, setPvpCooldown] = useState(0); // Cooldown timer in seconds
  const PVP_COOLDOWN_SECONDS = 600; // 10 minutes

  // Calculate PvP cooldown based on lastBattleTime
  useEffect(() => {
    if (!userPvPStats) {
      setPvpCooldown(0);
      return;
    }

    // Function to calculate remaining cooldown based on timestamp
    const calculateRemainingCooldown = (): number => {
      const lastBattleTime = typeof userPvPStats.lastBattleTime === 'number' 
        ? userPvPStats.lastBattleTime 
        : (userPvPStats.lastBattleTime ? parseInt(String(userPvPStats.lastBattleTime)) : 0);
      
      if (lastBattleTime === 0) {
        return 0; // No cooldown if never battled
      }

      const now = Date.now();
      const timeSinceLastBattle = Math.floor((now - lastBattleTime) / 1000);
      
      if (timeSinceLastBattle >= PVP_COOLDOWN_SECONDS) {
        return 0; // Cooldown expired
      } else {
        return Math.max(0, PVP_COOLDOWN_SECONDS - timeSinceLastBattle);
      }
    };

    // Calculate initial cooldown value
    setPvpCooldown(calculateRemainingCooldown());

    // Update cooldown every second
    const interval = setInterval(() => {
      setPvpCooldown(calculateRemainingCooldown());
    }, 1000);

    return () => clearInterval(interval);
  }, [userPvPStats?.lastBattleTime]);

  // Auto-search opponents when entering PvP tab
  useEffect(() => {
    if (activeTab === 'search' && opponents.length === 0 && !isSearching) {
      handleSearchOpponents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ranking') {
      loadRanking();
    }
  }, [activeTab]);

  const handleSearchOpponents = async () => {
    setIsSearching(true);
    try {
      const result = await onSearchOpponents();
      if (result.success) {
        setOpponents(result.opponents || []);
        setCurrentUserStats(result.currentUserStats);
      }
    } catch (error) {
      console.error('Error searching opponents:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadRanking = async () => {
    setIsLoadingRanking(true);
    try {
      const result = await onGetRanking(50, 0);
      if (result.success) {
        setRankings(result.rankings || []);
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setIsLoadingRanking(false);
    }
  };

  const handleStartBattle = async (opponentId: string) => {
    if (pvpCooldown > 0) {
      return; // Cooldown still active
    }

    try {
      const result = await onStartBattle(opponentId);
      if (result.success) {
        setBattleResult(result);
        setCurrentBattle(result.battle);
        
        // Auto-refresh opponents and ranking
        setTimeout(() => {
          handleSearchOpponents();
          loadRanking();
        }, 2000);
      } else {
        console.error('Battle failed:', result);
      }
    } catch (error) {
      console.error('Error starting battle:', error);
    }
  };

  const getRankIconForPoints = (honorPoints: number) => {
    if (honorPoints >= 2500) return '🏆';
    if (honorPoints >= 1500) return '👑';
    if (honorPoints >= 1000) return '💠';
    if (honorPoints >= 600) return '💎';
    if (honorPoints >= 300) return '🥇';
    if (honorPoints >= 100) return '🥈';
    return '🥉';
  };

  const formatCooldown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* PvP Stats Header */}
      <div className="bg-gradient-to-br from-primary-purple to-primary-pink p-6 rounded-2xl border-2 border-custom">
        <h3 className="text-2xl font-bold text-white mb-4">⚔️ Arena PvP</h3>
        
        {/* PvP Cooldown Timer */}
        {pvpCooldown > 0 && (
          <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-custom">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary-yellow" />
                <span className="text-white font-semibold">Cooldown PvP:</span>
              </div>
              <span className="text-primary-yellow font-bold text-xl">
                {formatCooldown(pvpCooldown)}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-yellow h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((PVP_COOLDOWN_SECONDS - pvpCooldown) / PVP_COOLDOWN_SECONDS) * 100}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Aguarde o cooldown para iniciar uma nova batalha PvP
            </p>
          </div>
        )}
        
        {userPvPStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-custom">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-primary-yellow" />
                <span className="text-white font-bold">Pontos de Honra</span>
              </div>
              <div className="text-2xl font-bold text-primary-yellow">
                {userPvPStats.honorPoints || 0}
              </div>
              <div className="text-sm text-gray-400">
                {getRankIconForPoints(userPvPStats.honorPoints || 0)} {userPvPStats.rank || 'Bronze'}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-custom">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-white font-bold">Vitórias</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {userPvPStats.wins || 0}
              </div>
              <div className="text-sm text-gray-400">
                Sequência: {userPvPStats.winStreak || 0}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-custom">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-white font-bold">Derrotas</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {userPvPStats.losses || 0}
              </div>
              <div className="text-sm text-gray-400">
                Total: {userPvPStats.totalBattles || 0}
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-custom">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold">Taxa de Vitória</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {userPvPStats.totalBattles > 0 
                  ? Math.round((userPvPStats.wins / userPvPStats.totalBattles) * 100) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-400">
                Melhor sequência: {userPvPStats.bestWinStreak || 0}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Battle Result Modal */}
      {battleResult && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-2xl border-2 border-custom max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">
                {battleResult.winner?.id === userId ? '🏆' : '💀'}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {battleResult.winner?.id === userId ? 'Vitória!' : 'Derrota!'}
              </h2>
              <p className="text-gray-300">
                {battleResult.winner?.nickname} vs {battleResult.loser?.nickname}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-custom">
                <h3 className="text-white font-bold mb-2">Vencedor</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getRankIconForPoints(battleResult.winner?.newHonorPoints)}</span>
                  <div>
                    <p className="text-white font-bold">{battleResult.winner?.nickname}</p>
                    <p className="text-green-400">+{battleResult.winner?.honorPointsGained} pontos</p>
                    <p className="text-gray-400">{battleResult.winner?.newRank}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg border border-custom">
                <h3 className="text-white font-bold mb-2">Perdedor</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getRankIconForPoints(battleResult.loser?.newHonorPoints)}</span>
                  <div>
                    <p className="text-white font-bold">{battleResult.loser?.nickname}</p>
                    <p className="text-red-400">-{battleResult.loser?.honorPointsLost} pontos</p>
                    <p className="text-gray-400">{battleResult.loser?.newRank}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg border border-custom mb-6">
              <h3 className="text-white font-bold mb-2">Log da Batalha</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {currentBattle?.battleLog?.map((log: string, index: number) => (
                  <div key={index} className="text-sm text-gray-300 p-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setBattleResult(null)}
              className="w-full bg-primary-green hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-primary-green to-primary-blue text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Buscar Oponentes</span>
        </button>
        
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
            activeTab === 'ranking'
              ? 'bg-gradient-to-r from-primary-green to-primary-blue text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Ranking</span>
        </button>
      </div>

      {/* Search Opponents Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-blue to-primary-cyan p-6 rounded-2xl border-2 border-custom">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-white">Buscar Oponentes</h4>
              <button
                onClick={handleSearchOpponents}
                disabled={isSearching}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                  isSearching
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-green hover:bg-green-600 text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? 'Buscando...' : 'Atualizar'}</span>
              </button>
            </div>

            {opponents.length === 0 ? (
              <p className="text-gray-300 text-center py-8">
                {isSearching ? 'Buscando oponentes...' : 'Carregando oponentes...'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {opponents.map((opponent) => (
                  <div key={opponent.playerId} className="bg-gray-800 p-4 rounded-lg border border-custom">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{CHARACTER_CLASSES[opponent.characterClass].icon}</span>
                      <div>
                        <h5 className="text-white font-bold">{opponent.nickname}</h5>
                        <p className="text-gray-400 text-sm">Nível {opponent.level}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Pontos de Honra:</span>
                        <span className="text-primary-yellow font-bold">
                          {getRankIconForPoints(opponent.honorPoints)} {opponent.honorPoints}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStartBattle(opponent.playerId)}
                      disabled={pvpCooldown > 0}
                      className={`w-full px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        pvpCooldown <= 0
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Sword className="w-4 h-4" />
                      <span>{pvpCooldown <= 0 ? 'Batalhar' : 'Cooldown Ativo'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ranking Tab */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-yellow to-primary-orange p-6 rounded-2xl border-2 border-custom">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-white">🏆 Ranking PvP</h4>
              <button
                onClick={loadRanking}
                disabled={isLoadingRanking}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                  isLoadingRanking
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-green hover:bg-green-600 text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{isLoadingRanking ? 'Carregando...' : 'Atualizar'}</span>
              </button>
            </div>

            {rankings.length === 0 ? (
              <p className="text-gray-300 text-center py-8">
                {isLoadingRanking ? 'Carregando ranking...' : 'Nenhum jogador encontrado no ranking.'}
              </p>
            ) : (
              <div className="space-y-2">
                {rankings.map((player, index) => (
                  <div key={player.playerId} className="bg-gray-800 p-4 rounded-lg border border-custom">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-yellow">#{player.rank}</div>
                          {index < 3 && (
                            <div className="text-lg">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{CHARACTER_CLASSES[player.characterClass].icon}</span>
                          <div>
                            <h5 className="text-white font-bold">{player.nickname}</h5>
                            <p className="text-gray-400 text-sm">Nível {player.level}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-primary-yellow font-bold text-lg">
                          {getRankIconForPoints(player.honorPoints)} {player.honorPoints}
                        </div>
                        <div className="text-sm text-gray-400">
                          {player.wins}W / {player.losses}L ({player.winRate}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
