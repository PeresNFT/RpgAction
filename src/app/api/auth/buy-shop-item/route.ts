import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';
import { SHOP_ITEMS, ITEMS } from '@/data/gameData';

export async function POST(request: NextRequest) {
  try {
    const { userId, shopItemId } = await request.json();

    if (!userId || !shopItemId) {
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

    // Find shop item
    const shopItem = SHOP_ITEMS.find(item => item.id === shopItemId);
    if (!shopItem) {
      return NextResponse.json(
        { error: 'Shop item not found' },
        { status: 404 }
      );
    }

    // Check if user already owns profile images
    if (shopItem.type === 'profile_image') {
      const purchasedItems = user.purchasedItems || [];
      if (purchasedItems.includes(shopItemId)) {
        return NextResponse.json(
          { error: 'Você já possui este item' },
          { status: 400 }
        );
      }
    }

    // Check if user has enough currency
    if (shopItem.priceGold && user.gold < shopItem.priceGold) {
      return NextResponse.json(
        { error: 'Ouro insuficiente' },
        { status: 400 }
      );
    }

    if (shopItem.priceDiamonds && (user.diamonds || 0) < shopItem.priceDiamonds) {
      return NextResponse.json(
        { error: 'Diamantes insuficientes' },
        { status: 400 }
      );
    }

    // Process purchase
    let updatedUser = { ...user };
    
    // Deduct currency
    if (shopItem.priceGold) {
      updatedUser.gold = user.gold - shopItem.priceGold;
    }
    if (shopItem.priceDiamonds) {
      updatedUser.diamonds = (user.diamonds || 0) - shopItem.priceDiamonds;
    }

    // Add item based on type
    if (shopItem.type === 'consumable' && shopItem.itemId) {
      // Add consumable to inventory
      const gameItem = ITEMS.find(item => item.id === shopItem.itemId);
      if (gameItem) {
        const inventory = updatedUser.inventory || [];
        const existingItem = inventory.find(item => item.id === shopItem.itemId);
        
        if (existingItem) {
          existingItem.amount = (existingItem.amount || 1) + 1;
        } else {
          inventory.push({
            ...gameItem,
            amount: 1
          });
        }
        
        updatedUser.inventory = inventory;
      }
    } else if (shopItem.type === 'profile_image') {
      // Add to purchased items
      const purchasedItems = updatedUser.purchasedItems || [];
      purchasedItems.push(shopItemId);
      updatedUser.purchasedItems = purchasedItems;
    }

    // Save user
    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      message: shopItem.type === 'consumable' 
        ? 'Item comprado e adicionado ao inventário!' 
        : 'Item comprado com sucesso!',
      user: userWithoutPassword(savedUser)
    });

  } catch (error: any) {
    console.error('Buy shop item error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

