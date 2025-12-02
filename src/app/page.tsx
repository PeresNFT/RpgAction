'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { Sword, Shield, Zap, Users, Crown, Gem } from 'lucide-react';

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

  const handlePlayNow = () => {
    if (user) {
      // Redirect to game page
      router.push('/game');
    } else {
      setShowAuthModal(true);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
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
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
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

          <div className="mb-12">
            <button
              onClick={handlePlayNow}
              className="bg-gradient-to-r from-primary-green to-primary-blue text-white text-xl px-8 py-4 rounded-2xl font-bold hover:from-primary-blue hover:to-primary-green transition-all duration-300 transform hover:scale-110 shadow-2xl"
            >
              {user ? 'Enter the Game' : 'Play Now'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary-green to-primary-blue p-6 rounded-2xl border-2 border-custom">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-gray-300 text-sm">Active Players</div>
            </div>
            <div className="bg-gradient-to-br from-primary-purple to-primary-pink p-6 rounded-2xl border-2 border-custom">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-gray-300 text-sm">Guilds</div>
            </div>
            <div className="bg-gradient-to-br from-primary-orange to-primary-yellow p-6 rounded-2xl border-2 border-custom">
              <div className="text-3xl font-bold text-white">1000+</div>
              <div className="text-gray-300 text-sm">Unique Items</div>
            </div>
            <div className="bg-gradient-to-br from-primary-cyan to-primary-blue p-6 rounded-2xl border-2 border-custom">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-gray-300 text-sm">Online World</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-brown to-primary-deep-orange p-12 rounded-2xl border-2 border-custom">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Begin Your Adventure?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Join thousands of players in this epic RPG world. Create your character, 
              choose your path, and become a legend!
            </p>
            <button
              onClick={handlePlayNow}
              className="bg-gradient-to-r from-primary-green to-primary-blue text-white text-xl px-8 py-4 rounded-2xl font-bold hover:from-primary-blue hover:to-primary-green transition-all duration-300 transform hover:scale-110 shadow-2xl"
            >
              {user ? 'Continue Your Journey' : 'Start Your Adventure'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-50 border-t-2 border-custom py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sword className="w-6 h-6 text-primary-orange" />
            <span className="text-xl font-bold text-white">RPG Browser</span>
          </div>
          <p className="text-gray-400">
            © 2024 RPG Browser. All rights reserved. Embark on your epic journey today!
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
