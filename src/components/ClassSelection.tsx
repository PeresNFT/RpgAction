'use client';

import React, { useState } from 'react';
import { CharacterClass } from '@/types/game';
import { CHARACTER_CLASSES } from '@/data/gameData';
import { Sword, Shield, Zap, ArrowRight, Star } from 'lucide-react';

interface ClassSelectionProps {
  onClassSelected: (characterClass: CharacterClass) => void;
}

export function ClassSelection({ onClassSelected }: ClassSelectionProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);

  const handleClassSelect = (characterClass: CharacterClass) => {
    setSelectedClass(characterClass);
  };

  const handleConfirm = () => {
    if (selectedClass) {
      onClassSelected(selectedClass);
    }
  };

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Escolha sua Classe
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Cada classe tem suas próprias características e especialidades. 
            Escolha sabiamente, pois essa decisão moldará sua jornada!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(CHARACTER_CLASSES).map(([key, classData]) => {
            const isSelected = selectedClass === key;
            return (
              <div
                key={key}
                onClick={() => handleClassSelect(key as CharacterClass)}
                className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? 'ring-4 ring-primary-yellow' : 'hover:ring-2 hover:ring-primary-yellow'
                }`}
              >
                <div className="bg-card-gradient p-6 rounded-2xl border-2 border-dark-border h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{classData.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{classData.name}</h3>
                    <p className="text-gray-200 mb-4">{classData.description}</p>
                    
                    <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
                      <h4 className="text-primary-yellow font-semibold mb-2">Foco: {classData.focus}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Força:</span>
                          <span className="text-white font-bold">{classData.baseStats.strength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Magia:</span>
                          <span className="text-white font-bold">{classData.baseStats.magic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Destreza:</span>
                          <span className="text-white font-bold">{classData.baseStats.dexterity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Agilidade:</span>
                          <span className="text-white font-bold">{classData.baseStats.agility}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Vitalidade:</span>
                          <span className="text-white font-bold">{classData.baseStats.vitality}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-primary-yellow">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-semibold">+10 pontos para distribuir</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-primary-yellow text-black rounded-full p-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedClass}
            className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
              selectedClass
                ? 'bg-gradient-to-r from-primary-green to-primary-blue text-white hover:from-primary-blue hover:to-primary-green hover:scale-110'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedClass ? 'Confirmar Escolha' : 'Selecione uma Classe'}
          </button>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Você poderá distribuir 10 pontos adicionais nos atributos após escolher sua classe.</p>
        </div>
      </div>
    </div>
  );
}
