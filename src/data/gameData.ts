import { CharacterClass, Item, Monster, Skill } from '@/types/game';

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
      luck: 5,
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
      luck: 7,
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
      luck: 10,
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
    stats: { agility: 1 },
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
    healAmount: 50,
    imagePath: '/images/items/health_potion.png'
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
    manaAmount: 30,
    imagePath: '/images/items/mana_potion.png'
  },
  // Materials (Collection resources worth 1 gold for selling - intended for crafting)
  {
    id: 'herb',
    name: 'Erva Medicinal',
    description: 'Erva usada para fazer poções.',
    type: 'material',
    rarity: 'common',
    level: 1,
    value: 1,
    icon: '🌿'
  },
  {
    id: 'iron_ore',
    name: 'Minério de Ferro',
    description: 'Minério usado para forjar armas.',
    type: 'material',
    rarity: 'common',
    level: 1,
    value: 1,
    icon: '⛏️'
  },
  // Collection Resources - Woodcutting (All worth 1 gold for selling - intended for crafting)
  {
    id: 'wood',
    name: 'Madeira',
    description: 'Madeira coletada de árvores.',
    type: 'material',
    rarity: 'common',
    level: 1,
    value: 1,
    icon: '🪵'
  },
  {
    id: 'oak_wood',
    name: 'Madeira de Carvalho',
    description: 'Madeira de carvalho de alta qualidade.',
    type: 'material',
    rarity: 'uncommon',
    level: 5,
    value: 1,
    icon: '🌳'
  },
  {
    id: 'pine_wood',
    name: 'Madeira de Pinho',
    description: 'Madeira de pinho resistente.',
    type: 'material',
    rarity: 'uncommon',
    level: 8,
    value: 1,
    icon: '🌲'
  },
  // Collection Resources - Fishing (All worth 1 gold for selling - intended for crafting)
  {
    id: 'fish',
    name: 'Peixe',
    description: 'Peixe fresco pescado.',
    type: 'material',
    rarity: 'common',
    level: 1,
    value: 1,
    icon: '🐟'
  },
  {
    id: 'salmon',
    name: 'Salmão',
    description: 'Salmão de alta qualidade.',
    type: 'material',
    rarity: 'uncommon',
    level: 5,
    value: 1,
    icon: '🐠'
  },
  {
    id: 'tuna',
    name: 'Atum',
    description: 'Atum grande e nutritivo.',
    type: 'material',
    rarity: 'rare',
    level: 10,
    value: 1,
    icon: '🐡'
  },
  // Collection Resources - Mining (All worth 1 gold for selling - intended for crafting)
  {
    id: 'copper_ore',
    name: 'Minério de Cobre',
    description: 'Minério de cobre útil para forja.',
    type: 'material',
    rarity: 'common',
    level: 5,
    value: 1,
    icon: '🟠'
  },
  {
    id: 'gold_ore',
    name: 'Minério de Ouro',
    description: 'Minério de ouro valioso.',
    type: 'material',
    rarity: 'rare',
    level: 10,
    value: 1,
    icon: '🟡'
  },
  // Collection Resources - Farming (All worth 1 gold for selling - intended for crafting)
  {
    id: 'wheat',
    name: 'Trigo',
    description: 'Trigo cultivado.',
    type: 'material',
    rarity: 'common',
    level: 3,
    value: 1,
    icon: '🌾'
  },
  {
    id: 'corn',
    name: 'Milho',
    description: 'Milho cultivado.',
    type: 'material',
    rarity: 'common',
    level: 6,
    value: 1,
    icon: '🌽'
  }
];

// Game formulas (must be defined before monster generation)
// Escaláveis para valores infinitos (5000+ atributos)
export const GAME_FORMULAS = {
  // Experience needed for next level
  experienceToNext: (level: number) => level * 500,
  
  // Health calculation - STR based (includes base health per class)
  maxHealth: (strength: number, level: number, characterClass?: CharacterClass) => {
    const baseHealth = 50 + (strength * 5);
    const levelHealth = level * 10;
    
    // Adicionar HP base por classe se especificado
    if (characterClass && CHARACTER_CLASSES[characterClass]) {
      const classBaseHealth = CHARACTER_CLASSES[characterClass].baseHealthPerLevel * level;
      return baseHealth + levelHealth + classBaseHealth;
    }
    
    return baseHealth + levelHealth;
  },
  
  // Mana calculation - MAG based
  maxMana: (magic: number, level: number) => 30 + (magic * 3) + (level * 5),
  
  // Attack calculation - Class based (STR/MAG/DEX)
  attack: (strength: number, magic: number, dexterity: number, level: number, characterClass?: CharacterClass) => {
    const baseAttack = level * 3;
    if (characterClass === 'warrior') {
      return Math.floor((strength * 2) + baseAttack);
    } else if (characterClass === 'mage') {
      return Math.floor((magic * 2.5) + baseAttack);
    } else if (characterClass === 'archer') {
      return Math.floor((dexterity * 2) + baseAttack);
    }
    // Fallback: média dos atributos
    return Math.floor(((strength * 2) + (magic * 1.5) + (dexterity * 1.5)) / 3 + baseAttack);
  },
  
  // Defense calculation - Level based + STR bonus for warrior
  defense: (strength: number, level: number, characterClass?: CharacterClass) => {
    const baseDefense = level * 2;
    if (characterClass === 'warrior') {
      return Math.floor(baseDefense + (strength * 0.5));
    }
    return baseDefense;
  },
  
  // Accuracy calculation - DEX based (escalável)
  accuracy: (dexterity: number) => {
    // Base 80%, bonus até 15% (máximo 95%)
    const bonus = Math.min(15, dexterity * 0.003); // 0.3% por 100 DEX
    return 80 + bonus;
  },
  
  // Dodge chance - AGI based (escalável)
  dodgeChance: (agility: number) => {
    // Máximo 40% de esquiva
    return Math.min(40, agility * 0.01); // 1% por 100 AGI
  },
  
  // Critical chance - LUK based (escalável)
  criticalChance: (luck: number) => {
    // Máximo 50% de crítico
    return Math.min(50, luck * 0.3); // 0.3% por ponto de LUK
  },
  
  // Critical resist - LUK based
  criticalResist: (luck: number) => {
    // Reduz crítico recebido
    return luck * 0.2; // 0.2% redução por ponto de LUK
  },
  
  // Calculate accuracy vs dodge (for hit chance)
  calculateHitChance: (attackerDEX: number, defenderAGI: number) => {
    const baseAccuracy = 80; // Base 80%
    const attackerAccuracy = GAME_FORMULAS.accuracy(attackerDEX);
    const defenderDodge = GAME_FORMULAS.dodgeChance(defenderAGI);
    
    // Fórmula proporcional escalável
    const difference = attackerDEX - defenderAGI;
    const sum = attackerDEX + defenderAGI;
    const bonus = sum > 0 ? (difference / sum) * 15 : 0;
    
    const hitChance = baseAccuracy + bonus;
    return Math.min(95, Math.max(80, hitChance)); // Entre 80% e 95%
  },
  
  // Calculate damage with proportional defense
  calculateDamage: (attack: number, defense: number) => {
    // Defesa reduz % do dano (não subtrai valor fixo)
    const defenseReduction = (defense / (defense + 100)) * 100;
    const damage = attack * (1 - defenseReduction / 100);
    const minDamage = attack * 0.10; // Mínimo 10% do ataque
    return Math.max(minDamage, damage);
  },
  
  // Calculate final critical chance (considering resist)
  calculateFinalCritical: (attackerLUK: number, defenderLUK: number) => {
    const baseCrit = GAME_FORMULAS.criticalChance(attackerLUK);
    const critResist = GAME_FORMULAS.criticalResist(defenderLUK);
    const finalCrit = Math.max(0, baseCrit - critResist);
    return Math.min(50, finalCrit); // Máximo 50%
  }
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
  
  // Calculate attributes based on level and class (novo sistema)
  const attributes = {
    strength: Math.floor(baseStats.strength + (level * 0.8)),
    magic: Math.floor(baseStats.magic + (level * 0.8)),
    dexterity: Math.floor(baseStats.dexterity + (level * 0.8)),
    agility: Math.floor(baseStats.agility + (level * 0.8)),
    luck: Math.floor((baseStats.luck || 5) + (level * 0.8))
  };

  // Calculate stats using the new formulas
  const maxHealth = GAME_FORMULAS.maxHealth(attributes.strength, level, monsterClass);
  const maxMana = GAME_FORMULAS.maxMana(attributes.magic, level);
  const attack = GAME_FORMULAS.attack(attributes.strength, attributes.magic, attributes.dexterity, level, monsterClass);
  const defense = GAME_FORMULAS.defense(attributes.strength, level, monsterClass);
  const accuracy = GAME_FORMULAS.accuracy(attributes.dexterity);
  const dodgeChance = GAME_FORMULAS.dodgeChance(attributes.agility);
  const criticalChance = GAME_FORMULAS.criticalChance(attributes.luck);
  const criticalResist = GAME_FORMULAS.criticalResist(attributes.luck);

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
    name: monsterName,
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
      accuracy,
      dodgeChance,
      criticalChance,
      criticalResist
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
    color: 'from-gray-600 to-gray-800',
    imagePath: '/images/collection/Mineracao.png'
  },
  {
    type: 'woodcutting' as const,
    name: 'Lenhador',
    icon: '🪓',
    description: 'Cortar madeiras e árvores',
    color: 'from-green-600 to-green-800',
    imagePath: '/images/collection/Lenhador.png'
  },
  {
    type: 'farming' as const,
    name: 'Agricultura',
    icon: '🌾',
    description: 'Cultivar plantas e ervas',
    color: 'from-yellow-600 to-yellow-800',
    imagePath: '/images/collection/Agricultura.png'
  },
  {
    type: 'fishing' as const,
    name: 'Pesca',
    icon: '🎣',
    description: 'Pescar peixes e tesouros',
    color: 'from-blue-600 to-blue-800',
    imagePath: '/images/collection/Pesca.png'
  }
];

/**
 * Obtém o caminho da imagem do ícone de guild
 * @param icon - Nome do ícone (guild1, guild2, ..., guild20) ou emoji como fallback
 * @returns Caminho da imagem ou null se não for um ícone válido
 */
export function getGuildIconImagePath(icon: string): string | null {
  // Verifica se é um ícone numérico (guild1 a guild20)
  const match = icon.match(/^guild(\d+)$/i);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 20) {
      return `/images/guild/guild${num}.png`;
    }
  }
  return null;
}

/**
 * Lista de ícones de guild disponíveis (guild1 a guild20)
 */
export const GUILD_ICONS = Array.from({ length: 20 }, (_, i) => ({
  id: `guild${i + 1}`,
  name: `Guild ${i + 1}`,
  imagePath: `/images/guild/guild${i + 1}.png`,
  fallbackIcon: '🛡️'
}));

/**
 * Tipos de itens da loja NPC
 */
export type ShopItemType = 'consumable' | 'profile_image';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ShopItemType;
  icon: string;
  priceGold?: number;
  priceDiamonds?: number;
  imagePath?: string; // Para fotos de perfil
  itemId?: string; // ID do item do jogo (para poções)
}

/**
 * Itens disponíveis na loja NPC
 */
export const SHOP_ITEMS: ShopItem[] = [
  // Poções
  {
    id: 'shop_health_potion',
    name: 'Poção de Vida',
    description: 'Restaura 50 pontos de vida instantaneamente.',
    type: 'consumable',
    icon: '❤️',
    priceGold: 50,
    itemId: 'health_potion'
  },
  {
    id: 'shop_mana_potion',
    name: 'Poção de Mana',
    description: 'Restaura 30 pontos de mana instantaneamente.',
    type: 'consumable',
    icon: '🔵',
    priceGold: 40,
    itemId: 'mana_potion'
  },
  // Fotos de perfil (Cash/Diamonds)
  {
    id: 'shop_profile_1',
    name: 'Foto de Perfil 1',
    description: 'Foto de perfil exclusiva #1',
    type: 'profile_image',
    icon: '🖼️',
    priceDiamonds: 1000,
    imagePath: '/images/profile/profile1.png'
  },
  {
    id: 'shop_profile_2',
    name: 'Foto de Perfil 2',
    description: 'Foto de perfil exclusiva #2',
    type: 'profile_image',
    icon: '🖼️',
    priceDiamonds: 1000,
    imagePath: '/images/profile/profile2.png'
  },
  {
    id: 'shop_profile_3',
    name: 'Foto de Perfil 3',
    description: 'Foto de perfil exclusiva #3',
    type: 'profile_image',
    icon: '🖼️',
    priceDiamonds: 1000,
    imagePath: '/images/profile/profile3.png'
  },
  {
    id: 'shop_profile_4',
    name: 'Foto de Perfil 4',
    description: 'Foto de perfil exclusiva #4',
    type: 'profile_image',
    icon: '🖼️',
    priceDiamonds: 1000,
    imagePath: '/images/profile/profile4.png'
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
  IRON: { name: 'Ferro', minPoints: 0, icon: '⚫' },
  BRONZE: { name: 'Bronze', minPoints: 50, icon: '🥉' },
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
    
    // Player 1 attacks Player 2 - Novo sistema
    const p1Attack = player1.stats.attack;
    const p1DEX = player1.attributes?.dexterity || 10;
    const p1LUK = player1.attributes?.luck || 5;
    const p2AGI = player2.attributes?.agility || 10;
    const p2LUK = player2.attributes?.luck || 5;
    
    // Verificar precisão vs esquiva
    const p1HitChance = GAME_FORMULAS.calculateHitChance(p1DEX, p2AGI);
    const p1HitRoll = Math.random() * 100;
    
    if (p1HitRoll > p1HitChance) {
      battleLog.push(`⚡ ${player2.nickname} esquivou o ataque de ${player1.nickname}!`);
    } else {
      // Calcular dano proporcional
      const p1BaseDamage = GAME_FORMULAS.calculateDamage(p1Attack, player2.stats.defense);
      const p1CritChance = GAME_FORMULAS.calculateFinalCritical(p1LUK, p2LUK);
      const p1Critical = Math.random() * 100 < p1CritChance;
      const finalP1Damage = p1Critical ? Math.floor(p1BaseDamage * 1.5) : Math.floor(p1BaseDamage);
      
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
    
    // Player 2 attacks Player 1 - Novo sistema
    const p2Attack = player2.stats.attack;
    const p2DEX = player2.attributes?.dexterity || 10;
    const p2LUK2 = player2.attributes?.luck || 5;
    const p1AGI = player1.attributes?.agility || 10;
    const p1LUK2 = player1.attributes?.luck || 5;
    
    // Verificar precisão vs esquiva
    const p2HitChance = GAME_FORMULAS.calculateHitChance(p2DEX, p1AGI);
    const p2HitRoll = Math.random() * 100;
    
    if (p2HitRoll > p2HitChance) {
      battleLog.push(`⚡ ${player1.nickname} esquivou o ataque de ${player2.nickname}!`);
    } else {
      // Calcular dano proporcional
      const p2BaseDamage = GAME_FORMULAS.calculateDamage(p2Attack, player1.stats.defense);
      const p2CritChance = GAME_FORMULAS.calculateFinalCritical(p2LUK2, p1LUK2);
      const p2Critical = Math.random() * 100 < p2CritChance;
      const finalP2Damage = p2Critical ? Math.floor(p2BaseDamage * 1.5) : Math.floor(p2BaseDamage);
      
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
  if (honorPoints >= PVP_RANKS.BRONZE.minPoints) return PVP_RANKS.BRONZE.name;
  return PVP_RANKS.IRON.name;
}

export function getRankIcon(rank: string): string {
  switch (rank) {
    case PVP_RANKS.IRON.name: return PVP_RANKS.IRON.icon;
    case PVP_RANKS.BRONZE.name: return PVP_RANKS.BRONZE.icon;
    case PVP_RANKS.SILVER.name: return PVP_RANKS.SILVER.icon;
    case PVP_RANKS.GOLD.name: return PVP_RANKS.GOLD.icon;
    case PVP_RANKS.PLATINUM.name: return PVP_RANKS.PLATINUM.icon;
    case PVP_RANKS.DIAMOND.name: return PVP_RANKS.DIAMOND.icon;
    case PVP_RANKS.MASTER.name: return PVP_RANKS.MASTER.icon;
    case PVP_RANKS.GRANDMASTER.name: return PVP_RANKS.GRANDMASTER.icon;
    default: return PVP_RANKS.IRON.icon;
  }
}

// Skill System - 3 skills per class (TODAS começam no nível 1)
export const SKILLS: Skill[] = [
  // Warrior Skills (Ganha de Arqueiro)
  {
    id: 'warrior_damage',
    name: 'Golpe Poderoso',
    description: 'Um golpe devastador que causa dano baseado em sua Força.',
    characterClass: 'warrior',
    manaCost: 20,
    cooldown: 3,
    effect: {
      type: 'damage',
      value: 1.3, // Base 130% do ataque, escala com STR e level da skill
      target: 'enemy'
    },
    icon: '⚔️',
    level: 1 // Nível mínimo 1 (todos começam no lv 1)
  },
  {
    id: 'warrior_defense',
    name: 'Postura Defensiva',
    description: 'Aumenta sua defesa temporariamente.',
    characterClass: 'warrior',
    manaCost: 25,
    cooldown: 5,
    effect: {
      type: 'buff',
      value: 0.3, // +30% defesa
      target: 'self',
      duration: 4
    },
    icon: '🛡️',
    level: 1
  },
  {
    id: 'warrior_heal',
    name: 'Regeneração',
    description: 'Recupera vida baseado em sua Força.',
    characterClass: 'warrior',
    manaCost: 30,
    cooldown: 6,
    effect: {
      type: 'heal',
      value: 0.25, // 25% da vida máxima + bônus de STR
      target: 'self'
    },
    icon: '💚',
    level: 1
  },
  
  // Archer Skills (Ganha de Mago)
  {
    id: 'archer_damage',
    name: 'Flecha Precisão',
    description: 'Flecha precisa que causa mais dano que Guerreiro, menos que Mago.',
    characterClass: 'archer',
    manaCost: 18,
    cooldown: 2,
    effect: {
      type: 'damage',
      value: 1.5, // 150% do ataque, escala com DEX e level da skill
      target: 'enemy'
    },
    icon: '🏹',
    level: 1
  },
  {
    id: 'archer_burst',
    name: 'Rajada de Flechas',
    description: 'Ataque devastador com alto consumo de MP.',
    characterClass: 'archer',
    manaCost: 60,
    cooldown: 8,
    effect: {
      type: 'damage',
      value: 2.5, // 250% do ataque, escala com DEX e level da skill
      target: 'enemy'
    },
    icon: '🎯',
    level: 1
  },
  {
    id: 'archer_buff',
    name: 'Concentração',
    description: 'Aumenta dano e esquiva temporariamente.',
    characterClass: 'archer',
    manaCost: 35,
    cooldown: 7,
    effect: {
      type: 'buff',
      value: 0.25, // +25% dano e esquiva
      target: 'self',
      duration: 5
    },
    icon: '💨',
    level: 1
  },
  
  // Mage Skills (Ganha de Guerreiro)
  {
    id: 'mage_damage',
    name: 'Bola de Fogo',
    description: 'Magia de fogo que causa o maior dano entre as classes.',
    characterClass: 'mage',
    manaCost: 25,
    cooldown: 3,
    effect: {
      type: 'damage',
      value: 1.8, // 180% do ataque, escala com MAG e level da skill
      target: 'enemy'
    },
    icon: '🔥',
    level: 1
  },
  {
    id: 'mage_burn',
    name: 'Chama Ardente',
    description: 'Pode queimar o inimigo por 3 turnos causando dano contínuo.',
    characterClass: 'mage',
    manaCost: 30,
    cooldown: 5,
    effect: {
      type: 'debuff',
      value: 0.1, // 10% do ataque por turno (burn)
      target: 'enemy',
      duration: 3
    },
    icon: '🔥',
    level: 1
  },
  {
    id: 'mage_shield',
    name: 'Escudo Mágico',
    description: 'Reduz dano recebido temporariamente.',
    characterClass: 'mage',
    manaCost: 40,
    cooldown: 8,
    effect: {
      type: 'buff',
      value: 0.35, // -35% dano recebido
      target: 'self',
      duration: 4
    },
    icon: '🛡️',
    level: 1
  }
];

// Helper function to get skills by class
export function getSkillsByClass(characterClass: CharacterClass): Skill[] {
  return SKILLS.filter(skill => skill.characterClass === characterClass);
}

// Helper function to get skill by id
export function getSkillById(skillId: string): Skill | undefined {
  return SKILLS.find(skill => skill.id === skillId);
}

// Skill calculation functions - Escaláveis com nível e atributos
export const SKILL_FORMULAS = {
  // Calculate skill damage based on class attribute and level
  calculateSkillDamage: (
    baseAttack: number,
    skillMultiplier: number,
    attributeValue: number, // STR para guerreiro, MAG para mago, DEX para arqueiro
    level: number,
    skillId: string
  ): number => {
    // Base damage from attack
    const baseDamage = baseAttack * skillMultiplier;
    
    // Bonus from attribute (scales with attribute)
    let attributeBonus = 0;
    if (skillId.includes('warrior')) {
      attributeBonus = attributeValue * 0.5; // STR bonus
    } else if (skillId.includes('mage')) {
      attributeBonus = attributeValue * 0.6; // MAG bonus (mages scale better)
    } else if (skillId.includes('archer')) {
      attributeBonus = attributeValue * 0.4; // DEX bonus
    }
    
    // Level scaling bonus
    const levelBonus = level * 2;
    
    return Math.floor(baseDamage + attributeBonus + levelBonus);
  },
  
  // Calculate skill heal based on max health, STR, and level
  calculateSkillHeal: (
    maxHealth: number,
    basePercentage: number,
    strength: number,
    level: number
  ): number => {
    const baseHeal = maxHealth * basePercentage;
    const strBonus = strength * 1.5;
    const levelBonus = level * 3;
    return Math.floor(baseHeal + strBonus + levelBonus);
  },
  
  // Calculate skill mana cost (scales slightly with level)
  calculateSkillManaCost: (
    baseCost: number,
    level: number,
    scaleFactor: number = 0.5
  ): number => {
    return Math.floor(baseCost + (level * scaleFactor));
  },
  
  // Calculate defense penetration for archer skills
  calculateDefensePenetration: (
    dexterity: number,
    basePenetration: number = 0.3
  ): number => {
    // Max 70% penetration
    const dexBonus = Math.min(0.4, dexterity * 0.0008); // 0.08% per 100 DEX
    return Math.min(0.7, basePenetration + dexBonus);
  },
  
  // Calculate skill upgrade cost
  calculateSkillUpgradeCost: (currentLevel: number): number => {
    if (currentLevel === 1) {
      return 10000; // Lv 2 = 10k gold
    } else if (currentLevel === 2) {
      return 15000; // Lv 3 = 15k gold
    } else {
      // Lv 4+ = +50% do valor anterior
      let cost = 15000;
      for (let i = 3; i < currentLevel; i++) {
        cost = Math.floor(cost * 1.5);
      }
      return Math.floor(cost * 1.5); // Custo para o próximo nível
    }
  },
  
  // Calculate skill effect value based on skill level
  calculateSkillEffectValue: (
    baseValue: number,
    skillLevel: number,
    skillId: string
  ): number => {
    // Cada nível aumenta o valor em 10%
    const levelMultiplier = 1 + ((skillLevel - 1) * 0.1);
    return baseValue * levelMultiplier;
  }
};


