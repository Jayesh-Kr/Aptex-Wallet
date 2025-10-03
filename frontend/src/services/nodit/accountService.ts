import { noditClient, handleNoditError, isNoditConfigured } from './noditClient';

export interface NoditBalance {
  coin: {
    value: string;
    decimals: number;
    symbol: string;
  };
}

export interface NoditAccountResource {
  type: string;
  data: any;
}

export interface NoditTransaction {
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: string | null;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: any[];
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: any;
  signature: any;
  events: any[];
  timestamp: string;
}

/**
 * Get account balance using Nodit API
 */
export async function getAccountBalance(address: string): Promise<NoditBalance | null> {
  if (!isNoditConfigured()) {
    console.warn('[Nodit] API key not configured, skipping balance fetch');
    return null;
  }

  try {
    const response = await noditClient.get(`/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`);
    
    if (response.data?.data?.coin) {
      return {
        coin: {
          value: response.data.data.coin.value,
          decimals: 8, // APT has 8 decimals
          symbol: 'APT',
        },
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Nodit] Failed to fetch account balance:', handleNoditError(error));
    throw error;
  }
}

/**
 * Get account resources
 */
export async function getAccountResources(address: string): Promise<NoditAccountResource[]> {
  if (!isNoditConfigured()) {
    console.warn('[Nodit] API key not configured, skipping resources fetch');
    return [];
  }

  try {
    const response = await noditClient.get(`/accounts/${address}/resources`);
    return response.data || [];
  } catch (error) {
    console.error('[Nodit] Failed to fetch account resources:', handleNoditError(error));
    throw error;
  }
}

/**
 * Get account transactions with pagination
 */
export async function getAccountTransactions(
  address: string,
  limit: number = 20,
  start?: string
): Promise<NoditTransaction[]> {
  if (!isNoditConfigured()) {
    console.warn('[Nodit] API key not configured, skipping transactions fetch');
    return [];
  }

  try {
    const params: any = { limit };
    if (start) params.start = start;

    const response = await noditClient.get(`/accounts/${address}/transactions`, { params });
    return response.data || [];
  } catch (error) {
    console.error('[Nodit] Failed to fetch account transactions:', handleNoditError(error));
    throw error;
  }
}

/**
 * Get account info
 */
export async function getAccountInfo(address: string): Promise<any> {
  if (!isNoditConfigured()) {
    console.warn('[Nodit] API key not configured, skipping account info fetch');
    return null;
  }

  try {
    const response = await noditClient.get(`/accounts/${address}`);
    return response.data;
  } catch (error) {
    console.error('[Nodit] Failed to fetch account info:', handleNoditError(error));
    throw error;
  }
}

/**
 * Convert octas to APT
 */
export function octasToApt(octas: string | number): number {
  const octasNum = typeof octas === 'string' ? parseInt(octas) : octas;
  return octasNum / 100000000; // 1 APT = 10^8 octas
}

/**
 * Convert APT to octas
 */
export function aptToOctas(apt: number): string {
  return (apt * 100000000).toString();
}
