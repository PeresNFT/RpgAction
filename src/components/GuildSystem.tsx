'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Crown, 
  Coins, 
  TrendingUp,
  Plus,
  Minus,
  Settings,
  LogOut,
  Search,
  Trophy,
  Star,
  UserPlus,
  X,
  Save,
  Edit
} from 'lucide-react';
import { Guild, GuildMember, GuildRanking } from '@/types/game';
import { CHARACTER_CLASSES } from '@/data/gameData';

interface GuildSystemProps {
  onCreateGuild: (name: string, description?: string, icon?: string) => Promise<{ success: boolean; guild?: Guild }>;
  onJoinGuild: (guildId: string) => Promise<{ success: boolean; guild?: Guild }>;
  onLeaveGuild: () => Promise<{ success: boolean }>;
  onGetGuild: (guildId: string) => Promise<{ success: boolean; guild?: Guild; members?: GuildMember[] }>;
  onUpdateGuild: (guildId: string, updates: any) => Promise<{ success: boolean; guild?: Guild }>;
  onGetRanking: (limit?: number, offset?: number) => Promise<{ success: boolean; rankings?: GuildRanking[]; total?: number }>;
  onGuildBank: (action: 'deposit' | 'withdraw', amount: number) => Promise<{ success: boolean; message?: string; userGold?: number; guildGold?: number }>;
  onContribute: (experience: number) => Promise<{ success: boolean; message?: string; guild?: Guild; leveledUp?: boolean }>;
  userGuildId?: string;
  userGuildRole?: 'member' | 'officer' | 'leader';
  userId: string;
  userGold: number;
}

export function GuildSystem({
  onCreateGuild,
  onJoinGuild,
  onLeaveGuild,
  onGetGuild,
  onUpdateGuild,
  onGetRanking,
  onGuildBank,
  onContribute,
  userGuildId,
  userGuildRole,
  userId,
  userGold
}: GuildSystemProps) {
  const [activeTab, setActiveTab] = useState<'myGuild' | 'search' | 'ranking'>('myGuild');
  const [guild, setGuild] = useState<Guild | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [rankings, setRankings] = useState<GuildRanking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create/Join modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createIcon, setCreateIcon] = useState('🛡️');
  const [joinGuildId, setJoinGuildId] = useState('');
  
  // Guild Bank
  const [bankAction, setBankAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [bankAmount, setBankAmount] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);
  
  // Contribute
  const [contributeAmount, setContributeAmount] = useState('');
  const [showContributeModal, setShowContributeModal] = useState(false);
  
  // Edit Guild
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('');
  
  // Search guilds
  const [searchResults, setSearchResults] = useState<GuildRanking[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load guild data when user has a guild
  useEffect(() => {
    if (userGuildId) {
      loadGuildData();
    }
  }, [userGuildId]);

  const loadGuildData = async () => {
    if (!userGuildId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onGetGuild(userGuildId);
      if (result.success && result.guild) {
        setGuild(result.guild);
        setMembers(result.members || []);
      } else {
        setError('Failed to load guild data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load guild data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!createName.trim()) {
      setError('Guild name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onCreateGuild(createName.trim(), createDescription.trim() || undefined, createIcon);
      if (result.success && result.guild) {
        setGuild(result.guild);
        setShowCreateModal(false);
        setCreateName('');
        setCreateDescription('');
        setCreateIcon('🛡️');
        setActiveTab('myGuild');
      } else {
        setError('Failed to create guild');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create guild');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGuild = async () => {
    if (!joinGuildId.trim()) {
      setError('Guild ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onJoinGuild(joinGuildId.trim());
      if (result.success && result.guild) {
        setGuild(result.guild);
        setShowJoinModal(false);
        setJoinGuildId('');
        setActiveTab('myGuild');
        await loadGuildData();
      } else {
        setError('Failed to join guild');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join guild');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGuild = async () => {
    if (!confirm('Are you sure you want to leave this guild?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onLeaveGuild();
      if (result.success) {
        setGuild(null);
        setMembers([]);
        setActiveTab('search');
      } else {
        setError('Failed to leave guild');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to leave guild');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankAction = async () => {
    const amount = parseInt(bankAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onGuildBank(bankAction, amount);
      if (result.success) {
        setShowBankModal(false);
        setBankAmount('');
        await loadGuildData();
      } else {
        setError(result.message || 'Failed to perform bank action');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to perform bank action');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = async () => {
    const amount = parseInt(contributeAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid experience amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onContribute(amount);
      if (result.success) {
        setShowContributeModal(false);
        setContributeAmount('');
        await loadGuildData();
        if (result.leveledUp) {
          alert('🎉 Guild leveled up!');
        }
      } else {
        setError(result.message || 'Failed to contribute experience');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to contribute experience');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGuild = async () => {
    if (!guild || !isEditing) return;

    setIsLoading(true);
    setError(null);

    try {
      const updates: any = {};
      if (editName.trim() !== guild.name) updates.name = editName.trim();
      if (editDescription.trim() !== (guild.description || '')) updates.description = editDescription.trim() || null;
      if (editIcon !== guild.icon) updates.icon = editIcon;

      const result = await onUpdateGuild(guild.id, updates);
      if (result.success && result.guild) {
        setGuild(result.guild);
        setIsEditing(false);
      } else {
        setError('Failed to update guild');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update guild');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRanking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await onGetRanking(50, 0);
      if (result.success && result.rankings) {
        setRankings(result.rankings);
        setSearchResults(result.rankings);
      } else {
        setError('Failed to load rankings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load rankings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ranking' || activeTab === 'search') {
      loadRanking();
    }
  }, [activeTab]);

  const canEdit = userGuildRole === 'leader' || userGuildRole === 'officer';
  const isLeader = userGuildRole === 'leader';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-3xl font-bold text-white">Guild System</h2>
              <p className="text-dark-text-secondary">Join or create a guild to unlock powerful benefits!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 bg-opacity-50 border-2 border-red-500 p-4 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-dark-border">
        <button
          onClick={() => setActiveTab('myGuild')}
          className={`px-6 py-3 font-semibold transition-all duration-300 rounded-t-xl ${
            activeTab === 'myGuild'
              ? 'bg-accent-purple text-white'
              : 'text-dark-text-secondary hover:text-white hover:bg-dark-bg-tertiary'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>My Guild</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 font-semibold transition-all duration-300 rounded-t-xl ${
            activeTab === 'search'
              ? 'bg-accent-purple text-white'
              : 'text-dark-text-secondary hover:text-white hover:bg-dark-bg-tertiary'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Guilds</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-6 py-3 font-semibold transition-all duration-300 rounded-t-xl ${
            activeTab === 'ranking'
              ? 'bg-accent-purple text-white'
              : 'text-dark-text-secondary hover:text-white hover:bg-dark-bg-tertiary'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Ranking</span>
          </div>
        </button>
      </div>

      {/* My Guild Tab */}
      {activeTab === 'myGuild' && (
        <div className="space-y-6">
          {!guild ? (
            <div className="bg-card-gradient p-8 rounded-2xl border border-dark-border card-glow text-center">
              <Shield className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Guild</h3>
              <p className="text-dark-text-secondary mb-6">Join an existing guild or create your own!</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-accent-purple px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Guild</span>
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className="bg-accent-blue px-6 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition-all duration-300 flex items-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Search Guilds</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Guild Info Card */}
              <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-6xl">{guild.icon}</div>
                    <div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-dark-bg-card text-white px-3 py-2 rounded-xl border border-dark-border w-full"
                            placeholder="Guild Name"
                          />
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="bg-dark-bg-card text-white px-3 py-2 rounded-xl border border-dark-border w-full"
                            placeholder="Description"
                          />
                          <input
                            type="text"
                            value={editIcon}
                            onChange={(e) => setEditIcon(e.target.value)}
                            className="bg-dark-bg-card text-white px-3 py-2 rounded-xl border border-dark-border w-full"
                            placeholder="Icon (emoji)"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold text-white">{guild.name}</h3>
                          {guild.description && (
                            <p className="text-dark-text-secondary mt-1">{guild.description}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {canEdit && !isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditName(guild.name);
                        setEditDescription(guild.description || '');
                        setEditIcon(guild.icon);
                      }}
                      className="text-dark-text-secondary hover:text-white transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateGuild}
                        disabled={isLoading}
                        className="text-primary-green hover:text-primary-blue transition-colors"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditName('');
                          setEditDescription('');
                          setEditIcon('');
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                    <div className="text-dark-text-secondary text-sm">Level</div>
                    <div className="text-2xl font-bold text-white">{guild.level}</div>
                  </div>
                  <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                    <div className="text-dark-text-secondary text-sm">Experience</div>
                    <div className="text-2xl font-bold text-white">{guild.experience}/{guild.experienceToNext}</div>
                  </div>
                  <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                    <div className="text-dark-text-secondary text-sm">Members</div>
                    <div className="text-2xl font-bold text-white">{guild.memberCount}/{guild.maxMembers}</div>
                  </div>
                  <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                    <div className="text-dark-text-secondary text-sm">Bank Gold</div>
                    <div className="text-2xl font-bold text-primary-yellow">{guild.gold.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowBankModal(true)}
                    className="bg-accent-blue px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Guild Bank</span>
                  </button>
                  <button
                    onClick={() => setShowContributeModal(true)}
                    className="bg-accent-purple px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Contribute XP</span>
                  </button>
                  {isLeader && (
                    <button
                      onClick={() => setActiveTab('search')}
                      className="bg-accent-cyan px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Invite Members</span>
                    </button>
                  )}
                  <button
                    onClick={handleLeaveGuild}
                    className="bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Leave Guild</span>
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
                <h4 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Members ({members.length})</span>
                </h4>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-dark-bg-card p-4 rounded-xl border border-dark-border flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center">
                          {member.role === 'leader' && <Crown className="w-6 h-6 text-primary-yellow" />}
                          {member.role === 'officer' && <Star className="w-6 h-6 text-white" />}
                          {member.role === 'member' && <Users className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{member.nickname}</div>
                          <div className="text-dark-text-secondary text-sm">
                            {CHARACTER_CLASSES[member.characterClass]?.name || member.characterClass} • Level {member.level}
                          </div>
                        </div>
                      </div>
                      <div className="text-dark-text-secondary text-sm capitalize">{member.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
            <h3 className="text-2xl font-bold text-white mb-4">Available Guilds</h3>
            {isLoading ? (
              <div className="text-center py-8 text-dark-text-secondary">Loading...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-dark-text-secondary">No guilds found</div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((guildRank) => (
                  <div
                    key={guildRank.guildId}
                    className="bg-dark-bg-card p-4 rounded-xl border border-dark-border flex items-center justify-between hover:border-accent-purple transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{guildRank.icon}</div>
                      <div>
                        <div className="text-white font-semibold">{guildRank.name}</div>
                        <div className="text-dark-text-secondary text-sm">
                          Level {guildRank.level} • {guildRank.memberCount} members • Leader: {guildRank.leaderNickname}
                        </div>
                      </div>
                    </div>
                    {userGuildId !== guildRank.guildId && (
                      <button
                        onClick={() => {
                          setJoinGuildId(guildRank.guildId);
                          handleJoinGuild();
                        }}
                        disabled={isLoading || !!userGuildId}
                        className="bg-accent-purple px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Join
                      </button>
                    )}
                    {userGuildId === guildRank.guildId && (
                      <span className="text-accent-purple font-semibold">Your Guild</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ranking Tab */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Guild Rankings</span>
            </h3>
            {isLoading ? (
              <div className="text-center py-8 text-dark-text-secondary">Loading...</div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-8 text-dark-text-secondary">No rankings available</div>
            ) : (
              <div className="space-y-2">
                {rankings.map((guildRank) => (
                  <div
                    key={guildRank.guildId}
                    className={`bg-dark-bg-card p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                      userGuildId === guildRank.guildId ? 'border-accent-purple border-2' : 'border-dark-border'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-primary-yellow w-8">
                        #{guildRank.rank}
                      </div>
                      <div className="text-3xl">{guildRank.icon}</div>
                      <div>
                        <div className="text-white font-semibold">{guildRank.name}</div>
                        <div className="text-dark-text-secondary text-sm">
                          Level {guildRank.level} • {guildRank.experience.toLocaleString()} XP • {guildRank.memberCount} members
                        </div>
                      </div>
                    </div>
                    <div className="text-dark-text-secondary text-sm">Leader: {guildRank.leaderNickname}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Guild Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Create Guild</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-text-secondary mb-2">Guild Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full bg-dark-bg-card text-white px-4 py-2 rounded-xl border border-dark-border"
                  placeholder="Enter guild name"
                  maxLength={30}
                />
              </div>
              <div>
                <label className="block text-dark-text-secondary mb-2">Description (Optional)</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full bg-dark-bg-card text-white px-4 py-2 rounded-xl border border-dark-border"
                  placeholder="Enter guild description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-dark-text-secondary mb-2">Choose Icon</label>
                <div className="flex space-x-3">
                  {[
                    { icon: '🛡️', name: 'Shield' },
                    { icon: '⚔️', name: 'Swords' },
                    { icon: '🏰', name: 'Castle' },
                    { icon: '👑', name: 'Crown' },
                    { icon: '🐉', name: 'Dragon' }
                  ].map((option) => (
                    <button
                      key={option.icon}
                      type="button"
                      onClick={() => setCreateIcon(option.icon)}
                      className={`w-16 h-16 text-4xl rounded-xl border-2 transition-all duration-300 hover:scale-110 ${
                        createIcon === option.icon
                          ? 'border-accent-purple bg-accent-purple bg-opacity-20 scale-110'
                          : 'border-dark-border bg-dark-bg-card hover:border-accent-purple'
                      }`}
                      title={option.name}
                    >
                      {option.icon}
                    </button>
                  ))}
                </div>
                <p className="text-dark-text-secondary text-sm mt-2">Selected: {createIcon}</p>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleCreateGuild}
                disabled={isLoading || !createName.trim()}
                className="flex-1 bg-accent-purple px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateName('');
                  setCreateDescription('');
                  setCreateIcon('🛡️');
                }}
                className="flex-1 bg-dark-bg-tertiary px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guild Bank Modal */}
      {showBankModal && guild && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Guild Bank</h3>
            <div className="space-y-4">
              <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                <div className="text-dark-text-secondary text-sm">Your Gold</div>
                <div className="text-2xl font-bold text-primary-yellow">{userGold.toLocaleString()}</div>
              </div>
              <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                <div className="text-dark-text-secondary text-sm">Guild Bank</div>
                <div className="text-2xl font-bold text-primary-yellow">{guild.gold.toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-dark-text-secondary mb-2">Action</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setBankAction('deposit')}
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      bankAction === 'deposit'
                        ? 'bg-accent-purple text-white'
                        : 'bg-dark-bg-tertiary text-dark-text-secondary'
                    }`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setBankAction('withdraw')}
                    disabled={!canEdit}
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      bankAction === 'withdraw'
                        ? 'bg-accent-blue text-white'
                        : 'bg-dark-bg-tertiary text-dark-text-secondary'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-dark-text-secondary mb-2">Amount</label>
                <input
                  type="number"
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  className="w-full bg-dark-bg-card text-white px-4 py-2 rounded-xl border border-dark-border"
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleBankAction}
                disabled={isLoading || !bankAmount}
                className="flex-1 bg-accent-purple px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : bankAction === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
              <button
                onClick={() => {
                  setShowBankModal(false);
                  setBankAmount('');
                }}
                className="flex-1 bg-dark-bg-tertiary px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && guild && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-card-gradient p-6 rounded-2xl border border-dark-border card-glow max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Contribute Experience</h3>
            <div className="space-y-4">
              <div className="bg-dark-bg-card p-4 rounded-xl border border-dark-border">
                <div className="text-dark-text-secondary text-sm">Guild Level</div>
                <div className="text-2xl font-bold text-white">{guild.level}</div>
                <div className="text-dark-text-secondary text-sm mt-1">
                  {guild.experience}/{guild.experienceToNext} XP to next level
                </div>
              </div>
              <div>
                <label className="block text-dark-text-secondary mb-2">Experience Amount</label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full bg-dark-bg-card text-white px-4 py-2 rounded-xl border border-dark-border"
                  placeholder="Enter experience amount"
                  min="1"
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleContribute}
                disabled={isLoading || !contributeAmount}
                className="flex-1 bg-accent-purple px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Contributing...' : 'Contribute'}
              </button>
              <button
                onClick={() => {
                  setShowContributeModal(false);
                  setContributeAmount('');
                }}
                className="flex-1 bg-dark-bg-tertiary px-4 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

