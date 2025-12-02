import { createClient } from '@supabase/supabase-js';
import { User } from '@/types/user';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for client-side operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (uses service role key)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper function to convert database row to User type
export function dbRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    password: row.password,
    createdAt: row.created_at,
    lastLogin: row.last_login,
    characterClass: row.character_class,
    attributes: row.attributes || {
      strength: 10,
      magic: 10,
      dexterity: 10,
      agility: 10,
      vitality: 10,
    },
    availablePoints: row.available_points || 0,
    stats: row.stats || {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      attack: 20,
      defense: 15,
      criticalChance: 5,
      dodgeChance: 4,
    },
    inventory: row.inventory || [],
    battle: row.battle || {
      isActive: false,
      player: {
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
      },
      monster: null,
      turn: 'player',
      battleLog: [],
    },
    collection: row.collection || {
      isActive: false,
      lastCollection: 0,
      collectionInterval: 30,
      skills: [],
      resources: [],
    },
    equippedItems: row.equipped_items || {},
    gold: row.gold || 100,
    pvpStats: row.pvp_stats,
    // Legacy fields
    level: row.stats?.level || row.level || 1,
    experience: row.stats?.experience || row.experience || 0,
    health: row.stats?.health || row.health || 100,
    maxHealth: row.stats?.maxHealth || row.max_health || 100,
    mana: row.stats?.mana || row.mana || 50,
    maxMana: row.stats?.maxMana || row.max_mana || 50,
    strength: row.attributes?.strength || row.strength || 10,
    agility: row.attributes?.agility || row.agility || 10,
    intelligence: row.attributes?.magic || row.intelligence || 10,
    guildId: row.guild_id,
    guildRole: row.guild_role,
  };
}

// Helper function to convert User to database row
export function userToDbRow(user: User): any {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    password: user.password,
    created_at: user.createdAt,
    last_login: user.lastLogin,
    character_class: user.characterClass,
    attributes: user.attributes,
    available_points: user.availablePoints,
    stats: user.stats,
    inventory: user.inventory,
    battle: user.battle,
    collection: user.collection,
    equipped_items: user.equippedItems,
    gold: user.gold,
    pvp_stats: user.pvpStats,
    // Legacy fields for backward compatibility
    level: user.level,
    experience: user.experience,
    health: user.health,
    max_health: user.maxHealth,
    mana: user.mana,
    max_mana: user.maxMana,
    strength: user.strength,
    agility: user.agility,
    intelligence: user.intelligence,
    guild_id: user.guildId,
    guild_role: user.guildRole,
  };
}

