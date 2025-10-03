import { kanaClient, handleKanaError, isKanaConfigured } from './kanaClient';

export interface PerpMarket {
  id: string;
  symbol: string;
  base_asset: string;
  quote_asset: string;
  price: number;
  price_change_24h: number;
  volume_24h: number;
  open_interest: number;
  funding_rate: number;
  max_leverage: number;
  mark_price: number;
  index_price: number;
}

export interface PerpPosition {
  id: string;
  market_id: string;
  market_symbol: string;
  side: 'long' | 'short';
  size: number;
  entry_price: number;
  mark_price: number;
  liquidation_price: number;
  leverage: number;
  margin: number;
  unrealized_pnl: number;
  realized_pnl: number;
  opened_at: string;
  status: 'open' | 'closed' | 'liquidated';
}

export interface OrderRequest {
  market_id: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  order_type: 'market' | 'limit';
  limit_price?: number;
  stop_loss?: number;
  take_profit?: number;
}

export interface PerpsTrade {
  id: string;
  market_symbol: string;
  side: 'long' | 'short';
  size: number;
  entry_price: number;
  exit_price: number;
  pnl: number;
  leverage: number;
  opened_at: string;
  closed_at: string;
  status: 'completed' | 'liquidated';
}

/**
 * Get all available perp markets
 */
export async function getPerpsMarkets(): Promise<PerpMarket[]> {
  if (!isKanaConfigured()) {
    console.warn('[Kana] API not configured, returning mock markets');
    return getMockMarkets();
  }

  try {
    const response = await kanaClient.get('/perps/markets');
    return response.data.markets || [];
  } catch (error) {
    console.error('[Kana] Failed to fetch markets:', handleKanaError(error));
    return getMockMarkets();
  }
}

/**
 * Get specific market details
 */
export async function getMarketDetails(marketId: string): Promise<PerpMarket | null> {
  if (!isKanaConfigured()) {
    console.warn('[Kana] API not configured, returning mock market');
    return getMockMarkets()[0];
  }

  try {
    const response = await kanaClient.get(`/perps/markets/${marketId}`);
    return response.data;
  } catch (error) {
    console.error('[Kana] Failed to fetch market details:', handleKanaError(error));
    return null;
  }
}

/**
 * Get user's open positions
 */
export async function getUserPositions(address: string): Promise<PerpPosition[]> {
  if (!isKanaConfigured()) {
    console.warn('[Kana] API not configured, returning mock positions');
    return getMockPositions();
  }

  try {
    const response = await kanaClient.get(`/perps/positions/${address}`);
    return response.data.positions || [];
  } catch (error) {
    console.error('[Kana] Failed to fetch positions:', handleKanaError(error));
    return [];
  }
}

/**
 * Get user's trading history
 */
export async function getUserTrades(address: string, limit: number = 20): Promise<PerpsTrade[]> {
  if (!isKanaConfigured()) {
    console.warn('[Kana] API not configured, returning mock trades');
    return [];
  }

  try {
    const response = await kanaClient.get(`/perps/trades/${address}`, {
      params: { limit },
    });
    return response.data.trades || [];
  } catch (error) {
    console.error('[Kana] Failed to fetch trades:', handleKanaError(error));
    return [];
  }
}

/**
 * Place a perp order (mock implementation)
 */
export async function placeOrder(address: string, order: OrderRequest): Promise<any> {
  if (!isKanaConfigured()) {
    console.warn('[Kana] API not configured, simulating order placement');
    return {
      success: true,
      order_id: `mock_order_${Date.now()}`,
      message: 'Order placed successfully (mock)',
    };
  }

  try {
    const response = await kanaClient.post('/perps/orders', {
      address,
      ...order,
    });
    return response.data;
  } catch (error) {
    console.error('[Kana] Failed to place order:', handleKanaError(error));
    throw error;
  }
}

/**
 * Close a position
 */
export async function closePosition(positionId: string): Promise<any> {
  if (!isKanaConfigured()) {
    console.warn('[Kana] API not configured, simulating position close');
    return {
      success: true,
      message: 'Position closed successfully (mock)',
    };
  }

  try {
    const response = await kanaClient.post(`/perps/positions/${positionId}/close`);
    return response.data;
  } catch (error) {
    console.error('[Kana] Failed to close position:', handleKanaError(error));
    throw error;
  }
}

// Mock data functions for development/testing
function getMockMarkets(): PerpMarket[] {
  return [
    {
      id: 'apt-perp',
      symbol: 'APT-PERP',
      base_asset: 'APT',
      quote_asset: 'USDC',
      price: 8.45,
      price_change_24h: 5.2,
      volume_24h: 12500000,
      open_interest: 8900000,
      funding_rate: 0.0001,
      max_leverage: 125,
      mark_price: 8.46,
      index_price: 8.45,
    },
    {
      id: 'btc-perp',
      symbol: 'BTC-PERP',
      base_asset: 'BTC',
      quote_asset: 'USDC',
      price: 43250,
      price_change_24h: -2.3,
      volume_24h: 890000000,
      open_interest: 450000000,
      funding_rate: -0.0002,
      max_leverage: 100,
      mark_price: 43245,
      index_price: 43250,
    },
    {
      id: 'eth-perp',
      symbol: 'ETH-PERP',
      base_asset: 'ETH',
      quote_asset: 'USDC',
      price: 2285,
      price_change_24h: 3.7,
      volume_24h: 560000000,
      open_interest: 280000000,
      funding_rate: 0.0003,
      max_leverage: 100,
      mark_price: 2286,
      index_price: 2285,
    },
    {
      id: 'sol-perp',
      symbol: 'SOL-PERP',
      base_asset: 'SOL',
      quote_asset: 'USDC',
      price: 98.5,
      price_change_24h: 8.1,
      volume_24h: 180000000,
      open_interest: 95000000,
      funding_rate: 0.0004,
      max_leverage: 75,
      mark_price: 98.6,
      index_price: 98.5,
    },
  ];
}

function getMockPositions(): PerpPosition[] {
  return [
    {
      id: 'pos_1',
      market_id: 'apt-perp',
      market_symbol: 'APT-PERP',
      side: 'long',
      size: 1000,
      entry_price: 8.2,
      mark_price: 8.45,
      liquidation_price: 6.5,
      leverage: 10,
      margin: 820,
      unrealized_pnl: 250,
      realized_pnl: 0,
      opened_at: new Date(Date.now() - 86400000).toISOString(),
      status: 'open',
    },
  ];
}

/**
 * Calculate position PnL
 */
export function calculatePnL(
  side: 'long' | 'short',
  entryPrice: number,
  currentPrice: number,
  size: number
): number {
  if (side === 'long') {
    return (currentPrice - entryPrice) * size;
  } else {
    return (entryPrice - currentPrice) * size;
  }
}

/**
 * Calculate liquidation price
 */
export function calculateLiquidationPrice(
  side: 'long' | 'short',
  entryPrice: number,
  leverage: number,
  maintenanceMargin: number = 0.005 // 0.5%
): number {
  if (side === 'long') {
    return entryPrice * (1 - (1 / leverage) + maintenanceMargin);
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMargin);
  }
}
