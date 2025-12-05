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
import { PvPSearchResult, PvPRanking, CharacterClass } from '@/types/game';
import { ProfileImage } from '@/components/ProfileImage';
import { Card } from '@/components/Card';

// Helper function to get character image path based on class
function getCharacterImagePath(characterClass: CharacterClass | null, isFemale: boolean = false): string | null {
  if (!characterClass) return null;
  
  const classImageMap: Record<CharacterClass, { male: string; female: string }> = {
    warrior: {
      male: '/images/characters/Guerreiro.png',
      female: '/images/characters/Guerreira.png'
    },
    archer: {
      male: '/images/characters/Arqueiro.png',
      female: '/images/characters/Arqueira.png'
    },
    mage: {
      male: '/images/characters/Mago.png',
      female: '/images/characters/Maga.png'
    }
  };
  
  const gender = isFemale ? 'female' : 'male';
  return classImageMap[characterClass]?.[gender] || null;
}

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
  const [refreshCooldown, setRefreshCooldown] = useState(0); // Refresh cooldown timer in seconds
  const REFRESH_COOLDOWN_SECONDS = 30; // 30 seconds
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0); // Timestamp of last refresh
  const [rankingRefreshCooldown, setRankingRefreshCooldown] = useState(0); // Ranking refresh cooldown timer in seconds
  const RANKING_REFRESH_COOLDOWN_SECONDS = 10; // 10 seconds
  const [lastRankingRefreshTime, setLastRankingRefreshTime] = useState<number>(0); // Timestamp of last ranking refresh

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

  // Calculate refresh cooldown
  useEffect(() => {
    const calculateRefreshCooldown = (): number => {
      if (lastRefreshTime === 0) {
        return 0; // No cooldown if never refreshed
      }

      const now = Date.now();
      const timeSinceLastRefresh = Math.floor((now - lastRefreshTime) / 1000);
      
      if (timeSinceLastRefresh >= REFRESH_COOLDOWN_SECONDS) {
        return 0; // Cooldown expired
      } else {
        return Math.max(0, REFRESH_COOLDOWN_SECONDS - timeSinceLastRefresh);
      }
    };

    // Calculate initial cooldown value
    setRefreshCooldown(calculateRefreshCooldown());

    // Update cooldown every second
    const interval = setInterval(() => {
      setRefreshCooldown(calculateRefreshCooldown());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  // Calculate ranking refresh cooldown
  useEffect(() => {
    const calculateRankingRefreshCooldown = (): number => {
      if (lastRankingRefreshTime === 0) {
        return 0; // No cooldown if never refreshed
      }

      const now = Date.now();
      const timeSinceLastRefresh = Math.floor((now - lastRankingRefreshTime) / 1000);
      
      if (timeSinceLastRefresh >= RANKING_REFRESH_COOLDOWN_SECONDS) {
        return 0; // Cooldown expired
      } else {
        return Math.max(0, RANKING_REFRESH_COOLDOWN_SECONDS - timeSinceLastRefresh);
      }
    };

    // Calculate initial cooldown value
    setRankingRefreshCooldown(calculateRankingRefreshCooldown());

    // Update cooldown every second
    const interval = setInterval(() => {
      setRankingRefreshCooldown(calculateRankingRefreshCooldown());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRankingRefreshTime]);

  // Auto-search opponents when entering PvP tab
  useEffect(() => {
    if (activeTab === 'search' && opponents.length === 0 && !isSearching && refreshCooldown === 0) {
      handleSearchOpponents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ranking' && rankings.length === 0 && !isLoadingRanking) {
      // Load ranking on first visit (no cooldown check)
      loadRanking(false);
    }
  }, [activeTab]);

  const handleSearchOpponents = async () => {
    if (refreshCooldown > 0) {
      return; // Cooldown still active
    }

    setIsSearching(true);
    try {
      const result = await onSearchOpponents();
      if (result.success) {
        setOpponents(result.opponents || []);
        setCurrentUserStats(result.currentUserStats);
        setLastRefreshTime(Date.now()); // Update last refresh time
      }
    } catch (error) {
      console.error('Error searching opponents:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const loadRanking = async (checkCooldown: boolean = true) => {
    if (checkCooldown && rankingRefreshCooldown > 0) {
      return; // Cooldown still active
    }

    setIsLoadingRanking(true);
    try {
      const result = await onGetRanking(50, 0);
      if (result.success) {
        setRankings(result.rankings || []);
        setLastRankingRefreshTime(Date.now()); // Update last ranking refresh time
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
      <Card>
        <h3 className="text-3xl font-bold text-white mb-6">⚔️ Arena PvP</h3>
        
        {/* PvP Cooldown Timer */}
        {pvpCooldown > 0 && (
          <div className="mb-6 bg-dark-bg-card p-4 rounded-xl border border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary-yellow" />
                <span className="text-white font-semibold">Cooldown PvP:</span>
              </div>
              <span className="text-primary-yellow font-bold text-xl">
                {formatCooldown(pvpCooldown)}
              </span>
            </div>
            <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
              <div 
                className="bg-accent-purple h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((PVP_COOLDOWN_SECONDS - pvpCooldown) / PVP_COOLDOWN_SECONDS) * 100}%` }}
              ></div>
            </div>
            <p className="text-dark-text-secondary text-sm mt-2">
              Aguarde o cooldown para iniciar uma nova batalha PvP
            </p>
          </div>
        )}
        
        {userPvPStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-primary-yellow" />
                <span className="text-white font-bold">Pontos de Honra</span>
              </div>
              <div className="text-2xl font-bold text-primary-yellow">
                {userPvPStats.honorPoints || 0}
              </div>
              <div className="text-sm text-dark-text-secondary">
                {getRankIconForPoints(userPvPStats.honorPoints || 0)} {userPvPStats.rank || 'Bronze'}
              </div>
            </div>
            
            <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-white font-bold">Vitórias</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {userPvPStats.wins || 0}
              </div>
              <div className="text-sm text-dark-text-secondary">
                Sequência: {userPvPStats.winStreak || 0}
              </div>
            </div>
            
            <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-white font-bold">Derrotas</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {userPvPStats.losses || 0}
              </div>
              <div className="text-sm text-dark-text-secondary">
                Total: {userPvPStats.totalBattles || 0}
              </div>
            </div>
            
            <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold">Taxa de Vitória</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {userPvPStats.totalBattles > 0 
                  ? Math.round((userPvPStats.wins / userPvPStats.totalBattles) * 100) 
                  : 0}%
              </div>
              <div className="text-sm text-dark-text-secondary">
                Melhor sequência: {userPvPStats.bestWinStreak || 0}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Battle Result Modal */}
      {battleResult && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">
                {battleResult.winner?.id === userId ? '🏆' : '💀'}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {battleResult.winner?.id === userId ? 'Vitória!' : 'Derrota!'}
              </h2>
              <p className="text-dark-text-secondary">
                {battleResult.winner?.nickname} vs {battleResult.loser?.nickname}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                <h3 className="text-white font-bold mb-2">Vencedor</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getRankIconForPoints(battleResult.winner?.newHonorPoints)}</span>
                  <div>
                    <p className="text-white font-bold">{battleResult.winner?.nickname}</p>
                    <p className="text-green-400">+{battleResult.winner?.honorPointsGained} pontos</p>
                    <p className="text-dark-text-secondary">{battleResult.winner?.newRank}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                <h3 className="text-white font-bold mb-2">Perdedor</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getRankIconForPoints(battleResult.loser?.newHonorPoints)}</span>
                  <div>
                    <p className="text-white font-bold">{battleResult.loser?.nickname}</p>
                    <p className="text-red-400">-{battleResult.loser?.honorPointsLost} pontos</p>
                    <p className="text-dark-text-secondary">{battleResult.loser?.newRank}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border mb-6">
              <h3 className="text-white font-bold mb-2">Log da Batalha</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {currentBattle?.battleLog?.map((log: string, index: number) => (
                  <div key={index} className="text-sm text-dark-text-secondary p-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setBattleResult(null)}
              className="w-full bg-accent-purple hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300"
            >
              Continuar
            </button>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'search'
              ? 'bg-accent-purple text-white'
              : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-card hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Buscar Oponentes</span>
        </button>
        
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'ranking'
              ? 'bg-accent-purple text-white'
              : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-card hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Ranking</span>
        </button>
      </div>

      {/* Search Opponents Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-2xl font-bold text-white">Buscar Oponentes</h4>
              <button
                onClick={handleSearchOpponents}
                disabled={isSearching || refreshCooldown > 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  isSearching || refreshCooldown > 0
                    ? 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                    : 'bg-accent-purple hover:opacity-90 text-white'
                }`}
                title={refreshCooldown > 0 ? `Aguarde ${formatCooldown(refreshCooldown)} para atualizar novamente` : ''}
              >
                <Search className="w-4 h-4" />
                <span>
                  {isSearching 
                    ? 'Buscando...' 
                    : refreshCooldown > 0 
                      ? `Atualizar (${formatCooldown(refreshCooldown)})`
                      : 'Atualizar'
                  }
                </span>
              </button>
            </div>

            {opponents.length === 0 ? (
              <p className="text-dark-text-secondary text-center py-8">
                {isSearching ? 'Buscando oponentes...' : 'Carregando oponentes...'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {opponents.map((opponent) => (
                  <div key={opponent.playerId} className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                    <div className="flex items-center space-x-3 mb-3">
                      {getCharacterImagePath(opponent.characterClass, false) ? (
                        <img 
                          src={getCharacterImagePath(opponent.characterClass, false)!} 
                          alt={CHARACTER_CLASSES[opponent.characterClass].name}
                          className="w-12 h-12 object-contain rounded-lg"
                          onError={(e) => {
                            // Fallback para ícone se imagem não existir
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('span');
                              fallback.className = 'text-2xl';
                              fallback.textContent = CHARACTER_CLASSES[opponent.characterClass].icon;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-2xl">{CHARACTER_CLASSES[opponent.characterClass].icon}</span>
                      )}
                      <div>
                        <h5 className="text-white font-bold">{opponent.nickname}</h5>
                        <p className="text-dark-text-secondary text-sm">Nível {opponent.level}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-text-secondary">Pontos de Honra:</span>
                        <span className="text-primary-yellow font-bold">
                          {getRankIconForPoints(opponent.honorPoints)} {opponent.honorPoints}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStartBattle(opponent.playerId)}
                      disabled={pvpCooldown > 0}
                      className={`w-full px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        pvpCooldown <= 0
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white'
                          : 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                      }`}
                    >
                      <Sword className="w-4 h-4" />
                      <span>{pvpCooldown <= 0 ? 'Batalhar' : `Batalhar (${formatCooldown(pvpCooldown)})`}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Ranking Tab */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-2xl font-bold text-white">🏆 Ranking PvP</h4>
              <button
                onClick={() => void loadRanking()}
                disabled={isLoadingRanking || rankingRefreshCooldown > 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  isLoadingRanking || rankingRefreshCooldown > 0
                    ? 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                    : 'bg-accent-purple hover:opacity-90 text-white'
                }`}
                title={rankingRefreshCooldown > 0 ? `Aguarde ${formatCooldown(rankingRefreshCooldown)} para atualizar novamente` : ''}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {isLoadingRanking 
                    ? 'Carregando...' 
                    : rankingRefreshCooldown > 0 
                      ? `Atualizar (${formatCooldown(rankingRefreshCooldown)})`
                      : 'Atualizar'
                  }
                </span>
              </button>
            </div>

            {rankings.length === 0 ? (
              <p className="text-dark-text-secondary text-center py-8">
                {isLoadingRanking ? 'Carregando ranking...' : 'Nenhum jogador encontrado no ranking.'}
              </p>
            ) : (
              <div className="space-y-2">
                {rankings.map((player, index) => (
                  <div key={player.playerId} className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
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
                          <ProfileImage
                            profileImage={player.profileImage}
                            characterClass={player.characterClass}
                            characterGender="male"
                            size="large"
                            showEditButton={false}
                          />
                          <div>
                            <h5 className="text-white font-bold">{player.nickname}</h5>
                            <p className="text-dark-text-secondary text-sm">Nível {player.level}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-primary-yellow font-bold text-lg">
                          {getRankIconForPoints(player.honorPoints)} {player.honorPoints}
                        </div>
                        <div className="text-sm text-dark-text-secondary">
                          {player.wins}W / {player.losses}L ({player.winRate}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
