import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const { userId, imagePath } = await request.json();

    if (!userId || !imagePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify user owns this profile image
    // For now, we'll allow any image path, but you can add validation here
    // if you want to restrict to purchased images only

    // Update profile image
    const updatedUser = {
      ...user,
      profileImage: imagePath
    };

    // Save user
    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Foto de perfil atualizada!',
      user: userWithoutPassword(savedUser)
    });

  } catch (error: any) {
    console.error('Update profile image error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

