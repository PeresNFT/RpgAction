'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Coins, 
  Gem,
  X,
  Package,
  TrendingUp,
  User
} from 'lucide-react';
import { MarketItem, Item } from '@/types/game';
import { SHOP_ITEMS, ShopItem, ITEMS } from '@/data/gameData';
import { Card } from '@/components/Card';

interface MarketSystemProps {
  onListMarketItems: (currencyType?: 'gold' | 'diamonds', limit?: number, offset?: number) => Promise<{ success: boolean; items?: MarketItem[]; total?: number }>;
  onAddMarketItem: (itemId: string, amount: number, price: number, priceDiamonds: number | undefined, currencyType: 'gold' | 'diamonds') => Promise<{ success: boolean; error?: string; marketItem?: MarketItem }>;
  onBuyMarketItem: (marketItemId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onRemoveMarketItem: (marketItemId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onBuyShopItem?: (shopItemId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onUpdateProfileImage?: (imagePath: string) => Promise<{ success: boolean; error?: string }>;
  userId: string;
  userGold: number;
  userDiamonds: number;
  userInventory: Item[];
  purchasedItems?: string[];
  profileImage?: string;
}

export function MarketSystem({
  onListMarketItems,
  onAddMarketItem,
  onBuyMarketItem,
  onRemoveMarketItem,
  onBuyShopItem,
  onUpdateProfileImage,
  userId,
  userGold,
  userDiamonds,
  userInventory,
  purchasedItems = [],
  profileImage
}: MarketSystemProps) {
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'shop'>('shop');
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'gold' | 'diamonds'>('all');
  
  // Add item modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemToSell, setSelectedItemToSell] = useState<Item | null>(null);
  const [sellAmount, setSellAmount] = useState('1');
  const [sellPriceGold, setSellPriceGold] = useState('');
  const [sellPriceDiamonds, setSellPriceDiamonds] = useState('');
  const [sellCurrencyType, setSellCurrencyType] = useState<'gold' | 'diamonds'>('gold');

  // Load market items
  const loadMarketItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onListMarketItems(
        currencyFilter === 'all' ? undefined : currencyFilter,
        50,
        0
      );
      if (result.success && result.items) {
        setMarketItems(result.items);
      } else {
        setError('Failed to load market items');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load market items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketItems();
  }, [currencyFilter]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showProfileImageModal) {
          setShowProfileImageModal(false);
        }
        if (showAddModal) {
          setShowAddModal(false);
          setSelectedItemToSell(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showProfileImageModal, showAddModal]);

  const handleAddItem = async () => {
    if (!selectedItemToSell) return;

    const amount = parseInt(sellAmount) || 1;
    const availableAmount = selectedItemToSell.amount || 1;
    
    if (amount < 1 || amount > availableAmount) {
      setError(`Quantidade inválida. Você tem ${availableAmount} deste item.`);
      return;
    }

    const price = sellCurrencyType === 'gold' ? parseInt(sellPriceGold) : 0;
    const priceDiamonds = sellCurrencyType === 'diamonds' ? parseInt(sellPriceDiamonds) : undefined;

    if (price <= 0 && (!priceDiamonds || priceDiamonds <= 0)) {
      setError('Por favor, digite um preço válido');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await onAddMarketItem(
        selectedItemToSell.id,
        amount,
        price,
        priceDiamonds,
        sellCurrencyType
      );
      
      if (result.success) {
        setShowAddModal(false);
        setSelectedItemToSell(null);
        setSellAmount('1');
        setSellPriceGold('');
        setSellPriceDiamonds('');
        setSellCurrencyType('gold');
        await loadMarketItems();
      } else {
        setError(result.error || 'Falha ao adicionar item ao mercado');
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao adicionar item ao mercado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyItem = async (marketItemId: string) => {
    if (!confirm('Deseja realmente comprar este item?')) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await onBuyMarketItem(marketItemId);
      
      if (result.success) {
        await loadMarketItems();
        alert(result.message || 'Item comprado com sucesso!');
      } else {
        setError(result.error || 'Failed to buy item');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to buy item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (marketItemId: string) => {
    if (!confirm('Deseja realmente remover este item do mercado?')) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await onRemoveMarketItem(marketItemId);
      
      if (result.success) {
        await loadMarketItems();
        alert(result.message || 'Item removido do mercado!');
      } else {
        setError(result.error || 'Failed to remove item');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  const rarityColors: Record<string, string> = {
    common: 'border-dark-border bg-dark-bg-tertiary',
    uncommon: 'border-green-500/50 bg-green-500/10',
    rare: 'border-blue-500/50 bg-blue-500/10',
    epic: 'border-purple-500/50 bg-purple-500/10',
    legendary: 'border-yellow-500/50 bg-yellow-500/10'
  };

  // Get user's items currently on market
  const myMarketItems = marketItems.filter(item => item.sellerId === userId);

  // Função para agrupar itens empilháveis no inventário
  const getStackedInventory = () => {
    if (!userInventory || userInventory.length === 0) return [];
    
    const stacked: { [key: string]: Item } = {};
    
    userInventory.forEach(item => {
      const key = item.id;
      if (stacked[key]) {
        // Se já existe, somar as quantidades
        stacked[key] = {
          ...stacked[key],
          amount: (stacked[key].amount || 1) + (item.amount || 1)
        };
      } else {
        // Se não existe, adicionar
        stacked[key] = { ...item, amount: item.amount || 1 };
      }
    });
    
    return Object.values(stacked);
  };

  return (
    <div className="space-y-6">
      {/* Header with currency display */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-3xl font-bold text-white">💎 Mercado</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(22, 33, 62, 0.4)' }}>
              <Coins className="w-5 h-5 text-primary-yellow" />
              <span className="text-white font-bold">{userGold.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(22, 33, 62, 0.4)' }}>
              <Gem className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-bold">{userDiamonds.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'shop'
                ? 'bg-accent-purple text-white'
                : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-card'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Loja NPC
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'browse'
                ? 'bg-accent-purple text-white'
                : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-card'
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Explorar
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'sell'
                ? 'bg-accent-purple text-white'
                : 'bg-dark-bg-tertiary text-dark-text-secondary hover:bg-dark-bg-card'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Vender Item
          </button>
        </div>

        {/* Currency Filter */}
        {activeTab === 'browse' && (
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setCurrencyFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                currencyFilter === 'all'
                  ? 'bg-accent-blue text-white'
                  : 'bg-dark-bg-tertiary text-dark-text-secondary'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setCurrencyFilter('gold')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1 ${
                currencyFilter === 'gold'
                  ? 'bg-accent-blue text-white'
                  : 'bg-dark-bg-tertiary text-dark-text-secondary'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Ouro</span>
            </button>
            <button
              onClick={() => setCurrencyFilter('diamonds')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1 ${
                currencyFilter === 'diamonds'
                  ? 'bg-accent-blue text-white'
                  : 'bg-dark-bg-tertiary text-dark-text-secondary'
              }`}
            >
              <Gem className="w-4 h-4" />
              <span>Diamantes</span>
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
      </Card>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* My Items on Market */}
          {myMarketItems.length > 0 && (
            <Card>
              <h4 className="text-xl font-bold text-white mb-4">Meus Itens à Venda</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myMarketItems.map((item) => (
                  <div
                    key={item.id}
                    className={`${rarityColors[item.item.rarity] || rarityColors.common} p-4 rounded-xl border-2`}
                    style={{ opacity: 0.7 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{item.item.icon}</span>
                        <div>
                          <h5 className="text-white font-bold text-sm">{item.item.name}</h5>
                          <p className="text-dark-text-secondary text-xs">Nv. {item.item.level}</p>
                          <p className="text-primary-yellow text-xs font-semibold mt-1">
                            Quantidade: {item.amount || 1}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-dark-border">
                      <div className="flex items-center space-x-2">
                        {item.currencyType === 'gold' ? (
                          <>
                            <Coins className="w-4 h-4 text-primary-yellow" />
                            <span className="text-primary-yellow font-bold">{item.price.toLocaleString()}</span>
                            {item.amount && item.amount > 1 && (
                              <span className="text-dark-text-secondary text-xs">
                                (total: {(item.price * item.amount).toLocaleString()})
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <Gem className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400 font-bold">{item.priceDiamonds?.toLocaleString()}</span>
                            {item.amount && item.amount > 1 && (
                              <span className="text-dark-text-secondary text-xs">
                                (total: {((item.priceDiamonds || 0) * item.amount).toLocaleString()})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Market Items List */}
          <Card>
            <h4 className="text-xl font-bold text-white mb-4">Itens Disponíveis</h4>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-purple mx-auto mb-4"></div>
                <p className="text-dark-text-secondary">Carregando itens...</p>
              </div>
            ) : marketItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-dark-text-muted" />
                <p className="text-dark-text-secondary text-lg">Nenhum item disponível no mercado</p>
                <p className="text-dark-text-muted text-sm mt-2">Seja o primeiro a vender!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {marketItems
                  .filter(item => item.sellerId !== userId) // Don't show own items in browse
                  .map((marketItem) => {
                    const canAfford = marketItem.currencyType === 'gold'
                      ? userGold >= marketItem.price
                      : (userDiamonds || 0) >= (marketItem.priceDiamonds || 0);

                    return (
                      <div
                        key={marketItem.id}
                        className={`${rarityColors[marketItem.item.rarity] || rarityColors.common} p-4 rounded-xl border-2 hover:scale-105 transition-all duration-300 h-full flex flex-col`}
                        style={{ opacity: 0.7 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2 flex-1">
                            <span className="text-2xl">{marketItem.item.icon}</span>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-white font-bold text-sm truncate">{marketItem.item.name}</h5>
                              <p className="text-dark-text-secondary text-xs">Nv. {marketItem.item.level}</p>
                            </div>
                          </div>
                        </div>
                        
                        {(marketItem.amount || 1) > 1 && (
                          <div className="mb-2">
                            <span className="text-primary-yellow text-xs font-semibold">Quantidade: {marketItem.amount || 1}</span>
                          </div>
                        )}
                        
                        <p className="text-dark-text-secondary text-xs mb-2 line-clamp-2 min-h-[2.5rem]">
                          {marketItem.item.description}
                        </p>

                        <div className="mt-auto space-y-2 pt-2 border-t border-dark-border">
                          <div className="flex items-center justify-between">
                            <span className="text-dark-text-secondary text-xs">Vendedor:</span>
                            <span className="text-white text-xs font-semibold">{marketItem.sellerNickname}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-dark-text-secondary text-xs">
                              Preço {marketItem.amount && marketItem.amount > 1 ? '(por unidade)' : ''}:
                            </span>
                            <div className="flex items-center space-x-1">
                              {marketItem.currencyType === 'gold' ? (
                                <>
                                  <Coins className="w-4 h-4 text-primary-yellow" />
                                  <span className="text-primary-yellow font-bold">{marketItem.price.toLocaleString()}</span>
                                </>
                              ) : (
                                <>
                                  <Gem className="w-4 h-4 text-cyan-400" />
                                  <span className="text-cyan-400 font-bold">{marketItem.priceDiamonds?.toLocaleString()}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleBuyItem(marketItem.id)}
                            disabled={!canAfford || isLoading}
                            className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                              canAfford && !isLoading
                                ? 'bg-accent-purple hover:opacity-90 text-white'
                                : 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>{canAfford ? 'Comprar' : 'Sem recursos'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <Card>
          <h4 className="text-xl font-bold text-white mb-4">Vender Item</h4>
          <p className="text-dark-text-secondary text-sm mb-4">
            Selecione um item do seu inventário para vender. Você pode vender múltiplos itens do mesmo tipo em uma única venda.
          </p>

          {userInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-dark-text-muted" />
              <p className="text-dark-text-secondary">Seu inventário está vazio</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                {getStackedInventory().map((item) => (
                  <div
                    key={item.id}
                    className={`${rarityColors[item.rarity] || rarityColors.common} p-4 rounded-xl border-2 cursor-pointer hover:scale-105 transition-all duration-300 ${
                      selectedItemToSell?.id === item.id ? 'ring-2 ring-accent-purple' : ''
                    }`}
                    style={{ opacity: 0.7 }}
                    onClick={() => {
                      setSelectedItemToSell(item);
                      setSellAmount('1');
                      setShowAddModal(true);
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <h5 className="text-white font-bold text-sm">{item.name}</h5>
                        <p className="text-dark-text-secondary text-xs">Nv. {item.level}</p>
                        <p className="text-primary-yellow text-xs font-semibold mt-1">
                          Qtd: {item.amount || 1}
                        </p>
                      </div>
                    </div>
                    <p className="text-dark-text-secondary text-xs line-clamp-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Shop Tab */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          <Card>
            <h4 className="text-xl font-bold text-white mb-4">Loja NPC</h4>
            <p className="text-dark-text-secondary text-sm mb-6">
              Compre itens exclusivos diretamente da loja NPC. Poções podem ser compradas com ouro, 
              enquanto fotos de perfil exclusivas requerem diamantes.
            </p>

            {/* Consumables Section */}
            <div className="mb-8">
              <h5 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Coins className="w-5 h-5 text-primary-yellow" />
                <span>Poções (Ouro)</span>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {SHOP_ITEMS.filter(item => item.type === 'consumable').map((shopItem) => {
                  const canAfford = shopItem.priceGold ? userGold >= shopItem.priceGold : false;
                  // Get item image path from ITEMS array
                  const gameItem = shopItem.itemId ? ITEMS.find(item => item.id === shopItem.itemId) : null;
                  const itemImagePath = gameItem?.imagePath;
                  
                  return (
                    <Card
                      key={shopItem.id}
                      variant="small"
                      className="hover:scale-105 transition-all duration-300 flex flex-col"
                      style={{ minHeight: '160px' }}
                    >
                      <div className="flex items-start space-x-3 mb-3 flex-shrink-0">
                        {itemImagePath ? (
                          <img
                            src={itemImagePath}
                            alt={shopItem.name}
                            className="w-12 h-12 object-contain flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('span');
                                fallback.className = 'text-3xl flex-shrink-0';
                                fallback.textContent = shopItem.icon;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-3xl flex-shrink-0">{shopItem.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <h6 className="text-white font-bold mb-1">{shopItem.name}</h6>
                          <p className="text-dark-text-secondary text-xs leading-relaxed">{shopItem.description}</p>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-dark-border">
                        <div className="flex items-center space-x-2">
                          <Coins className="w-4 h-4 text-primary-yellow" />
                          <span className="text-primary-yellow font-bold">{shopItem.priceGold?.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={async () => {
                            if (!onBuyShopItem) return;
                            setIsLoading(true);
                            setError(null);
                            try {
                              const result = await onBuyShopItem(shopItem.id);
                              if (result.success) {
                                alert(result.message || 'Item comprado com sucesso!');
                              } else {
                                setError(result.error || 'Falha ao comprar item');
                              }
                            } catch (err: any) {
                              setError(err.message || 'Falha ao comprar item');
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={!canAfford || isLoading || !onBuyShopItem}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                            canAfford && !isLoading && onBuyShopItem
                              ? 'bg-accent-purple hover:opacity-90 text-white'
                              : 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Comprar' : 'Sem ouro'}
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Profile Images Section */}
            <div>
              <h5 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Gem className="w-5 h-5 text-cyan-400" />
                <span>Fotos de Perfil (Diamantes)</span>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHOP_ITEMS.filter(item => item.type === 'profile_image').map((shopItem) => {
                  const isOwned = purchasedItems.includes(shopItem.id);
                  const isSelected = profileImage === shopItem.imagePath;
                  const canAfford = shopItem.priceDiamonds ? (userDiamonds || 0) >= shopItem.priceDiamonds : false;
                  
                  return (
                    <Card
                      key={shopItem.id}
                      variant="small"
                      className={`border-2 transition-all duration-300 ${
                        isSelected ? 'border-accent-purple' : 'border-dark-border'
                      } ${isOwned ? 'hover:scale-105' : ''}`}
                    >
                      <div className="flex flex-col items-center mb-3">
                        {shopItem.imagePath ? (
                          <img 
                            src={shopItem.imagePath} 
                            alt={shopItem.name}
                            className="w-24 h-24 object-cover rounded-lg mb-2 border-2 border-dark-border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-24 h-24 bg-dark-bg-tertiary rounded-lg flex items-center justify-center text-4xl mb-2';
                                fallback.textContent = shopItem.icon;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-dark-bg-tertiary rounded-lg flex items-center justify-center text-4xl mb-2">
                            {shopItem.icon}
                          </div>
                        )}
                        <h6 className="text-white font-bold text-center">{shopItem.name}</h6>
                        <p className="text-dark-text-secondary text-xs text-center">{shopItem.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-dark-border">
                        {isOwned ? (
                          <>
                            {isSelected ? (
                              <span className="text-accent-purple font-semibold text-sm">Selecionada</span>
                            ) : (
                              <button
                                onClick={async () => {
                                  if (!onUpdateProfileImage || !shopItem.imagePath) return;
                                  setIsLoading(true);
                                  setError(null);
                                  try {
                                    const result = await onUpdateProfileImage(shopItem.imagePath);
                                    if (result.success) {
                                      alert('Foto de perfil atualizada!');
                                    } else {
                                      setError(result.error || 'Falha ao atualizar foto de perfil');
                                    }
                                  } catch (err: any) {
                                    setError(err.message || 'Falha ao atualizar foto de perfil');
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }}
                                disabled={isLoading || !onUpdateProfileImage}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent-blue hover:opacity-90 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Usar
                              </button>
                            )}
                            <button
                              onClick={() => setShowProfileImageModal(true)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold bg-dark-bg-tertiary hover:bg-dark-bg-card text-white transition-all duration-300"
                            >
                              Ver
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2">
                              <Gem className="w-4 h-4 text-cyan-400" />
                              <span className="text-cyan-400 font-bold">{shopItem.priceDiamonds?.toLocaleString()}</span>
                            </div>
                            <button
                              onClick={async () => {
                                if (!onBuyShopItem) return;
                                setIsLoading(true);
                                setError(null);
                                try {
                                  const result = await onBuyShopItem(shopItem.id);
                                  if (result.success) {
                                    alert(result.message || 'Item comprado com sucesso!');
                                  } else {
                                    setError(result.error || 'Falha ao comprar item');
                                  }
                                } catch (err: any) {
                                  setError(err.message || 'Falha ao comprar item');
                                } finally {
                                  setIsLoading(false);
                                }
                              }}
                              disabled={!canAfford || isLoading || !onBuyShopItem}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                canAfford && !isLoading && onBuyShopItem
                                  ? 'bg-accent-purple hover:opacity-90 text-white'
                                  : 'bg-dark-bg-tertiary text-dark-text-muted cursor-not-allowed'
                              }`}
                            >
                              {canAfford ? 'Comprar' : 'Sem diamantes'}
                            </button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Profile Image Modal */}
      {showProfileImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[9999]">
          <Card className="max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Suas Fotos de Perfil</h3>
              <button
                onClick={() => setShowProfileImageModal(false)}
                className="text-dark-text-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {SHOP_ITEMS.filter(item => item.type === 'profile_image' && purchasedItems.includes(item.id)).map((shopItem) => {
                const isSelected = profileImage === shopItem.imagePath;
                return (
                  <div
                    key={shopItem.id}
                    className={`relative p-2 rounded-xl border-2 transition-all duration-300 ${
                      isSelected ? 'border-accent-purple' : 'border-dark-border'
                    }`}
                  >
                    {shopItem.imagePath && (
                      <img 
                        src={shopItem.imagePath} 
                        alt={shopItem.name}
                        className="w-full aspect-square object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full aspect-square bg-dark-bg-tertiary rounded-lg flex items-center justify-center text-4xl';
                            fallback.textContent = shopItem.icon;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-accent-purple rounded-full p-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {onUpdateProfileImage && shopItem.imagePath && !isSelected && (
                      <button
                        onClick={async () => {
                          setIsLoading(true);
                          setError(null);
                          try {
                            const result = await onUpdateProfileImage(shopItem.imagePath!);
                            if (result.success) {
                              setShowProfileImageModal(false);
                              alert('Foto de perfil atualizada!');
                            } else {
                              setError(result.error || 'Falha ao atualizar foto de perfil');
                            }
                          } catch (err: any) {
                            setError(err.message || 'Falha ao atualizar foto de perfil');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="absolute bottom-2 left-2 right-2 bg-accent-blue hover:opacity-90 text-white px-2 py-1 rounded text-xs font-semibold transition-all duration-300 disabled:opacity-50"
                      >
                        Usar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {SHOP_ITEMS.filter(item => item.type === 'profile_image' && purchasedItems.includes(item.id)).length === 0 && (
              <div className="text-center py-8 text-dark-text-secondary">
                Você ainda não possui fotos de perfil. Compre algumas na loja!
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && selectedItemToSell && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[9999]">
          <Card className="max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Vender Item</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedItemToSell(null);
                  setSellAmount('1');
                  setSellPriceGold('');
                  setSellPriceDiamonds('');
                }}
                className="text-dark-text-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <Card variant="small" className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">{selectedItemToSell.icon}</span>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{selectedItemToSell.name}</h4>
                  <p className="text-dark-text-secondary text-xs">{selectedItemToSell.description}</p>
                  <p className="text-primary-yellow text-xs mt-1">
                    Quantidade disponível: {selectedItemToSell.amount || 1}
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItemToSell.amount || 1}
                  value={sellAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    const max = selectedItemToSell.amount || 1;
                    if (val === '' || parseInt(val) <= 0) {
                      setSellAmount('1');
                    } else if (parseInt(val) > max) {
                      setSellAmount(max.toString());
                    } else {
                      setSellAmount(val);
                    }
                  }}
                  className="w-full bg-dark-bg-tertiary border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                  placeholder="Quantidade"
                />
                <p className="text-dark-text-secondary text-xs mt-1">
                  Máximo: {selectedItemToSell.amount || 1}
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Tipo de Moeda</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSellCurrencyType('gold');
                      setSellPriceDiamonds('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                      sellCurrencyType === 'gold'
                        ? 'bg-accent-purple text-white'
                        : 'bg-dark-bg-tertiary text-dark-text-secondary'
                    }`}
                  >
                    <Coins className="w-5 h-5" />
                    <span>Ouro</span>
                  </button>
                  <button
                    onClick={() => {
                      setSellCurrencyType('diamonds');
                      setSellPriceGold('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                      sellCurrencyType === 'diamonds'
                        ? 'bg-accent-purple text-white'
                        : 'bg-dark-bg-tertiary text-dark-text-secondary'
                    }`}
                  >
                    <Gem className="w-5 h-5" />
                    <span>Diamantes</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Preço ({sellCurrencyType === 'gold' ? 'Ouro' : 'Diamantes'})
                </label>
                <input
                  type="number"
                  min="1"
                  value={sellCurrencyType === 'gold' ? sellPriceGold : sellPriceDiamonds}
                  onChange={(e) => {
                    if (sellCurrencyType === 'gold') {
                      setSellPriceGold(e.target.value);
                    } else {
                      setSellPriceDiamonds(e.target.value);
                    }
                  }}
                  className="w-full bg-dark-bg-tertiary border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-purple"
                  placeholder={`Digite o preço em ${sellCurrencyType === 'gold' ? 'ouro' : 'diamantes'}`}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddItem}
                  disabled={isLoading || (sellCurrencyType === 'gold' ? !sellPriceGold : !sellPriceDiamonds)}
                  className="flex-1 bg-accent-purple hover:opacity-90 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Adicionando...' : 'Adicionar ao Mercado'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedItemToSell(null);
                    setSellPriceGold('');
                    setSellPriceDiamonds('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

