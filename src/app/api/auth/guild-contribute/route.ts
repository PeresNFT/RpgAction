import { NextRequest, NextResponse } from 'next/server';
import { getGuildById, getUserById, updateGuild } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const { userId, guildId, experience } = await request.json();

    if (!userId || !guildId || experience === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (experience <= 0 || !Number.isInteger(experience)) {
      return NextResponse.json(
        { error: 'Experience must be a positive integer' },
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

    // Add experience to guild
    let newExperience = guild.experience + experience;
    let newLevel = guild.level;
    let newExperienceToNext = guild.experienceToNext;

    // Level up guild if needed
    while (newExperience >= newExperienceToNext) {
      newExperience -= newExperienceToNext;
      newLevel += 1;
      // Experience needed increases with level
      newExperienceToNext = Math.floor(100 * Math.pow(1.5, newLevel - 1));
    }

    const updatedGuild = await updateGuild(guildId, {
      level: newLevel,
      experience: newExperience,
      experienceToNext: newExperienceToNext
    });

    return NextResponse.json({
      success: true,
      message: `Contributed ${experience} experience to guild`,
      guild: updatedGuild,
      leveledUp: newLevel > guild.level
    });

  } catch (error: any) {
    console.error('Guild contribute error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

