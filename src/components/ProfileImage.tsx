'use client';

import React, { useState, useEffect } from 'react';
import { Edit, User, X } from 'lucide-react';
import { SHOP_ITEMS } from '@/data/gameData';
import { CharacterClass } from '@/types/game';
import { CHARACTER_CLASSES } from '@/data/gameData';

interface ProfileImageProps {
  profileImage?: string;
  characterClass?: CharacterClass | null;
  characterGender?: 'male' | 'female';
  size?: 'small' | 'medium' | 'large';
  showEditButton?: boolean;
  purchasedItems?: string[];
  onUpdateProfileImage?: (imagePath: string) => Promise<{ success: boolean; error?: string }>;
  onOpenEditModal?: () => void;
  className?: string;
}

// Helper function to get character image path
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

export function ProfileImage({
  profileImage,
  characterClass,
  characterGender = 'male',
  size = 'medium',
  showEditButton = false,
  purchasedItems = [],
  onUpdateProfileImage,
  onOpenEditModal,
  className = ''
}: ProfileImageProps) {

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-32 h-32'
  };

  const buttonSizeClasses = {
    small: 'w-4 h-4 p-0.5',
    medium: 'w-5 h-5 p-1',
    large: 'w-6 h-6 p-1'
  };

  // Determine which image to show - prioritize profileImage, then character image
  const displayImage = profileImage || getCharacterImagePath(characterClass || null, characterGender === 'female');
  const fallbackIcon = characterClass ? CHARACTER_CLASSES[characterClass].icon : '👤';
  
  // Check if profileImage is a character image path (to show in modal)
  const isProfileImageCharacter = profileImage && (
    profileImage.includes('/images/characters/') && 
    !SHOP_ITEMS.some(item => item.type === 'profile_image' && item.imagePath === profileImage)
  );

  const handleEditClick = () => {
    if (onOpenEditModal) {
      onOpenEditModal();
    }
  };

  return (
    <>
      <div className={`relative inline-block ${className}`}>
        {displayImage ? (
          <img
            src={displayImage}
            alt="Profile"
            className={`${sizeClasses[size]} object-cover rounded-full border-2 border-dark-border shadow-lg`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = `${sizeClasses[size]} bg-purple-gradient rounded-full flex items-center justify-center border-2 border-dark-border shadow-lg`;
                const icon = document.createElement('span');
                icon.className = size === 'large' ? 'text-4xl' : size === 'medium' ? 'text-2xl' : 'text-lg';
                icon.textContent = fallbackIcon;
                fallback.appendChild(icon);
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className={`${sizeClasses[size]} bg-purple-gradient rounded-full flex items-center justify-center border-2 border-dark-border shadow-lg`}>
            <span className={size === 'large' ? 'text-4xl' : size === 'medium' ? 'text-2xl' : 'text-lg'}>
              {fallbackIcon}
            </span>
          </div>
        )}
        
        {showEditButton && onOpenEditModal && (
          <button
            onClick={handleEditClick}
            className={`absolute -bottom-1 -right-1 bg-accent-purple rounded-full ${buttonSizeClasses[size]} text-white hover:bg-accent-purple/80 transition-all duration-300 shadow-lg border-2 border-dark-bg-card flex items-center justify-center`}
            title="Editar foto de perfil"
          >
            <Edit className={size === 'large' ? 'w-4 h-4' : size === 'medium' ? 'w-3 h-3' : 'w-2.5 h-2.5'} />
          </button>
        )}
      </div>
    </>
  );
}

