'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ClassSelection } from '@/components/ClassSelection';
import { AttributeDistribution } from '@/components/AttributeDistribution';
import { LevelUpAttributeDistribution } from '@/components/LevelUpAttributeDistribution';
import { PvPSystem } from '@/components/PvPSystem';
import { GuildSystem } from '@/components/GuildSystem';
import { MarketSystem } from '@/components/MarketSystem';
import { ProfileImage } from '@/components/ProfileImage';
import { Card } from '@/components/Card';
import { 
  Sword, 
  Shield, 
  Zap, 
  Users, 
  Crown, 
  Gem, 
  Heart, 
  Coins, 
  Star,
  LogOut,
  Settings,
  Map,
  Package,
  Target,
  Plus,
  Minus,
  Timer,
  X,
  User,
  Sword as SwordIcon,
  Shield as ShieldIcon,
  Zap as ZapIcon,
  Trophy,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { CharacterClass, Attributes, Monster, Item } from '@/types/game';
import { CHARACTER_CLASSES, MONSTERS, ITEMS, GAME_FORMULAS, COLLECTION_SKILLS, COLLECTION_RESOURCES, generateNewMonsterOfSameLevel, applyLevelPenalty, SKILLS, getSkillsByClass, getSkillById, SKILL_FORMULAS, getRankFromPoints, getRankIcon, SHOP_ITEMS } from '@/data/gameData';

// Helper function to get character image path based on class and gender
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

export default function GamePage() {
  const { user, logout, updateCharacter, updateExperience, updateAttributes, updateHealth, useItem, rest, sellItems, updateCollection, searchPvPOpponents, startPvPBattle, getPvPRanking, createGuild, joinGuild, leaveGuild, getGuild, updateGuild, getGuildRanking, guildBank, contributeExperience, upgradeSkill, listMarketItems, addMarketItem, buyMarketItem, removeMarketItem, buyShopItem, updateProfileImage, equipItem, unequipItem, refreshUser, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('character');
  const [showClassSelection, setShowClassSelection] = useState(false);
  const [showAttributeDistribution, setShowAttributeDistribution] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [collectionTimer, setCollectionTimer] = useState(0);
  const [restCooldown, setRestCooldown] = useState(0); // Cooldown timer in seconds
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({}); // Skill cooldowns in turns (not seconds)
  const [selectedCharacterClass, setSelectedCharacterClass] = useState<CharacterClass | null>(null);
  const [showLevelUpDistribution, setShowLevelUpDistribution] = useState(false);
  const [levelFilter, setLevelFilter] = useState<number>(0);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItemsToSell, setSelectedItemsToSell] = useState<Array<{itemId: string, amount: number}>>([]);
  const [showSellAllModal, setShowSellAllModal] = useState(false);

  const [showDeathMessage, setShowDeathMessage] = useState(false);
  const [deathInfo, setDeathInfo] = useState<{monsterName: string, experienceLost: number} | null>(null);
  const [currentMonsterHealth, setCurrentMonsterHealth] = useState<number>(0);
  const [pvpUserRank, setPvpUserRank] = useState<number | null>(null);
  const [showEditProfileImage, setShowEditProfileImage] = useState(false);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  
  // Active buffs state - { skillId: { duration: number, effect: {...} } }
  const [activeBuffs, setActiveBuffs] = useState<Record<string, { duration: number; effect: any; skillName: string }>>({});
  
  // Active debuffs on monster (burn, etc.)
  const [activeDebuffs, setActiveDebuffs] = useState<Record<string, { duration: number; effect: any; skillName: string; damage?: number }>>({});
  
  // Guild name state
  const [guildName, setGuildName] = useState<string | null>(null);
  
  // Character gender state (stored in localStorage)
  const [characterGender, setCharacterGender] = useState<'male' | 'female'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('characterGender');
      return (saved === 'female' ? 'female' : 'male') as 'male' | 'female';
    }
    return 'male';
  });
  
  // Toggle character gender
  const toggleCharacterGender = () => {
    const newGender = characterGender === 'male' ? 'female' : 'male';
    setCharacterGender(newGender);
    if (typeof window !== 'undefined') {
      localStorage.setItem('characterGender', newGender);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    console.log('useEffect - isLoading:', isLoading, 'user:', !!user, 'characterClass:', user?.characterClass, 'showAttributeDistribution:', showAttributeDistribution);
    
    if (!isLoading && !user) {
      router.push('/');
    } else if (user && user.characterClass === null && !showAttributeDistribution) {
      console.log('Mostrando seleção de classe');
      setShowClassSelection(true);
    }
  }, [user, router, isLoading, showAttributeDistribution]);

  // Calculate collection timer based on lastCollection timestamp
  // This ensures the timer continues even when the page is closed/reloaded
  useEffect(() => {
    if (!user?.collection) {
      setCollectionTimer(0);
      return;
    }

    // Store current collection data in variables to use in interval
    const lastCollection = typeof user.collection.lastCollection === 'number' 
      ? user.collection.lastCollection 
      : (user.collection.lastCollection ? parseInt(String(user.collection.lastCollection)) : 0);
    const collectionInterval = user.collection.collectionInterval || 30;

    // Function to calculate remaining time based on timestamp
    // This function recalculates from scratch each time, ensuring accuracy
    const calculateRemainingTime = (): number => {
      const now = Date.now();
      
      // Only calculate if lastCollection is a valid timestamp
      if (lastCollection > 0) {
        const timeSinceLastCollection = Math.floor((now - lastCollection) / 1000); // seconds
        
        if (timeSinceLastCollection >= collectionInterval) {
          // Timer already expired
          return 0;
        } else if (timeSinceLastCollection < 0) {
          // Invalid timestamp (future date), reset timer
          return 0;
        } else {
          // Timer still counting down
          return Math.max(0, collectionInterval - timeSinceLastCollection);
        }
      } else {
        // No previous collection (lastCollection is 0 or null), timer is ready
        return 0;
      }
    };

    // Calculate initial timer value
    setCollectionTimer(calculateRemainingTime());

    // Update timer every second based on current timestamp
    // This way the timer continues even if the user leaves and comes back
    const interval = setInterval(() => {
      setCollectionTimer(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.collection?.lastCollection, user?.collection?.collectionInterval]);

  // Calculate rest cooldown based on lastRestTime and user level
  useEffect(() => {
    if (!user) {
      setRestCooldown(0);
      return;
    }

    const userLevel = user.stats?.level || user.level || 1;
    
    // Calculate cooldown duration based on level
    // Level 1-4: 1 minute (60 seconds)
    // Level 5-9: 2 minutes (120 seconds)
    // Level 10-14: 3 minutes (180 seconds)
    // etc.
    const calculateRestCooldownDuration = (level: number): number => {
      if (level <= 4) {
        return 60; // 1 minuto
      }
      return 60 + Math.floor((level - 1) / 5) * 60; // 1 minuto base + 1 minuto a cada 5 níveis
    };

    const cooldownDuration = calculateRestCooldownDuration(userLevel);

    // Function to calculate remaining cooldown based on timestamp
    const calculateRemainingCooldown = (): number => {
      const stats = user.stats as any;
      const lastRestTime = typeof stats?.lastRestTime === 'number' 
        ? stats.lastRestTime 
        : (stats?.lastRestTime ? parseInt(String(stats.lastRestTime)) : 0);
      
      if (lastRestTime === 0) {
        return 0; // No cooldown if never rested
      }

      const now = Date.now();
      const timeSinceLastRest = Math.floor((now - lastRestTime) / 1000); // em segundos
      
      if (timeSinceLastRest >= cooldownDuration) {
        return 0; // Cooldown expired
      } else {
        return Math.max(0, cooldownDuration - timeSinceLastRest);
      }
    };

    // Calculate initial cooldown value
    setRestCooldown(calculateRemainingCooldown());

    // Update cooldown every second
    const interval = setInterval(() => {
      setRestCooldown(calculateRemainingCooldown());
    }, 1000);

    return () => clearInterval(interval);
  }, [user, user?.stats?.level, user?.level]);

  // Load guild name when user has a guildId
  useEffect(() => {
    const loadGuildName = async () => {
      if (user?.guildId) {
        try {
          const result = await getGuild(user.guildId);
          if (result.success && result.guild) {
            setGuildName(result.guild.name);
          } else {
            setGuildName(null);
          }
        } catch (error) {
          console.error('Error loading guild name:', error);
          setGuildName(null);
        }
      } else {
        setGuildName(null);
      }
    };
    
    loadGuildName();
  }, [user?.guildId, getGuild]);

  // Load PvP ranking to get user position
  useEffect(() => {
    const loadPvPRanking = async () => {
      if (user?.pvpStats) {
        try {
          const result = await getPvPRanking(1000, 0); // Get top 1000 to find user
          if (result.success && result.rankings) {
            const userRanking = result.rankings.find(r => r.playerId === user.id);
            if (userRanking) {
              setPvpUserRank(userRanking.rank);
            } else {
              // User not in top 1000, need to calculate position
              // For now, set to null if not found
              setPvpUserRank(null);
            }
          }
        } catch (error) {
          console.error('Error loading PvP ranking:', error);
        }
      }
    };
    
    loadPvPRanking();
  }, [user?.id, user?.pvpStats, getPvPRanking]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSellModal) {
          setShowSellModal(false);
          setSelectedItemsToSell([]);
        }
        if (showSellAllModal) {
          setShowSellAllModal(false);
          setSelectedItemsToSell([]);
        }
        if (showDeathMessage) {
          setShowDeathMessage(false);
          setDeathInfo(null);
        }
        if (showLevelUpDistribution) {
          setShowLevelUpDistribution(false);
        }
        if (showEditProfileImage) {
          setShowEditProfileImage(false);
        }
        if (showDiscordModal) {
          setShowDiscordModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showSellModal, showSellAllModal, showDeathMessage, showLevelUpDistribution, showEditProfileImage, showDiscordModal]);

  // Reduce skill cooldowns by 1 turn after each action
  const reduceSkillCooldowns = () => {
    setSkillCooldowns(prev => {
      const newCooldowns: Record<string, number> = {};
      for (const skillId in prev) {
        const currentCooldown = prev[skillId];
        if (currentCooldown > 1) {
          // Reduce cooldown by 1 turn
          newCooldowns[skillId] = currentCooldown - 1;
        }
        // If cooldown is 1, it becomes 0 and is removed (skill available again)
        // If cooldown is 0 or less, it's already available and removed
      }
      return newCooldowns;
    });
    
    // Reduce buff durations by 1 turn
    setActiveBuffs(prev => {
      const newBuffs: Record<string, { duration: number; effect: any; skillName: string }> = {};
      for (const skillId in prev) {
        const buff = prev[skillId];
        if (buff.duration > 1) {
          newBuffs[skillId] = {
            ...buff,
            duration: buff.duration - 1
          };
        }
        // If duration is 1, remove the buff (expires)
      }
      return newBuffs;
    });
    
    // Reduce debuff durations and apply damage (burn, etc.)
    setActiveDebuffs(prev => {
      const newDebuffs: Record<string, { duration: number; effect: any; skillName: string; damage?: number }> = {};
      for (const skillId in prev) {
        const debuff = prev[skillId];
        if (debuff.duration > 1) {
          newDebuffs[skillId] = {
            ...debuff,
            duration: debuff.duration - 1
          };
        }
        // If duration is 1, remove the debuff (expires)
      }
      return newDebuffs;
    });
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple mx-auto mb-4"></div>
          <p className="text-dark-text text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleClassSelected = (characterClass: CharacterClass) => {
    console.log('Classe selecionada:', characterClass);
    setSelectedCharacterClass(characterClass);
    setShowClassSelection(false);
    setShowAttributeDistribution(true);
    console.log('Estados atualizados - showClassSelection: false, showAttributeDistribution: true');
  };

  const handleAttributesConfirmed = async (attributes: Attributes) => {
    if (user && selectedCharacterClass) {
      const success = await updateCharacter(selectedCharacterClass, attributes);
      if (success) {
        setShowAttributeDistribution(false);
        setSelectedCharacterClass(null); // Limpar o estado temporário
      }
    }
  };

  const handleLevelUpAttributesConfirmed = async (attributes: Attributes) => {
    if (user) {
      const success = await updateAttributes(attributes);
      if (success) {
        setShowLevelUpDistribution(false);
      }
    }
  };

  const handleCollectResources = async (collectionType: string) => {
    if (collectionTimer > 0) {
      return; // Timer ainda não acabou
    }

    // Simulate resource collection based on type
    const resources = COLLECTION_RESOURCES[collectionType as keyof typeof COLLECTION_RESOURCES] || [];
    
    if (!resources || resources.length === 0) {
      console.error('No resources found for collection type:', collectionType);
      return;
    }

    // Get current skill level (default to level 1 if skill doesn't exist yet)
    const skill = user.collection?.skills?.find(s => s.type === collectionType);
    const currentSkillLevel = skill?.level || 1;
    
    // Filter resources based on skill level
    const availableResources = resources.filter((resource: any) => {
      return currentSkillLevel >= (resource.level || 1);
    });
    
    if (availableResources.length === 0) {
      setBattleLog(prev => [
        ...prev, 
        `Você precisa de um nível maior em ${collectionType} para coletar recursos aqui.`
      ]);
      return;
    }
    
    const randomResource = availableResources[Math.floor(Math.random() * availableResources.length)];
    const amount = Math.floor(Math.random() * (randomResource.maxAmount - randomResource.baseAmount + 1)) + randomResource.baseAmount;
    
    const collectedResources = [{
      id: randomResource.id,
      name: randomResource.name,
      amount,
      icon: randomResource.icon
    }];
    
    // Atualizar experiência de coleta
    const result = await updateCollection(collectionType, randomResource.experience, collectedResources);
    
    if (result.success) {
      setBattleLog(prev => [
        ...prev, 
        `Coletou: ${amount}x ${randomResource.name}`,
        ...(result.levelUp ? [`🎉 ${collectionType.toUpperCase()} subiu de nível! 🎉`] : [])
      ]);
    } else {
      setBattleLog(prev => [
        ...prev, 
        `Erro ao coletar recursos. Tente novamente.`
      ]);
    }
    
    // Timer will be reset automatically by the useEffect that reads lastCollection
  };

  const handleUseItem = async (itemId: string) => {
    const result = await useItem(itemId);
    
    if (result.success) {
      setBattleLog(prev => [
        `Usou: ${result.itemUsed}`,
        ...(result.effectsApplied || []),
        ...prev
      ]);
    }
  };

  const handleRest = async () => {
    if (restCooldown > 0) {
      return; // Cooldown still active
    }

    const result = await rest();
    
    if (result.success) {
      setBattleLog(prev => [
        result.message || 'Descansou e recuperou HP/MP!',
        ...prev
      ]);
    } else {
      // Handle error messages (like cooldown active from server-side check)
      setBattleLog(prev => [
        'Erro ao descansar. Tente novamente.',
        ...prev
      ]);
    }
  };

  const handleSellItems = async () => {
    if (selectedItemsToSell.length === 0) return;
    
    const result = await sellItems(selectedItemsToSell);
    
    if (result.success) {
      setBattleLog(prev => [
        result.message || 'Itens vendidos com sucesso!',
        ...prev
      ]);
      setShowSellModal(false);
      setSelectedItemsToSell([]);
    }
  };

  const handleSelectItemForSale = (itemId: string, amount: number) => {
    setSelectedItemsToSell(prev => {
      const existing = prev.find(item => item.itemId === itemId);
      if (existing) {
        return prev.map(item => 
          item.itemId === itemId 
            ? { ...item, amount: Math.min(amount, item.amount + 1) }
            : item
        );
      } else {
        return [...prev, { itemId, amount: 1 }];
      }
    });
  };

  const handleRemoveItemFromSale = (itemId: string) => {
    setSelectedItemsToSell(prev => prev.filter(item => item.itemId !== itemId));
  };

  const handleUpdateSaleAmount = (itemId: string, newAmount: number) => {
    setSelectedItemsToSell(prev => 
      prev.map(item => 
        item.itemId === itemId 
          ? { ...item, amount: Math.max(1, newAmount) }
          : item
      )
    );
  };



  // Função para agrupar itens em stacks
  // Helper function to migrate old item IDs to new ones
  const migrateItemId = (itemId: string): string => {
    const idMigration: Record<string, string> = {
      'iron_helmet': 'copper_helmet',
      'iron_armor': 'copper_armor',
      'iron_sword': 'copper_sword',
      'iron_boots': 'copper_boots',
      'iron_shield': 'copper_shield',
      'iron_ring': 'copper_ring',
      'iron_amulet': 'copper_amulet'
    };
    return idMigration[itemId] || itemId;
  };

  // Helper function to get full item data with migration support
  const getFullItemData = (item: any) => {
    if (!item || !item.id) return item;
    const migratedId = migrateItemId(item.id);
    const fullItem = ITEMS.find(i => i.id === migratedId);
    return fullItem ? { ...fullItem, ...item, id: migratedId } : { ...item, id: migratedId };
  };

  // Helper function to get equipped item with full data
  const getEquippedItem = (slot: keyof typeof user.equippedItems) => {
    const item = user.equippedItems?.[slot];
    if (!item) return null;
    return getFullItemData(item);
  };

  const getStackedInventory = () => {
    if (!user?.inventory) return [];
    
    const stacked: { [key: string]: any } = {};
    
    user.inventory.forEach(item => {
      // Migrar ID antigo para novo se necessário
      const migratedId = migrateItemId(item.id);
      const key = migratedId;
      
      // Buscar o item completo do array ITEMS para pegar imagePath e outras propriedades
      const itemData = getFullItemData(item);
      
      if (stacked[key]) {
        stacked[key].amount = (stacked[key].amount || 1) + (item.amount || 1);
      } else {
        stacked[key] = { ...itemData, amount: item.amount || 1 };
      }
    });
    
    return Object.values(stacked);
  };

  const handleStartBattle = (monster: Monster) => {
    console.log('🎯 Starting battle against:', monster.name, 'with health:', monster.health);
    setSelectedMonster(monster);
    setCurrentMonsterHealth(monster.health);
    setBattleLog([`Iniciou batalha contra ${monster.name}!`]);
    // Reset skill cooldowns and buffs when starting a new battle
    setSkillCooldowns({});
    setActiveBuffs({});
    setActiveDebuffs({});
    console.log('✅ Battle started, selectedMonster should be set');
  };

  const handleAttack = async () => {
    if (!selectedMonster) {
      console.log('❌ No monster selected for attack');
      return { playerDied: false, monsterDefeated: false };
    }

    let currentPlayerHealth = user.stats?.health || user.health || 100;
    let monsterHealth = currentMonsterHealth > 0 ? currentMonsterHealth : selectedMonster.health;
    let battleLogEntries: string[] = [];

    console.log('=== BATTLE ROUND START ===');
    console.log('🎯 Target monster:', selectedMonster.name);
    console.log('💚 Monster health before attack:', monsterHealth);
    console.log('❤️ Player health before attack:', user.stats?.health || user.health || 100);

    // Player attack - Novo sistema
    const playerAttack = user.stats?.attack || 20;
    const playerDEX = user.attributes?.dexterity || 10;
    const playerLUK = user.attributes?.luck || 5;
    const monsterAGI = selectedMonster.stats?.dodgeChance ? 
      (selectedMonster.attributes?.agility || 10) : 10;
    const monsterLUK = selectedMonster.attributes?.luck || 5;
    
    // Verificar precisão vs esquiva
    const hitChance = GAME_FORMULAS.calculateHitChance(playerDEX, monsterAGI);
    const hitRoll = Math.random() * 100;
    
    if (hitRoll > hitChance) {
      battleLogEntries.push(`⚡ ${selectedMonster.name} esquivou seu ataque!`);
      // Monster counter-attack (quando player erra)
      const monsterAttackCounter = selectedMonster.attack;
      const monsterDEXCounter = selectedMonster.attributes?.dexterity || 10;
      const playerAGICounter = user.attributes?.agility || 10;
      const playerLUKCounter = user.attributes?.luck || 5;
      const monsterLUKCounter = selectedMonster.attributes?.luck || 5;
      
      const monsterHitChanceCounter = GAME_FORMULAS.calculateHitChance(monsterDEXCounter, playerAGICounter);
      const monsterHitRollCounter = Math.random() * 100;
      
      if (monsterHitRollCounter <= monsterHitChanceCounter) {
        // Monster hits
        const monsterDamageCounter = GAME_FORMULAS.calculateDamage(monsterAttackCounter, user.stats?.defense || 15);
        const monsterCritChanceCounter = GAME_FORMULAS.calculateFinalCritical(monsterLUKCounter, playerLUKCounter);
        const isMonsterCriticalCounter = Math.random() * 100 < monsterCritChanceCounter;
        const finalMonsterDamageCounter = isMonsterCriticalCounter ? Math.floor(monsterDamageCounter * 1.5) : Math.floor(monsterDamageCounter);
        
        currentPlayerHealth = Math.max(0, currentPlayerHealth - finalMonsterDamageCounter);
        
        if (isMonsterCriticalCounter) {
          battleLogEntries.push(`🎯 CRÍTICO! ${selectedMonster.name} causou ${finalMonsterDamageCounter} de dano!`);
        } else {
          battleLogEntries.push(`${selectedMonster.name} causou ${finalMonsterDamageCounter} de dano!`);
        }
      } else {
        battleLogEntries.push(`⚡ Você esquivou o ataque de ${selectedMonster.name}!`);
      }
      
      // Update player health
      await updateHealth(currentPlayerHealth);
      
      if (currentPlayerHealth <= 0) {
        battleLogEntries.push(`💀 Você foi derrotado por ${selectedMonster.name}!`);
        setBattleLog(prev => [...battleLogEntries, ...prev]);
        setShowDeathMessage(true);
        setDeathInfo({
          monsterName: selectedMonster.name,
          experienceLost: Math.floor((user.stats?.experience || 0) * 0.1)
        });
        return { playerDied: true, monsterDefeated: false };
      }
      
      setBattleLog(prev => [...battleLogEntries, ...prev]);
      return { playerDied: false, monsterDefeated: false };
    }
    
    // Apply attack buffs
    let modifiedPlayerAttack = playerAttack;
    Object.values(activeBuffs).forEach(buff => {
      if (buff.effect.type === 'buff') {
        // Assume buff increases attack (warrior rage, archer buff)
        modifiedPlayerAttack = Math.floor(modifiedPlayerAttack * (1 + buff.effect.value));
      }
    });
    
    // Player hits - calcular dano proporcional
    const baseDamage = GAME_FORMULAS.calculateDamage(modifiedPlayerAttack, selectedMonster.defense);
    const playerCritChance = GAME_FORMULAS.calculateFinalCritical(playerLUK, monsterLUK);
    const isPlayerCritical = Math.random() * 100 < playerCritChance;
    const finalPlayerDamage = isPlayerCritical ? Math.floor(baseDamage * 1.5) : Math.floor(baseDamage);
    
    console.log(`Player deals ${finalPlayerDamage} damage to monster`);
    monsterHealth = Math.max(0, monsterHealth - finalPlayerDamage);
    
    if (isPlayerCritical) {
      battleLogEntries.push(`🎯 CRÍTICO! Você causou ${finalPlayerDamage} de dano!`);
    } else {
      battleLogEntries.push(`Você causou ${finalPlayerDamage} de dano!`);
    }

    // Update monster health state immediately
    setCurrentMonsterHealth(monsterHealth);
    console.log('Monster health after player attack:', monsterHealth);

         // Check if monster is defeated
     if (monsterHealth <= 0) {
       console.log('Monster defeated!');
       
       // Reduce skill cooldowns by 1 turn after attack (turno completo)
       reduceSkillCooldowns();
       
       const playerLevel = user.stats?.level || user.level || 1;
       const monsterLevel = selectedMonster.level;
       
       // Apply level penalty to rewards
       const baseExperience = selectedMonster.experience;
       const baseGold = selectedMonster.gold;
       const { experience, gold, penaltyPercentage } = applyLevelPenalty(baseExperience, baseGold, monsterLevel, playerLevel);
       
       const items = selectedMonster.drops
         .filter(drop => Math.random() < drop.chance)
         .map(drop => ITEMS.find(item => item.id === drop.itemId))
         .filter(Boolean) as Item[];

       const result = await updateExperience(experience, gold, items);
       
                      if (result.success) {
           const penaltyMessage = penaltyPercentage > 0 ? ` (Penalidade: -${penaltyPercentage}% por nível baixo)` : '';
           setBattleLog(prev => [
             ...battleLogEntries,
             `Derrotou ${selectedMonster.name}!`,
             `Ganhou ${experience} experiência e ${gold} ouro!${penaltyMessage}`,
             ...(result.levelUp ? ['🎉 PARABÉNS! Você subiu de nível! 🎉'] : []),
             ...(items.length > 0 ? [`Encontrou: ${items.map(item => item.name).join(', ')}`] : []),
             ...prev
           ]);
         
         // Removed automatic level up distribution - now only available in profile
       }
       
       // Generate a new monster of the same level
       const newMonster = generateNewMonsterOfSameLevel(selectedMonster.level);
       console.log('🔄 Generated new monster:', newMonster.name, 'with health:', newMonster.health);
       
       setSelectedMonster(newMonster);
       setCurrentMonsterHealth(newMonster.health);
       
       // Add new monster info to battle log
       setBattleLog(prev => [
         `🔄 Novo monstro apareceu: ${newMonster.name} (Nível ${newMonster.level})!`,
         ...prev
       ]);
       
       console.log('✅ Monster defeated, new monster ready for battle');
       return { playerDied: false, monsterDefeated: true };
    }

    // Apply burn damage before monster attacks
    if (Object.keys(activeDebuffs).length > 0) {
      Object.entries(activeDebuffs).forEach(([skillId, debuff]) => {
        if (debuff.damage) {
          const burnDamage = debuff.damage;
          monsterHealth = Math.max(0, monsterHealth - burnDamage);
          battleLogEntries.push(`🔥 ${selectedMonster.name} sofreu ${burnDamage} de dano de queimadura!`);
          setCurrentMonsterHealth(monsterHealth);
        }
      });
    }
    
    // Check if monster died from burn
    if (monsterHealth <= 0) {
      const playerLevel = user.stats?.level || user.level || 1;
      const monsterLevel = selectedMonster.level;
      const { experience, gold, penaltyPercentage } = applyLevelPenalty(selectedMonster.experience, selectedMonster.gold, monsterLevel, playerLevel);
      const items = selectedMonster.drops
        .filter(drop => Math.random() < drop.chance)
        .map(drop => ITEMS.find(item => item.id === drop.itemId))
        .filter(Boolean) as Item[];
      const result = await updateExperience(experience, gold, items);
      if (result.success) {
        const penaltyMessage = penaltyPercentage > 0 ? ` (Penalidade: -${penaltyPercentage}% por nível baixo)` : '';
        setBattleLog(prev => [...battleLogEntries, `Derrotou ${selectedMonster.name}!`, `Ganhou ${experience} experiência e ${gold} ouro!${penaltyMessage}`, ...(result.levelUp ? ['🎉 PARABÉNS! Você subiu de nível! 🎉'] : []), ...(items.length > 0 ? [`Encontrou: ${items.map(item => item.name).join(', ')}`] : []), ...prev]);
      }
      const newMonster = generateNewMonsterOfSameLevel(selectedMonster.level);
      setSelectedMonster(newMonster);
      setCurrentMonsterHealth(newMonster.health);
      setBattleLog(prev => [`🔄 Novo monstro apareceu: ${newMonster.name} (Nível ${newMonster.level})!`, ...prev]);
      return { playerDied: false, monsterDefeated: true };
    }
    
    // Monster attacks back - Novo sistema
    const monsterAttack = selectedMonster.attack;
    
    // Apply defense and dodge buffs
    let modifiedPlayerDefense = user.stats?.defense || 15;
    let modifiedPlayerAGI = user.attributes?.agility || 10;
    
    Object.entries(activeBuffs).forEach(([buffSkillId, buff]) => {
      if (buff.effect.type === 'buff') {
        const skill = getSkillById(buffSkillId);
        // Check if it's a defense buff (warrior defense skill)
        if (buffSkillId.includes('defense')) {
          modifiedPlayerDefense = Math.floor(modifiedPlayerDefense * (1 + buff.effect.value));
        }
        // Check if it's a dodge/agility buff (archer buff)
        if (buffSkillId.includes('buff') || buffSkillId.includes('dodge')) {
          modifiedPlayerAGI = Math.floor(modifiedPlayerAGI * (1 + buff.effect.value));
        }
      }
    });
    
    // Novo sistema: precisão vs esquiva (contra-ataque normal)
    const monsterDEXNormal = selectedMonster.attributes?.dexterity || 10;
    const playerAGINormal = user.attributes?.agility || 10;
    const playerLUKNormal = user.attributes?.luck || 5;
    const monsterLUKNormal = selectedMonster.attributes?.luck || 5;
    
    const monsterHitChanceNormal = GAME_FORMULAS.calculateHitChance(monsterDEXNormal, modifiedPlayerAGI);
    const monsterHitRollNormal = Math.random() * 100;
    
    if (monsterHitRollNormal > monsterHitChanceNormal) {
      battleLogEntries.push(`⚡ Você esquivou o ataque de ${selectedMonster.name}!`);
      console.log('Player dodged monster attack');
    } else {
      // Calcular dano proporcional com defesa modificada
      let baseMonsterDamage = GAME_FORMULAS.calculateDamage(monsterAttack, modifiedPlayerDefense);
      const monsterCritChanceNormal = GAME_FORMULAS.calculateFinalCritical(monsterLUKNormal, playerLUKNormal);
      const isMonsterCritical = Math.random() * 100 < monsterCritChanceNormal;
      let finalMonsterDamage = isMonsterCritical ? Math.floor(baseMonsterDamage * 1.5) : Math.floor(baseMonsterDamage);
      
      // Apply shield buffs (damage reduction)
      Object.entries(activeBuffs).forEach(([buffSkillId, buff]) => {
        if (buffSkillId.includes('shield')) {
          // Reduce damage by buff value (e.g., 35% = 0.35 reduction)
          finalMonsterDamage = Math.floor(finalMonsterDamage * (1 - buff.effect.value));
        }
      });
      
      currentPlayerHealth = Math.max(0, currentPlayerHealth - finalMonsterDamage);
      console.log(`Monster deals ${finalMonsterDamage} damage to player`);
      console.log('Player health after monster attack:', currentPlayerHealth);
      
      if (isMonsterCritical) {
        battleLogEntries.push(`💥 CRÍTICO! ${selectedMonster.name} causou ${finalMonsterDamage} de dano!`);
      } else {
        battleLogEntries.push(`${selectedMonster.name} causou ${finalMonsterDamage} de dano!`);
      }
      
      // Check if player died
      if (currentPlayerHealth <= 0) {
        console.log('Player died!');
        
        const currentLevel = user.stats?.level || user.level || 1;
        const experienceToNext = user.stats?.experienceToNext || 100;
        const experienceLost = Math.floor(experienceToNext * 0.01);
        
        battleLogEntries.push(`💀 Você foi derrotado por ${selectedMonster.name}!`);
        battleLogEntries.push(`📉 Perdeu ${experienceLost} experiência!`);
        
        setDeathInfo({
          monsterName: selectedMonster.name,
          experienceLost: experienceLost
        });
        setShowDeathMessage(true);
        
        const result = await updateExperience(-experienceLost, 0, []);
        
        if (result.success) {
          setBattleLog(prev => [
            ...battleLogEntries,
            ...prev
          ]);
        }
        
        
        setSelectedMonster(null);
        return { playerDied: true, monsterDefeated: false };
      }
    }
    
    // Update player health via API
    await updateHealth(currentPlayerHealth);
    
    // Reduce skill cooldowns by 1 turn after attack
    reduceSkillCooldowns();
    
    setBattleLog(prev => [
      ...battleLogEntries,
      ...prev
    ]);
    
    console.log('=== BATTLE ROUND END ===');
    console.log('💚 Final monster health:', monsterHealth);
    console.log('❤️ Final player health:', currentPlayerHealth);
    console.log('🔄 Auto battle should continue...');
    
    return { playerDied: false, monsterDefeated: false };
  };

  // Handle skill usage
  const handleUseSkill = async (skillId: string) => {
    if (!selectedMonster || !user.characterClass) return;

    const skill = getSkillById(skillId);
    if (!skill) {
      setBattleLog(prev => ['❌ Habilidade não encontrada!', ...prev]);
      return;
    }

    // Check if skill is for this character class
    if (skill.characterClass !== user.characterClass) {
      setBattleLog(prev => ['❌ Essa habilidade não é da sua classe!', ...prev]);
      return;
    }

    // Check player level
    const playerLevel = user.stats?.level || user.level || 1;
    if (playerLevel < skill.level) {
      setBattleLog(prev => [`❌ Você precisa ser nível ${skill.level} para usar ${skill.name}!`, ...prev]);
      return;
    }

    // Check mana
    const currentMana = user.stats?.mana || user.mana || 0;
    if (currentMana < skill.manaCost) {
      setBattleLog(prev => [`❌ Você não tem mana suficiente! (${currentMana}/${skill.manaCost})`, ...prev]);
      return;
    }

    // Check cooldown (in turns)
    const cooldownRemaining = getSkillCooldownRemaining(skillId);
    if (cooldownRemaining > 0) {
      setBattleLog(prev => [`⏳ ${skill.name} está em cooldown! (${cooldownRemaining} turno${cooldownRemaining > 1 ? 's' : ''} restante${cooldownRemaining > 1 ? 's' : ''})`, ...prev]);
      return;
    }

    // Get player skill level (defaults to 1 if not found)
    const playerSkills = user.skills || [];
    const playerSkill = playerSkills.find(ps => ps.skillId === skillId);
    const skillLevel = playerSkill?.level || 1;
    
    // Calculate scaled effect value based on skill level
    const scaledEffectValue = SKILL_FORMULAS.calculateSkillEffectValue(skill.effect.value, skillLevel, skillId);

    // Apply skill effect
    const battleLogEntries: string[] = [];
    battleLogEntries.push(`✨ Você usou ${skill.name} (Nv.${skillLevel})!`);

    let newPlayerHealth = user.stats?.health || user.health || 100;
    let newPlayerMana = currentMana - skill.manaCost;
    let monsterHealth = currentMonsterHealth > 0 ? currentMonsterHealth : selectedMonster.health;

    if (skill.effect.type === 'damage' && skill.effect.target === 'enemy') {
      const playerAttack = user.stats?.attack || 20;
      const baseDamage = GAME_FORMULAS.calculateDamage(playerAttack, selectedMonster.defense);
      const skillDamage = Math.floor(baseDamage * scaledEffectValue);
      
      // Apply accuracy check
      const playerDEX = user.attributes?.dexterity || 10;
      const monsterAGI = selectedMonster.attributes?.agility || 10;
      const hitChance = GAME_FORMULAS.calculateHitChance(playerDEX, monsterAGI);
      const hitRoll = Math.random() * 100;
      
      if (hitRoll <= hitChance) {
        const playerLUK = user.attributes?.luck || 5;
        const monsterLUK = selectedMonster.attributes?.luck || 5;
        const critChance = GAME_FORMULAS.calculateFinalCritical(playerLUK, monsterLUK);
        const isCritical = Math.random() * 100 < critChance;
        const finalDamage = isCritical ? Math.floor(skillDamage * 1.5) : skillDamage;
        
        monsterHealth = Math.max(0, monsterHealth - finalDamage);
        setCurrentMonsterHealth(monsterHealth);
        
        if (isCritical) {
          battleLogEntries.push(`🎯 CRÍTICO! Você causou ${finalDamage} de dano com ${skill.name}!`);
        } else {
          battleLogEntries.push(`⚔️ Você causou ${finalDamage} de dano com ${skill.name}!`);
        }
      } else {
        battleLogEntries.push(`⚡ ${selectedMonster.name} esquivou ${skill.name}!`);
      }
    } else if (skill.effect.type === 'heal' && skill.effect.target === 'self') {
      const maxHealth = user.stats?.maxHealth || user.maxHealth || 100;
      const str = user.attributes?.strength || 10;
      const healAmount = SKILL_FORMULAS.calculateSkillHeal(maxHealth, scaledEffectValue, str, skillLevel);
      newPlayerHealth = Math.min(maxHealth, newPlayerHealth + healAmount);
      battleLogEntries.push(`💚 Você recuperou ${healAmount} de vida!`);
    } else if (skill.effect.type === 'buff' && skill.effect.target === 'self') {
      // Apply buff - store in state
      const buffDuration = skill.effect.duration || 3;
      setActiveBuffs(prev => ({
        ...prev,
        [skillId]: {
          duration: buffDuration,
          effect: {
            ...skill.effect,
            value: scaledEffectValue
          },
          skillName: skill.name
        }
      }));
      battleLogEntries.push(`🔥 ${skill.name} ativado! (Efeito por ${buffDuration} turnos)`);
    } else if (skill.effect.type === 'debuff' && skill.effect.target === 'enemy') {
      // Apply debuff (like burn) - store in state
      const debuffDuration = skill.effect.duration || 3;
      setActiveDebuffs(prev => ({
        ...prev,
        [skillId]: {
          duration: debuffDuration,
          effect: {
            ...skill.effect,
            value: scaledEffectValue
          },
          skillName: skill.name,
          damage: Math.floor((user.stats?.attack || 20) * scaledEffectValue)
        }
      }));
      battleLogEntries.push(`🔥 ${selectedMonster.name} foi queimado! (${debuffDuration} turnos)`);
    }

    // Update skill cooldown in local state (in turns)
    setSkillCooldowns(prev => ({
      ...prev,
      [skillId]: skill.cooldown
    }));

    // Update health and mana
    const needsHealthUpdate = newPlayerHealth !== (user.stats?.health || user.health);
    const needsManaUpdate = newPlayerMana !== (user.stats?.mana || user.mana);
    
    if (needsHealthUpdate || needsManaUpdate) {
      await updateHealth(
        needsHealthUpdate ? newPlayerHealth : undefined,
        needsManaUpdate ? newPlayerMana : undefined
      );
    }
    
    // Reduce skill cooldowns by 1 turn after using skill
    reduceSkillCooldowns();
    
    setBattleLog(prev => [...battleLogEntries, ...prev]);

    // Check if monster is defeated
    if (monsterHealth <= 0) {
      const playerLevel = user.stats?.level || user.level || 1;
      const monsterLevel = selectedMonster.level;
      const { experience, gold, penaltyPercentage } = applyLevelPenalty(
        selectedMonster.experience, 
        selectedMonster.gold, 
        monsterLevel, 
        playerLevel
      );
      
      const items = selectedMonster.drops
        .filter(drop => Math.random() < drop.chance)
        .map(drop => ITEMS.find(item => item.id === drop.itemId))
        .filter(Boolean) as Item[];

      const result = await updateExperience(experience, gold, items);
      
      if (result.success) {
        const penaltyMessage = penaltyPercentage > 0 ? ` (Penalidade: -${penaltyPercentage}% por nível baixo)` : '';
        setBattleLog(prev => [
          ...battleLogEntries,
          `Derrotou ${selectedMonster.name}!`,
          `Ganhou ${experience} experiência e ${gold} ouro!${penaltyMessage}`,
          ...(result.levelUp ? ['🎉 PARABÉNS! Você subiu de nível! 🎉'] : []),
          ...(items.length > 0 ? [`Encontrou: ${items.map(item => item.name).join(', ')}`] : []),
          ...prev
        ]);
      }
      
      const newMonster = generateNewMonsterOfSameLevel(selectedMonster.level);
      setSelectedMonster(newMonster);
      setCurrentMonsterHealth(newMonster.health);
      setBattleLog(prev => [
        `🔄 Novo monstro apareceu: ${newMonster.name} (Nível ${newMonster.level})!`,
        ...prev
      ]);
      return;
    }

    // Monster counter-attack after skill
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const monsterAttack = selectedMonster.attack;
    const monsterDEX = selectedMonster.attributes?.dexterity || 10;
    const playerAGI = user.attributes?.agility || 10;
    const playerLUK = user.attributes?.luck || 5;
    const monsterLUK = selectedMonster.attributes?.luck || 5;
    
    const monsterHitChance = GAME_FORMULAS.calculateHitChance(monsterDEX, playerAGI);
    const monsterHitRoll = Math.random() * 100;
    
    if (monsterHitRoll > monsterHitChance) {
      battleLogEntries.push(`⚡ Você esquivou o ataque de ${selectedMonster.name}!`);
    } else {
      const baseMonsterDamage = GAME_FORMULAS.calculateDamage(monsterAttack, user.stats?.defense || 15);
      const monsterCritChance = GAME_FORMULAS.calculateFinalCritical(monsterLUK, playerLUK);
      const isMonsterCritical = Math.random() * 100 < monsterCritChance;
      const finalMonsterDamage = isMonsterCritical ? Math.floor(baseMonsterDamage * 1.5) : Math.floor(baseMonsterDamage);
      
      newPlayerHealth = Math.max(0, newPlayerHealth - finalMonsterDamage);
      
      if (isMonsterCritical) {
        battleLogEntries.push(`💥 CRÍTICO! ${selectedMonster.name} causou ${finalMonsterDamage} de dano!`);
      } else {
        battleLogEntries.push(`${selectedMonster.name} causou ${finalMonsterDamage} de dano!`);
      }
      
      if (newPlayerHealth <= 0) {
        battleLogEntries.push(`💀 Você foi derrotado por ${selectedMonster.name}!`);
        setBattleLog(prev => [...battleLogEntries, ...prev]);
        setShowDeathMessage(true);
        setDeathInfo({
          monsterName: selectedMonster.name,
          experienceLost: Math.floor((user.stats?.experience || 0) * 0.1)
        });
        const result = await updateExperience(-Math.floor((user.stats?.experience || 0) * 0.1), 0, []);
        if (result.success) {
          setSelectedMonster(null);
        }
        return;
      }
      
      await updateHealth(newPlayerHealth);
    }
    
    setBattleLog(prev => [...battleLogEntries, ...prev]);
  };

  // Get available skills for current character class
  const getAvailableSkills = () => {
    if (!user.characterClass) return [];
    const playerLevel = user.stats?.level || user.level || 1;
    return getSkillsByClass(user.characterClass).filter(skill => playerLevel >= skill.level);
  };

  // Calculate skill cooldown remaining (in turns)
  const getSkillCooldownRemaining = (skillId: string): number => {
    // Return cooldown from local state (turns remaining)
    return skillCooldowns[skillId] || 0;
  };

  // Helper function to get background image style for each tab
  const getTabBackgroundStyle = (tabId: string): React.CSSProperties => {
    const backgroundMap: Record<string, string> = {
      'character': 'BGperfil',
      'profile': 'BGequipamento',
      'inventory': 'BGinventario',
      'battle': 'BGbatalha',
      'skills': 'BGskills',
      'pvp': 'BGpvp',
      'collection': 'BGcoleta',
      'rest': 'BGdescanso',
      'guild': 'BGguild',
      'market': 'BGmercado',
      'world': 'BGmundo',
    };

    const bgName = backgroundMap[tabId];
    if (!bgName) return {};

    return {
      backgroundImage: `url(/images/background/${bgName}.png), url(/images/background/${bgName}.gif)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  };

  const tabs = [
    { id: 'character', label: 'Perfil', icon: Crown },
    { id: 'profile', label: 'Equipamentos', icon: Users },
    { id: 'inventory', label: 'Inventário', icon: Package },
    { id: 'battle', label: 'Batalha', icon: Sword },
    { id: 'skills', label: 'Skills', icon: Sparkles },
    { id: 'pvp', label: 'PvP', icon: Trophy },
    { id: 'collection', label: 'Coleta', icon: Target },
    { id: 'rest', label: 'Descanso', icon: Heart },
    { id: 'guild', label: 'Guild', icon: Shield },
    { id: 'market', label: 'Mercado', icon: Zap },
    { id: 'world', label: 'Mundo', icon: Map },
  ];

  // Helper function to format item description with bonuses
  const formatItemDescription = (item: Item | { description?: string; stats?: { strength?: number; magic?: number; dexterity?: number; agility?: number; luck?: number } }): string => {
    let description = item.description || '';
    
    if (item.stats) {
      const bonuses: string[] = [];
      if (item.stats.strength) bonuses.push(`STR +${item.stats.strength}`);
      if (item.stats.magic) bonuses.push(`MAG +${item.stats.magic}`);
      if (item.stats.dexterity) bonuses.push(`DEX +${item.stats.dexterity}`);
      if (item.stats.agility) bonuses.push(`AGI +${item.stats.agility}`);
      if (item.stats.luck) bonuses.push(`LUK +${item.stats.luck}`);
      
      if (bonuses.length > 0) {
        description += ` | Bônus: ${bonuses.join(', ')}`;
      }
    }
    
    return description;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'character':
        return (
          <div className="space-y-6 min-h-screen relative">
            <div className="relative z-10 space-y-6">
            <Card>
              <h3 className="text-3xl font-bold text-white mb-6">Informações do Personagem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Nome:</span> <span className="text-accent-purple">{user.nickname}</span></p>
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Classe:</span> <span className="text-accent-cyan">{user.characterClass ? CHARACTER_CLASSES[user.characterClass].name : 'Não escolhida'}</span></p>
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Nível:</span> <span className="text-primary-yellow font-bold">{user.stats?.level || user.level || 1}</span></p>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-dark-text-secondary text-sm">Experiência: {user.stats?.experience || user.experience || 0}/{user.stats?.experienceToNext || 100}</p>
                      {user.pvpStats && (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-dark-text-secondary">PvP:</span>
                            <span className="text-accent-purple font-semibold">{user.pvpStats.honorPoints || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-dark-text-secondary">Rank:</span>
                            <span className="text-sm">{getRankIcon(user.pvpStats.rank || getRankFromPoints(user.pvpStats.honorPoints || 0))}</span>
                            <span className="text-accent-cyan font-semibold">{user.pvpStats.rank || getRankFromPoints(user.pvpStats.honorPoints || 0)}</span>
                          </div>
                          {pvpUserRank !== null && (
                            <div className="flex items-center gap-1">
                              <span className="text-dark-text-secondary">#</span>
                              <span className="text-primary-yellow font-semibold">{pvpUserRank}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-full bg-dark-bg-tertiary rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary-yellow to-orange-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${((user.stats?.experience || user.experience || 0) / (user.stats?.experienceToNext || 100)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Pontos Disponíveis:</span> <span className="text-accent-purple font-bold">{user.availablePoints}</span></p>
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Guild:</span> <span className="text-accent-cyan">{guildName || 'Nenhuma'}</span></p>
                  {user.availablePoints > 0 && (
                    <button
                      onClick={() => setShowLevelUpDistribution(true)}
                      className="mt-2 bg-purple-gradient hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-semibold shadow-lg"
                    >
                      <Star className="w-5 h-5" />
                      <span>Distribuir Pontos</span>
                    </button>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="text-2xl font-bold text-dark-text mb-6">Atributos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-dark-border">
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-dark-text-secondary text-sm">Vida</span>
                    </div>
                    <span className="text-dark-text font-semibold">{user.stats?.health || user.health || 100}/{user.stats?.maxHealth || user.maxHealth || 100}</span>
                  </div>
                  <div className="w-full bg-dark-bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((user.stats?.health || user.health || 100) / (user.stats?.maxHealth || user.maxHealth || 100)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-dark-text-secondary text-sm">Mana</span>
                    </div>
                    <span className="text-dark-text font-semibold">{user.stats?.mana || user.mana || 50}/{user.stats?.maxMana || user.maxMana || 50}</span>
                  </div>
                  <div className="w-full bg-dark-bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((user.stats?.mana || user.mana || 50) / (user.stats?.maxMana || user.maxMana || 50)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Força:</span>
                  <span className="text-red-400 font-bold text-lg">{user.attributes?.strength || user.strength || 10}</span>
                </div>
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Magia:</span>
                  <span className="text-purple-400 font-bold text-lg">{user.attributes?.magic || user.intelligence || 10}</span>
                </div>
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Destreza:</span>
                  <span className="text-blue-400 font-bold text-lg">{user.attributes?.dexterity || 10}</span>
                </div>
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Agilidade:</span>
                  <span className="text-green-400 font-bold text-lg">{user.attributes?.agility || user.agility || 10}</span>
                </div>
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Sorte (LUK):</span>
                  <span className="text-yellow-400 font-bold text-lg">{user.attributes?.luck || 5}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h4 className="text-2xl font-bold text-dark-text mb-6">Status de Combate</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Ataque:</span>
                  <span className="text-red-400 font-bold text-lg">{user.stats?.attack || 20}</span>
                </div>
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Defesa:</span>
                  <span className="text-blue-400 font-bold text-lg">{user.stats?.defense || 15}</span>
                </div>
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Crítico:</span>
                  <span className="text-yellow-400 font-bold text-lg">{(user.stats?.criticalChance || 5).toFixed(1)}%</span>
                </div>
                <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border flex items-center justify-between">
                  <span className="text-dark-text-secondary">Esquiva:</span>
                  <span className="text-green-400 font-bold text-lg">{(user.stats?.dodgeChance || 4).toFixed(1)}%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
       );

       case 'profile':
         return (
           <div className="space-y-6 min-h-screen relative">
             <div className="relative z-10 space-y-6">
             <Card>
               <h3 className="text-3xl font-bold text-white mb-6">Perfil de Equipamentos</h3>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Character Model */}
                 <Card variant="small" className="p-6">
                   <h4 className="text-white font-bold mb-4 text-center">Personagem</h4>
                   <div className="flex flex-col items-center space-y-4">
                     {/* Head */}
                     <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center relative">
                       {(() => {
                         const helmetItem = getEquippedItem('helmet');
                         return helmetItem ? (
                           <>
                             {helmetItem.imagePath ? (
                               <img
                                 src={helmetItem.imagePath}
                                 alt={helmetItem.name}
                                 className="w-full h-full object-contain"
                                 onError={(e) => {
                                   const target = e.target as HTMLImageElement;
                                   target.style.display = 'none';
                                   if (target.nextSibling) {
                                     (target.nextSibling as HTMLElement).style.display = 'inline';
                                   }
                                 }}
                               />
                             ) : null}
                             <span className="text-2xl" style={{ display: helmetItem.imagePath ? 'none' : 'inline' }}>
                               {helmetItem.icon}
                             </span>
                           </>
                         ) : (
                           <span className="text-dark-text-muted text-sm">Capacete</span>
                         );
                       })()}
                     </div>
                     
                     {/* Body */}
                     <div className="flex space-x-4">
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center relative">
                         {(() => {
                           const weaponItem = getEquippedItem('weapon');
                           return weaponItem ? (
                             <>
                               {weaponItem.imagePath ? (
                                 <img
                                   src={weaponItem.imagePath}
                                   alt={weaponItem.name}
                                   className="w-full h-full object-contain"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     if (target.nextSibling) {
                                       (target.nextSibling as HTMLElement).style.display = 'inline';
                                     }
                                   }}
                                 />
                               ) : null}
                               <span className="text-2xl" style={{ display: weaponItem.imagePath ? 'none' : 'inline' }}>
                                 {weaponItem.icon}
                               </span>
                             </>
                           ) : (
                             <span className="text-dark-text-muted text-sm">Arma</span>
                           );
                         })()}
                       </div>
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center relative">
                         {(() => {
                           const armorItem = getEquippedItem('armor');
                           return armorItem ? (
                             <>
                               {armorItem.imagePath ? (
                                 <img
                                   src={armorItem.imagePath}
                                   alt={armorItem.name}
                                   className="w-full h-full object-contain"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     if (target.nextSibling) {
                                       (target.nextSibling as HTMLElement).style.display = 'inline';
                                     }
                                   }}
                                 />
                               ) : null}
                               <span className="text-2xl" style={{ display: armorItem.imagePath ? 'none' : 'inline' }}>
                                 {armorItem.icon}
                               </span>
                             </>
                           ) : (
                             <span className="text-dark-text-muted text-sm">Armadura</span>
                           );
                         })()}
                       </div>
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center relative">
                         {(() => {
                           const offhandItem = getEquippedItem('offhand');
                           return offhandItem ? (
                             <>
                               {offhandItem.imagePath ? (
                                 <img
                                   src={offhandItem.imagePath}
                                   alt={offhandItem.name}
                                   className="w-full h-full object-contain"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     if (target.nextSibling) {
                                       (target.nextSibling as HTMLElement).style.display = 'inline';
                                     }
                                   }}
                                 />
                               ) : null}
                               <span className="text-2xl" style={{ display: offhandItem.imagePath ? 'none' : 'inline' }}>
                                 {offhandItem.icon}
                               </span>
                             </>
                           ) : (
                             <span className="text-dark-text-muted text-sm">2ª Mão</span>
                           );
                         })()}
                       </div>
                     </div>
                     
                     {/* Feet */}
                     <div className="flex justify-center">
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center relative">
                         {(() => {
                           const bootsItem = getEquippedItem('boots');
                           return bootsItem ? (
                             <>
                               {bootsItem.imagePath ? (
                                 <img
                                   src={bootsItem.imagePath}
                                   alt={bootsItem.name}
                                   className="w-full h-full object-contain"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     if (target.nextSibling) {
                                       (target.nextSibling as HTMLElement).style.display = 'inline';
                                     }
                                   }}
                                 />
                               ) : null}
                               <span className="text-2xl" style={{ display: bootsItem.imagePath ? 'none' : 'inline' }}>
                                 {bootsItem.icon}
                               </span>
                             </>
                           ) : (
                             <span className="text-dark-text-muted text-sm">Bota</span>
                           );
                         })()}
                       </div>
                     </div>
                     
                     {/* Accessories */}
                     <div className="flex space-x-4">
                       <div className="w-12 h-12 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center relative">
                         {(() => {
                           const ringItem = getEquippedItem('ring');
                           return ringItem ? (
                             <>
                               {ringItem.imagePath ? (
                                 <img
                                   src={ringItem.imagePath}
                                   alt={ringItem.name}
                                   className="w-full h-full object-contain"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     if (target.nextSibling) {
                                       (target.nextSibling as HTMLElement).style.display = 'inline';
                                     }
                                   }}
                                 />
                               ) : null}
                               <span className="text-lg" style={{ display: ringItem.imagePath ? 'none' : 'inline' }}>
                                 {ringItem.icon}
                               </span>
                             </>
                           ) : (
                             <span className="text-dark-text-muted text-xs">Anel</span>
                           );
                         })()}
                       </div>
                       <div className="w-12 h-12 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center relative">
                         {(() => {
                           const amuletItem = getEquippedItem('amulet');
                           return amuletItem ? (
                             <>
                               {amuletItem.imagePath ? (
                                 <img
                                   src={amuletItem.imagePath}
                                   alt={amuletItem.name}
                                   className="w-full h-full object-contain"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     if (target.nextSibling) {
                                       (target.nextSibling as HTMLElement).style.display = 'inline';
                                     }
                                   }}
                                 />
                               ) : null}
                               <span className="text-lg" style={{ display: amuletItem.imagePath ? 'none' : 'inline' }}>
                                 {amuletItem.icon}
                               </span>
                             </>
                           ) : (
                             <span className="text-dark-text-muted text-xs">Amuleto</span>
                           );
                         })()}
                       </div>
                       <div className="w-12 h-12 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center relative">
                         {(() => {
                           const relicItem = getEquippedItem('relic');
                           return relicItem ? (
                             <>
                               {relicItem.imagePath ? (
                                 <img
                                   src={relicItem.imagePath}
                                   alt={relicItem.name}
                                   className="w-full h-full object-contain"
                                   onError={(e) => {
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     if (target.nextSibling) {
                                       (target.nextSibling as HTMLElement).style.display = 'inline';
                                     }
                                   }}
                                 />
                               ) : null}
                               <span className="text-lg" style={{ display: relicItem.imagePath ? 'none' : 'inline' }}>
                                 {relicItem.icon}
                               </span>
                             </>
                           ) : (
                             <span className="text-dark-text-muted text-xs">Relíquia</span>
                           );
                         })()}
                       </div>
                     </div>
                   </div>
                 </Card>
                 
                 {/* Equipment Stats */}
                 <Card variant="small" className="p-6">
                   <h4 className="text-white font-bold mb-4">Bônus de Equipamentos</h4>
                   {(() => {
                     const equippedItems = user.equippedItems || {};
                     const totalStats = {
                       strength: 0,
                       magic: 0,
                       dexterity: 0,
                       agility: 0,
                       luck: 0
                     };

                     Object.values(equippedItems).forEach(item => {
                       if (item) {
                         const fullItem = getFullItemData(item);
                         if (fullItem?.stats) {
                           totalStats.strength += fullItem.stats.strength || 0;
                           totalStats.magic += fullItem.stats.magic || 0;
                           totalStats.dexterity += fullItem.stats.dexterity || 0;
                           totalStats.agility += fullItem.stats.agility || 0;
                           totalStats.luck += fullItem.stats.luck || 0;
                         }
                       }
                     });

                     return (
                       <div className="space-y-2">
                         <div className="flex justify-between">
                           <span className="text-dark-text-secondary">Força:</span>
                           <span className={`font-bold ${totalStats.strength > 0 ? 'text-green-400' : 'text-white'}`}>
                             {totalStats.strength > 0 ? `+${totalStats.strength}` : '+0'}
                           </span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-dark-text-secondary">Magia:</span>
                           <span className={`font-bold ${totalStats.magic > 0 ? 'text-green-400' : 'text-white'}`}>
                             {totalStats.magic > 0 ? `+${totalStats.magic}` : '+0'}
                           </span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-dark-text-secondary">Destreza:</span>
                           <span className={`font-bold ${totalStats.dexterity > 0 ? 'text-green-400' : 'text-white'}`}>
                             {totalStats.dexterity > 0 ? `+${totalStats.dexterity}` : '+0'}
                           </span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-dark-text-secondary">Agilidade:</span>
                           <span className={`font-bold ${totalStats.agility > 0 ? 'text-green-400' : 'text-white'}`}>
                             {totalStats.agility > 0 ? `+${totalStats.agility}` : '+0'}
                           </span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-dark-text-secondary">Sorte:</span>
                           <span className={`font-bold ${totalStats.luck > 0 ? 'text-green-400' : 'text-white'}`}>
                             {totalStats.luck > 0 ? `+${totalStats.luck}` : '+0'}
                           </span>
                         </div>
                       </div>
                     );
                   })()}
                 </Card>
               </div>

               {/* Equipped Items List */}
               <Card variant="small" className="p-6">
                 <h4 className="text-white font-bold mb-4">Itens Equipados</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {[
                     { slot: 'helmet' as const, label: 'Capacete' },
                     { slot: 'weapon' as const, label: 'Arma' },
                     { slot: 'armor' as const, label: 'Armadura' },
                     { slot: 'offhand' as const, label: '2ª Mão' },
                     { slot: 'boots' as const, label: 'Bota' },
                     { slot: 'ring' as const, label: 'Anel' },
                     { slot: 'amulet' as const, label: 'Amuleto' },
                     { slot: 'relic' as const, label: 'Relíquia' },
                   ].map(({ slot, label }) => {
                     const item = getEquippedItem(slot);
                     return (
                       <div
                       key={slot}
                       className="p-4 rounded-lg border border-dark-border bg-dark-bg-tertiary"
                     >
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-dark-text-secondary text-sm font-semibold">{label}</span>
                         {item && (
                           <button
                             onClick={async () => {
                               const result = await unequipItem(slot);
                               if (result.success) {
                                 alert(result.message || 'Item desequipado com sucesso!');
                               } else {
                                 alert('Erro ao desequipar: ' + (result.error || 'Erro desconhecido'));
                               }
                             }}
                             className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
                             title="Desequipar"
                           >
                             Remover
                           </button>
                         )}
                       </div>
                       {item ? (
                         <div className="space-y-1">
                           <div className="flex items-center space-x-2">
                             {item.imagePath ? (
                               <img
                                 src={item.imagePath}
                                 alt={item.name}
                                 className="w-8 h-8 object-contain"
                                 onError={(e) => {
                                   const target = e.target as HTMLImageElement;
                                   target.style.display = 'none';
                                   if (target.nextSibling) {
                                     (target.nextSibling as HTMLElement).style.display = 'inline';
                                   }
                                 }}
                               />
                             ) : null}
                             <span className="text-2xl" style={{ display: item.imagePath ? 'none' : 'inline' }}>
                               {item.icon}
                             </span>
                             <span className="text-white font-semibold text-sm">{item.name}</span>
                           </div>
                           {item.stats && (
                             <div className="text-xs text-dark-text-secondary space-y-0.5">
                               {item.stats.strength && (
                                 <div>STR: <span className="text-green-400">+{item.stats.strength}</span></div>
                               )}
                               {item.stats.magic && (
                                 <div>MAG: <span className="text-green-400">+{item.stats.magic}</span></div>
                               )}
                               {item.stats.dexterity && (
                                 <div>DEX: <span className="text-green-400">+{item.stats.dexterity}</span></div>
                               )}
                               {item.stats.agility && (
                                 <div>AGI: <span className="text-green-400">+{item.stats.agility}</span></div>
                               )}
                               {item.stats.luck && (
                                 <div>LUK: <span className="text-green-400">+{item.stats.luck}</span></div>
                               )}
                             </div>
                           )}
                         </div>
                       ) : (
                         <span className="text-dark-text-muted text-sm">Vazio</span>
                       )}
                       </div>
                     );
                   })}
                 </div>
               </Card>
             </Card>
             </div>
           </div>
         );

       case 'inventory':
        return (
          <div className="space-y-6 min-h-screen relative">
            <div className="relative z-10 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-white">Inventário</h3>
                {(user.inventory?.length || 0) > 0 && (
                  <button
                    onClick={() => {
                      // Selecionar todos os itens do inventário
                      const allItems = getStackedInventory();
                      const allItemsToSell = allItems.map(item => ({
                        itemId: item.id,
                        amount: item.amount || 1
                      }));
                      setSelectedItemsToSell(allItemsToSell);
                      setShowSellAllModal(true);
                    }}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 shadow-lg"
                  >
                    <Coins className="w-5 h-5" />
                    <span>Vender TUDO</span>
                  </button>
                )}
              </div>
              
              {(user.inventory?.length || 0) === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-dark-text-muted" />
                  <p className="text-dark-text-secondary text-lg">Seu inventário está vazio</p>
                  <p className="text-dark-text-muted text-sm mt-2">Derrote monstros para coletar itens!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
                  {getStackedInventory().map((item, index) => {
                    const rarityColors: Record<string, string> = {
                      common: 'border-dark-border bg-dark-bg-tertiary',
                      uncommon: 'border-green-500/50 bg-green-500/10',
                      rare: 'border-blue-500/50 bg-blue-500/10',
                      epic: 'border-purple-500/50 bg-purple-500/10',
                      legendary: 'border-yellow-500/50 bg-yellow-500/10'
                    };
                    
                    const rarity = item.rarity || 'common';
                    
                    return (
                      <Card
                        key={index}
                        variant="small"
                        className={`${rarityColors[rarity] || rarityColors.common} border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg h-full flex flex-col min-h-[280px]`}
                      >
                        <div className="flex flex-col space-y-3 flex-1">
                          <div className="flex items-start">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {item.imagePath ? (
                                <img
                                  src={item.imagePath}
                                  alt={item.name}
                                  className="w-12 h-12 object-contain flex-shrink-0"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const fallback = document.createElement('span');
                                      fallback.className = 'text-3xl flex-shrink-0';
                                      fallback.textContent = item.icon;
                                      parent.appendChild(fallback);
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-dark-text font-bold text-sm truncate">{item.name}</h4>
                                <p className="text-dark-text-secondary text-xs mt-1 line-clamp-3 min-h-[3.5rem]">{formatItemDescription(item)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                            <div className="flex items-center space-x-2">
                              <Coins className="w-4 h-4 text-primary-yellow" />
                              <span className="text-primary-yellow text-sm font-semibold">{item.value}</span>
                            </div>
                            {item.amount > 1 && (
                              <span className="bg-accent-purple text-white px-2 py-1 rounded-lg text-xs font-bold">
                                x{item.amount}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2 pt-2 mt-auto">
                            {(item.type === 'weapon' || item.type === 'armor') && (() => {
                              const fullItem = ITEMS.find(i => i.id === item.id);
                              const playerLevel = user.stats?.level || user.level || 1;
                              const requiredLevel = fullItem?.requiredLevel || 1;
                              const canEquip = !fullItem?.requiredClass || fullItem.requiredClass === user.characterClass;
                              const hasLevel = playerLevel >= requiredLevel;
                              const classNames: Record<string, string> = {
                                warrior: 'Guerreiro',
                                mage: 'Mago',
                                archer: 'Arqueiro'
                              };
                              
                              return (
                                <button 
                                  onClick={async () => {
                                    const result = await equipItem(item.id);
                                    if (result.success) {
                                      alert(result.message || 'Item equipado com sucesso!');
                                    } else {
                                      alert('Erro ao equipar: ' + (result.error || 'Erro desconhecido'));
                                    }
                                  }}
                                  disabled={!canEquip || !hasLevel}
                                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                                    !canEquip || !hasLevel
                                      ? 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                                      : 'bg-accent-purple hover:bg-accent-purple-dark text-white'
                                  }`}
                                  title={
                                    !canEquip
                                      ? `Requer classe: ${classNames[fullItem?.requiredClass || ''] || fullItem?.requiredClass}`
                                      : !hasLevel
                                      ? `Requer nível ${requiredLevel}`
                                      : 'Equipar item'
                                  }
                                >
                                  <SwordIcon className="w-4 h-4" />
                                  <span>Equipar</span>
                                </button>
                              );
                            })()}
                            {item.type === 'consumable' && (
                              <button 
                                onClick={() => handleUseItem(item.id)}
                                className="bg-accent-blue hover:opacity-90 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                              >
                                <ZapIcon className="w-4 h-4" />
                                <span>Usar</span>
                              </button>
                            )}
                            <button 
                              onClick={async () => {
                                try {
                                  const result = await sellItems([{ itemId: item.id, amount: item.amount || 1 }]);
                                  if (result.success) {
                                    setBattleLog(prev => [
                                      result.message || `Item vendido por ${result.totalGold || 0} ouro!`,
                                      ...prev
                                    ]);
                                  } else {
                                    setBattleLog(prev => [
                                      'Erro ao vender item. Tente novamente.',
                                      ...prev
                                    ]);
                                  }
                                } catch (error) {
                                  console.error('Erro ao vender item:', error);
                                  setBattleLog(prev => [
                                    'Erro ao vender item. Tente novamente.',
                                    ...prev
                                  ]);
                                }
                              }}
                              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <Coins className="w-4 h-4" />
                              <span>Vender</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
            </div>
          </div>
        );

      case 'battle':
        return (
          <div className="space-y-6 min-h-screen relative">
            <div className="relative z-10 space-y-6">
            <Card>
              <h3 className="text-3xl font-bold text-white mb-6">Arena de Batalha</h3>
              
              {selectedMonster ? (
                <div className="space-y-4">
                  {/* Player Health Bar */}
                  <Card variant="small" className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <ProfileImage
                            profileImage={user.profileImage}
                            characterClass={user.characterClass}
                            characterGender={characterGender}
                            size="medium"
                            showEditButton={false}
                            purchasedItems={user.purchasedItems || []}
                            onUpdateProfileImage={updateProfileImage}
                          />
                          <div>
                            <h4 className="text-white font-bold text-xl">{user.nickname}</h4>
                            <p className="text-dark-text-secondary">Nível {user.stats?.level || user.level || 1}</p>
                            {/* Active Buffs Icons */}
                            {Object.keys(activeBuffs).length > 0 && (
                              <div className="flex items-center space-x-2 mt-2">
                                {Object.entries(activeBuffs).map(([skillId, buff]) => {
                                  const skill = getSkillById(skillId);
                                  return (
                                    <div
                                      key={skillId}
                                      className="relative group"
                                      title={`${buff.skillName} - ${buff.duration} turno${buff.duration > 1 ? 's' : ''} restante${buff.duration > 1 ? 's' : ''}`}
                                    >
                                      <span className="text-2xl">{skill?.icon || '✨'}</span>
                                      <span className="absolute -top-1 -right-1 bg-accent-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                        {buff.duration}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-1 ml-4">
                          <div className="text-white font-bold mb-1">{user.stats?.health || user.health || 100}/{user.stats?.maxHealth || user.maxHealth || 100}</div>
                          <div className="w-full bg-dark-bg-tertiary rounded-full h-4 mt-1">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-300"
                              style={{ width: `${((user.stats?.health || user.health || 100) / (user.stats?.maxHealth || user.maxHealth || 100)) * 100}%` }}
                            ></div>
                          </div>
                          {/* Mana Bar */}
                          <div className="text-white font-bold mt-3 mb-1">{user.stats?.mana || user.mana || 50}/{user.stats?.maxMana || user.maxMana || 50}</div>
                          <div className="w-full bg-dark-bg-tertiary rounded-full h-4 mt-1">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-300"
                              style={{ width: `${((user.stats?.mana || user.mana || 50) / (user.stats?.maxMana || user.maxMana || 50)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Experience Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-dark-text-secondary">Experiência:</span>
                          <span className="text-primary-yellow font-bold">
                            {user.stats?.experience || user.experience || 0}/{user.stats?.experienceToNext || 100}
                          </span>
                        </div>
                        <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
                          <div 
                            className="bg-primary-yellow h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((user.stats?.experience || user.experience || 0) / (user.stats?.experienceToNext || 100)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </Card>

                   {/* Monster Health Bar */}
                   <Card variant="small" className="p-6">
                     <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center space-x-4">
                         {selectedMonster.imagePath ? (
                           <div className="relative">
                             <img 
                               src={selectedMonster.imagePath} 
                               alt={selectedMonster.name}
                               className="w-20 h-20 object-contain rounded-lg bg-dark-bg-tertiary p-2 border border-dark-border-light"
                               onError={(e) => {
                                 // Fallback para ícone se imagem não existir
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = 'none';
                                 const parent = target.parentElement;
                                 if (parent) {
                                   const fallback = document.createElement('span');
                                   fallback.className = 'text-4xl';
                                   fallback.textContent = selectedMonster.icon;
                                   parent.appendChild(fallback);
                                 }
                               }}
                             />
                           </div>
                         ) : (
                           <span className="text-4xl">{selectedMonster.icon}</span>
                         )}
                         <div>
                           <h4 className="text-dark-text font-bold text-xl">{selectedMonster.name}</h4>
                           <p className="text-dark-text-secondary">Nível {selectedMonster.level}</p>
                           {/* Active Debuffs Icons */}
                           {Object.keys(activeDebuffs).length > 0 && (
                             <div className="flex items-center space-x-2 mt-2">
                               {Object.entries(activeDebuffs).map(([skillId, debuff]) => {
                                 const skill = getSkillById(skillId);
                                 return (
                                   <div
                                     key={skillId}
                                     className="relative group"
                                     title={`${debuff.skillName} - ${debuff.duration} turno${debuff.duration > 1 ? 's' : ''} restante${debuff.duration > 1 ? 's' : ''}`}
                                   >
                                     <span className="text-2xl">{skill?.icon || '🔥'}</span>
                                     <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                       {debuff.duration}
                                     </span>
                                   </div>
                                 );
                               })}
                             </div>
                           )}
                         </div>
                       </div>
                       <div className="text-right flex-1 ml-4">
                          <div className="text-white font-bold mb-1">
                            {currentMonsterHealth > 0 ? currentMonsterHealth : selectedMonster.health}/{selectedMonster.maxHealth}
                          </div>
                          <div className="w-full bg-dark-bg-tertiary rounded-full h-4 mt-1">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-rose-600 h-4 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${((currentMonsterHealth > 0 ? currentMonsterHealth : selectedMonster.health) / selectedMonster.maxHealth) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                     </div>
                     
                     {/* Monster Stats */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                       <div className="text-center">
                         <p className="text-gray-400 text-sm">Ataque</p>
                         <p className="text-red-400 font-bold">{selectedMonster.attack}</p>
                       </div>
                       <div className="text-center">
                         <p className="text-gray-400 text-sm">Defesa</p>
                         <p className="text-blue-400 font-bold">{selectedMonster.defense}</p>
                       </div>
                       <div className="text-center">
                         <p className="text-gray-400 text-sm">Crítico</p>
                         <p className="text-yellow-400 font-bold">{selectedMonster.stats?.criticalChance?.toFixed(1) || '0.0'}%</p>
                       </div>
                       <div className="text-center">
                         <p className="text-gray-400 text-sm">Esquiva</p>
                         <p className="text-cyan-400 font-bold">{selectedMonster.stats?.dodgeChance?.toFixed(1) || '0.0'}%</p>
                       </div>
                     </div>
                   </Card>
                  
                                     <div className="space-y-4">
                     {/* Skills Section */}
                     {getAvailableSkills().length > 0 && (
                       <Card variant="small">
                         <h4 className="text-white font-bold mb-3 text-sm">Habilidades:</h4>
                         <div className="grid grid-cols-3 gap-2">
                           {getAvailableSkills().map((skill) => {
                             const cooldownRemaining = getSkillCooldownRemaining(skill.id);
                             const currentMana = user.stats?.mana || user.mana || 0;
                             const hasEnoughMana = currentMana >= skill.manaCost;
                             const isOnCooldown = cooldownRemaining > 0;
                             const canUse = hasEnoughMana && !isOnCooldown;
                             
                             return (
                               <button
                                 key={skill.id}
                                 onClick={() => handleUseSkill(skill.id)}
                                 disabled={!canUse}
                                 className={`
                                   px-3 py-2 rounded-lg font-semibold text-xs transition-all
                                   flex flex-col items-center justify-center space-y-1
                                   ${canUse 
                                     ? 'bg-accent-purple hover:bg-purple-600 text-white cursor-pointer' 
                                     : 'bg-dark-bg-tertiary text-gray-500 cursor-not-allowed opacity-50'
                                   }
                                 `}
                                 title={skill.description}
                               >
                                 <span className="text-lg">{skill.icon}</span>
                                 <span className="font-bold truncate w-full text-center">{skill.name}</span>
                                 <div className="flex items-center space-x-1 text-xs">
                                   <span>💙 {skill.manaCost}</span>
                                   {isOnCooldown && (
                                     <span className="text-yellow-400">⏱️ {cooldownRemaining} turno{cooldownRemaining > 1 ? 's' : ''}</span>
                                   )}
                                 </div>
                               </button>
                             );
                           })}
                         </div>
                       </Card>
                     )}
                     
                     {/* Action Buttons */}
                     <div className="flex space-x-4">
                       <button
                         onClick={() => {
                           console.log('🔘 Attack button clicked');
                           handleAttack();
                         }}
                         className="px-6 py-3 rounded-lg font-bold transition-colors flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
                       >
                         <SwordIcon className="w-5 h-5" />
                         <span>Atacar</span>
                       </button>
                       
                       <button
                         onClick={() => {
                           setSelectedMonster(null);
                           // Reset skill cooldowns and buffs when fleeing
                           setSkillCooldowns({});
                           setActiveBuffs({});
                           setActiveDebuffs({});
                         }}
                         className="px-6 py-3 rounded-lg font-bold transition-colors bg-gray-600 hover:bg-gray-700 text-white"
                       >
                         Fugir
                       </button>
                     </div>
                   </div>
                </div>
              ) : (
                                 <div>
                   <p className="text-dark-text-secondary mb-4">Escolha um monstro para batalhar:</p>
                   
                   {/* Monster Level Filter */}
                   <div className="mb-6">
                     <div className="flex flex-wrap gap-4">
                       <div>
                         <label className="text-white text-sm font-semibold mb-2 block">Nível Mínimo:</label>
                         <select 
                           value={levelFilter} 
                           onChange={(e) => setLevelFilter(Number(e.target.value))}
                           className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
                         >
                           <option value={0}>Qualquer Nível</option>
                           <option value={1}>Nível 1+</option>
                           <option value={10}>Nível 10+</option>
                           <option value={25}>Nível 25+</option>
                           <option value={50}>Nível 50+</option>
                           <option value={100}>Nível 100+</option>
                           <option value={200}>Nível 200+</option>
                           <option value={500}>Nível 500+</option>
                         </select>
                       </div>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {MONSTERS
                       .filter(monster => {
                         // Filter by level only
                         if (levelFilter > 0 && monster.level < levelFilter) return false;
                         return true;
                       })
                       .map((monster) => (
                       <Card
                         key={monster.id}
                         onClick={() => handleStartBattle(monster)}
                         className="cursor-pointer hover:border-accent-purple hover:scale-105 transition-all duration-300"
                         variant="small"
                       >
                         <div className="text-center">
                           {monster.imagePath ? (
                             <div className="mb-3 flex justify-center">
                               <img 
                                 src={monster.imagePath} 
                                 alt={monster.name}
                                 className="w-20 h-20 object-contain rounded-lg bg-dark-bg-tertiary p-2 border border-dark-border-light"
                                 onError={(e) => {
                                   // Fallback para ícone se imagem não existir
                                   const target = e.target as HTMLImageElement;
                                   target.style.display = 'none';
                                   const parent = target.parentElement;
                                   if (parent) {
                                     const fallback = document.createElement('span');
                                     fallback.className = 'text-3xl';
                                     fallback.textContent = monster.icon;
                                     parent.appendChild(fallback);
                                   }
                                 }}
                               />
                             </div>
                           ) : (
                             <div className="text-3xl mb-2">{monster.icon}</div>
                           )}
                           <h4 className="text-white font-bold text-sm mb-1">{monster.name}</h4>
                           <p className="text-dark-text-secondary text-xs mb-2">Nível {monster.level}</p>
                           <div className="mt-2 space-y-1">
                             <p className="text-primary-yellow text-xs font-semibold">{monster.experience} EXP</p>
                             <p className="text-primary-green text-xs font-semibold">{monster.gold} Ouro</p>
                           </div>
                         </div>
                       </Card>
                     ))}
                   </div>
                </div>
              )}
            </Card>

                         {battleLog.length > 0 && (
               <div className="bg-gray-800 p-4 rounded-lg border border-custom">
                 <h4 className="text-white font-bold mb-2">Log de Batalha</h4>
                 <div className="space-y-1 max-h-60 overflow-y-auto">
                   {battleLog.map((log, index) => {
                     // Helper function to determine log color
                     const getLogColor = (message: string): string => {
                       // Drops encontrados, experiência e ouro - verde e negrito
                       if (message.includes('Encontrou:') || 
                           message.includes('Encontrou') ||
                           message.includes('Ganhou') && (message.includes('experiência') || message.includes('ouro'))) {
                         return 'text-green-400 font-bold';
                       }
                       
                       // Dano causado pelo jogador - roxo (verificar primeiro para evitar conflito)
                       if (message.includes('Você causou') || 
                           (message.includes('CRÍTICO') && message.includes('Você') && message.includes('causou')) ||
                           (message.includes('causou') && message.includes('dano com'))) {
                         return 'text-purple-400';
                       }
                       
                       // Dano recebido do monstro - vermelho
                       // Verifica se contém "causou" e "dano" mas não é do jogador
                       if (message.includes('causou') && message.includes('dano')) {
                         // Se não é do jogador, é do monstro
                         if (!message.includes('Você causou') && 
                             !message.includes('Você recuperou') &&
                             !message.includes('Você esquivou')) {
                           return 'text-red-400';
                         }
                       }
                       
                       // Dano de queimadura recebido - vermelho
                       if (message.includes('sofreu') && message.includes('dano')) {
                         return 'text-red-400';
                       }
                       
                       // CRÍTICO do monstro - vermelho
                       if (message.includes('CRÍTICO') && !message.includes('Você')) {
                         return 'text-red-400';
                       }
                       
                       // Default
                       return 'text-gray-300';
                     };

                     return (
                       <div 
                         key={index} 
                         className={`p-2 rounded ${
                           index < 2 ? 'bg-gray-700 border-l-4 border-yellow-400' : 'bg-gray-800'
                         }`}
                       >
                         <p className={`text-sm ${getLogColor(log)}`}>{log}</p>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
            </div>
          </div>
        );

      case 'skills':
        if (!user.characterClass) {
          return (
            <div className="min-h-screen relative">
              <div className="relative z-10">
                <Card className="text-center">
                  <p className="text-white text-lg">Você precisa escolher uma classe primeiro!</p>
                </Card>
              </div>
            </div>
          );
        }

        const availableSkills = getAvailableSkills();
        const playerSkills = user.skills || [];

        return (
          <div className="space-y-6 min-h-screen relative">
            <div className="relative z-10 space-y-6">
            <Card>
              <h3 className="text-3xl font-bold text-white mb-6">✨ Sistema de Skills</h3>
              <p className="text-dark-text-secondary mb-4">
                Melhore suas skills usando ouro. Cada nível aumenta o poder da skill em 10%.
              </p>
              <Card variant="small" className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Ouro Disponível:</span>
                  <span className="text-primary-yellow font-bold text-xl">{user.gold.toLocaleString()}</span>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableSkills.map((skill) => {
                  const playerSkill = playerSkills.find(ps => ps.skillId === skill.id);
                  const currentLevel = playerSkill?.level || 1;
                  const upgradeCost = SKILL_FORMULAS.calculateSkillUpgradeCost(currentLevel);
                  const canAfford = user.gold >= upgradeCost;
                  const scaledValue = SKILL_FORMULAS.calculateSkillEffectValue(skill.effect.value, currentLevel, skill.id);

                  return (
                    <Card
                      key={skill.id}
                      variant="small"
                      className="p-6 hover:border-accent-purple transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-4xl">{skill.icon}</span>
                          <div>
                            <h4 className="text-white font-bold text-lg">{skill.name}</h4>
                            <p className="text-dark-text-secondary text-xs">Nv. {currentLevel}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-dark-text-secondary text-sm mb-4 min-h-[40px]">{skill.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-dark-text-secondary">Efeito:</span>
                          <span className="text-white font-semibold">
                            {skill.effect.type === 'damage' && `${(scaledValue * 100).toFixed(0)}% dano`}
                            {skill.effect.type === 'heal' && `${(scaledValue * 100).toFixed(0)}% cura`}
                            {skill.effect.type === 'buff' && `${(scaledValue * 100).toFixed(0)}% buff`}
                            {skill.effect.type === 'debuff' && `${(scaledValue * 100).toFixed(0)}% debuff`}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-dark-text-secondary">Custo MP:</span>
                          <span className="text-blue-400 font-semibold">{skill.manaCost}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-dark-text-secondary">Cooldown:</span>
                          <span className="text-yellow-400 font-semibold">{skill.cooldown} turnos</span>
                        </div>
                      </div>

                      <div className="border-t border-dark-border pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-dark-text-secondary text-sm">Próximo nível:</span>
                          <span className="text-primary-yellow font-bold">{upgradeCost.toLocaleString()} 🪙</span>
                        </div>
                        <button
                          onClick={async () => {
                            const result = await upgradeSkill(skill.id);
                            if (!result.success) {
                              alert(result.error || 'Erro ao fazer upgrade da skill');
                            }
                          }}
                          disabled={!canAfford}
                          className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                            canAfford
                              ? 'bg-accent-purple hover:opacity-90 text-white'
                              : 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Upgrade para Nv.{currentLevel + 1}</span>
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
            </div>
          </div>
        );

      case 'pvp':
        return (
          <div className="min-h-screen relative">
            <div className="relative z-10">
          <PvPSystem
           onSearchOpponents={searchPvPOpponents}
           onStartBattle={startPvPBattle}
           onGetRanking={getPvPRanking}
           userPvPStats={user.pvpStats}
           userId={user.id}
          />
            </div>
          </div>
        );
      case 'guild':
        return (
          <div className="min-h-screen relative">
            <div className="relative z-10">
          <GuildSystem
            onCreateGuild={createGuild}
            onJoinGuild={joinGuild}
            onLeaveGuild={leaveGuild}
            onGetGuild={getGuild}
            onUpdateGuild={updateGuild}
            onGetRanking={getGuildRanking}
            onGuildBank={guildBank}
            userGuildId={user.guildId}
            userGuildRole={user.guildRole}
            userId={user.id}
            userGold={user.gold}
          />
            </div>
          </div>
        );

       case 'collection':
         return (
           <div className="space-y-6">
             <Card>
               <h3 className="text-2xl font-bold text-white mb-4">Sistema de Coleta</h3>
               
               <div className="mb-6">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-white font-semibold">Próxima Coleta:</span>
                   <span className="text-primary-yellow font-bold">
                     {Math.floor(collectionTimer / 60)}:{(collectionTimer % 60).toString().padStart(2, '0')}
                   </span>
                 </div>
                 <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
                   <div 
                     className="bg-accent-purple h-2 rounded-full transition-all duration-1000"
                     style={{ width: `${(((user.collection?.collectionInterval || 30) - collectionTimer) / (user.collection?.collectionInterval || 30)) * 100}%` }}
                   ></div>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {COLLECTION_SKILLS.map((skill) => {
                   const skillData = user.collection?.skills?.find(s => s.type === skill.type);
                   const level = skillData?.level || 1;
                   const experience = skillData?.experience || 0;
                   const experienceToNext = skillData?.experienceToNext || 50;
                   
                   return (
                     <Card key={skill.type} variant="small" className="flex flex-col h-full min-h-[280px]">
                       <div className="text-center mb-3 flex-grow flex flex-col">
                         {skill.imagePath ? (
                           <div className="flex justify-center mb-3">
                             <img 
                               src={skill.imagePath} 
                               alt={skill.name}
                               className="w-24 h-24 object-contain"
                               onError={(e) => {
                                 // Fallback para ícone se imagem não existir
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = 'none';
                                 const parent = target.parentElement;
                                 if (parent) {
                                   const fallback = document.createElement('div');
                                   fallback.className = 'text-4xl';
                                   fallback.textContent = skill.icon;
                                   parent.appendChild(fallback);
                                 }
                               }}
                             />
                           </div>
                         ) : (
                           <div className="text-4xl mb-3">{skill.icon}</div>
                         )}
                         <h4 className="text-white font-bold mb-1">{skill.name}</h4>
                         <p className="text-dark-text-secondary text-xs flex-grow">{skill.description}</p>
                       </div>
                       
                       <div className="mb-3 mt-auto">
                         <div className="flex justify-between text-sm mb-1">
                           <span className="text-dark-text-secondary">Nível {level}</span>
                           <span className="text-primary-yellow">{experience}/{experienceToNext} EXP</span>
                         </div>
                         <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
                           <div 
                             className="bg-primary-yellow h-2 rounded-full transition-all duration-300"
                             style={{ width: `${(experience / experienceToNext) * 100}%` }}
                           ></div>
                         </div>
                       </div>
                       
                       <button
                         onClick={() => handleCollectResources(skill.type)}
                         disabled={collectionTimer > 0}
                         className={`w-full px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                           collectionTimer <= 0
                             ? 'bg-accent-purple hover:opacity-90 text-white'
                             : 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                         }`}
                       >
                         <Target className="w-4 h-4" />
                         <span>
                           {collectionTimer <= 0 
                             ? 'Coletar' 
                             : `Coletar (${Math.floor(collectionTimer / 60)}:${(collectionTimer % 60).toString().padStart(2, '0')})`
                           }
                         </span>
                       </button>
                     </Card>
                   );
                 })}
               </div>
             </Card>
           </div>
         );

       case 'rest':
         return (
           <div className="space-y-6 min-h-screen relative">
             <div className="relative z-10 space-y-6">
             <Card>
               <h3 className="text-2xl font-bold text-white mb-4">Sistema de Descanso</h3>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Descanso Gratuito */}
                 <Card variant="small" className="p-6">
                   <div className="text-center mb-4">
                     <div className="flex justify-center mb-3">
                       <img 
                         src="/images/ui/Descanso.png" 
                         alt="Descanso"
                         className="w-24 h-24 object-contain"
                         onError={(e) => {
                           // Fallback para emoji se imagem não existir
                           const target = e.target as HTMLImageElement;
                           target.style.display = 'none';
                           const parent = target.parentElement;
                           if (parent) {
                             const fallback = document.createElement('div');
                             fallback.className = 'text-4xl mb-2';
                             fallback.textContent = '😴';
                             parent.appendChild(fallback);
                           }
                         }}
                       />
                     </div>
                     <h4 className="text-white font-bold text-xl">Descanso Gratuito</h4>
                     <p className="text-dark-text-secondary text-sm mt-2">
                       Recupera HP e MP completos sem custo
                     </p>
                   </div>
                   
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-dark-text-secondary">Tempo de Cooldown:</span>
                      <span className="text-primary-yellow font-bold">
                        {(() => {
                          const userLevel = user.stats?.level || user.level || 1;
                          const cooldownMinutes = userLevel <= 4 ? 1 : 1 + Math.floor((userLevel - 1) / 5);
                          return `${cooldownMinutes} minuto(s)`;
                        })()}
                      </span>
                    </div>
                    <div className="text-xs text-dark-text-muted mb-2">
                      {(user.stats?.level || user.level || 1) <= 4 
                        ? 'Level 1-4: 1 minuto de cooldown'
                        : 'Base: 1 minuto + 1 minuto a cada 5 níveis'}
                    </div>
                    
                  </div>
                  
                  <button
                    onClick={handleRest}
                    disabled={restCooldown > 0}
                    className={`w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      restCooldown <= 0
                        ? 'bg-accent-purple hover:opacity-90 text-white'
                        : 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>
                      {restCooldown <= 0 
                        ? 'Descansar' 
                        : `Descansar (${Math.floor(restCooldown / 60)}:${(restCooldown % 60).toString().padStart(2, '0')})`
                      }
                    </span>
                  </button>
                 </Card>
                 
                 {/* Status Atual */}
                 <Card variant="small" className="p-6">
                   <h4 className="text-white font-bold mb-4">Status Atual</h4>
                   
                   <div className="space-y-4">
                     <div>
                       <div className="flex justify-between text-sm mb-1">
                         <span className="text-dark-text-secondary">Vida:</span>
                         <span className="text-white font-bold">
                           {user.stats?.health || user.health || 100}/{user.stats?.maxHealth || user.maxHealth || 100}
                         </span>
                       </div>
                       <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
                         <div 
                           className="bg-gradient-to-r from-red-500 to-rose-600 h-2 rounded-full transition-all duration-300"
                           style={{ width: `${((user.stats?.health || user.health || 100) / (user.stats?.maxHealth || user.maxHealth || 100)) * 100}%` }}
                         ></div>
                       </div>
                     </div>
                     
                     <div>
                       <div className="flex justify-between text-sm mb-1">
                         <span className="text-dark-text-secondary">Mana:</span>
                         <span className="text-white font-bold">
                           {user.stats?.mana || user.mana || 50}/{user.stats?.maxMana || user.maxMana || 50}
                         </span>
                       </div>
                       <div className="w-full bg-dark-bg-tertiary rounded-full h-2">
                         <div 
                           className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                           style={{ width: `${((user.stats?.mana || user.mana || 50) / (user.stats?.maxMana || user.maxMana || 50)) * 100}%` }}
                         ></div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="mt-4 p-3 bg-dark-bg-tertiary rounded-lg">
                     <h5 className="text-white font-semibold mb-2">Informações:</h5>
                     <ul className="text-xs text-dark-text-secondary space-y-1">
                       <li>• Descanso recupera HP e MP ao máximo</li>
                       <li>• Tempo aumenta com o nível do personagem</li>
                       <li>• Alternativa gratuita às poções</li>
                       <li>• Ideal para jogadores sem ouro</li>
                     </ul>
                   </div>
                 </Card>
               </div>
             </Card>
           </div>
           </div>
         );

      case 'market':
        return (
          <div className="relative">
            <MarketSystem
              onListMarketItems={listMarketItems}
              onAddMarketItem={addMarketItem}
              onBuyMarketItem={buyMarketItem}
              onRemoveMarketItem={removeMarketItem}
              onBuyShopItem={buyShopItem}
              onUpdateProfileImage={updateProfileImage}
              userId={user.id}
              userGold={user.gold}
              userDiamonds={user.diamonds || 0}
              userInventory={user.inventory || []}
              purchasedItems={user.purchasedItems || []}
              profileImage={user.profileImage}
            />
          </div>
        );

      case 'world':
        return (
          <div className="space-y-6 min-h-screen relative">
            <div className="relative z-10 space-y-6">
            <Card>
              <h3 className="text-2xl font-bold text-white mb-4">Mapa do Mundo</h3>
              <p className="text-dark-text-secondary">Explore o vasto mundo do RPG Browser!</p>
            </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Early returns for modals and special states
  if (showClassSelection) {
    return <ClassSelection onClassSelected={handleClassSelected} />;
  }

  // Show attribute distribution if user has chosen class but not distributed points
  if (showAttributeDistribution && selectedCharacterClass) {
    return <AttributeDistribution characterClass={selectedCharacterClass} onAttributesConfirmed={handleAttributesConfirmed} />;
  }

  // Show level up attribute distribution if user has available points
  if (showLevelUpDistribution && user && user.availablePoints > 0) {
    return (
      <LevelUpAttributeDistribution
        characterClass={user.characterClass!}
        currentAttributes={user.attributes}
        availablePoints={user.availablePoints}
        userLevel={user.stats?.level || user.level || 1}
        onAttributesConfirmed={handleLevelUpAttributesConfirmed}
        onCancel={() => setShowLevelUpDistribution(false)}
      />
    );
  }

  // Show death message modal
  if (showDeathMessage && deathInfo) {
    return (
      <div className="min-h-screen bg-black bg-opacity-75 flex items-center justify-center p-4 z-[9999] fixed inset-0">
        <Card className="max-w-md w-full text-center" style={{ backgroundColor: 'rgba(139, 0, 0, 0.9)', borderColor: '#dc2626' }}>
          <div className="text-6xl mb-4">💀</div>
          <h2 className="text-3xl font-bold text-white mb-4">Você Morreu!</h2>
          
          <div className="bg-red-800 p-4 rounded-lg mb-6">
            <p className="text-white text-lg mb-2">
              Você foi derrotado por <span className="font-bold text-red-300">{deathInfo.monsterName}</span>
            </p>
            <p className="text-red-200 text-sm">
              Perdeu <span className="font-bold">{deathInfo.experienceLost}</span> pontos de experiência
            </p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h3 className="text-white font-bold mb-2">Para se recuperar:</h3>
            <ul className="text-gray-300 text-sm space-y-1 text-left">
              <li>• Use poções de vida no inventário</li>
              <li>• Vá para a aba "Descanso" para recuperar HP/MP</li>
              <li>• Escolha monstros mais fracos para treinar</li>
              <li>• Melhore seus atributos para ficar mais forte</li>
            </ul>
          </div>
          
          <button
            onClick={() => {
              setShowDeathMessage(false);
              setDeathInfo(null);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
          >
            Entendi
          </button>
        </Card>
      </div>
    );
  }

  // Show sell all modal
  if (showSellAllModal) {
    const allItems = getStackedInventory();
    const totalGold = selectedItemsToSell.reduce((total, selectedItem) => {
      const item = allItems.find(i => i.id === selectedItem.itemId);
      return total + (item ? item.value * selectedItem.amount : 0);
    }, 0);

    return (
      <div className="min-h-screen bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] fixed inset-0">
        <Card className="max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">⚠️ Vender TUDO</h2>
            <button
              onClick={() => {
                setShowSellAllModal(false);
                setSelectedItemsToSell([]);
              }}
              className="text-dark-text-muted hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <Card variant="small" className="mb-6">
            <p className="text-white font-semibold mb-4">
              Você está prestes a vender TODOS os itens do inventário!
            </p>
            <p className="text-dark-text-secondary text-sm mb-4">
              Total de itens: <span className="text-white font-bold">{selectedItemsToSell.length}</span>
            </p>
            
            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
              {selectedItemsToSell.map((selectedItem, index) => {
                const item = allItems.find(i => i.id === selectedItem.itemId);
                if (!item) return null;
                
                return (
                  <div key={index} className="flex justify-between text-sm bg-dark-bg-tertiary p-2 rounded">
                    <span className="text-white">{item.name} x{selectedItem.amount}</span>
                    <span className="text-primary-yellow font-bold">{item.value * selectedItem.amount} ouro</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-dark-border">
              <span className="text-white font-bold text-lg">Total a receber:</span>
              <span className="text-primary-yellow font-bold text-xl">{totalGold.toLocaleString()} ouro</span>
            </div>
          </Card>

          <div className="flex space-x-4">
            <button
              onClick={async () => {
                if (selectedItemsToSell.length === 0) return;
                
                const result = await sellItems(selectedItemsToSell);
                
                if (result.success) {
                  setBattleLog(prev => [
                    result.message || `Todos os itens foram vendidos por ${totalGold.toLocaleString()} ouro!`,
                    ...prev
                  ]);
                  setShowSellAllModal(false);
                  setSelectedItemsToSell([]);
                } else {
                  alert('Erro ao vender itens. Tente novamente.');
                }
              }}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
            >
              Confirmar Venda de TUDO
            </button>
            <button
              onClick={() => {
                setShowSellAllModal(false);
                setSelectedItemsToSell([]);
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Show sell modal
  if (showSellModal) {
    return (
      <div className="min-h-screen bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999] fixed inset-0">
        <div className="bg-gray-900 p-6 rounded-2xl border-2 border-custom max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Vender Itens</h2>
            <button
              onClick={() => {
                setShowSellModal(false);
                setSelectedItemsToSell([]);
              }}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {selectedItemsToSell.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-300 mb-4">Selecione itens para vender:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getStackedInventory().map((item, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg border border-custom cursor-pointer hover:border-yellow-400 transition-colors">
                    <div className="flex items-center space-x-3">
                      {item.imagePath ? (
                        <img
                          src={item.imagePath}
                          alt={item.name}
                          className="w-10 h-10 object-contain flex-shrink-0"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('span');
                              fallback.className = 'text-2xl';
                              fallback.textContent = item.icon;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-2xl">{item.icon}</span>
                      )}
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{item.name}</h4>
                        <p className="text-gray-400 text-sm">{formatItemDescription(item)}</p>
                        <p className="text-primary-yellow text-sm">Valor: {item.value} ouro</p>
                        {item.amount > 1 && (
                          <p className="text-blue-400 text-sm font-bold">x{item.amount}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectItemForSale(item.id, item.amount)}
                      className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-bold"
                    >
                      Selecionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-custom">
                <h3 className="text-white font-bold mb-4">Itens Selecionados:</h3>
                {selectedItemsToSell.map((selectedItem, index) => {
                  const item = getStackedInventory().find(i => i.id === selectedItem.itemId);
                  if (!item) return null;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-2">
                      <div className="flex items-center space-x-3">
                        {item.imagePath ? (
                          <img
                            src={item.imagePath}
                            alt={item.name}
                            className="w-8 h-8 object-contain flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('span');
                                fallback.className = 'text-xl';
                                fallback.textContent = item.icon;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-xl">{item.icon}</span>
                        )}
                        <div>
                          <h4 className="text-white font-bold">{item.name}</h4>
                          <p className="text-primary-yellow text-sm">{item.value} ouro cada</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max={item.amount}
                          value={selectedItem.amount}
                          onChange={(e) => handleUpdateSaleAmount(selectedItem.itemId, parseInt(e.target.value) || 1)}
                          className="w-16 bg-gray-600 text-white px-2 py-1 rounded text-center"
                        />
                        <span className="text-gray-300">/ {item.amount}</span>
                        <button
                          onClick={() => handleRemoveItemFromSale(selectedItem.itemId)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-custom">
                <h3 className="text-white font-bold mb-2">Resumo da Venda:</h3>
                <div className="space-y-2">
                  {selectedItemsToSell.map((selectedItem, index) => {
                    const item = getStackedInventory().find(i => i.id === selectedItem.itemId);
                    if (!item) return null;
                    
                    return (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.name} x{selectedItem.amount}</span>
                        <span className="text-primary-yellow font-bold">{item.value * selectedItem.amount} ouro</span>
                      </div>
                    );
                  })}
                  <hr className="border-gray-600 my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-primary-yellow">
                      {selectedItemsToSell.reduce((total, selectedItem) => {
                        const item = getStackedInventory().find(i => i.id === selectedItem.itemId);
                        return total + (item ? item.value * selectedItem.amount : 0);
                      }, 0)} ouro
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSellItems}
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
                >
                  Confirmar Venda
                </button>
                <button
                  onClick={() => {
                    setShowSellModal(false);
                    setSelectedItemsToSell([]);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen content-layer relative">
      {/* Background fixo atrás de tudo para todas as abas */}
      <div 
        className="fixed inset-0"
        style={{
          ...getTabBackgroundStyle(activeTab),
          backgroundAttachment: 'fixed',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      {/* Top Navigation */}
      <nav className="relative z-10 bg-dark-bg-secondary bg-opacity-80 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sword className="w-8 h-8 text-accent-purple" />
              <span className="text-2xl font-bold text-white">RPG Browser</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-dark-bg-tertiary px-4 py-2 rounded-lg border border-dark-border">
                <Coins className="w-5 h-5 text-primary-yellow" />
                <span className="font-semibold text-dark-text">{user.gold.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 bg-dark-bg-tertiary px-4 py-2 rounded-lg border border-dark-border">
                <Gem className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-dark-text">{user.diamonds?.toLocaleString() || 0}</span>
                <button
                  onClick={() => setShowDiscordModal(true)}
                  className="ml-2 w-5 h-5 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-colors rounded-full hover:bg-cyan-400/20"
                  title="Comprar diamantes"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={async () => {
                    const result = await refreshUser();
                    if (result.success) {
                      alert('Dados atualizados do servidor!');
                    } else {
                      alert('Erro ao atualizar: ' + (result.error || 'Erro desconhecido'));
                    }
                  }}
                  className="ml-1 w-5 h-5 flex items-center justify-center text-dark-text-muted hover:text-white transition-colors rounded-full hover:bg-dark-bg-tertiary"
                  title="Atualizar dados do servidor"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center space-x-2 bg-dark-bg-tertiary px-4 py-2 rounded-lg border border-dark-border">
                <Star className="w-5 h-5 text-accent-purple" />
                <span className="font-semibold text-dark-text">Lv.{user.stats?.level || user.level || 1}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center space-x-2 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <div className="w-64 bg-dark-bg-secondary border-r border-dark-border min-h-screen relative z-10">
          <div className="p-4">
            <Card className="mb-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex justify-center">
                  <ProfileImage
                    profileImage={user.profileImage}
                    characterClass={user.characterClass}
                    characterGender={characterGender}
                    size="large"
                    showEditButton={true}
                    purchasedItems={user.purchasedItems || []}
                    onUpdateProfileImage={updateProfileImage}
                    onOpenEditModal={() => setShowEditProfileImage(true)}
                  />
                </div>
                <h3 className="text-dark-text font-bold text-xl">{user.nickname}</h3>
                <p className="text-dark-text-secondary text-sm mt-1">Nível {user.stats?.level || user.level || 1}</p>
                {user.characterClass && (
                  <p className="text-accent-purple text-sm font-semibold mt-1">{CHARACTER_CLASSES[user.characterClass].name}</p>
                )}
              </div>
            </Card>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-purple-gradient text-white shadow-lg'
                        : 'text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Discord Contact Modal */}
      {showDiscordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow max-w-md w-full" style={{ position: 'relative', zIndex: 100000 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Comprar Diamantes</h3>
              <button
                onClick={() => setShowDiscordModal(false)}
                className="text-dark-text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-white text-center">
                Entre em contato com o Desenvolvedor <span className="font-bold text-accent-purple">Delita</span> no Discord:
              </p>
              
              <div className="bg-dark-bg-tertiary p-4 rounded-lg border border-dark-border">
                <a
                  href="https://discord.gg/SSufkA7EJV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-cyan-400 hover:text-cyan-300 font-semibold transition-colors break-all"
                >
                  discord.gg/SSufkA7EJV
                </a>
              </div>
              
              <button
                onClick={() => setShowDiscordModal(false)}
                className="w-full bg-accent-purple hover:bg-accent-purple/80 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Image Section */}
      {showEditProfileImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{ position: 'relative', zIndex: 100000 }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Selecionar Foto de Perfil</h3>
              <button
                onClick={() => setShowEditProfileImage(false)}
                className="text-dark-text-muted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Default Character Image */}
              {user.characterClass && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Imagem do Personagem</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {(['male', 'female'] as const).map((gender) => {
                      const charImage = gender === 'female' 
                        ? `/images/characters/${user.characterClass === 'warrior' ? 'Guerreira' : user.characterClass === 'archer' ? 'Arqueira' : 'Maga'}.png`
                        : `/images/characters/${user.characterClass === 'warrior' ? 'Guerreiro' : user.characterClass === 'archer' ? 'Arqueiro' : 'Mago'}.png`;
                      const isSelected = !user.profileImage && characterGender === gender;
                      
                      return (
                        <div
                          key={gender}
                          className={`relative p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                            isSelected ? 'border-accent-purple' : 'border-dark-border hover:border-accent-purple/50'
                          }`}
                          onClick={async () => {
                            const result = await updateProfileImage(charImage);
                            if (result.success) {
                              setShowEditProfileImage(false);
                            }
                          }}
                        >
                          <img
                            src={charImage}
                            alt={gender === 'male' ? 'Masculino' : 'Feminino'}
                            className="w-full aspect-square object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-full aspect-square bg-dark-bg-tertiary rounded-lg flex items-center justify-center text-4xl';
                                fallback.textContent = CHARACTER_CLASSES[user.characterClass as CharacterClass].icon;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                          <div className="text-center mt-2 text-white text-sm">
                            {gender === 'male' ? 'Masculino' : 'Feminino'}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-accent-purple rounded-full p-1">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Purchased Profile Images */}
              {(user.purchasedItems || []).length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Fotos Compradas</h4>
                  <div className="grid grid-cols-4 gap-4">
                    {SHOP_ITEMS.filter(item => item.type === 'profile_image' && (user.purchasedItems || []).includes(item.id)).map((shopItem) => {
                      const isSelected = user.profileImage === shopItem.imagePath;
                      
                      return (
                        <div
                          key={shopItem.id}
                          className={`relative p-2 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                            isSelected ? 'border-accent-purple' : 'border-dark-border hover:border-accent-purple/50'
                          }`}
                          onClick={async () => {
                            if (shopItem.imagePath) {
                              const result = await updateProfileImage(shopItem.imagePath);
                              if (result.success) {
                                setShowEditProfileImage(false);
                              }
                            }
                          }}
                        >
                          {shopItem.imagePath ? (
                            <img
                              src={shopItem.imagePath}
                              alt={shopItem.name}
                              className="w-full aspect-square object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-full aspect-square bg-dark-bg-tertiary rounded-lg flex items-center justify-center text-2xl';
                                  fallback.textContent = shopItem.icon;
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full aspect-square bg-dark-bg-tertiary rounded-lg flex items-center justify-center text-2xl">
                              {shopItem.icon}
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-accent-purple rounded-full p-1">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(user.purchasedItems || []).length === 0 && (
                <div className="text-center py-8 text-dark-text-secondary">
                  Você ainda não possui fotos de perfil compradas. Compre algumas na loja NPC!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
