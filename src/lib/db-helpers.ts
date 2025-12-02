import { supabaseAdmin, dbRowToUser, userToDbRow } from './supabase';
import { User } from '@/types/user';

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

