'use client';

import React, { useState } from 'react';
import { CharacterClass, Attributes } from '@/types/game';
import { CHARACTER_CLASSES, GAME_FORMULAS } from '@/data/gameData';
import { Plus, Minus, ArrowRight, Star, Heart, Zap, Shield, Target, Zap as ZapIcon, Sparkles } from 'lucide-react';

interface LevelUpAttributeDistributionProps {
  characterClass: CharacterClass;
  currentAttributes: Attributes;
  availablePoints: number;
  userLevel: number;
  onAttributesConfirmed: (attributes: Attributes) => void;
  onCancel: () => void;
}

export function LevelUpAttributeDistribution({ 
  characterClass, 
  currentAttributes, 
  availablePoints, 
  userLevel,
  onAttributesConfirmed, 
  onCancel 
}: LevelUpAttributeDistributionProps) {
  const [attributes, setAttributes] = useState<Attributes>(currentAttributes);
  const [remainingPoints, setRemainingPoints] = useState(availablePoints);

  const handleAttributeChange = (attribute: keyof Attributes, change: number) => {
    if (change > 0 && remainingPoints <= 0) return;
    if (change < 0 && attributes[attribute] <= currentAttributes[attribute]) return;

    setAttributes(prev => ({
      ...prev,
      [attribute]: prev[attribute] + change
    }));
    setRemainingPoints(prev => prev - change);
  };

  const calculateStats = () => {
    return {
      maxHealth: GAME_FORMULAS.maxHealth(attributes.vitality, userLevel, characterClass),
      maxMana: GAME_FORMULAS.maxMana(attributes.magic, userLevel),
      attack: GAME_FORMULAS.attack(attributes.strength, attributes.magic, userLevel),
      defense: GAME_FORMULAS.defense(attributes.vitality, userLevel),
      criticalChance: GAME_FORMULAS.criticalChance(attributes.dexterity),
      dodgeChance: GAME_FORMULAS.dodgeChance(attributes.agility)
    };
  };

  const stats = calculateStats();

  const attributeConfigs = [
    {
      key: 'strength' as keyof Attributes,
      name: 'Força',
      description: 'Aumenta dano físico e capacidade de carregar peso',
      icon: Shield,
      color: 'from-red-500 to-red-700'
    },
    {
      key: 'magic' as keyof Attributes,
      name: 'Magia',
      description: 'Aumenta dano mágico e mana máxima',
      icon: ZapIcon,
      color: 'from-purple-500 to-purple-700'
    },
    {
      key: 'dexterity' as keyof Attributes,
      name: 'Destreza',
      description: 'Aumenta chance de crítico e precisão',
      icon: Target,
      color: 'from-blue-500 to-blue-700'
    },
    {
      key: 'agility' as keyof Attributes,
      name: 'Agilidade',
      description: 'Aumenta chance de esquiva e velocidade',
      icon: Zap,
      color: 'from-green-500 to-green-700'
    },
    {
      key: 'vitality' as keyof Attributes,
      name: 'Vitalidade',
      description: 'Aumenta vida máxima e defesa',
      icon: Heart,
      color: 'from-orange-500 to-orange-700'
    }
  ];

  const handleConfirm = () => {
    if (remainingPoints === 0) {
      onAttributesConfirmed(attributes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-amber-600">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="text-yellow-400 text-4xl mr-3" />
            <h1 className="text-3xl font-bold text-white">Level Up!</h1>
            <Sparkles className="text-yellow-400 text-4xl ml-3" />
          </div>
          <p className="text-gray-300 text-lg">
            Parabéns! Você subiu de nível e ganhou <span className="text-yellow-400 font-bold">{availablePoints} pontos</span> para distribuir nos atributos.
          </p>
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 rounded-xl border border-amber-500/30">
            <p className="text-amber-300 font-semibold">
              Pontos restantes: <span className="text-yellow-400 text-xl">{remainingPoints}</span>
            </p>
          </div>
        </div>

        {/* Attributes Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {attributeConfigs.map((config) => (
            <div
              key={config.key}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-amber-500/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color} mr-3`}>
                    <config.icon className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{config.name}</h3>
                    <p className="text-gray-400 text-sm">{config.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{attributes[config.key]}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAttributeChange(config.key, -1)}
                    disabled={attributes[config.key] <= currentAttributes[config.key]}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="text-white text-sm" />
                  </button>
                  <button
                    onClick={() => handleAttributeChange(config.key, 1)}
                    disabled={remainingPoints <= 0}
                    className="p-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="text-white text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Preview */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/30 mb-8">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center">
            <Star className="text-yellow-400 mr-2" />
            Preview dos Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Vida Máxima</p>
              <p className="text-red-400 font-bold text-lg">{stats.maxHealth}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Mana Máxima</p>
              <p className="text-blue-400 font-bold text-lg">{stats.maxMana}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Ataque</p>
              <p className="text-orange-400 font-bold text-lg">{stats.attack}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Defesa</p>
              <p className="text-green-400 font-bold text-lg">{stats.defense}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Crítico</p>
              <p className="text-yellow-400 font-bold text-lg">{stats.criticalChance.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Esquiva</p>
              <p className="text-cyan-400 font-bold text-lg">{stats.dodgeChance.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors duration-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={remainingPoints > 0}
            className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
          >
            <ArrowRight className="mr-2" />
            Confirmar Distribuição
          </button>
        </div>

        {remainingPoints > 0 && (
          <div className="mt-4 text-center">
            <p className="text-amber-400 text-sm">
              ⚠️ Você ainda tem {remainingPoints} ponto(s) para distribuir
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
