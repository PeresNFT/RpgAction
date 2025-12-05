'use client';

import React, { useState } from 'react';
import { CharacterClass, Attributes } from '@/types/game';
import { CHARACTER_CLASSES, GAME_FORMULAS } from '@/data/gameData';
import { Plus, Minus, ArrowRight, Star, Heart, Zap, Shield, Target, Zap as ZapIcon } from 'lucide-react';

interface AttributeDistributionProps {
  characterClass: CharacterClass;
  onAttributesConfirmed: (attributes: Attributes) => void;
}

export function AttributeDistribution({ characterClass, onAttributesConfirmed }: AttributeDistributionProps) {
  // Verificar se characterClass é válido
  if (!characterClass || !CHARACTER_CLASSES[characterClass]) {
    console.error('Invalid characterClass:', characterClass);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Erro</h1>
          <p className="text-gray-300">Classe inválida. Por favor, tente novamente.</p>
        </div>
      </div>
    );
  }

  const classData = CHARACTER_CLASSES[characterClass];
  const baseStats = classData.baseStats;
  
  const [attributes, setAttributes] = useState<Attributes>(baseStats);
  const [availablePoints, setAvailablePoints] = useState(10);

  const handleAttributeChange = (attribute: keyof Attributes, change: number) => {
    if (change > 0 && availablePoints <= 0) return;
    if (change < 0 && attributes[attribute] <= baseStats[attribute]) return;

    setAttributes(prev => ({
      ...prev,
      [attribute]: prev[attribute] + change
    }));
    setAvailablePoints(prev => prev - change);
  };

  const calculateStats = () => {
    const level = 1;
    return {
      maxHealth: GAME_FORMULAS.maxHealth(attributes.strength, level, characterClass),
      maxMana: GAME_FORMULAS.maxMana(attributes.magic, level),
      attack: GAME_FORMULAS.attack(attributes.strength, attributes.magic, attributes.dexterity, level, characterClass),
      defense: GAME_FORMULAS.defense(attributes.strength, level, characterClass),
      accuracy: GAME_FORMULAS.accuracy(attributes.dexterity),
      dodgeChance: GAME_FORMULAS.dodgeChance(attributes.agility),
      criticalChance: GAME_FORMULAS.criticalChance(attributes.luck),
      criticalResist: GAME_FORMULAS.criticalResist(attributes.luck)
    };
  };

  const stats = calculateStats();

  const attributeConfigs = [
    {
      key: 'strength' as keyof Attributes,
      name: 'Força (STR)',
      description: 'Aumenta vida máxima e dano para Guerreiro',
      icon: Shield,
      color: 'from-red-500 to-red-700'
    },
    {
      key: 'magic' as keyof Attributes,
      name: 'Magia (MAG)',
      description: 'Aumenta mana máxima e dano para Mago',
      icon: ZapIcon,
      color: 'from-purple-500 to-purple-700'
    },
    {
      key: 'dexterity' as keyof Attributes,
      name: 'Destreza (DEX)',
      description: 'Aumenta precisão e dano para Arqueiro',
      icon: Target,
      color: 'from-blue-500 to-blue-700'
    },
    {
      key: 'agility' as keyof Attributes,
      name: 'Agilidade (AGI)',
      description: 'Aumenta chance de esquiva e reduz crítico recebido',
      icon: Zap,
      color: 'from-green-500 to-green-700'
    },
    {
      key: 'luck' as keyof Attributes,
      name: 'Sorte (LUK)',
      description: 'Aumenta chance de crítico e resistência a crítico',
      icon: Heart,
      color: 'from-yellow-500 to-yellow-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Distribuir Atributos
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Você tem <span className="text-primary-yellow font-bold">{availablePoints}</span> pontos para distribuir.
            Escolha sabiamente para otimizar sua classe {classData.name}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attributes Panel */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Atributos</h2>
            {attributeConfigs.map((config) => {
              const value = attributes[config.key];
              const baseValue = baseStats[config.key];
              const Icon = config.icon;
              
              return (
                <div key={config.key} className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border-2 border-custom">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{config.name}</h3>
                        <p className="text-gray-400 text-sm">{config.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{value}</div>
                      <div className="text-sm text-gray-400">
                        Base: {baseValue}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => handleAttributeChange(config.key, -1)}
                      disabled={value <= baseValue}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        value > baseValue
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-green to-primary-blue transition-all duration-300"
                        style={{ width: `${((value - baseValue) / 10) * 100}%` }}
                      ></div>
                    </div>
                    
                    <button
                      onClick={() => handleAttributeChange(config.key, 1)}
                      disabled={availablePoints <= 0}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        availablePoints > 0
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Preview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Previsão de Status</h2>
            
            <div className="bg-gradient-to-br from-primary-brown to-primary-deep-orange p-6 rounded-2xl border-2 border-custom">
              <h3 className="text-xl font-bold text-white mb-4">Status Calculados</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black bg-opacity-30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-gray-300 text-sm">Vida Máxima</span>
                  </div>
                  <div className="text-white font-bold text-lg">{stats.maxHealth}</div>
                </div>
                
                <div className="bg-black bg-opacity-30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-300 text-sm">Mana Máxima</span>
                  </div>
                  <div className="text-white font-bold text-lg">{stats.maxMana}</div>
                </div>
                
                <div className="bg-black bg-opacity-30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-300 text-sm">Ataque</span>
                  </div>
                  <div className="text-white font-bold text-lg">{stats.attack}</div>
                </div>
                
                <div className="bg-black bg-opacity-30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-gray-300 text-sm">Defesa</span>
                  </div>
                  <div className="text-white font-bold text-lg">{stats.defense}</div>
                </div>
                
                <div className="bg-black bg-opacity-30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-300 text-sm">Crítico</span>
                  </div>
                  <div className="text-white font-bold text-lg">{stats.criticalChance.toFixed(1)}%</div>
                </div>
                
                <div className="bg-black bg-opacity-30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="w-4 h-4 text-cyan-500" />
                    <span className="text-gray-300 text-sm">Esquiva</span>
                  </div>
                  <div className="text-white font-bold text-lg">{stats.dodgeChance.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border-2 border-custom">
              <h3 className="text-xl font-bold text-white mb-4">Classe: {classData.name}</h3>
              <div className="text-gray-300 mb-4">
                <p className="mb-2">{classData.description}</p>
                <p className="text-primary-yellow font-semibold">Foco: {classData.focus}</p>
              </div>
              <div className="text-4xl">{classData.icon}</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => onAttributesConfirmed(attributes)}
            disabled={availablePoints > 0}
            className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
              availablePoints === 0
                ? 'bg-gradient-to-r from-primary-green to-primary-blue text-white hover:from-primary-blue hover:to-primary-green hover:scale-110'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {availablePoints === 0 ? 'Confirmar Atributos' : `Distribua todos os ${availablePoints} pontos restantes`}
          </button>
        </div>
      </div>
    </div>
  );
}
