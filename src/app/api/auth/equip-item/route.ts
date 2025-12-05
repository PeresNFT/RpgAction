import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/user';
import { CharacterClass } from '@/types/game';
import { ITEMS } from '@/data/gameData';
import { getUserById, updateUser, userWithoutPassword } from '@/lib/db-helpers';

// Helper function to determine equipment slot based on item ID
function getEquipmentSlot(itemId: string): keyof User['equippedItems'] | null {
  // Helmets (check first to avoid conflicts)
  if (itemId.includes('helmet')) return 'helmet';
  
  // Boots (check before armor to avoid conflicts)
  if (itemId.includes('boots')) return 'boots';
  
  // Shields and offhand items (check before armor)
  if (itemId.includes('shield') || itemId.includes('bible')) return 'offhand';
  
  // Rings
  if (itemId.includes('ring')) return 'ring';
  
  // Amulets
  if (itemId.includes('amulet')) return 'amulet';
  
  // Weapons (check before armor)
  if (itemId.includes('sword') || itemId.includes('bow') || itemId.includes('staff') || itemId.includes('weapon')) {
    return 'weapon';
  }
  
  // Armor (check last to avoid conflicts with other armor pieces)
  if (itemId.includes('armor')) return 'armor';
  
  // Pants (if any)
  if (itemId.includes('pants')) return 'pants';
  
  // Relics (if any)
  if (itemId.includes('relic')) return 'relic';
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemId } = body;

    if (!userId || !itemId) {
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
    
    // Find item in inventory
    const itemIndex = user.inventory?.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1 || itemIndex === undefined) {
      return NextResponse.json(
        { error: 'Item not found in inventory' },
        { status: 404 }
      );
    }

    const item = user.inventory[itemIndex];
    
    // Check if item is equippable (weapon or armor)
    if (item.type !== 'weapon' && item.type !== 'armor') {
      return NextResponse.json(
        { error: 'Item is not equippable' },
        { status: 400 }
      );
    }

    // Get full item data from ITEMS array
    const fullItem = ITEMS.find(i => i.id === item.id);
    if (!fullItem) {
      return NextResponse.json(
        { error: 'Item template not found' },
        { status: 404 }
      );
    }

    // Check class requirement
    if (fullItem.requiredClass && user.characterClass !== fullItem.requiredClass) {
      const classNames: Record<string, string> = {
        warrior: 'Guerreiro',
        mage: 'Mago',
        archer: 'Arqueiro'
      };
      return NextResponse.json(
        { error: `Este item só pode ser equipado por ${classNames[fullItem.requiredClass] || fullItem.requiredClass}` },
        { status: 400 }
      );
    }

    // Check level requirement
    const playerLevel = user.stats?.level || user.level || 1;
    const requiredLevel = fullItem.requiredLevel || 1;
    if (playerLevel < requiredLevel) {
      return NextResponse.json(
        { error: `Você precisa estar no nível ${requiredLevel} para equipar este item` },
        { status: 400 }
      );
    }

    // Determine equipment slot
    const slot = getEquipmentSlot(item.id);
    
    if (!slot) {
      return NextResponse.json(
        { error: 'Could not determine equipment slot for this item' },
        { status: 400 }
      );
    }

    // Create updated user
    const updatedUser = { ...user };
    const equippedItems = { ...(user.equippedItems || {}) };
    
    // If there's already an item in this slot, add it back to inventory
    if (equippedItems[slot]) {
      const currentEquipped = equippedItems[slot];
      if (currentEquipped) {
        const inventory = updatedUser.inventory || [];
        const existingItem = inventory.find(invItem => invItem.id === currentEquipped.id);
        
        if (existingItem) {
          existingItem.amount = (existingItem.amount || 1) + 1;
        } else {
          inventory.push({ ...currentEquipped, amount: 1 });
        }
        
        updatedUser.inventory = inventory;
      }
    }
    
    // Equip the new item
    equippedItems[slot] = fullItem;
    updatedUser.equippedItems = equippedItems;
    
    // Remove item from inventory (or reduce amount)
    const newInventory = [...(user.inventory || [])];
    if (item.amount && item.amount > 1) {
      newInventory[itemIndex] = { ...item, amount: item.amount - 1 };
    } else {
      newInventory.splice(itemIndex, 1);
    }
    
    updatedUser.inventory = newInventory;

    const savedUser = await updateUser(updatedUser);

    return NextResponse.json({
      success: true,
      user: userWithoutPassword(savedUser),
      message: `Equipou ${fullItem.name}!`
    });

  } catch (error) {
    console.error('Equip item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

