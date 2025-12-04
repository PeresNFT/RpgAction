import { CharacterClass, Item, Monster } from '@/types/game';

export const CHARACTER_CLASSES = {
  warrior: {
    name: 'Guerreiro',
    description: 'Especialista em combate corpo a corpo. Alta resistência e dano físico.',
    focus: 'STR / VIT',
    baseStats: {
      strength: 15,
      magic: 5,
      dexterity: 8,
      agility: 7,
      vitality: 15,
    },
    baseHealthPerLevel: 15, // HP base por nível para Guerreiro
    icon: '⚔️',
    color: 'from-red-600 to-red-800'
  },
  archer: {
    name: 'Arqueiro',
    description: 'Especialista em combate à distância. Alta precisão e velocidade.',
    focus: 'DEX / AGI',
    baseStats: {
      strength: 8,
      magic: 5,
      dexterity: 15,
      agility: 15,
      vitality: 7,
    },
    baseHealthPerLevel: 10, // HP base por nível para Arqueiro
    icon: '🏹',
    color: 'from-green-600 to-green-800'
  },
  mage: {
    name: 'Mago',
    description: 'Especialista em magias poderosas. Alto dano mágico e mana.',
    focus: 'MAG ++',
    baseStats: {
      strength: 5,
      magic: 20,
      dexterity: 8,
      agility: 7,
      vitality: 10,
    },
    baseHealthPerLevel: 8, // HP base por nível para Mago
    icon: '🔮',
    color: 'from-purple-600 to-purple-800'
  }
} as const;

export const ITEMS: Item[] = [
  // Weapons
  {
    id: 'sword_basic',
    name: 'Espada Básica',
    description: 'Uma espada simples mas eficaz.',
    type: 'weapon',
    rarity: 'common',
    level: 1,
    stats: { strength: 3 },
    value: 50,
    icon: '⚔️'
  },
  {
    id: 'bow_basic',
    name: 'Arco Básico',
    description: 'Um arco simples para caça.',
    type: 'weapon',
    rarity: 'common',
    level: 1,
    stats: { dexterity: 3 },
    value: 50,
    icon: '🏹'
  },
  {
    id: 'staff_basic',
    name: 'Cajado Básico',
    description: 'Um cajado para canalizar magias.',
    type: 'weapon',
    rarity: 'common',
    level: 1,
    stats: { magic: 3 },
    value: 50,
    icon: '🔮'
  },
  // Armor
  {
    id: 'leather_armor',
    name: 'Armadura de Couro',
    description: 'Armadura leve de couro.',
    type: 'armor',
    rarity: 'common',
    level: 1,
    stats: { vitality: 2, agility: 1 },
    value: 30,
    icon: '🛡️'
  },
  // Consumables
  {
    id: 'health_potion',
    name: 'Poção de Vida',
    description: 'Restaura 50 pontos de vida.',
    type: 'consumable',
    rarity: 'common',
    level: 1,
    value: 25,
    icon: '❤️',
    healAmount: 50
  },
  {
    id: 'mana_potion',
    name: 'Poção de Mana',
    description: 'Restaura 30 pontos de mana.',
    type: 'consumable',
    rarity: 'common',
    level: 1,
    value: 20,
    icon: '🔵',
    manaAmount: 30
  },
  // Materials
  {
    id: 'herb',
    name: 'Erva Medicinal',
    description: 'Erva usada para fazer poções.',
    type: 'material',
    rarity: 'common',
    level: 1,
    value: 5,
    icon: '🌿'
  },
  {
    id: 'iron_ore',
    name: 'Minério de Ferro',
    description: 'Minério usado para forjar armas.',
    type: 'material',
    rarity: 'common',
    level: 1,
    value: 10,
    icon: '⛏️'
  }
];

// Game formulas (must be defined before monster generation)
export const GAME_FORMULAS = {
  // Experience needed for next level
  experienceToNext: (level: number) => level * 500,
  
  // Health calculation (includes base health per class)
  maxHealth: (vitality: number, level: number, characterClass?: CharacterClass) => {
    const baseHealth = 50 + (vitality * 5);
    const levelHealth = level * 10;
    
    // Adicionar HP base por classe se especificado
    if (characterClass && CHARACTER_CLASSES[characterClass]) {
      const classBaseHealth = CHARACTER_CLASSES[characterClass].baseHealthPerLevel * level;
      return baseHealth + levelHealth + classBaseHealth;
    }
    
    return baseHealth + levelHealth;
  },
  
  // Mana calculation
  maxMana: (magic: number, level: number) => 30 + (magic * 3) + (level * 5),
  
  // Attack calculation
  attack: (strength: number, magic: number, level: number) => 
    Math.floor((strength * 2) + (magic * 1.5) + (level * 3)),
  
  // Defense calculation
  defense: (vitality: number, level: number) => 
    Math.floor((vitality * 1.5) + (level * 2)),
  
  // Critical chance
  criticalChance: (dexterity: number) => Math.min(dexterity * 0.5, 25),
  
  // Dodge chance
  dodgeChance: (agility: number) => Math.min(agility * 0.4, 20)
};

// Creative monster names for each level
const MONSTER_NAMES = [
  'Goblin Raivoso',
  'Lobo Enfurecido', 
  'Orc Esmagador',
  'Sombra do Caos',
  'Olho da Verdade',
  'Demônio Sussurrante',
  'Dragão de Cristal',
  'Fênix Imortal',
  'Titã de Pedra',
  'Vampiro Ancestral',
  'Lich Sombrio',
  'Kraken Abissal',
  'Gigante de Gelo',
  'Elemental de Fogo',
  'Necromante Maldito',
  'Sereia Traiçoeira',
  'Minotauro Lendário',
  'Hidra de Nove Cabeças',
  'Anjo Caído',
  'Deus Antigo',
  'Criatura do Vazio',
  'Senhor da Guerra'
];

// Monster generation function
function generateMonster(level: number, monsterClass: 'warrior' | 'archer' | 'mage', monsterName: string): Monster {
  const baseStats = CHARACTER_CLASSES[monsterClass].baseStats;
  
  // Calculate attributes based on level and class
  const attributes = {
    strength: Math.floor(baseStats.strength + (level * 0.8)),
    magic: Math.floor(baseStats.magic + (level * 0.8)),
    dexterity: Math.floor(baseStats.dexterity + (level * 0.8)),
    agility: Math.floor(baseStats.agility + (level * 0.8)),
    vitality: Math.floor(baseStats.vitality + (level * 0.8))
  };

  // Calculate stats using the same formulas as players
  const maxHealth = GAME_FORMULAS.maxHealth(attributes.vitality, level, monsterClass);
  const maxMana = GAME_FORMULAS.maxMana(attributes.magic, level);
  const attack = GAME_FORMULAS.attack(attributes.strength, attributes.magic, level);
  const defense = GAME_FORMULAS.defense(attributes.vitality, level);
  const criticalChance = GAME_FORMULAS.criticalChance(attributes.dexterity);
  const dodgeChance = GAME_FORMULAS.dodgeChance(attributes.agility);

  // Experience and gold scaling
  const baseExperience = Math.floor(level * 25 + (level * level * 0.5));
  const baseGold = Math.floor(level * 15 + (level * level * 0.3));

  // Calculate penalty for fighting weak monsters
  const calculatePenalty = (monsterLevel: number, playerLevel: number) => {
    const levelDifference = playerLevel - monsterLevel;
    if (levelDifference <= 0) return 1.0; // No penalty if monster is same level or higher
    
    const penaltyTiers = Math.floor(levelDifference / 10);
    const penaltyPercentage = penaltyTiers * 10; // 10% penalty per 10 levels
    
    return Math.max(0, 1 - (penaltyPercentage / 100)); // Minimum 0% reward
  };

  // Apply penalty (this will be calculated when the monster is fought)
  const experience = baseExperience;
  const gold = baseGold;

  // Generate drops based on level and class
  const drops = generateMonsterDrops(level, monsterClass);

  // Generate image path based on monster name
  // Example: "Goblin Raivoso" -> "goblin.png"
  const monsterNameLower = monsterName.toLowerCase();
  let imageName = 'default';
  
  // Map monster names to image file names
  if (monsterNameLower.includes('goblin')) imageName = 'goblin';
  else if (monsterNameLower.includes('lobo')) imageName = 'wolf';
  else if (monsterNameLower.includes('orc')) imageName = 'orc';
  else if (monsterNameLower.includes('sombra')) imageName = 'shadow';
  else if (monsterNameLower.includes('olho')) imageName = 'eye';
  else if (monsterNameLower.includes('demônio') || monsterNameLower.includes('demonio')) imageName = 'demon';
  else if (monsterNameLower.includes('dragão') || monsterNameLower.includes('dragao')) imageName = 'dragon';
  else if (monsterNameLower.includes('fênix') || monsterNameLower.includes('fenix')) imageName = 'phoenix';
  else if (monsterNameLower.includes('titã') || monsterNameLower.includes('tita')) imageName = 'titan';
  else if (monsterNameLower.includes('vampiro')) imageName = 'vampire';
  else if (monsterNameLower.includes('lich')) imageName = 'lich';
  else if (monsterNameLower.includes('kraken')) imageName = 'kraken';
  else if (monsterNameLower.includes('gigante')) imageName = 'giant';
  else if (monsterNameLower.includes('elemental')) imageName = 'elemental';
  else if (monsterNameLower.includes('necromante')) imageName = 'necromancer';
  else if (monsterNameLower.includes('sereia')) imageName = 'mermaid';
  else if (monsterNameLower.includes('minotauro')) imageName = 'minotaur';
  else if (monsterNameLower.includes('hidra')) imageName = 'hydra';
  else if (monsterNameLower.includes('anjo')) imageName = 'fallen_angel';
  else if (monsterNameLower.includes('deus')) imageName = 'ancient_god';
  else if (monsterNameLower.includes('criatura') || monsterNameLower.includes('vazio')) imageName = 'void_creature';
  else if (monsterNameLower.includes('senhor') || monsterNameLower.includes('guerra')) imageName = 'war_lord';

  return {
    id: `${monsterName.toLowerCase().replace(/\s+/g, '_')}_${level}`,
    name: `${monsterName} Nível ${level}`,
    level,
    health: maxHealth,
    maxHealth,
    attack,
    defense,
    experience,
    gold,
    drops,
    icon: CHARACTER_CLASSES[monsterClass].icon,
    imagePath: `/images/monsters/${imageName}.png`,
    attributes,
    stats: {
      maxHealth,
      maxMana,
      attack,
      defense,
      criticalChance,
      dodgeChance
    }
  };
}

// Generate drops based on monster level and class
function generateMonsterDrops(level: number, monsterClass: 'warrior' | 'archer' | 'mage'): Array<{itemId: string, chance: number}> {
  const drops: Array<{itemId: string, chance: number}> = [];
  
  // Base drops for all monsters
  if (level >= 1) {
    drops.push({ itemId: 'herb', chance: 0.3 });
    drops.push({ itemId: 'health_potion', chance: 0.2 });
  }
  
  if (level >= 5) {
    drops.push({ itemId: 'iron_ore', chance: 0.4 });
    drops.push({ itemId: 'mana_potion', chance: 0.15 });
  }
  
  if (level >= 10) {
    drops.push({ itemId: 'leather_armor', chance: 0.1 });
  }
  
  // Class-specific drops
  if (monsterClass === 'warrior') {
    if (level >= 15) drops.push({ itemId: 'sword_basic', chance: 0.05 });
  } else if (monsterClass === 'archer') {
    if (level >= 15) drops.push({ itemId: 'bow_basic', chance: 0.05 });
  } else if (monsterClass === 'mage') {
    if (level >= 15) drops.push({ itemId: 'staff_basic', chance: 0.05 });
  }
  
  return drops;
}

// Monster levels to generate
const MONSTER_LEVELS = [1, 3, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 1000];

// Class rotation for variety (warrior, archer, mage, repeat...)
const CLASS_ROTATION: ('warrior' | 'archer' | 'mage')[] = ['warrior', 'archer', 'mage'];

// Generate all monsters with alternating classes and creative names
export const MONSTERS: Monster[] = MONSTER_LEVELS.map((level, index) => {
  const monsterClass = CLASS_ROTATION[index % CLASS_ROTATION.length];
  const monsterName = MONSTER_NAMES[index % MONSTER_NAMES.length];
  return generateMonster(level, monsterClass, monsterName);
});

// Function to generate a new monster of the same level with random class and name
export function generateNewMonsterOfSameLevel(level: number): Monster {
  // Randomly select a class
  const monsterClass = CLASS_ROTATION[Math.floor(Math.random() * CLASS_ROTATION.length)];
  
  // Randomly select a name
  const monsterName = MONSTER_NAMES[Math.floor(Math.random() * MONSTER_NAMES.length)];
  
  const monster = generateMonster(level, monsterClass, monsterName);
  return monster;
}

// Function to calculate penalty for fighting weak monsters
export function calculateLevelPenalty(monsterLevel: number, playerLevel: number) {
  const levelDifference = playerLevel - monsterLevel;
  if (levelDifference <= 0) return 1.0; // No penalty if monster is same level or higher
  
  const penaltyTiers = Math.floor(levelDifference / 10);
  const penaltyPercentage = penaltyTiers * 10; // 10% penalty per 10 levels
  
  return Math.max(0, 1 - (penaltyPercentage / 100)); // Minimum 0% reward
}

// Function to apply penalty to experience and gold rewards
export function applyLevelPenalty(baseExperience: number, baseGold: number, monsterLevel: number, playerLevel: number) {
  const penaltyMultiplier = calculateLevelPenalty(monsterLevel, playerLevel);
  
  return {
    experience: Math.floor(baseExperience * penaltyMultiplier),
    gold: Math.floor(baseGold * penaltyMultiplier),
    penaltyPercentage: Math.floor((1 - penaltyMultiplier) * 100)
  };
}

export const COLLECTION_SKILLS = [
  {
    type: 'mining' as const,
    name: 'Mineração',
    icon: '⛏️',
    description: 'Extrair minérios e pedras preciosas',
    color: 'from-gray-600 to-gray-800'
  },
  {
    type: 'woodcutting' as const,
    name: 'Lenhador',
    icon: '🪓',
    description: 'Cortar madeiras e árvores',
    color: 'from-green-600 to-green-800'
  },
  {
    type: 'farming' as const,
    name: 'Agricultura',
    icon: '🌾',
    description: 'Cultivar plantas e ervas',
    color: 'from-yellow-600 to-yellow-800'
  },
  {
    type: 'fishing' as const,
    name: 'Pesca',
    icon: '🎣',
    description: 'Pescar peixes e tesouros',
    color: 'from-blue-600 to-blue-800'
  }
];

export const COLLECTION_RESOURCES = {
  mining: [
    {
      id: 'iron_ore',
      name: 'Minério de Ferro',
      icon: '⛏️',
      level: 1,
      experience: 10,
      baseAmount: 1,
      maxAmount: 3
    },
    {
      id: 'copper_ore',
      name: 'Minério de Cobre',
      icon: '🟠',
      level: 5,
      experience: 25,
      baseAmount: 1,
      maxAmount: 4
    },
    {
      id: 'gold_ore',
      name: 'Minério de Ouro',
      icon: '🟡',
      level: 10,
      experience: 50,
      baseAmount: 1,
      maxAmount: 2
    }
  ],
  woodcutting: [
    {
      id: 'wood',
      name: 'Madeira',
      icon: '🪵',
      level: 1,
      experience: 8,
      baseAmount: 2,
      maxAmount: 8
    },
    {
      id: 'oak_wood',
      name: 'Madeira de Carvalho',
      icon: '🌳',
      level: 5,
      experience: 20,
      baseAmount: 1,
      maxAmount: 5
    },
    {
      id: 'pine_wood',
      name: 'Madeira de Pinho',
      icon: '🌲',
      level: 8,
      experience: 35,
      baseAmount: 1,
      maxAmount: 4
    }
  ],
  farming: [
    {
      id: 'herb',
      name: 'Erva Medicinal',
      icon: '🌿',
      level: 1,
      experience: 5,
      baseAmount: 1,
      maxAmount: 5
    },
    {
      id: 'wheat',
      name: 'Trigo',
      icon: '🌾',
      level: 3,
      experience: 15,
      baseAmount: 2,
      maxAmount: 8
    },
    {
      id: 'corn',
      name: 'Milho',
      icon: '🌽',
      level: 6,
      experience: 25,
      baseAmount: 1,
      maxAmount: 6
    }
  ],
  fishing: [
    {
      id: 'fish',
      name: 'Peixe',
      icon: '🐟',
      level: 1,
      experience: 12,
      baseAmount: 1,
      maxAmount: 4
    },
    {
      id: 'salmon',
      name: 'Salmão',
      icon: '🐠',
      level: 5,
      experience: 30,
      baseAmount: 1,
      maxAmount: 3
    },
    {
      id: 'tuna',
      name: 'Atum',
      icon: '🐡',
      level: 10,
      experience: 60,
      baseAmount: 1,
      maxAmount: 2
    }
  ]
};

// PvP System Constants
export const PVP_RANKS = {
  BRONZE: { name: 'Bronze', minPoints: 0, icon: '🥉' },
  SILVER: { name: 'Prata', minPoints: 100, icon: '🥈' },
  GOLD: { name: 'Ouro', minPoints: 300, icon: '🥇' },
  PLATINUM: { name: 'Platina', minPoints: 600, icon: '💎' },
  DIAMOND: { name: 'Diamante', minPoints: 1000, icon: '💠' },
  MASTER: { name: 'Mestre', minPoints: 1500, icon: '👑' },
  GRANDMASTER: { name: 'Grão-Mestre', minPoints: 2500, icon: '🏆' }
};

export const PVP_HONOR_POINTS = {
  WIN_BASE: 25,
  WIN_STREAK_BONUS: 5, // Bonus por sequência de vitórias
  LOSS_BASE: -15,
  LOSS_STREAK_PENALTY: -5, // Penalidade por sequência de derrotas
  UNDERDOG_BONUS: 10, // Bonus para jogador com menos pontos
  FAVORITE_PENALTY: -5 // Penalidade para jogador com mais pontos
};

export const PVP_BATTLE_SETTINGS = {
  MAX_WAIT_TIME: 30, // segundos para encontrar oponente
  BATTLE_DURATION: 60, // segundos máximo por batalha
  MIN_LEVEL_DIFFERENCE: 5, // diferença máxima de nível para matchmaking
  MIN_HONOR_DIFFERENCE: 100 // diferença máxima de pontos para matchmaking
};

// PvP Battle Functions
export function calculatePvPBattle(player1: any, player2: any): { winner: string; battleLog: string[] } {
  const battleLog: string[] = [];
  let p1Health = player1.stats.health;
  let p2Health = player2.stats.health;
  
  battleLog.push(`⚔️ ${player1.nickname} vs ${player2.nickname}`);
  battleLog.push(`🎯 Batalha iniciada!`);
  
  let round = 1;
  const maxRounds = 20; // Evita batalhas infinitas
  
  while (p1Health > 0 && p2Health > 0 && round <= maxRounds) {
    battleLog.push(`\n🔄 Rodada ${round}:`);
    
    // Player 1 attacks Player 2
    const p1Attack = player1.stats.attack;
    const p1Critical = Math.random() * 100 < player1.stats.criticalChance;
    const p2Dodge = Math.random() * 100 < player2.stats.dodgeChance;
    
    if (p2Dodge) {
      battleLog.push(`⚡ ${player2.nickname} esquivou o ataque de ${player1.nickname}!`);
    } else {
      const p1Damage = Math.max(1, p1Attack - player2.stats.defense);
      const finalP1Damage = p1Critical ? Math.floor(p1Damage * 1.5) : p1Damage;
      
      p2Health = Math.max(0, p2Health - finalP1Damage);
      
      if (p1Critical) {
        battleLog.push(`🎯 CRÍTICO! ${player1.nickname} causou ${finalP1Damage} de dano!`);
      } else {
        battleLog.push(`⚔️ ${player1.nickname} causou ${finalP1Damage} de dano!`);
      }
      
      if (p2Health <= 0) {
        battleLog.push(`💀 ${player2.nickname} foi derrotado!`);
        break;
      }
    }
    
    // Player 2 attacks Player 1
    const p2Attack = player2.stats.attack;
    const p2Critical = Math.random() * 100 < player2.stats.criticalChance;
    const p1Dodge = Math.random() * 100 < player1.stats.dodgeChance;
    
    if (p1Dodge) {
      battleLog.push(`⚡ ${player1.nickname} esquivou o ataque de ${player2.nickname}!`);
    } else {
      const p2Damage = Math.max(1, p2Attack - player1.stats.defense);
      const finalP2Damage = p2Critical ? Math.floor(p2Damage * 1.5) : p2Damage;
      
      p1Health = Math.max(0, p1Health - finalP2Damage);
      
      if (p2Critical) {
        battleLog.push(`🎯 CRÍTICO! ${player2.nickname} causou ${finalP2Damage} de dano!`);
      } else {
        battleLog.push(`⚔️ ${player2.nickname} causou ${finalP2Damage} de dano!`);
      }
      
      if (p1Health <= 0) {
        battleLog.push(`💀 ${player1.nickname} foi derrotado!`);
        break;
      }
    }
    
    round++;
  }
  
  // Determine winner
  let winner: string;
  if (p1Health > 0 && p2Health <= 0) {
    winner = player1.id;
    battleLog.push(`\n🏆 ${player1.nickname} venceu a batalha!`);
  } else if (p2Health > 0 && p1Health <= 0) {
    winner = player2.id;
    battleLog.push(`\n🏆 ${player2.nickname} venceu a batalha!`);
  } else {
    // Tie - player with more health wins
    winner = p1Health >= p2Health ? player1.id : player2.id;
    battleLog.push(`\n🤝 Empate! ${winner === player1.id ? player1.nickname : player2.nickname} vence por ter mais vida!`);
  }
  
  return { winner, battleLog };
}

export function calculateHonorPoints(winner: any, loser: any, winnerStats: any, loserStats: any): { winnerPoints: number; loserPoints: number } {
  const baseWinPoints = PVP_HONOR_POINTS.WIN_BASE;
  const baseLossPoints = PVP_HONOR_POINTS.LOSS_BASE;
  
  // Win streak bonus
  const winStreakBonus = Math.min(winnerStats.winStreak * PVP_HONOR_POINTS.WIN_STREAK_BONUS, 50);
  
  // Loss streak penalty
  const lossStreakPenalty = Math.min(loserStats.winStreak * PVP_HONOR_POINTS.LOSS_STREAK_PENALTY, -30);
  
  // Underdog bonus (if winner has fewer honor points)
  const honorDifference = loserStats.honorPoints - winnerStats.honorPoints;
  const underdogBonus = honorDifference > 0 ? Math.min(honorDifference / 10, PVP_HONOR_POINTS.UNDERDOG_BONUS) : 0;
  
  // Favorite penalty (if loser has more honor points)
  const favoritePenalty = honorDifference < 0 ? Math.min(Math.abs(honorDifference) / 10, PVP_HONOR_POINTS.FAVORITE_PENALTY) : 0;
  
  const winnerPoints = baseWinPoints + winStreakBonus + underdogBonus;
  const loserPoints = baseLossPoints + lossStreakPenalty + favoritePenalty;
  
  return {
    winnerPoints: Math.max(winnerPoints, 1), // Minimum 1 point for winning
    loserPoints: Math.min(loserPoints, -1) // Minimum -1 point for losing
  };
}

export function getRankFromPoints(honorPoints: number): string {
  if (honorPoints >= PVP_RANKS.GRANDMASTER.minPoints) return PVP_RANKS.GRANDMASTER.name;
  if (honorPoints >= PVP_RANKS.MASTER.minPoints) return PVP_RANKS.MASTER.name;
  if (honorPoints >= PVP_RANKS.DIAMOND.minPoints) return PVP_RANKS.DIAMOND.name;
  if (honorPoints >= PVP_RANKS.PLATINUM.minPoints) return PVP_RANKS.PLATINUM.name;
  if (honorPoints >= PVP_RANKS.GOLD.minPoints) return PVP_RANKS.GOLD.name;
  if (honorPoints >= PVP_RANKS.SILVER.minPoints) return PVP_RANKS.SILVER.name;
  return PVP_RANKS.BRONZE.name;
}

export function getRankIcon(rank: string): string {
  switch (rank) {
    case PVP_RANKS.BRONZE.name: return PVP_RANKS.BRONZE.icon;
    case PVP_RANKS.SILVER.name: return PVP_RANKS.SILVER.icon;
    case PVP_RANKS.GOLD.name: return PVP_RANKS.GOLD.icon;
    case PVP_RANKS.PLATINUM.name: return PVP_RANKS.PLATINUM.icon;
    case PVP_RANKS.DIAMOND.name: return PVP_RANKS.DIAMOND.icon;
    case PVP_RANKS.MASTER.name: return PVP_RANKS.MASTER.icon;
    case PVP_RANKS.GRANDMASTER.name: return PVP_RANKS.GRANDMASTER.icon;
    default: return PVP_RANKS.BRONZE.icon;
  }
}


