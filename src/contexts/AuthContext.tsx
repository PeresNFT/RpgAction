'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginFormData, RegisterFormData, AuthContextType } from '@/types/user';
import { CharacterClass, Attributes } from '@/types/game';
import { authenticateUser, createUser } from '@/lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('rpg_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('rpg_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authenticatedUser = await authenticateUser(data);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('rpg_user', JSON.stringify(authenticatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterFormData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const newUser = await createUser(data);
      setUser(newUser);
      localStorage.setItem('rpg_user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharacter = async (characterClass: CharacterClass, attributes: Attributes): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/update-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          characterClass,
          attributes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update character');
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return true;
    } catch (error) {
      console.error('Update character error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExperience = async (experienceGained: number, goldGained: number = 0, itemsGained: any[] = []): Promise<{ success: boolean; levelUp?: boolean }> => {
    try {
      const response = await fetch('/api/auth/update-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          experienceGained,
          goldGained,
          itemsGained,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update experience');
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return { success: true, levelUp: result.levelUp };
    } catch (error) {
      console.error('Update experience error:', error);
      return { success: false };
    }
  };

  const updateAttributes = async (attributes: Attributes): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/update-attributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          attributes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update attributes');
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return true;
    } catch (error) {
      console.error('Update attributes error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHealth = async (health: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/update-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          health,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update health');
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return true;
    } catch (error) {
      console.error('Update health error:', error);
      return false;
    }
  };

  const useItem = async (itemId: string): Promise<{ success: boolean; effectsApplied?: string[]; itemUsed?: string }> => {
    try {
      const response = await fetch('/api/auth/use-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          itemId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to use item');
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return { 
        success: true, 
        effectsApplied: result.effectsApplied,
        itemUsed: result.itemUsed
      };
    } catch (error) {
      console.error('Use item error:', error);
      return { success: false };
    }
  };

  const rest = async (): Promise<{ success: boolean; restTimeMinutes?: number; message?: string }> => {
    try {
      const response = await fetch('/api/auth/rest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to rest');
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return { 
        success: true, 
        restTimeMinutes: result.restTimeMinutes,
        message: result.message
      };
    } catch (error) {
      console.error('Rest error:', error);
      return { success: false };
    }
  };

  const sellItems = async (itemsToSell: Array<{itemId: string, amount: number}>): Promise<{ success: boolean; totalGold?: number; soldItems?: any[]; message?: string }> => {
    try {
      const response = await fetch('/api/auth/sell-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          itemsToSell,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sell items');
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return { 
        success: true, 
        totalGold: result.totalGold,
        soldItems: result.soldItems,
        message: result.message
      };
    } catch (error) {
      console.error('Sell items error:', error);
      return { success: false };
    }
  };

  const updateCollection = async (collectionType: string, experienceGained: number, resourcesGained: any[] = []): Promise<{ success: boolean; levelUp?: boolean }> => {
    try {
      const response = await fetch('/api/auth/update-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          collectionType,
          experienceGained,
          resourcesGained,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update collection');
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return { success: true, levelUp: result.levelUp };
    } catch (error) {
      console.error('Update collection error:', error);
      return { success: false };
    }
  };

  // PvP Functions
  const searchPvPOpponents = async (): Promise<{ success: boolean; opponents?: any[]; currentUserStats?: any }> => {
    try {
      const response = await fetch('/api/auth/search-pvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to search PvP opponents');
      }

      return { 
        success: true, 
        opponents: result.opponents,
        currentUserStats: result.currentUserStats
      };
    } catch (error) {
      console.error('Search PvP opponents error:', error);
      return { success: false };
    }
  };

  const startPvPBattle = async (opponentId: string): Promise<{ success: boolean; battle?: any; winner?: any; loser?: any }> => {
    try {
      const response = await fetch('/api/auth/start-pvp-battle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player1Id: user?.id,
          player2Id: opponentId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start PvP battle');
      }

      // Update local user data with new PvP stats
      if (!user) {
        return { success: false };
      }

      if (result.winner && result.winner.id === user.id) {
        const updatedUser = {
          ...user,
          pvpStats: {
            honorPoints: result.winner.newHonorPoints,
            wins: (user.pvpStats?.wins ?? 0) + 1,
            losses: user.pvpStats?.losses ?? 0,
            winStreak: (user.pvpStats?.winStreak ?? 0) + 1,
            bestWinStreak: Math.max((user.pvpStats?.winStreak ?? 0) + 1, user.pvpStats?.bestWinStreak ?? 0),
            totalBattles: (user.pvpStats?.totalBattles ?? 0) + 1,
            rank: result.winner.newRank,
            lastBattleTime: Date.now()
          }
        };
        setUser(updatedUser);
        localStorage.setItem('rpg_user', JSON.stringify(updatedUser));
      } else if (result.loser && result.loser.id === user.id) {
        const updatedUser = {
          ...user,
          pvpStats: {
            honorPoints: result.loser.newHonorPoints,
            wins: user.pvpStats?.wins ?? 0,
            losses: (user.pvpStats?.losses ?? 0) + 1,
            winStreak: 0,
            bestWinStreak: user.pvpStats?.bestWinStreak ?? 0,
            totalBattles: (user.pvpStats?.totalBattles ?? 0) + 1,
            rank: result.loser.newRank,
            lastBattleTime: Date.now()
          }
        };
        setUser(updatedUser);
        localStorage.setItem('rpg_user', JSON.stringify(updatedUser));
      }

      return { 
        success: true, 
        battle: result.battle,
        winner: result.winner,
        loser: result.loser
      };
    } catch (error) {
      console.error('Start PvP battle error:', error);
      return { success: false };
    }
  };

  const getPvPRanking = async (limit: number = 50, offset: number = 0): Promise<{ success: boolean; rankings?: any[]; total?: number }> => {
    try {
      const response = await fetch(`/api/auth/pvp-ranking?limit=${limit}&offset=${offset}`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get PvP ranking');
      }

      return { 
        success: true, 
        rankings: result.rankings,
        total: result.total
      };
    } catch (error) {
      console.error('Get PvP ranking error:', error);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rpg_user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    updateCharacter,
    updateExperience,
    updateAttributes,
    updateHealth,
    useItem,
    rest,
    sellItems,
    updateCollection,
    searchPvPOpponents,
    startPvPBattle,
    getPvPRanking,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
