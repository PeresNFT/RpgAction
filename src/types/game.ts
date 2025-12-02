export type CharacterClass = 'warrior' | 'archer' | 'mage';

export interface Attributes {
  strength: number;    // Força - Dano físico, carregar peso
  magic: number;       // Magia - Dano mágico, mana
  dexterity: number;   // Destreza - Precisão, crítico
  agility: number;     // Agilidade - Velocidade, esquiva
  vitality: number;    // Vitalidade - HP, resistência
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
  criticalChance: number;
  dodgeChance: number;
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
  attributes?: Attributes;
  stats?: {
    maxHealth: number;
    maxMana: number;
    attack: number;
    defense: number;
    criticalChance: number;
    dodgeChance: number;
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
}

export interface PvPSearchResult {
  playerId: string;
  nickname: string;
  characterClass: CharacterClass;
  level: number;
  honorPoints: number;
  estimatedWaitTime: number; // em segundos
}
