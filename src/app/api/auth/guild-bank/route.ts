import { NextRequest, NextResponse } from 'next/server';
import { getGuildById, getUserById, updateGuild, updateUser } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const { userId, guildId, action, amount } = await request.json();

    if (!userId || !guildId || !action || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: 'Amount must be a positive integer' },
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

    // Check if user is in the guild
    if (user.guildId !== guildId) {
      return NextResponse.json(
        { error: 'You are not a member of this guild' },
        { status: 403 }
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

    if (action === 'deposit') {
      // Check if user has enough gold
      if (user.gold < amount) {
        return NextResponse.json(
          { error: 'Insufficient gold' },
          { status: 400 }
        );
      }

      // Deposit gold
      const updatedUser = {
        ...user,
        gold: user.gold - amount
      };
      await updateUser(updatedUser);

      const updatedGuild = await updateGuild(guildId, {
        gold: guild.gold + amount
      });

      return NextResponse.json({
        success: true,
        message: `Deposited ${amount} gold to guild bank`,
        userGold: updatedUser.gold,
        guildGold: updatedGuild.gold
      });

    } else if (action === 'withdraw') {
      // Check permissions (only leader and officers can withdraw)
      if (user.guildRole !== 'leader' && user.guildRole !== 'officer') {
        return NextResponse.json(
          { error: 'Only leaders and officers can withdraw from guild bank' },
          { status: 403 }
        );
      }

      // Check if guild has enough gold
      if (guild.gold < amount) {
        return NextResponse.json(
          { error: 'Guild bank has insufficient gold' },
          { status: 400 }
        );
      }

      // Withdraw gold
      const updatedUser = {
        ...user,
        gold: user.gold + amount
      };
      await updateUser(updatedUser);

      const updatedGuild = await updateGuild(guildId, {
        gold: guild.gold - amount
      });

      return NextResponse.json({
        success: true,
        message: `Withdrew ${amount} gold from guild bank`,
        userGold: updatedUser.gold,
        guildGold: updatedGuild.gold
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "deposit" or "withdraw"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Guild bank error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

