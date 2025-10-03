import { noditClient, handleNoditError, isNoditConfigured } from './noditClient';

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo_url?: string;
  project_url?: string;
  description?: string;
  price_usd?: number;
  market_cap?: number;
  volume_24h?: number;
}

export interface TokenBalance {
  token_type: string;
  balance: string;
  decimals: number;
  symbol: string;
  name: string;
  metadata?: TokenMetadata;
}

/**
 * Get token metadata
 */
export async function getTokenMetadata(tokenAddress: string): Promise<TokenMetadata | null> {
  if (!isNoditConfigured()) {
    console.warn('[Nodit] API key not configured, skipping token metadata fetch');
    return null;
  }

  try {
    const response = await noditClient.get(`/tokens/${tokenAddress}/metadata`);
    return response.data;
  } catch (error) {
    console.error('[Nodit] Failed to fetch token metadata:', handleNoditError(error));
    return null;
  }
}

/**
 * Get all token balances for an account
 */
export async function getAccountTokenBalances(address: string): Promise<TokenBalance[]> {
  if (!isNoditConfigured()) {
    console.warn('[Nodit] API key not configured, skipping token balances fetch');
    return [];
  }

  try {
    const response = await noditClient.get(`/accounts/${address}/resources`);
    const resources = response.data || [];
    
    // Filter for CoinStore resources
    const tokenBalances: TokenBalance[] = resources
      .filter((resource: any) => resource.type.includes('::coin::CoinStore'))
      .map((resource: any) => {
        const tokenType = resource.type.match(/<(.+)>/)?.[1] || '';
        return {
          token_type: tokenType,
          balance: resource.data.coin.value,
          decimals: 8, // Default to 8, should be fetched from token metadata
          symbol: tokenType.split('::').pop() || 'UNKNOWN',
          name: tokenType.split('::').pop() || 'Unknown Token',
        };
      });

    return tokenBalances;
  } catch (error) {
    console.error('[Nodit] Failed to fetch token balances:', handleNoditError(error));
    return [];
  }
}

/**
 * Get token price (placeholder - would integrate with price oracle)
 */
export async function getTokenPrice(symbol: string): Promise<number | null> {
  // This would integrate with a price oracle API
  // For now, return mock data for APT
  if (symbol === 'APT') {
    return 8.50; // Mock price
  }
  return null;
}
