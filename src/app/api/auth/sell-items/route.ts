import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { User } from '@/types/user';
import { ITEMS } from '@/data/gameData';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

function loadUsers(): User[] {
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
}

function saveUsers(users: User[]): void {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

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

    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[userIndex];
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

    users[userIndex] = updatedUser;
    saveUsers(users);

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
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
