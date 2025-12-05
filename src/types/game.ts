export type CharacterClass = 'warrior' | 'archer' | 'mage';

export interface Attributes {
  strength: number;    // STR - Vida, Dano para Guerreiro
  magic: number;       // MAG - Mana, Dano para Mago
  dexterity: number;   // DEX - Precisão, Dano para Arqueiro
  agility: number;     // AGI - Esquiva, Reduz crítico recebido
  luck: number;        // LUK - Crítico, Resistência a crítico
}

export interface CharacterStats {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  accuracy: number;        // Precisão (DEX)
  dodgeChance: number;     // Esquiva (AGI)
  criticalChance: number;  // Crítico (LUK)
  criticalResist: number;  // Resistência a crítico (LUK)
  lastRestTime?: number; // Timestamp do último descanso para cooldown
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level: number;
  stats?: Partial<Attributes>;
  value: number;
  icon: string;
  amount?: number;
  healAmount?: number;  // Para poções de vida
  manaAmount?: number;  // Para poções de mana
  imagePath?: string;  // Caminho da imagem do item
  requiredClass?: CharacterClass;  // Classe necessária para equipar
  requiredLevel?: number;  // Nível mínimo necessário para equipar (padrão: 1)
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  drops: Array<{
    itemId: string;
    chance: number;
  }>;
  icon: string;
  imagePath?: string; // Path para imagem do monstro (ex: /images/monsters/goblin.png)
  attributes?: Attributes;
  stats?: {
    maxHealth: number;
    maxMana: number;
    attack: number;
    defense: number;
    accuracy: number;
    dodgeChance: number;
    criticalChance: number;
    criticalResist: number;
  };
}

export interface BattleState {
  isActive: boolean;
  player: {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
  };
  monster: Monster | null;
  turn: 'player' | 'monster';
  battleLog: string[];
  rewards?: {
    experience: number;
    gold: number;
    items: Item[];
  };
}

export type CollectionType = 'mining' | 'woodcutting' | 'farming' | 'fishing';

export interface CollectionSkill {
  type: CollectionType;
  level: number;
  experience: number;
  experienceToNext: number;
}

export interface CollectionState {
  isActive: boolean;
  lastCollection: number;
  collectionInterval: number; // em segundos
  skills: CollectionSkill[];
  resources: Array<{
    id: string;
    name: string;
    amount: number;
    icon: string;
  }>;
}

export interface GameState {
  characterClass: CharacterClass | null;
  attributes: Attributes;
  availablePoints: number;
  stats: CharacterStats;
  inventory: Item[];
  battle: BattleState;
  collection: CollectionState;
  gold: number;
}

// PvP System Types
export interface PvPStats {
  honorPoints: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  totalBattles: number;
  rank: string;
  lastBattleTime?: number;
}

export interface PvPBattle {
  id: string;
  player1: {
    id: string;
    nickname: string;
    characterClass: CharacterClass;
    level: number;
    health: number;
    maxHealth: number;
    stats: CharacterStats;
  };
  player2: {
    id: string;
    nickname: string;
    characterClass: CharacterClass;
    level: number;
    health: number;
    maxHealth: number;
    stats: CharacterStats;
  };
  winner?: string; // ID do jogador vencedor
  battleLog: string[];
  startTime: number;
  endTime?: number;
  status: 'pending' | 'active' | 'completed';
}

export interface PvPRanking {
  rank: number;
  playerId: string;
  nickname: string;
  characterClass: CharacterClass;
  level: number;
  honorPoints: number;
  wins: number;
  losses: number;
  winRate: number;
  profileImage?: string;
}

export interface PvPSearchResult {
  playerId: string;
  nickname: string;
  characterClass: CharacterClass;
  level: number;
  honorPoints: number;
  profileImage?: string;
  estimatedWaitTime: number; // em segundos
}

// Guild System Types
export type GuildRole = 'member' | 'officer' | 'leader';
export type GuildJoinType = 'open' | 'invite' | 'closed';

export interface GuildSettings {
  buffs: {
    attackBoost?: number;
    defenseBoost?: number;
    experienceBoost?: number;
    goldBoost?: number;
  };
  upgrades: {
    maxMembers?: number;
    bankCapacity?: number;
    buffLevel?: number;
  };
  joinType: GuildJoinType;
}

export interface Guild {
  id: string;
  name: string;
  description?: string;
  icon: string;
  level: number;
  experience: number;
  experienceToNext: number;
  gold: number; // Guild Bank
  maxMembers: number;
  leaderId: string;
  leaderNickname?: string;
  settings: GuildSettings;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuildMember {
  id: string;
  nickname: string;
  characterClass: CharacterClass;
  level: number;
  role: GuildRole;
  joinedAt: string;
  contribution?: number; // Total XP/Gold contributed
}

export interface GuildRanking {
  rank: number;
  guildId: string;
  name: string;
  icon: string;
  level: number;
  experience: number;
  memberCount: number;
  leaderNickname: string;
}

// Skill System Types
export interface Skill {
  id: string;
  name: string;
  description: string;
  characterClass: CharacterClass;
  manaCost: number;
  cooldown: number; // em segundos
  effect: {
    type: 'damage' | 'heal' | 'buff' | 'debuff';
    value: number; // Multiplicador ou valor fixo
    target: 'self' | 'enemy';
    duration?: number; // Para buffs/debuffs
  };
  icon: string;
  level: number; // Level mínimo necessário
}

export interface PlayerSkill {
  skillId: string;
  level: number;
  lastUsed?: number; // Timestamp do último uso para cooldown
}

// Market System Types
export interface MarketItem {
  id: string;
  sellerId: string;
  sellerNickname: string;
  item: Item;
  amount: number; // Quantidade de itens à venda
  price: number; // Price per unit in gold (ou total, dependendo da implementação)
  priceDiamonds?: number; // Optional price per unit in diamonds
  currencyType: 'gold' | 'diamonds'; // Which currency is being used
  createdAt: string;
  expiresAt?: string; // Optional expiration date
  isSold: boolean;
  buyerId?: string;
}