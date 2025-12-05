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

  const updateHealth = async (health?: number, mana?: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/update-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...(health !== undefined && { health }),
          ...(mana !== undefined && { mana }),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update health/mana');
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

  // Guild Functions
  const createGuild = async (name: string, description?: string, icon?: string): Promise<{ success: boolean; guild?: any }> => {
    try {
      if (!user) {
        return { success: false };
      }

      const response = await fetch('/api/auth/create-guild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name,
          description,
          icon,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create guild');
      }

      // Update user with guild info
      if (result.guild) {
        const updatedUser = {
          ...user,
          guildId: result.guild.id,
          guildRole: 'leader' as const
        };
        setUser(updatedUser);
        localStorage.setItem('rpg_user', JSON.stringify(updatedUser));
      }

      return { success: true, guild: result.guild };
    } catch (error: any) {
      console.error('Create guild error:', error);
      return { success: false };
    }
  };

  const joinGuild = async (guildId: string): Promise<{ success: boolean; guild?: any }> => {
    try {
      if (!user) {
        return { success: false };
      }

      const response = await fetch('/api/auth/join-guild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          guildId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join guild');
      }

      // Update user with guild info
      if (result.guild) {
        const updatedUser = {
          ...user,
          guildId: result.guild.id,
          guildRole: 'member' as const
        };
        setUser(updatedUser);
        localStorage.setItem('rpg_user', JSON.stringify(updatedUser));
      }

      return { success: true, guild: result.guild };
    } catch (error: any) {
      console.error('Join guild error:', error);
      return { success: false };
    }
  };

  const leaveGuild = async (): Promise<{ success: boolean }> => {
    try {
      if (!user) {
        return { success: false };
      }

      const response = await fetch('/api/auth/leave-guild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to leave guild');
      }

      // Update user to remove guild info
      const updatedUser = {
        ...user,
        guildId: undefined,
        guildRole: undefined
      };
      setUser(updatedUser);
      localStorage.setItem('rpg_user', JSON.stringify(updatedUser));

      return { success: true };
    } catch (error: any) {
      console.error('Leave guild error:', error);
      return { success: false };
    }
  };

  const getGuild = async (guildId: string): Promise<{ success: boolean; guild?: any; members?: any[] }> => {
    try {
      const response = await fetch('/api/auth/get-guild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guildId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get guild');
      }

      return { success: true, guild: result.guild, members: result.members };
    } catch (error: any) {
      console.error('Get guild error:', error);
      return { success: false };
    }
  };

  const updateGuild = async (guildId: string, updates: any): Promise<{ success: boolean; guild?: any }> => {
    try {
      if (!user) {
        return { success: false };
      }

      const response = await fetch('/api/auth/update-guild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          guildId,
          updates,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update guild');
      }

      return { success: true, guild: result.guild };
    } catch (error: any) {
      console.error('Update guild error:', error);
      return { success: false };
    }
  };

  const getGuildRanking = async (limit: number = 50, offset: number = 0): Promise<{ success: boolean; rankings?: any[]; total?: number }> => {
    try {
      const response = await fetch(`/api/auth/guild-ranking?limit=${limit}&offset=${offset}`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get guild ranking');
      }

      return { 
        success: true, 
        rankings: result.rankings,
        total: result.total
      };
    } catch (error) {
      console.error('Get guild ranking error:', error);
      return { success: false };
    }
  };

  const guildBank = async (action: 'deposit' | 'withdraw', amount: number): Promise<{ success: boolean; message?: string; userGold?: number; guildGold?: number }> => {
    try {
      if (!user || !user.guildId) {
        return { success: false };
      }

      const response = await fetch('/api/auth/guild-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          guildId: user.guildId,
          action,
          amount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to perform bank action');
      }

      // Update user gold if deposit
      if (result.userGold !== undefined) {
        const updatedUser = {
          ...user,
          gold: result.userGold
        };
        setUser(updatedUser);
        localStorage.setItem('rpg_user', JSON.stringify(updatedUser));
      }

      return { 
        success: true, 
        message: result.message,
        userGold: result.userGold,
        guildGold: result.guildGold
      };
    } catch (error: any) {
      console.error('Guild bank error:', error);
      return { success: false };
    }
  };

  const contributeExperience = async (experience: number): Promise<{ success: boolean; message?: string; guild?: any; leveledUp?: boolean }> => {
    try {
      if (!user || !user.guildId) {
        return { success: false };
      }

      const response = await fetch('/api/auth/guild-contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          guildId: user.guildId,
          experience,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to contribute experience');
      }

      return { 
        success: true, 
        message: result.message,
        guild: result.guild,
        leveledUp: result.leveledUp
      };
    } catch (error: any) {
      console.error('Contribute experience error:', error);
      return { success: false };
    }
  };

  const upgradeSkill = async (skillId: string): Promise<{ success: boolean; error?: string; skillLevel?: number; goldSpent?: number }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/upgrade-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          skillId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to upgrade skill' };
      }

      setUser(result.user);
      localStorage.setItem('rpg_user', JSON.stringify(result.user));
      return { 
        success: true, 
        skillLevel: result.skillLevel,
        goldSpent: result.goldSpent
      };
    } catch (error: any) {
      console.error('Upgrade skill error:', error);
      return { success: false, error: 'Internal server error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rpg_user');
  };

  // Market functions
  const listMarketItems = async (currencyType?: 'gold' | 'diamonds', limit: number = 50, offset: number = 0): Promise<{ success: boolean; items?: any[]; total?: number }> => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (currencyType) {
        params.append('currencyType', currencyType);
      }

      const response = await fetch(`/api/auth/market/list?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to list market items');
      }

      return { success: true, items: result.items, total: result.total };
    } catch (error: any) {
      console.error('List market items error:', error);
      return { success: false };
    }
  };

  const addMarketItem = async (itemId: string, amount: number, price: number, priceDiamonds: number | undefined, currencyType: 'gold' | 'diamonds'): Promise<{ success: boolean; error?: string; marketItem?: any }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/market/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          itemId,
          amount,
          price,
          priceDiamonds,
          currencyType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to add item to market' };
      }

      // Update user data with returned user
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('rpg_user', JSON.stringify(result.user));
      }

      return { success: true, marketItem: result.marketItem };
    } catch (error: any) {
      console.error('Add market item error:', error);
      return { success: false, error: 'Internal server error' };
    }
  };

  const buyMarketItem = async (marketItemId: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/market/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId: user.id,
          marketItemId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to buy item' };
      }

      // Update user data with returned buyer data
      if (result.buyer) {
        setUser(result.buyer);
        localStorage.setItem('rpg_user', JSON.stringify(result.buyer));
      }

      return { success: true, message: result.message };
    } catch (error: any) {
      console.error('Buy market item error:', error);
      return { success: false, error: 'Internal server error' };
    }
  };

  const removeMarketItem = async (marketItemId: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/market/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          marketItemId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to remove item from market' };
      }

      // Update user data with returned user data
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('rpg_user', JSON.stringify(result.user));
      }

      return { success: true, message: result.message };
    } catch (error: any) {
      console.error('Remove market item error:', error);
      return { success: false, error: 'Internal server error' };
    }
  };

  const buyShopItem = async (shopItemId: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/buy-shop-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          shopItemId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to buy shop item' };
      }

      // Update user data with returned user
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('rpg_user', JSON.stringify(result.user));
      }

      return { success: true, message: result.message };
    } catch (error: any) {
      console.error('Buy shop item error:', error);
      return { success: false, error: 'Internal server error' };
    }
  };

  const updateProfileImage = async (imagePath: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/update-profile-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          imagePath,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to update profile image' };
      }

      // Update user data with returned user
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('rpg_user', JSON.stringify(result.user));
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update profile image error:', error);
      return { success: false, error: 'Internal server error' };
    }
  };

  const equipItem = async (itemId: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/equip-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          itemId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to equip item' };
      }

      // Update user data with returned user
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('rpg_user', JSON.stringify(result.user));
      }

      return { success: true, message: result.message };
    } catch (error: any) {
      console.error('Equip item error:', error);
      return { success: false, error: 'Internal server error' };
    }
  };

  const unequipItem = async (slot: keyof User['equippedItems']): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/unequip-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          slot,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to unequip item' };
      }

      // Update user data with returned user
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('rpg_user', JSON.stringify(result.user));
      }

      return { success: true, message: result.message };
    } catch (error: any) {
      console.error('Unequip item error:', error);
      return { success: false, error: 'Internal server error' };
    }
  };

  const refreshUser = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not logged in' };
      }

      const response = await fetch('/api/auth/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to refresh user data' };
      }

      // Update user data with returned user from database
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('rpg_user', JSON.stringify(result.user));
      }

      return { success: true };
    } catch (error: any) {
      console.error('Refresh user error:', error);
      return { success: false, error: 'Internal server error' };
    }
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
    createGuild,
    joinGuild,
    leaveGuild,
    getGuild,
    updateGuild,
    getGuildRanking,
    guildBank,
    contributeExperience,
    upgradeSkill,
    listMarketItems,
    addMarketItem,
    buyMarketItem,
    removeMarketItem,
    buyShopItem,
    updateProfileImage,
    equipItem,
    unequipItem,
    refreshUser,
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
