import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { ITEMS } from '@/data/gameData';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemsToSell } = body;

    if (!userId || !itemsToSell || !Array.isArray(itemsToSell)) {
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
    const inventory = [...(user.inventory || [])];
    let totalGold = 0;
    const soldItems = [];

    // Process each item to sell
    for (const sellItem of itemsToSell) {
      const { itemId, amount } = sellItem;
      
      // Find the item in inventory
      const itemIndex = inventory.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        continue; // Item not found, skip
      }

      const item = inventory[itemIndex];
      const itemTemplate = ITEMS.find(template => template.id === itemId);
      
      if (!itemTemplate) {
        continue; // Item template not found, skip
      }

      // Calculate how much to sell
      const availableAmount = item.amount || 1;
      const sellAmount = Math.min(amount, availableAmount);
      
      if (sellAmount <= 0) {
        continue;
      }

      // Calculate gold earned
      const itemGold = itemTemplate.value * sellAmount;
      totalGold += itemGold;

      // Update or remove item from inventory
      if (sellAmount >= availableAmount) {
        // Remove entire stack
        inventory.splice(itemIndex, 1);
      } else {
        // Reduce stack size
        inventory[itemIndex] = {
          ...item,
          amount: availableAmount - sellAmount
        };
      }

      soldItems.push({
        name: itemTemplate.name,
        amount: sellAmount,
        gold: itemGold
      });
    }

    // Update user
    const updatedUser = {
      ...user,
      inventory,
      gold: (user.gold || 0) + totalGold
    };

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
      totalGold,
      soldItems,
      message: `Vendeu ${soldItems.length} tipo(s) de item(s) por ${totalGold} ouro!`
    });

  } catch (error) {
    console.error('Sell items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
