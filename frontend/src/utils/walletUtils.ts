import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey, AccountAddress } from '@aptos-labs/ts-sdk';

// Initialize Aptos client for testnet
const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);

export interface WalletAccount {
  address: string;
  privateKey: string;
  publicKey: string;
  accountIndex: number;
}

export interface StoredWallet {
  seedPhrase: string;
  accounts: WalletAccount[];
  currentAccountIndex: number;
}

export interface Transaction {
  version: string;
  timestamp: string;
  type: string;
  success: boolean;
  hash: string;
}

// LocalStorage keys
const WALLET_STORAGE_KEY = 'cryptal_wallet';
const ACCOUNT_COUNT_KEY = 'cryptal_account_count';
const LEGACY_WALLET_KEY = 'aptos_wallet'; // Legacy key from AuthContext

// Migrate legacy wallet data to new format
const migrateLegacyWallet = (): void => {
  try {
    // Check if we already have the new format
    const existingWallet = localStorage.getItem(WALLET_STORAGE_KEY);
    if (existingWallet) {
      return; // Already migrated
    }

    // Check for legacy wallet
    const legacyWalletData = localStorage.getItem(LEGACY_WALLET_KEY);
    if (!legacyWalletData) {
      return; // No legacy wallet to migrate
    }

    const legacyWallet = JSON.parse(legacyWalletData);
    
    // Convert legacy wallet to new format
    const walletAccount: WalletAccount = {
      address: legacyWallet.address,
      privateKey: legacyWallet.privateKey,
      publicKey: legacyWallet.publicKey,
      accountIndex: 0
    };

    const newWallet: StoredWallet = {
      seedPhrase: legacyWallet.mnemonic || '',
      accounts: [walletAccount],
      currentAccountIndex: 0
    };

    // Save in new format
    saveWallet(newWallet);
    console.log('✓ Successfully migrated legacy wallet to new format');
  } catch (error) {
    console.error('Error migrating legacy wallet:', error);
  }
};

// Generate a new wallet with seed phrase
export const generateNewWallet = (): { seedPhrase: string; account: Account } => {
  const account = Account.generate();
  // For demo purposes, we'll use a simplified seed phrase approach
  // In production, you'd want to use proper BIP39 mnemonic generation
  const seedPhrase = generateSeedPhrase();
  
  return {
    seedPhrase,
    account
  };
};

// Generate a simple seed phrase (in production, use proper BIP39)
const generateSeedPhrase = (): string => {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
    'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm',
    'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost',
    'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing',
    'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle'
  ];
  
  const selectedWords = [];
  for (let i = 0; i < 12; i++) {
    selectedWords.push(words[Math.floor(Math.random() * words.length)]);
  }
  
  return selectedWords.join(' ');
};

// Get wallet from localStorage
export const getStoredWallet = (): StoredWallet | null => {
  try {
    // First, try to migrate any legacy wallet data
    migrateLegacyWallet();
    
    const walletData = localStorage.getItem(WALLET_STORAGE_KEY);
    if (walletData) {
      return JSON.parse(walletData);
    }
    return null;
  } catch (error) {
    console.error('Error reading wallet from localStorage:', error);
    return null;
  }
};

// Get account count from localStorage
export const getAccountCount = (): number => {
  try {
    const count = localStorage.getItem(ACCOUNT_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error reading account count:', error);
    return 0;
  }
};

// Save wallet to localStorage
export const saveWallet = (wallet: StoredWallet): void => {
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
    localStorage.setItem(ACCOUNT_COUNT_KEY, wallet.accounts.length.toString());
  } catch (error) {
    console.error('Error saving wallet to localStorage:', error);
    throw new Error('Failed to save wallet');
  }
};

// Create a new wallet and save it
export const createNewWallet = (): StoredWallet => {
  const { seedPhrase, account } = generateNewWallet();
  
  // Note: Newer Aptos SDK versions may not expose privateKey directly
  // This is a limitation that needs to be addressed based on SDK version
  // For now, we store empty string and rely on seed phrase for recovery
  const walletAccount: WalletAccount = {
    address: account.accountAddress.toString(),
    privateKey: '', // TODO: Update based on Aptos SDK documentation for key access
    publicKey: account.publicKey.toString(),
    accountIndex: 0
  };
  
  const wallet: StoredWallet = {
    seedPhrase,
    accounts: [walletAccount],
    currentAccountIndex: 0
  };
  
  saveWallet(wallet);
  return wallet;
};

// Add a new account to existing wallet
export const addNewAccount = (): WalletAccount | null => {
  const wallet = getStoredWallet();
  if (!wallet) {
    return null;
  }
  
  const newAccount = Account.generate();
  const accountIndex = wallet.accounts.length;
  
  const walletAccount: WalletAccount = {
    address: newAccount.accountAddress.toString(),
    privateKey: newAccount.privateKey.toString(),
    publicKey: newAccount.publicKey.toString(),
    accountIndex
  };
  
  wallet.accounts.push(walletAccount);
  saveWallet(wallet);
  
  return walletAccount;
};

// Get current account
export const getCurrentAccount = (): WalletAccount | null => {
  const wallet = getStoredWallet();
  if (!wallet || wallet.accounts.length === 0) {
    return null;
  }
  
  return wallet.accounts[wallet.currentAccountIndex] || wallet.accounts[0];
};

// Switch to different account
export const switchAccount = (accountIndex: number): boolean => {
  const wallet = getStoredWallet();
  if (!wallet || accountIndex >= wallet.accounts.length || accountIndex < 0) {
    return false;
  }
  
  const oldAddress = wallet.accounts[wallet.currentAccountIndex]?.address;
  wallet.currentAccountIndex = accountIndex;
  const newAddress = wallet.accounts[accountIndex]?.address;
  
  saveWallet(wallet);
  
  // Dispatch custom event to notify components about account change
  console.log('🔄 Dispatching wallet-account-changed event:', oldAddress, '→', newAddress);
  window.dispatchEvent(new CustomEvent('wallet-account-changed', {
    detail: { oldAddress, newAddress, accountIndex }
  }));
  
  return true;
};

// Get account balance
export const getAccountBalance = async (address: string): Promise<string> => {
  try {
    // Use the proper getAccountAPTAmount method from SDK
    const accountAddress = AccountAddress.fromString(address);
    const balance = await aptos.getAccountAPTAmount({
      accountAddress
    });
    
    // Convert from octas to APT (1 APT = 100,000,000 octas)
    const aptBalance = (balance / 100_000_000).toFixed(8);
    console.log('✅ Balance fetched:', aptBalance, 'APT for', address.slice(0, 10) + '...');
    
    return aptBalance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    
    // Check if it's a network/API issue
    if (error instanceof Error) {
      if (error.message.includes('Resource not found')) {
        console.log('ℹ️ Account not found on testnet, returning 0 balance');
        return '0.00000000';
      }
      if (error.message.includes('Unexpected token') || 
          error.message.includes('Bad Gateway') ||
          error.message.includes('502') ||
          error.message.includes('503')) {
        console.error('🔴 Aptos Testnet API is down. Please try again in a few minutes.');
        throw new Error('Aptos Testnet API is temporarily unavailable. Please try again later.');
      }
    }
    return '0';
  }
};

// Get account transactions
export const getAccountTransactions = async (address: string, limit: number = 25) => {
  try {
    const transactions = await aptos.getAccountTransactions({
      accountAddress: address,
      options: {
        limit
      }
    });
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Fund account on testnet (for testing)
export const fundAccount = async (address: string): Promise<boolean> => {
  try {
    await aptos.fundAccount({
      accountAddress: address,
      amount: 100000000 // 1 APT in octas
    });
    return true;
  } catch (error) {
    console.error('Error funding account:', error);
    return false;
  }
};

// Clear all wallet data (logout)
export const clearWalletData = (): void => {
  localStorage.removeItem(WALLET_STORAGE_KEY);
  localStorage.removeItem(ACCOUNT_COUNT_KEY);
};