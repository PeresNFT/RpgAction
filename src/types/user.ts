import { CharacterClass, Attributes, CharacterStats, Item, BattleState, CollectionState, PvPStats, PlayerSkill } from './game';

export interface User {
  id: string;
  email: string;
  nickname: string;
  password: string;
  createdAt: string;
  lastLogin: string;
  // Game data
  characterClass: CharacterClass | null;
  attributes: Attributes;
  availablePoints: number;
  stats: CharacterStats;
  inventory: Item[];
  battle: BattleState;
  collection: CollectionState;
  equippedItems: {
    weapon?: Item;
    offhand?: Item;
    helmet?: Item;
    armor?: Item;
    pants?: Item;
    boots?: Item;
    ring?: Item;
    amulet?: Item;
    relic?: Item;
  };
  gold: number;
  diamonds: number; // Premium currency (cash/R$)
  pvpStats?: PvPStats; // Add PvP stats
  skills?: PlayerSkill[]; // Player's unlocked skills and cooldowns
  // Legacy fields (for backward compatibility)
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength: number;
  agility: number;
  intelligence: number;
  guildId?: string;
  guildRole?: 'member' | 'officer' | 'leader';
  // Shop & Profile
  purchasedItems?: string[]; // IDs of purchased items (profile images, etc)
  profileImage?: string; // Selected profile image path
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
}

export interface AuthContextType {
  user: User | null;
  login: (data: LoginFormData) => Promise<boolean>;
  register: (data: RegisterFormData) => Promise<boolean>;
  updateCharacter: (characterClass: CharacterClass, attributes: Attributes) => Promise<boolean>;
  updateExperience: (experienceGained: number, goldGained?: number, itemsGained?: any[]) => Promise<{ success: boolean; levelUp?: boolean }>;
  updateAttributes: (attributes: Attributes) => Promise<boolean>;
  updateHealth: (health?: number, mana?: number) => Promise<boolean>;
  useItem: (itemId: string) => Promise<{ success: boolean; effectsApplied?: string[]; itemUsed?: string }>;
  rest: () => Promise<{ success: boolean; restTimeMinutes?: number; message?: string }>;
  sellItems: (itemsToSell: Array<{itemId: string, amount: number}>) => Promise<{ success: boolean; totalGold?: number; soldItems?: any[]; message?: string }>;
  updateCollection: (collectionType: string, experienceGained: number, resourcesGained?: any[]) => Promise<{ success: boolean; levelUp?: boolean }>;
  searchPvPOpponents: () => Promise<{ success: boolean; opponents?: any[]; currentUserStats?: any }>;
  startPvPBattle: (opponentId: string) => Promise<{ success: boolean; battle?: any; winner?: any; loser?: any }>;
  getPvPRanking: (limit?: number, offset?: number) => Promise<{ success: boolean; rankings?: any[]; total?: number }>;
  createGuild: (name: string, description?: string, icon?: string) => Promise<{ success: boolean; guild?: any }>;
  joinGuild: (guildId: string) => Promise<{ success: boolean; guild?: any }>;
  leaveGuild: () => Promise<{ success: boolean }>;
  getGuild: (guildId: string) => Promise<{ success: boolean; guild?: any; members?: any[] }>;
  updateGuild: (guildId: string, updates: any) => Promise<{ success: boolean; guild?: any }>;
  getGuildRanking: (limit?: number, offset?: number) => Promise<{ success: boolean; rankings?: any[]; total?: number }>;
  guildBank: (action: 'deposit' | 'withdraw', amount: number) => Promise<{ success: boolean; message?: string; userGold?: number; guildGold?: number }>;
  contributeExperience: (experience: number) => Promise<{ success: boolean; message?: string; guild?: any; leveledUp?: boolean }>;
  upgradeSkill: (skillId: string) => Promise<{ success: boolean; error?: string; skillLevel?: number; goldSpent?: number }>;
  // Market functions
  listMarketItems: (currencyType?: 'gold' | 'diamonds', limit?: number, offset?: number) => Promise<{ success: boolean; items?: any[]; total?: number }>;
  addMarketItem: (itemId: string, amount: number, price: number, priceDiamonds: number | undefined, currencyType: 'gold' | 'diamonds') => Promise<{ success: boolean; error?: string; marketItem?: any }>;
  buyMarketItem: (marketItemId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  removeMarketItem: (marketItemId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  // Shop functions
  buyShopItem: (shopItemId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateProfileImage: (imagePath: string) => Promise<{ success: boolean; error?: string }>;
  equipItem: (itemId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  unequipItem: (slot: keyof User['equippedItems']) => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshUser: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}
