// Wallet utility functions for Aptos blockchain
// Real Aptos SDK integration for testnet

import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
  AccountAddress,
  AnyRawTransaction,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";
import * as bip39 from 'bip39';

// Configure Aptos client for testnet
const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);

// Test network connectivity
export const testAptosConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Aptos testnet connection...');
    const ledgerInfo = await aptos.getLedgerInfo();
    console.log('✅ Aptos testnet connection successful');
    console.log('📊 Ledger info:', {
      chainId: ledgerInfo.chain_id,
      epoch: ledgerInfo.epoch,
      ledgerVersion: ledgerInfo.ledger_version,
      ledgerTimestamp: ledgerInfo.ledger_timestamp
    });
    return true;
  } catch (error) {
    console.error('❌ Aptos testnet connection failed:', error);
    return false;
  }
};

export interface AptosWalletData {
  address: string;
  mnemonic: string;
  privateKey: string;
  publicKey: string;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  gasUsed?: number;
  message?: string;
}

export interface AptosTransaction {
  version: string;
  hash: string;
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  timestamp: string;
  payload?: {
    type: string;
    function: string;
    arguments: any[];
    type_arguments: string[];
  };
  changes?: any[];
  events?: {
    sequence_number: string;
    type: string;
    data: {
      amount?: string;
      sender?: string;
      receiver?: string;
    };
  }[];
}

export interface ProcessedTransaction {
  hash: string;
  timestamp: Date;
  type: 'sent' | 'received' | 'other';
  status: 'confirmed' | 'failed';
  amount: string;
  from: string;
  to: string;
  gasUsed?: string;
  function?: string;
}

/**
 * Generate a new Aptos wallet using the official Aptos SDK with proper BIP39 mnemonic
 */
export const generateAptosWallet = async (): Promise<AptosWalletData> => {
  try {
    // Generate proper BIP39 mnemonic phrase
    const mnemonic = generateMnemonic();
    
    // Validate the mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Generated invalid mnemonic');
    }
    
    // Create account from mnemonic using standard derivation path
    const account = Account.fromDerivationPath({
      path: "m/44'/637'/0'/0'/0'",
      mnemonic: mnemonic,
    });
    
    // Get the derived information
    const privateKey = account.privateKey.toString();
    const publicKey = account.publicKey.toString();
    const address = account.accountAddress.toString();
    
    return {
      address,
      mnemonic,
      privateKey,
      publicKey
    };
  } catch (error) {
    console.error('Error generating Aptos wallet:', error);
    throw new Error('Failed to generate wallet');
  }
};

/**
 * Generate a proper BIP39 mnemonic phrase
 */
function generateMnemonic(): string {
  // Generate 128 bits of entropy for 12-word mnemonic
  return bip39.generateMnemonic();
}

/**
 * Import wallet from mnemonic phrase using Aptos SDK
 */
export const importWalletFromMnemonic = async (mnemonic: string): Promise<AptosWalletData> => {
  try {
    const cleanedMnemonic = mnemonic.trim().toLowerCase();
    const words = cleanedMnemonic.split(/\s+/);
    
    // Validate word count
    if (words.length !== 12 && words.length !== 24) {
      throw new Error('Invalid mnemonic: must be 12 or 24 words');
    }
    
    // Validate mnemonic using BIP39
    if (!bip39.validateMnemonic(cleanedMnemonic)) {
      throw new Error('Invalid mnemonic: checksum failed');
    }
    
    // Create account from mnemonic using Aptos SDK
    const account = Account.fromDerivationPath({
      path: "m/44'/637'/0'/0'/0'",
      mnemonic: cleanedMnemonic,
    });
    
    const privateKey = account.privateKey.toString();
    const publicKey = account.publicKey.toString();
    const address = account.accountAddress.toString();
    
    return {
      address,
      mnemonic: cleanedMnemonic,
      privateKey,
      publicKey
    };
  } catch (error) {
    console.error('Error importing wallet from mnemonic:', error);
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    }
    throw new Error('Failed to import wallet from mnemonic');
  }
};

/**
 * Import wallet from private key using Aptos SDK
 */
export const importWalletFromPrivateKey = async (privateKey: string): Promise<AptosWalletData> => {
  try {
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      throw new Error('Invalid private key format');
    }
    
    // Create Ed25519PrivateKey from hex string
    const ed25519PrivateKey = new Ed25519PrivateKey(privateKey);
    
    // Create account from private key
    const account = Account.fromPrivateKey({ privateKey: ed25519PrivateKey });
    
    const publicKey = account.publicKey.toString();
    const address = account.accountAddress.toString();
    
    return {
      address,
      mnemonic: '', // Not available when importing from private key
      privateKey,
      publicKey
    };
  } catch (error) {
    console.error('Error importing wallet from private key:', error);
    throw new Error('Failed to import wallet from private key');
  }
};

/**
 * Get wallet balance from Aptos testnet
 */
export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    console.log('🔍 Fetching balance for address:', address);
    
    // Validate address format
    if (!address || !address.startsWith('0x')) {
      throw new Error('Invalid address format');
    }
    
    const accountAddress = AccountAddress.fromString(address);
    console.log('📍 Parsed account address:', accountAddress.toString());
    
    // Use the Aptos client to get APT amount directly
    const balance = await aptos.getAccountAPTAmount({
      accountAddress
    });
    
    console.log('💰 Raw balance (octas):', balance);
    
    // Convert from octas to APT (1 APT = 100,000,000 octas)
    const aptBalance = (balance / 100_000_000).toFixed(8);
    console.log('✅ Converted balance (APT):', aptBalance);
    
    return aptBalance;
  } catch (error) {
    console.error('❌ Error fetching wallet balance for', address, ':', error);
    
    // Provide more specific error information
    if (error instanceof Error) {
      if (error.message.includes('Resource not found')) {
        console.log('ℹ️ Account not found on testnet, returning 0 balance');
        return '0.00000000';
      } else if (error.message.includes('Invalid address')) {
        console.error('🚫 Invalid address format provided');
        throw error;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        console.error('🌐 Network error while fetching balance');
        throw new Error('Network error: Unable to fetch balance from Aptos testnet');
      }
    }
    
    // Return 0 for unknown errors
    console.log('⚠️ Unknown error, returning 0 balance');
    return '0.00000000';
  }
};

/**
 * Get account transactions from Aptos devnet
 */
export const getAccountTransactions = async (
  address: string,
  limit: number = 25
): Promise<ProcessedTransaction[]> => {
  try {
    console.log('🔍 Fetching transactions for address:', address);
    
    const accountAddress = AccountAddress.fromString(address);
    
    // Get account transactions from Aptos
    const transactions = await aptos.getAccountTransactions({
      accountAddress,
      options: {
        limit,
        orderBy: [{ ledger_version: 'desc' }]
      }
    });
    
    console.log('📦 Raw transactions fetched:', transactions.length);
    
    const processedTransactions: ProcessedTransaction[] = [];
    
    for (const tx of transactions) {
      try {
        const transaction = tx as AptosTransaction;
        
        // Convert timestamp from microseconds to milliseconds
        const timestamp = new Date(parseInt(transaction.timestamp) / 1000);
        
        let type: 'sent' | 'received' | 'other' = 'other';
        let amount = '0';
        let toAddress = '';
        let fromAddress = transaction.sender;
        let functionName = '';
        
        // Process payload for coin transfer transactions
        if (transaction.payload?.function === '0x1::coin::transfer' || 
            transaction.payload?.function === '0x1::aptos_coin::transfer') {
          functionName = 'Transfer';
          
          if (transaction.payload.arguments && transaction.payload.arguments.length >= 2) {
            toAddress = transaction.payload.arguments[0] as string;
            const amountInOctas = transaction.payload.arguments[1] as string;
            amount = (parseInt(amountInOctas) / 100_000_000).toFixed(8);
            
            // Determine if sent or received
            if (transaction.sender.toLowerCase() === address.toLowerCase()) {
              type = 'sent';
            } else if (toAddress.toLowerCase() === address.toLowerCase()) {
              type = 'received';
              fromAddress = transaction.sender;
            }
          }
        } else if (transaction.payload?.function) {
          functionName = transaction.payload.function.split('::').pop() || 'Unknown';
        }
        
        // Also check events for transfers
        if (transaction.events && transaction.events.length > 0) {
          for (const event of transaction.events) {
            if (event.type.includes('withdraw') || event.type.includes('deposit') || 
                event.type.includes('transfer')) {
              if (event.data.amount) {
                const eventAmount = (parseInt(event.data.amount) / 100_000_000).toFixed(8);
                if (parseFloat(eventAmount) > parseFloat(amount)) {
                  amount = eventAmount;
                }
              }
              
              if (event.data.sender && event.data.receiver) {
                fromAddress = event.data.sender;
                toAddress = event.data.receiver;
                
                if (event.data.sender.toLowerCase() === address.toLowerCase()) {
                  type = 'sent';
                } else if (event.data.receiver.toLowerCase() === address.toLowerCase()) {
                  type = 'received';
                }
              }
            }
          }
        }
        
        // If still no amount found but it's a successful transaction, check for gas
        if (amount === '0' && transaction.gas_used) {
          const gasInAPT = (parseInt(transaction.gas_used) * parseInt(transaction.gas_unit_price) / 100_000_000).toFixed(8);
          if (parseFloat(gasInAPT) > 0) {
            amount = gasInAPT;
            type = 'sent'; // Gas fees are always "sent"
            functionName = functionName || 'Gas Fee';
          }
        }
        
        const processedTx: ProcessedTransaction = {
          hash: transaction.hash,
          timestamp,
          type,
          status: transaction.success ? 'confirmed' : 'failed',
          amount,
          from: fromAddress,
          to: toAddress || '',
          gasUsed: transaction.gas_used,
          function: functionName
        };
        
        processedTransactions.push(processedTx);
        
      } catch (txError) {
        console.error('Error processing transaction:', txError);
        // Continue with other transactions
      }
    }
    
    console.log('✅ Processed transactions:', processedTransactions.length);
    return processedTransactions;
    
  } catch (error) {
    console.error('❌ Error fetching account transactions:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Resource not found')) {
        console.log('ℹ️ No transactions found for this account');
        return [];
      }
    }
    
    throw new Error('Failed to fetch transaction history');
  }
};

/**
 * Send APT transaction on Aptos testnet
 */
export const sendAptosTransaction = async (
  from: string,
  to: string,
  amount: string,
  privateKey: string
): Promise<TransactionResult> => {
  try {
    // Create sender account from private key
    const ed25519PrivateKey = new Ed25519PrivateKey(privateKey);
    const senderAccount = Account.fromPrivateKey({ privateKey: ed25519PrivateKey });
    
    // Validate addresses
    const senderAddress = AccountAddress.fromString(from);
    const recipientAddress = AccountAddress.fromString(to);
    
    // Convert amount to octas (1 APT = 100,000,000 octas)
    const amountInOctas = Math.floor(parseFloat(amount) * 100_000_000);
    
    if (amountInOctas <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    // Create the transaction
    const transaction = await aptos.transaction.build.simple({
      sender: senderAddress,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [recipientAddress, amountInOctas],
      },
    });
    
    // Sign and submit the transaction
    const senderAuthenticator = aptos.transaction.sign({
      signer: senderAccount,
      transaction,
    });
    
    const committedTransaction = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator,
    });
    
    // Wait for transaction confirmation
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });
    
    return {
      hash: executedTransaction.hash,
      success: executedTransaction.success,
      gasUsed: parseInt(executedTransaction.gas_used || '0'),
      message: executedTransaction.success ? 'Transaction successful' : 'Transaction failed'
    };
    
  } catch (error) {
    console.error('Error sending Aptos transaction:', error);
    return {
      hash: '',
      success: false,
      gasUsed: 0,
      message: error instanceof Error ? error.message : 'Transaction failed'
    };
  }
};

/**
 * Fund account with devnet APT tokens (faucet)
 */
export const fundAccountWithTestnetAPT = async (address: string): Promise<boolean> => {
  try {
    const accountAddress = AccountAddress.fromString(address);
    await aptos.fundAccount({
      accountAddress,
      amount: 100_000_000, // 1 APT in octas
    });
    
    console.log(`Funded account ${address} with 1 APT from testnet faucet`);
    return true;
  } catch (error) {
    console.error('Error funding account:', error);
    return false;
  }
};

// Keep old function name for backward compatibility
export const fundAccountWithDevnetAPT = fundAccountWithTestnetAPT;

/**
 * Check if account exists on Aptos devnet
 */
export const checkAccountExists = async (address: string): Promise<boolean> => {
  try {
    const accountAddress = AccountAddress.fromString(address);
    const accountData = await aptos.getAccountInfo({
      accountAddress
    });
    return !!accountData;
  } catch (error) {
    console.error('Account does not exist or error checking:', error);
    return false;
  }
};

/**
 * Get account information from Aptos testnet
 */
export const getAccountInfo = async (address: string) => {
  try {
    const accountAddress = AccountAddress.fromString(address);
    const accountInfo = await aptos.getAccountInfo({
      accountAddress
    });
    return accountInfo;
  } catch (error) {
    console.error('Error getting account info:', error);
    throw error;
  }
};

/**
 * Validate BIP39 mnemonic phrase
 */
export const isValidMnemonic = (mnemonic: string): boolean => {
  try {
    const cleanedMnemonic = mnemonic.trim().toLowerCase();
    return bip39.validateMnemonic(cleanedMnemonic);
  } catch {
    return false;
  }
};

/**
 * Validate Aptos address format
 */
export const isValidAptosAddress = (address: string): boolean => {
  try {
    AccountAddress.fromString(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Format address for display (show first 6 and last 4 characters)
 */
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Encrypt wallet data with password
 * In production, use proper encryption libraries like crypto-js or Web Crypto API
 */
export const encryptWalletData = async (walletData: AptosWalletData, password: string): Promise<string> => {
  // Mock implementation - in production, use proper encryption
  const dataToEncrypt = JSON.stringify(walletData);
  const encrypted = btoa(dataToEncrypt); // Base64 encoding for demo
  return encrypted;
};

/**
 * Decrypt wallet data with password
 * In production, use proper decryption to match encryptWalletData
 */
export const decryptWalletData = async (encryptedData: string, password: string): Promise<AptosWalletData> => {
  try {
    // Mock implementation - in production, use proper decryption
    const decrypted = atob(encryptedData); // Base64 decoding for demo
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt wallet data - incorrect password');
  }
};



export default {
  generateAptosWallet,
  importWalletFromMnemonic,
  importWalletFromPrivateKey,
  getWalletBalance,
  getAccountTransactions,
  sendAptosTransaction,
  fundAccountWithTestnetAPT,
  fundAccountWithDevnetAPT,
  checkAccountExists,
  getAccountInfo,
  isValidMnemonic,
  isValidAptosAddress,
  formatAddress,
  encryptWalletData,
  testAptosConnection,
  decryptWalletData,
  aptos
};