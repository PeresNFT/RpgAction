'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'main' | 'small';
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  style = {},
  variant = 'main',
  onClick 
}: CardProps) {
  // Cor padrão: #9f72ed com 70% de transparência
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 128, 0.1)',
    ...style
  };

  // Variantes de tamanho mantendo a estrutura atual
  const baseClasses = variant === 'main' 
    ? 'p-6 rounded-2xl border border-dark-border card-glow'
    : 'p-4 rounded-xl border border-dark-border';

  const combinedClassName = onClick 
    ? `${baseClasses} ${className} cursor-pointer`
    : `${baseClasses} ${className}`;

  return (
    <div 
      className={combinedClassName}
      style={baseStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

