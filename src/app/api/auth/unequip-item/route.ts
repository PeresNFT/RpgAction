import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, slot } = body;

    if (!userId || !slot) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const equippedItems = { ...(user.equippedItems || {}) };
    const itemToUnequip = equippedItems[slot as keyof User['equippedItems']];

    if (!itemToUnequip) {
      return NextResponse.json(
        { error: 'No item equipped in this slot' },
        { status: 400 }
      );
    }

    // Remove item from equipped slot
    delete equippedItems[slot as keyof User['equippedItems']];

    // Add item back to inventory
    const inventory = [...(user.inventory || [])];
    const existingItem = inventory.find(invItem => invItem.id === itemToUnequip.id);

    if (existingItem) {
      existingItem.amount = (existingItem.amount || 1) + 1;
    } else {
      inventory.push({ ...itemToUnequip, amount: 1 });
    }

    const updatedUser: User = {
      ...user,
      equippedItems,
      inventory
    };

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
      message: `Desequipou ${itemToUnequip.name}!`
    });

  } catch (error) {
    console.error('Unequip item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

