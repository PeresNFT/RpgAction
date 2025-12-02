import { NextRequest, NextResponse } from 'next/server';
import { getGuildById, getUserById, updateUser, getGuildMembers } from '@/lib/db-helpers';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
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

    // Check if user is in a guild
    if (!user.guildId) {
      return NextResponse.json(
        { error: 'You are not in a guild' },
        { status: 400 }
      );
    }

    const guild = await getGuildById(user.guildId);
    if (!guild) {
      // User has guildId but guild doesn't exist, just remove it
      const updatedUser = {
        ...user,
        guildId: undefined,
        guildRole: undefined
      };
      await updateUser(updatedUser);
      return NextResponse.json({
        success: true,
        message: 'Left guild'
      });
    }

    // If user is leader, transfer leadership or disband guild
    if (user.guildRole === 'leader') {
      const members = await getGuildMembers(guild.id);
      const officers = members.filter(m => m.role === 'officer' && m.id !== userId);
      const regularMembers = members.filter(m => m.role === 'member' && m.id !== userId);

      // Try to transfer to an officer
      if (officers.length > 0) {
        const newLeader = officers[0];
        await supabaseAdmin!
          .from('users')
          .update({ guild_role: 'leader' })
          .eq('id', newLeader.id);

        await supabaseAdmin!
          .from('guilds')
          .update({ leader_id: newLeader.id })
          .eq('id', guild.id);
      }
      // Try to transfer to a regular member
      else if (regularMembers.length > 0) {
        const newLeader = regularMembers[0];
        await supabaseAdmin!
          .from('users')
          .update({ guild_role: 'leader' })
          .eq('id', newLeader.id);

        await supabaseAdmin!
          .from('guilds')
          .update({ leader_id: newLeader.id })
          .eq('id', guild.id);
      }
      // No other members, disband guild
      else {
        await supabaseAdmin!
          .from('guilds')
          .delete()
          .eq('id', guild.id);
      }
    }

    // Remove user from guild
    const updatedUser = {
      ...user,
      guildId: undefined,
      guildRole: undefined
    };

    await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Left guild successfully'
    });

  } catch (error: any) {
    console.error('Leave guild error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

