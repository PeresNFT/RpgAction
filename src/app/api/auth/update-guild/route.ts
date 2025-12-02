import { NextRequest, NextResponse } from 'next/server';
import { getGuildById, getUserById, updateGuild } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const { userId, guildId, updates } = await request.json();

    if (!userId || !guildId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get guild
    const guild = await getGuildById(guildId);
    if (!guild) {
      return NextResponse.json(
        { error: 'Guild not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isLeader = guild.leaderId === userId;
    const isOfficer = user.guildRole === 'officer' && user.guildId === guildId;

    if (!isLeader && !isOfficer) {
      return NextResponse.json(
        { error: 'You do not have permission to update this guild' },
        { status: 403 }
      );
    }

    // Validate updates
    const allowedUpdates: any = {};
    
    // Anyone can update description
    if (updates.description !== undefined) {
      allowedUpdates.description = updates.description?.trim() || null;
    }

    // Only leader can update name, icon, settings, leader
    if (isLeader) {
      if (updates.name !== undefined) {
        if (updates.name.length < 3 || updates.name.length > 30) {
          return NextResponse.json(
            { error: 'Guild name must be between 3 and 30 characters' },
            { status: 400 }
          );
        }
        allowedUpdates.name = updates.name.trim();
      }

      if (updates.icon !== undefined) {
        allowedUpdates.icon = updates.icon;
      }

      if (updates.settings !== undefined) {
        allowedUpdates.settings = updates.settings;
      }

      if (updates.leaderId !== undefined && updates.leaderId !== guild.leaderId) {
        // Transfer leadership
        const { supabaseAdmin } = await import('@/lib/supabase');
        if (!supabaseAdmin) {
          return NextResponse.json(
            { error: 'Database not configured' },
            { status: 500 }
          );
        }

        const newLeader = await getUserById(updates.leaderId);
        if (!newLeader || newLeader.guildId !== guildId) {
          return NextResponse.json(
            { error: 'New leader must be a member of the guild' },
            { status: 400 }
          );
        }

        // Update old leader to officer
        await supabaseAdmin
          .from('users')
          .update({ guild_role: 'officer' })
          .eq('id', userId);

        // Update new leader
        await supabaseAdmin
          .from('users')
          .update({ guild_role: 'leader' })
          .eq('id', updates.leaderId);

        allowedUpdates.leaderId = updates.leaderId;
      }
    }

    // Update guild
    const updatedGuild = await updateGuild(guildId, allowedUpdates);

    return NextResponse.json({
      success: true,
      guild: updatedGuild
    });

  } catch (error: any) {
    console.error('Update guild error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

