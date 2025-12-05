'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { Sword, Shield, Zap, Users, Crown, Gem } from 'lucide-react';

// Discord Icon Component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928-1.793 6.4-2.22 8.298-2.272a.076.076 0 0 1 .08.028c.462.63.874 1.295 1.226 1.994a.076.076 0 0 1-.041.106 13.1 13.1 0 0 1-1.872.892.077.077 0 0 0-.007.128c.12.097.24.19.372.292a.074.074 0 0 0 .078.01 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to game if already logged in
  React.useEffect(() => {
    if (!isLoading && user) {
      router.push('/game');
    }
  }, [user, isLoading, router]);


  const features = [
    {
      icon: Sword,
      title: 'Epic Battles',
      description: 'Engage in thrilling PvP and PvE battles with unique combat mechanics and strategic gameplay.',
      color: 'from-primary-red to-primary-deep-orange'
    },
    {
      icon: Shield,
      title: 'Guild System',
      description: 'Join powerful guilds, participate in guild wars, and rise through the ranks to become a legendary leader.',
      color: 'from-primary-blue to-primary-cyan'
    },
    {
      icon: Zap,
      title: 'Trading Market',
      description: 'Buy, sell, and trade rare items, weapons, and resources in a dynamic player-driven economy.',
      color: 'from-primary-yellow to-primary-orange'
    },
    {
      icon: Users,
      title: 'Multiplayer World',
      description: 'Explore a vast open world with thousands of players, form alliances, and create your own destiny.',
      color: 'from-primary-green to-primary-blue'
    },
    {
      icon: Crown,
      title: 'Character Progression',
      description: 'Level up your character, unlock new abilities, and customize your build with unique skill trees.',
      color: 'from-primary-purple to-primary-pink'
    },
    {
      icon: Gem,
      title: 'Rare Items',
      description: 'Discover legendary weapons, armor, and artifacts with unique properties and powerful enchantments.',
      color: 'from-primary-cyan to-primary-blue-gray'
    }
  ];

  // Helper function to get background image
  const getBackgroundImage = (): string | null => {
    // Try PNG first, then GIF
    const pngPath = '/images/background/BGinicial.png';
    const gifPath = '/images/background/BGinicial.gif';
    
    // Return the path - the browser will handle if the file exists
    // We'll use PNG as default, but the user can replace with GIF if needed
    return pngPath;
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Fallback gradient if image doesn't load */}
      <div className="fixed inset-0 z-[-2] bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black bg-opacity-50 backdrop-blur-sm border-b-2 border-custom z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sword className="w-8 h-8 text-primary-orange" />
              <span className="text-2xl font-bold text-white">RPG Browser</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-white text-sm">Welcome, {user.nickname}!</span>
                  <button
                    onClick={logout}
                    className="bg-primary-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-primary-green to-primary-blue text-white px-6 py-2 rounded-lg hover:from-primary-blue hover:to-primary-green transition-all duration-300 transform hover:scale-105"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary-orange via-primary-yellow to-primary-green bg-clip-text text-transparent">
                RPG Browser
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Embark on an epic journey in this immersive browser-based RPG. Battle monsters, 
              trade with players, join guilds, and become a legend in this vast fantasy world.
            </p>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Game Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the amazing features that make our RPG world unique and engaging
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border-2 border-custom hover:border-primary-yellow transition-all duration-300 transform hover:scale-105"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-brown to-primary-deep-orange p-12 rounded-2xl border-2 border-custom">
            <h2 className="text-4xl font-bold text-white">
              Ready to Begin Your Adventure?
            </h2>
            <p className="text-xl text-gray-200">
              Join thousands of players in this epic RPG world. Create your character, 
              choose your path, and become a legend!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-50 border-t-2 border-custom py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Discord Link - Centralized */}
          <div className="flex justify-center mb-4">
            <a
              href="https://discord.gg/SSufkA7EJV"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              title="Entre no nosso Discord"
            >
              <DiscordIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Discord</span>
            </a>
          </div>
          
          {/* Copyright and Credits - Centralized */}
          <div className="text-center space-y-1">
            <p className="text-gray-600 text-xs">
              © 2024 RPG Browser. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs">
              <p className="text-gray-400">
                Desenvolvido por <span className="text-gray-300">André Peres</span>
              </p>
              <span className="hidden sm:inline text-gray-600">•</span>
              <p className="text-gray-500">
                Designers: <span className="text-gray-400">Arch e Lis</span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
