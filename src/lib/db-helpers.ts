import { supabaseAdmin, dbRowToUser, userToDbRow } from './supabase';
import { User } from '@/types/user';
import { Guild, GuildMember, GuildSettings } from '@/types/game';

/**
 * Get user by ID from database
 */
export async function getUserById(userId: string): Promise<User | null> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return dbRowToUser(data);
}

/**
 * Update user in database
 */
export async function updateUser(user: User): Promise<User> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(userToDbRow(user))
    .eq('id', user.id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update user: ${error?.message || 'Unknown error'}`);
  }

  return dbRowToUser(data);
}

/**
 * Get user without password (for API responses)
 */
export function userWithoutPassword(user: User): Omit<User, 'password'> {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get all users with character class (for PvP matching)
 */
export async function getAllUsersWithClass(): Promise<User[]> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .not('character_class', 'is', null);

  if (error || !data) {
    return [];
  }

  return data.map(row => dbRowToUser(row));
}

/**
 * Get users by IDs
 */
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  if (userIds.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .in('id', userIds);

  if (error || !data) {
    return [];
  }

  return data.map(row => dbRowToUser(row));
}

/**
 * Guild Helper Functions
 */
export async function getGuildById(guildId: string): Promise<Guild | null> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('guilds')
    .select('*')
    .eq('id', guildId)
    .single();

  if (error || !data) {
    return null;
  }

  // Get leader info
  const leader = await getUserById(data.leader_id);
  
  // Count members
  const { count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('guild_id', guildId);

  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    icon: data.icon || 'guild1',
    level: data.level || 1,
    experience: data.experience || 0,
    experienceToNext: data.experience_to_next || 100,
    gold: data.gold || 0,
    maxMembers: data.max_members || 20,
    leaderId: data.leader_id,
    leaderNickname: leader?.nickname,
    settings: data.settings || {
      buffs: {},
      upgrades: {},
      joinType: 'open'
    },
    memberCount: count || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function getGuildMembers(guildId: string): Promise<GuildMember[]> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, nickname, character_class, level, guild_role, created_at')
    .eq('guild_id', guildId)
    .order('guild_role', { ascending: false })
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(row => ({
    id: row.id,
    nickname: row.nickname,
    characterClass: row.character_class as any,
    level: row.level || 1,
    role: (row.guild_role || 'member') as any,
    joinedAt: row.created_at,
    contribution: 0 // TODO: Calculate contribution
  }));
}

export async function createGuild(guildData: {
  name: string;
  description?: string;
  icon?: string;
  leaderId: string;
}): Promise<Guild> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('guilds')
    .insert({
      name: guildData.name,
      description: guildData.description || null,
      icon: guildData.icon || 'guild1',
      leader_id: guildData.leaderId,
      level: 1,
      experience: 0,
      experience_to_next: 100,
      gold: 0,
      max_members: 20,
      settings: {
        buffs: {},
        upgrades: {},
        joinType: 'open'
      }
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create guild: ${error?.message || 'Unknown error'}`);
  }

  // Update user to join guild as leader
  await supabaseAdmin
    .from('users')
    .update({
      guild_id: data.id,
      guild_role: 'leader'
    })
    .eq('id', guildData.leaderId);

  const guild = await getGuildById(data.id);
  if (!guild) {
    throw new Error('Failed to retrieve created guild');
  }

  return guild;
}

export async function updateGuild(guildId: string, updates: Partial<Guild>): Promise<Guild> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.level !== undefined) updateData.level = updates.level;
  if (updates.experience !== undefined) updateData.experience = updates.experience;
  if (updates.experienceToNext !== undefined) updateData.experience_to_next = updates.experienceToNext;
  if (updates.gold !== undefined) updateData.gold = updates.gold;
  if (updates.maxMembers !== undefined) updateData.max_members = updates.maxMembers;
  if (updates.leaderId !== undefined) updateData.leader_id = updates.leaderId;
  if (updates.settings !== undefined) updateData.settings = updates.settings;

  const { data, error } = await supabaseAdmin
    .from('guilds')
    .update(updateData)
    .eq('id', guildId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update guild: ${error?.message || 'Unknown error'}`);
  }

  const guild = await getGuildById(guildId);
  if (!guild) {
    throw new Error('Failed to retrieve updated guild');
  }

  return guild;
}

export async function getAllGuilds(limit: number = 50, offset: number = 0): Promise<Guild[]> {
  if (!supabaseAdmin) {
    throw new Error('Database not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('guilds')
    .select('*')
    .order('level', { ascending: false })
    .order('experience', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return [];
  }

  const guilds: Guild[] = [];
  for (const row of data) {
    const guild = await getGuildById(row.id);
    if (guild) {
      guilds.push(guild);
    }
  }

  return guilds;
}

