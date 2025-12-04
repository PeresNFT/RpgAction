'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ClassSelection } from '@/components/ClassSelection';
import { AttributeDistribution } from '@/components/AttributeDistribution';
import { LevelUpAttributeDistribution } from '@/components/LevelUpAttributeDistribution';
import { PvPSystem } from '@/components/PvPSystem';
import { GuildSystem } from '@/components/GuildSystem';
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
  Sword as SwordIcon,
  Shield as ShieldIcon,
  Zap as ZapIcon,
  Trophy
} from 'lucide-react';
import { CharacterClass, Attributes, Monster, Item } from '@/types/game';
import { CHARACTER_CLASSES, MONSTERS, ITEMS, GAME_FORMULAS, COLLECTION_SKILLS, COLLECTION_RESOURCES, generateNewMonsterOfSameLevel, applyLevelPenalty } from '@/data/gameData';

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
  const { user, logout, updateCharacter, updateExperience, updateAttributes, updateHealth, useItem, rest, sellItems, updateCollection, searchPvPOpponents, startPvPBattle, getPvPRanking, createGuild, joinGuild, leaveGuild, getGuild, updateGuild, getGuildRanking, guildBank, contributeExperience, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('character');
  const [showClassSelection, setShowClassSelection] = useState(false);
  const [showAttributeDistribution, setShowAttributeDistribution] = useState(false);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [collectionTimer, setCollectionTimer] = useState(0);
  const [selectedCharacterClass, setSelectedCharacterClass] = useState<CharacterClass | null>(null);
  const [showLevelUpDistribution, setShowLevelUpDistribution] = useState(false);
  const [levelFilter, setLevelFilter] = useState<number>(0);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItemsToSell, setSelectedItemsToSell] = useState<Array<{itemId: string, amount: number}>>([]);

  const [showDeathMessage, setShowDeathMessage] = useState(false);
  const [deathInfo, setDeathInfo] = useState<{monsterName: string, experienceLost: number} | null>(null);
  const [currentMonsterHealth, setCurrentMonsterHealth] = useState<number>(0);
  
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
    const result = await rest();
    
    if (result.success) {
      setBattleLog(prev => [
        result.message || 'Descansou e recuperou HP/MP!',
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
  const getStackedInventory = () => {
    if (!user?.inventory) return [];
    
    const stacked: { [key: string]: any } = {};
    
    user.inventory.forEach(item => {
      const key = item.id;
      if (stacked[key]) {
        stacked[key].amount = (stacked[key].amount || 1) + (item.amount || 1);
      } else {
        stacked[key] = { ...item, amount: item.amount || 1 };
      }
    });
    
    return Object.values(stacked);
  };

  const handleStartBattle = (monster: Monster) => {
    console.log('🎯 Starting battle against:', monster.name, 'with health:', monster.health);
    setSelectedMonster(monster);
    setCurrentMonsterHealth(monster.health);
    setBattleLog([`Iniciou batalha contra ${monster.name}!`]);
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

    // Player attack
    const playerAttack = user.stats?.attack || 20;
    const playerCriticalChance = user.stats?.criticalChance || 5;
    const playerDodgeChance = user.stats?.dodgeChance || 4;
    
    // Check for critical hit
    const isPlayerCritical = Math.random() * 100 < playerCriticalChance;
    const playerDamage = Math.max(1, playerAttack - selectedMonster.defense);
    const finalPlayerDamage = isPlayerCritical ? Math.floor(playerDamage * 1.5) : playerDamage;
    
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

    // Monster attacks back
    const monsterAttack = selectedMonster.attack;
    const monsterCriticalChance = selectedMonster.stats?.criticalChance || 5;
    const monsterDodgeChance = selectedMonster.stats?.dodgeChance || 4;
    
    const playerDodged = Math.random() * 100 < playerDodgeChance;
    
    if (playerDodged) {
      battleLogEntries.push(`⚡ Você esquivou o ataque de ${selectedMonster.name}!`);
      console.log('Player dodged monster attack');
    } else {
      const isMonsterCritical = Math.random() * 100 < monsterCriticalChance;
      const monsterDamage = Math.max(1, monsterAttack - (user.stats?.defense || 15));
      const finalMonsterDamage = isMonsterCritical ? Math.floor(monsterDamage * 1.5) : monsterDamage;
      
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

  const tabs = [
    { id: 'character', label: 'Personagem', icon: Crown },
    { id: 'profile', label: 'Perfil', icon: Users },
    { id: 'inventory', label: 'Inventário', icon: Package },
    { id: 'battle', label: 'Batalha', icon: Sword },
    { id: 'pvp', label: 'PvP', icon: Trophy },
    { id: 'collection', label: 'Coleta', icon: Target },
    { id: 'rest', label: 'Descanso', icon: Heart },
    { id: 'guild', label: 'Guild', icon: Shield },
    { id: 'market', label: 'Mercado', icon: Zap },
    { id: 'world', label: 'Mundo', icon: Map },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'character':
        return (
          <div className="space-y-6">
            <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
              <h3 className="text-3xl font-bold text-white mb-6">Informações do Personagem</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Nome:</span> <span className="text-accent-purple">{user.nickname}</span></p>
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Classe:</span> <span className="text-accent-cyan">{user.characterClass ? CHARACTER_CLASSES[user.characterClass].name : 'Não escolhida'}</span></p>
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Nível:</span> <span className="text-primary-yellow font-bold">{user.stats?.level || user.level || 1}</span></p>
                  <div>
                    <p className="text-dark-text-secondary text-sm mb-1">Experiência: {user.stats?.experience || user.experience || 0}/{user.stats?.experienceToNext || 100}</p>
                    <div className="w-full bg-dark-bg-tertiary rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary-yellow to-orange-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${((user.stats?.experience || user.experience || 0) / (user.stats?.experienceToNext || 100)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Ouro:</span> <span className="text-primary-yellow font-bold">{user.gold}</span></p>
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Pontos Disponíveis:</span> <span className="text-accent-purple font-bold">{user.availablePoints}</span></p>
                  <p className="text-dark-text"><span className="text-dark-text font-semibold">Guild:</span> <span className="text-accent-cyan">{user.guildId || 'Nenhuma'}</span></p>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Heart className="w-6 h-6 text-red-400" />
                  </div>
                  <h4 className="text-xl font-bold text-dark-text">Vida</h4>
                </div>
                <div className="text-3xl font-bold text-dark-text mb-2">{user.stats?.health || user.health || 100}/{user.stats?.maxHealth || user.maxHealth || 100}</div>
                <div className="w-full bg-dark-bg-tertiary rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-rose-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${((user.stats?.health || user.health || 100) / (user.stats?.maxHealth || user.maxHealth || 100)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-dark-text">Mana</h4>
                </div>
                <div className="text-3xl font-bold text-dark-text mb-2">{user.stats?.mana || user.mana || 50}/{user.stats?.maxMana || user.maxMana || 50}</div>
                <div className="w-full bg-dark-bg-tertiary rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${((user.stats?.mana || user.mana || 50) / (user.stats?.maxMana || user.maxMana || 50)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Coins className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h4 className="text-xl font-bold text-dark-text">Ouro</h4>
                </div>
                <div className="text-3xl font-bold text-primary-yellow mb-2">{user.gold}</div>
                <p className="text-dark-text-secondary text-sm">Moeda</p>
              </div>
            </div>

            <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
              <h4 className="text-2xl font-bold text-dark-text mb-6">Atributos</h4>
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
                  <span className="text-dark-text-secondary">Vitalidade:</span>
                  <span className="text-cyan-400 font-bold text-lg">{user.attributes?.vitality || 10}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-custom">
              <h4 className="text-xl font-bold text-white mb-4">Status de Combate</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-text-secondary">Ataque:</span>
                  <span className="text-white font-bold">{user.stats?.attack || 20}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-text-secondary">Defesa:</span>
                  <span className="text-white font-bold">{user.stats?.defense || 15}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-text-secondary">Crítico:</span>
                  <span className="text-white font-bold">{(user.stats?.criticalChance || 5).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-text-secondary">Esquiva:</span>
                  <span className="text-white font-bold">{(user.stats?.dodgeChance || 4).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
                 );

       case 'profile':
         return (
           <div className="space-y-6">
             <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
               <h3 className="text-3xl font-bold text-white mb-6">Perfil de Equipamentos</h3>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Character Model */}
                 <div className="bg-dark-bg-card p-6 rounded-xl border border-dark-border">
                   <h4 className="text-white font-bold mb-4 text-center">Personagem</h4>
                   <div className="flex flex-col items-center space-y-4">
                     {/* Head */}
                     <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                       {user.equippedItems?.helmet ? (
                         <span className="text-2xl">{user.equippedItems.helmet.icon}</span>
                       ) : (
                         <span className="text-dark-text-muted text-sm">Capacete</span>
                       )}
                     </div>
                     
                     {/* Body */}
                     <div className="flex space-x-4">
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                         {user.equippedItems?.weapon ? (
                           <span className="text-2xl">{user.equippedItems.weapon.icon}</span>
                         ) : (
                           <span className="text-dark-text-muted text-sm">Arma</span>
                         )}
                       </div>
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                         {user.equippedItems?.armor ? (
                           <span className="text-2xl">{user.equippedItems.armor.icon}</span>
                         ) : (
                           <span className="text-dark-text-muted text-sm">Armadura</span>
                         )}
                       </div>
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                         {user.equippedItems?.offhand ? (
                           <span className="text-2xl">{user.equippedItems.offhand.icon}</span>
                         ) : (
                           <span className="text-dark-text-muted text-sm">2ª Mão</span>
                         )}
                       </div>
                     </div>
                     
                     {/* Legs and Feet */}
                     <div className="flex space-x-4">
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                         {user.equippedItems?.pants ? (
                           <span className="text-2xl">{user.equippedItems.pants.icon}</span>
                         ) : (
                           <span className="text-dark-text-muted text-sm">Calça</span>
                         )}
                       </div>
                       <div className="w-16 h-16 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                         {user.equippedItems?.boots ? (
                           <span className="text-2xl">{user.equippedItems.boots.icon}</span>
                         ) : (
                           <span className="text-dark-text-muted text-sm">Bota</span>
                         )}
                       </div>
                     </div>
                     
                     {/* Accessories */}
                     <div className="flex space-x-4">
                       <div className="w-12 h-12 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                         {user.equippedItems?.ring ? (
                           <span className="text-lg">{user.equippedItems.ring.icon}</span>
                         ) : (
                           <span className="text-dark-text-muted text-xs">Anel</span>
                         )}
                       </div>
                       <div className="w-12 h-12 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                         {user.equippedItems?.amulet ? (
                           <span className="text-lg">{user.equippedItems.amulet.icon}</span>
                         ) : (
                           <span className="text-dark-text-muted text-xs">Amuleto</span>
                         )}
                       </div>
                       <div className="w-12 h-12 bg-dark-bg-tertiary rounded-lg border-2 border-dashed border-dark-border-light flex items-center justify-center">
                         {user.equippedItems?.relic ? (
                           <span className="text-lg">{user.equippedItems.relic.icon}</span>
                         ) : (
                           <span className="text-dark-text-muted text-xs">Relíquia</span>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 {/* Equipment Stats */}
                 <div className="bg-dark-bg-card p-6 rounded-xl border border-dark-border">
                   <h4 className="text-white font-bold mb-4">Bônus de Equipamentos</h4>
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <span className="text-dark-text-secondary">Força:</span>
                       <span className="text-white font-bold">+0</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-dark-text-secondary">Magia:</span>
                       <span className="text-white font-bold">+0</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-dark-text-secondary">Destreza:</span>
                       <span className="text-white font-bold">+0</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-dark-text-secondary">Agilidade:</span>
                       <span className="text-white font-bold">+0</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-dark-text-secondary">Vitalidade:</span>
                       <span className="text-white font-bold">+0</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         );

       case 'inventory':
        return (
          <div className="space-y-6">
            <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-white">Inventário</h3>
                <button
                  onClick={() => setShowSellModal(true)}
                  className="bg-purple-gradient hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 shadow-lg"
                >
                  <Coins className="w-5 h-5" />
                  <span>Vender Itens</span>
                </button>
              </div>
              
              {(user.inventory?.length || 0) === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-dark-text-muted" />
                  <p className="text-dark-text-secondary text-lg">Seu inventário está vazio</p>
                  <p className="text-dark-text-muted text-sm mt-2">Derrote monstros para coletar itens!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      <div 
                        key={index} 
                        className={`${rarityColors[rarity] || rarityColors.common} p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                      >
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <span className="text-3xl">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-dark-text font-bold text-sm truncate">{item.name}</h4>
                                <p className="text-dark-text-secondary text-xs mt-1 line-clamp-2">{item.description}</p>
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
                          
                          <div className="flex flex-col space-y-2 pt-2">
                            {(item.type === 'weapon' || item.type === 'armor') && (
                              <button className="bg-accent-purple hover:bg-accent-purple-dark text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                                <SwordIcon className="w-4 h-4" />
                                <span>Equipar</span>
                              </button>
                            )}
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
                              onClick={() => handleSelectItemForSale(item.id, item.amount)}
                              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <Coins className="w-4 h-4" />
                              <span>Vender</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'battle':
        return (
          <div className="space-y-6">
            <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
              <h3 className="text-3xl font-bold text-white mb-6">Arena de Batalha</h3>
              
                             {selectedMonster ? (
                 <div className="space-y-4">
                                       {/* Player Health Bar */}
                    <div className="bg-dark-bg-card p-6 rounded-2xl border border-dark-border card-glow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {getCharacterImagePath(user.characterClass, characterGender === 'female') ? (
                            <div className="relative cursor-pointer" onClick={toggleCharacterGender} title="Clique para alternar entre masculino/feminino">
                              <img 
                                src={getCharacterImagePath(user.characterClass, characterGender === 'female')!} 
                                alt={user.characterClass ? CHARACTER_CLASSES[user.characterClass].name : 'Personagem'}
                                className="w-20 h-20 object-contain rounded-lg hover:opacity-80 transition-opacity"
                                onError={(e) => {
                                  // Fallback para ícone se imagem não existir
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('span');
                                    fallback.className = 'text-4xl cursor-pointer';
                                    fallback.textContent = user.characterClass ? CHARACTER_CLASSES[user.characterClass].icon : '👤';
                                    fallback.onclick = toggleCharacterGender;
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <span 
                              className="text-4xl cursor-pointer hover:opacity-80 transition-opacity" 
                              onClick={toggleCharacterGender}
                              title="Clique para alternar entre masculino/feminino"
                            >
                              {user.characterClass ? CHARACTER_CLASSES[user.characterClass].icon : '👤'}
                            </span>
                          )}
                          <div>
                            <h4 className="text-white font-bold text-xl">{user.nickname}</h4>
                            <p className="text-dark-text-secondary">Nível {user.stats?.level || user.level || 1}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{user.stats?.health || user.health || 100}/{user.stats?.maxHealth || user.maxHealth || 100}</div>
                          <div className="w-32 bg-dark-bg-tertiary rounded-full h-2.5 mt-1">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${((user.stats?.health || user.health || 100) / (user.stats?.maxHealth || user.maxHealth || 100)) * 100}%` }}
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
                    </div>

                   {/* Monster Health Bar */}
                   <div className="bg-dark-bg-card p-6 rounded-2xl border border-dark-border card-glow">
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
                         </div>
                       </div>
                                               <div className="text-right">
                          <div className="text-white font-bold">
                            {currentMonsterHealth > 0 ? currentMonsterHealth : selectedMonster.health}/{selectedMonster.maxHealth}
                          </div>
                          <div className="w-32 bg-dark-bg-tertiary rounded-full h-2.5 mt-1">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-rose-600 h-2.5 rounded-full transition-all duration-300"
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
                     
                     {/* Monster Attributes */}
                     {selectedMonster.attributes && (
                       <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                         <h5 className="text-white font-semibold mb-2">Atributos:</h5>
                         <div className="grid grid-cols-5 gap-2 text-xs">
                           <div className="text-center">
                             <p className="text-gray-400">FOR</p>
                             <p className="text-white font-bold">{selectedMonster.attributes.strength}</p>
                           </div>
                           <div className="text-center">
                             <p className="text-gray-400">MAG</p>
                             <p className="text-white font-bold">{selectedMonster.attributes.magic}</p>
                           </div>
                           <div className="text-center">
                             <p className="text-gray-400">DES</p>
                             <p className="text-white font-bold">{selectedMonster.attributes.dexterity}</p>
                           </div>
                           <div className="text-center">
                             <p className="text-gray-400">AGI</p>
                             <p className="text-white font-bold">{selectedMonster.attributes.agility}</p>
                           </div>
                           <div className="text-center">
                             <p className="text-gray-400">VIT</p>
                             <p className="text-white font-bold">{selectedMonster.attributes.vitality}</p>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                  
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
                       }}
                       className="px-6 py-3 rounded-lg font-bold transition-colors bg-gray-600 hover:bg-gray-700 text-white"
                     >
                       Fugir
                     </button>
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
                       <div
                         key={monster.id}
                         onClick={() => handleStartBattle(monster)}
                         className="bg-card-gradient p-4 rounded-xl border border-dark-border cursor-pointer hover:border-accent-purple hover:scale-105 transition-all duration-300 card-glow"
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
                             <div className="flex justify-center space-x-2 text-xs mt-2">
                               <span className="text-red-400 font-semibold">ATK: {monster.attack}</span>
                               <span className="text-blue-400 font-semibold">DEF: {monster.defense}</span>
                             </div>
                             <p className="text-accent-cyan text-xs mt-1">
                               {monster.icon === '⚔️' ? 'Guerreiro' : 
                                monster.icon === '🏹' ? 'Arqueiro' : 
                                monster.icon === '🔮' ? 'Mago' : 'Desconhecido'}
                             </p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

                         {battleLog.length > 0 && (
               <div className="bg-gray-800 p-4 rounded-lg border border-custom">
                 <h4 className="text-white font-bold mb-2">Log de Batalha</h4>
                 <div className="space-y-1 max-h-60 overflow-y-auto">
                   {battleLog.map((log, index) => (
                     <div 
                       key={index} 
                       className={`p-2 rounded ${
                         index < 2 ? 'bg-gray-700 border-l-4 border-yellow-400' : 'bg-gray-800'
                       }`}
                     >
                       <p className="text-gray-300 text-sm">{log}</p>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        );

             case 'pvp':
        return (
          <PvPSystem
           onSearchOpponents={searchPvPOpponents}
           onStartBattle={startPvPBattle}
           onGetRanking={getPvPRanking}
           userPvPStats={user.pvpStats}
           userId={user.id}
          />
        );
      case 'guild':
        return (
          <GuildSystem
            onCreateGuild={createGuild}
            onJoinGuild={joinGuild}
            onLeaveGuild={leaveGuild}
            onGetGuild={getGuild}
            onUpdateGuild={updateGuild}
            onGetRanking={getGuildRanking}
            onGuildBank={guildBank}
            onContribute={contributeExperience}
            userGuildId={user.guildId}
            userGuildRole={user.guildRole}
            userId={user.id}
            userGold={user.gold}
          />
        );

       case 'collection':
         return (
           <div className="space-y-6">
             <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
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
                     <div key={skill.type} className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                       <div className="text-center mb-3">
                         <div className="text-3xl mb-2">{skill.icon}</div>
                         <h4 className="text-white font-bold">{skill.name}</h4>
                         <p className="text-dark-text-secondary text-sm">{skill.description}</p>
                       </div>
                       
                       <div className="mb-3">
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
                         <span>{collectionTimer <= 0 ? 'Coletar' : 'Aguardando...'}</span>
                       </button>
                     </div>
                   );
                 })}
               </div>
             </div>
           </div>
                   );

       case 'rest':
         return (
           <div className="space-y-6">
             <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
               <h3 className="text-2xl font-bold text-white mb-4">Sistema de Descanso</h3>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Descanso Gratuito */}
                 <div className="bg-dark-bg-card p-6 rounded-xl border border-dark-border">
                   <div className="text-center mb-4">
                     <div className="text-4xl mb-2">😴</div>
                     <h4 className="text-white font-bold text-xl">Descanso Gratuito</h4>
                     <p className="text-dark-text-secondary text-sm mt-2">
                       Recupera HP e MP completos sem custo
                     </p>
                   </div>
                   
                   <div className="mb-4">
                     <div className="flex justify-between text-sm mb-2">
                       <span className="text-dark-text-secondary">Tempo de Descanso:</span>
                       <span className="text-primary-yellow font-bold">
                         {Math.floor((user.stats?.level || user.level || 1) / 5) + 1} minuto(s)
                       </span>
                     </div>
                     <div className="text-xs text-dark-text-muted">
                       Base: 1 minuto + 1 minuto a cada 5 níveis
                     </div>
                   </div>
                   
                   <button
                     onClick={handleRest}
                     className="w-full bg-accent-purple hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2"
                   >
                     <Heart className="w-5 h-5" />
                     <span>Descansar</span>
                   </button>
                 </div>
                 
                 {/* Status Atual */}
                 <div className="bg-dark-bg-card p-6 rounded-xl border border-dark-border">
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
                 </div>
               </div>
             </div>
           </div>
         );

       case 'guild':
        return (
          <div className="space-y-6">
            <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
              <h3 className="text-2xl font-bold text-white mb-4">Sistema de Guild</h3>
              {user.guildId ? (
                <p className="text-gray-300">Você é membro de uma guild.</p>
              ) : (
                <div>
                  <p className="text-gray-300 mb-4">Junte-se ou crie uma guild para participar de atividades em grupo!</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-primary-green text-white p-4 rounded-lg hover:bg-green-600 transition-colors">
                      Entrar em Guild
                    </button>
                    <button className="bg-primary-purple text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
                      Criar Guild
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-6">
            <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
              <h3 className="text-2xl font-bold text-white mb-4">Mercado de Trading</h3>
              <p className="text-gray-300">O mercado está vazio. Itens aparecerão conforme os jogadores começarem a negociar!</p>
            </div>
          </div>
        );

      case 'world':
        return (
          <div className="space-y-6">
            <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
              <h3 className="text-2xl font-bold text-white mb-4">Mapa do Mundo</h3>
              <p className="text-dark-text-secondary">Explore o vasto mundo do RPG Browser!</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show class selection if user hasn't chosen a class
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
      <div className="min-h-screen bg-black bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-red-900 to-red-800 p-8 rounded-2xl border-2 border-red-600 max-w-md w-full text-center">
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
        </div>
      </div>
    );
  }

  // Show sell modal
  if (showSellModal) {
    return (
      <div className="min-h-screen bg-black bg-opacity-50 flex items-center justify-center p-4">
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
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-white font-bold">{item.name}</h4>
                        <p className="text-gray-400 text-sm">{item.description}</p>
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
                        <span className="text-xl">{item.icon}</span>
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
    <div className="min-h-screen bg-dark-gradient content-layer">
      {/* Top Navigation */}
      <nav className="bg-dark-bg-secondary bg-opacity-80 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sword className="w-8 h-8 text-accent-purple" />
              <span className="text-2xl font-bold text-white">RPG Browser</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-dark-bg-tertiary px-4 py-2 rounded-lg border border-dark-border">
                <Coins className="w-5 h-5 text-primary-yellow" />
                <span className="font-semibold text-dark-text">{user.gold}</span>
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

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-dark-bg-secondary border-r border-dark-border min-h-screen">
          <div className="p-4">
            <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow mb-6">
              <div className="text-center">
                {getCharacterImagePath(user.characterClass, characterGender === 'female') ? (
                  <div 
                    className="w-32 h-32 mx-auto mb-4 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={toggleCharacterGender}
                    title="Clique para alternar entre masculino/feminino"
                  >
                    <img 
                      src={getCharacterImagePath(user.characterClass, characterGender === 'female')!} 
                      alt={user.characterClass ? CHARACTER_CLASSES[user.characterClass].name : 'Personagem'}
                      className="w-32 h-32 object-contain rounded-full shadow-lg"
                      onError={(e) => {
                        // Fallback para ícone se imagem não existir
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-24 h-24 bg-purple-gradient rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform';
                          fallback.onclick = toggleCharacterGender;
                          const icon = document.createElement('span');
                          icon.className = 'text-4xl';
                          icon.textContent = user.characterClass ? CHARACTER_CLASSES[user.characterClass].icon : '👤';
                          fallback.appendChild(icon);
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 bg-purple-gradient rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
                    onClick={toggleCharacterGender}
                    title="Clique para alternar entre masculino/feminino"
                  >
                    <span className="text-4xl">
                      {user.characterClass ? CHARACTER_CLASSES[user.characterClass].icon : '👤'}
                    </span>
                  </div>
                )}
                <h3 className="text-dark-text font-bold text-xl">{user.nickname}</h3>
                <p className="text-dark-text-secondary text-sm mt-1">Nível {user.stats?.level || user.level || 1}</p>
                {user.characterClass && (
                  <p className="text-accent-purple text-sm font-semibold mt-1">{CHARACTER_CLASSES[user.characterClass].name}</p>
                )}
              </div>
            </div>

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
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
