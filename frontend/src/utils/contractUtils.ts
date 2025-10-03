/**
 * Smart Contract Integration Utilities
 * wallet_system.move contract interaction layer
 */

import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  Ed25519PrivateKey,
  AccountAddress,
  InputViewFunctionData,
  InputEntryFunctionData,
} from "@aptos-labs/ts-sdk";
import { parseContractError, formatErrorForLog } from "./errorHandler";
import { rpcCache, generateCacheKey } from "./rpcCache";

// Initialize Aptos client for testnet
const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);

// Contract configuration - Updated for Testnet deployment
export const CONTRACT_ADDRESS = "0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c";
export const MODULE_NAME = "wallet_system";

// Full module identifier
const MODULE_ID = `${CONTRACT_ADDRESS}::${MODULE_NAME}`;

// ============================================================================
// Type Definitions
// ============================================================================

export interface PaymentRequest {
  id: string;
  from_address: string;
  to_address: string;
  amount: string;
  description: string;
  created_at: string;
  status: number; // 0: pending, 1: paid, 2: rejected
}

export interface SplitEntry {
  participant: string;
  amount: string;
}

export interface SplitBill {
  id: string;
  creator: string;
  total_amount: string;
  description: string;
  splits: SplitEntry[];
  created_at: string;
  paid_participants: string[];
}

export interface EmiAgreement {
  id: string;
  user: string;
  company: string;
  total_amount: string;
  monthly_amount: string;
  months: number;
  months_paid: number;
  description: string;
  created_at: string;
  next_payment_due: string;
  status: number; // 0: active, 1: completed, 2: defaulted
  auto_pay_approved: boolean;
  auto_pay_balance: string;
}

export interface UserStats {
  total_transactions: string; // Changed from transaction_count to match contract
  last_transaction_date: string;
  loyalty_nfts_minted: number[];
}

export interface LoyaltyNFTMetadata {
  tier: number; // 0: bronze, 1: silver, 2: gold, 3: platinum, 4: diamond
  tier_name: string;
  transaction_count: string;
  minted_at: string;
  image_url: string;
  attributes: string[];
}

export interface CouponNFTMetadata {
  template_id: string;
  company: string;
  title: string;
  description: string;
  discount_percentage: string;
  max_discount_amount: string;
  expiry_date: string;
  image_url: string;
  is_redeemed: boolean;
}

export interface CouponTemplate {
  id: string;
  company: string;
  title: string;
  description: string;
  discount_percentage: string;
  max_discount_amount: string;
  valid_days: string;
  image_url: string;
  total_minted: string;
  is_active: boolean;
}

// Transaction result type
export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
  vm_status?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Account object from private key string
 */
export const getAccountFromPrivateKey = (privateKeyHex: string): Account => {
  const privateKey = new Ed25519PrivateKey(privateKeyHex);
  return Account.fromPrivateKey({ privateKey });
};

/**
 * Estimate gas for a transaction
 */
export const estimateGas = async (
  senderAddress: string,
  payload: InputEntryFunctionData
): Promise<{ gasUnitPrice: string; maxGasAmount: string; estimatedCost: string }> => {
  try {
    // Return default gas estimates for now
    // TODO: Implement proper gas simulation when SDK supports it
    return {
      gasUnitPrice: "100",
      maxGasAmount: "2000",
      estimatedCost: "0.0002",
    };
  } catch (error) {
    console.error("Error estimating gas:", error);
    return {
      gasUnitPrice: "100",
      maxGasAmount: "2000",
      estimatedCost: "0.0002",
    };
  }
};

/**
 * Check if user has enough balance for transaction + gas
 */
export const checkSufficientBalance = async (
  address: string,
  amountAPT: number,
  gasEstimateAPT: number
): Promise<{ sufficient: boolean; currentBalance: number; required: number }> => {
  try {
    // Use the same reliable method as getAccountBalance
    const accountAddress = AccountAddress.fromString(address);
    const balanceInOctas = await aptos.getAccountAPTAmount({
      accountAddress
    });
    
    // Convert from octas to APT (1 APT = 100,000,000 octas)
    const balanceAPT = balanceInOctas / 100_000_000;
    const required = amountAPT + gasEstimateAPT;

    console.log('✅ Balance check:', {
      currentBalance: balanceAPT.toFixed(8),
      required: required.toFixed(8),
      sufficient: balanceAPT >= required
    });

    return {
      sufficient: balanceAPT >= required,
      currentBalance: balanceAPT,
      required,
    };
  } catch (error) {
    console.error("Error checking balance:", error);
    if (error instanceof Error && error.message.includes('Resource not found')) {
      console.log('ℹ️ Account not found on testnet, returning 0 balance');
      return { sufficient: false, currentBalance: 0, required: amountAPT + gasEstimateAPT };
    }
    return { sufficient: false, currentBalance: 0, required: amountAPT + gasEstimateAPT };
  }
};

// ============================================================================
// Entry Functions (State-changing operations)
// ============================================================================

/**
 * Register a wallet ID for the user
 */
export const registerWalletId = async (
  account: Account,
  walletId: string
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::register_wallet_id`,
        functionArguments: [CONTRACT_ADDRESS, walletId],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error registering wallet ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to register wallet ID",
    };
  }
};

/**
 * Register a UPI ID for the user
 */
export const registerUpiId = async (
  account: Account,
  upiId: string
): Promise<TransactionResult> => {
  try {
    const senderAddress = account.accountAddress.toString();
    console.log('=== REGISTERING UPI ID ===');
    console.log('Sender Address:', senderAddress);
    console.log('UPI ID:', upiId);
    console.log('Contract Address:', CONTRACT_ADDRESS);
    
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::register_upi_id`,
        functionArguments: [CONTRACT_ADDRESS, upiId],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    console.log('✅ UPI ID Registration Success!');
    console.log('Transaction Hash:', pendingTxn.hash);
    console.log('Mapped:', upiId, '→', senderAddress);

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("❌ Error registering UPI ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to register UPI ID",
    };
  }
};

/**
 * Create a payment request
 * NOTE: The contract expects a wallet_id (String), not an address
 */
export const createPaymentRequest = async (
  account: Account,
  toWalletId: string,
  amountOctas: string,
  description: string
): Promise<TransactionResult> => {
  try {
    // Validate that recipient wallet ID exists by trying to resolve it
    const recipientAddress = await getAddressByWalletId(toWalletId);
    if (!recipientAddress) {
      return {
        success: false,
        error: `Wallet ID "${toWalletId}" not found. Please ensure the recipient has registered their wallet ID.`,
      };
    }

    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::create_payment_request`,
        functionArguments: [CONTRACT_ADDRESS, toWalletId, amountOctas, description],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    if (!response.success) {
      const errorDetails = parseContractError(response.vm_status);
      console.error(formatErrorForLog(response.vm_status, "createPaymentRequest"));
      return {
        success: false,
        hash: pendingTxn.hash,
        vm_status: response.vm_status,
        error: errorDetails?.message || "Transaction failed on blockchain",
      };
    }

    return {
      success: true,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error(formatErrorForLog(error, "createPaymentRequest"));
    const errorDetails = parseContractError(error);
    return {
      success: false,
      error: errorDetails?.message || (error instanceof Error ? error.message : "Failed to create payment request"),
    };
  }
};

/**
 * Transfer APT with tracking (for loyalty NFT minting)
 * This function transfers APT and updates user stats for loyalty NFT eligibility
 */
export const transferWithTracking = async (
  account: Account,
  recipient: string,
  amount: number
): Promise<TransactionResult> => {
  try {
    const amountInOctas = aptToOctas(amount);
    
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::transfer_with_tracking`,
        functionArguments: [CONTRACT_ADDRESS, recipient, amountInOctas.toString()],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error transferring with tracking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to transfer",
    };
  }
};

/**
 * Pay a payment request
 */
export const payRequest = async (
  account: Account,
  requestId: number
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::pay_request`,
        functionArguments: [CONTRACT_ADDRESS, requestId.toString()],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error paying request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pay request",
    };
  }
};

/**
 * Reject a payment request
 */
export const rejectRequest = async (
  account: Account,
  requestId: number
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::reject_request`,
        functionArguments: [CONTRACT_ADDRESS, requestId.toString()],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject request",
    };
  }
};

/**
 * Create a split bill with custom amounts
 * NOTE: The contract expects wallet IDs (not addresses) for participants
 */
export const createSplitBill = async (
  account: Account,
  description: string,
  participantWalletIds: string[], // Wallet IDs (e.g., "testing1", "testing2")
  participantAmounts: string[] // amounts in octas as strings
): Promise<TransactionResult> => {
  try {
    // Calculate total amount from participant amounts
    const totalAmount = participantAmounts.reduce((sum, amount) => sum + BigInt(amount), BigInt(0));
    
    // Convert string amounts to numbers for the contract
    const amountsAsNumbers = participantAmounts.map(amount => Number(amount));
    
    console.log('🔧 createSplitBill called with:', {
      description,
      participantWalletIds,
      participantAmounts,
      amountsAsNumbers,
      totalAmount: totalAmount.toString()
    });
    
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::create_split_bill`,
        functionArguments: [
          CONTRACT_ADDRESS, 
          totalAmount.toString(), // total_amount as string (will be converted to u64)
          description, 
          participantWalletIds, // Wallet IDs (contract will resolve to addresses)
          amountsAsNumbers // amounts as numbers
        ],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error creating split bill:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create split bill",
    };
  }
};

/**
 * Create EMI agreement - User initiates autopay agreement with a recipient
 * This is the correct implementation matching the smart contract
 */
export const createEmiAgreementByUser = async (
  account: Account,
  recipientWalletId: string,
  totalAmountOctas: string,
  monthlyAmountOctas: string,
  months: number,
  description: string
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::create_emi_agreement`,
        functionArguments: [
          CONTRACT_ADDRESS,
          recipientWalletId,
          totalAmountOctas,
          monthlyAmountOctas,
          months.toString(),
          description,
        ],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error creating EMI agreement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create EMI agreement",
    };
  }
};

/**
 * Create EMI agreement (Company function) - DEPRECATED
 * @deprecated This function signature doesn't match the smart contract. Use createEmiAgreementByUser instead.
 */
export const createEmiAgreement = async (
  account: Account,
  userAddress: string,
  totalAmountOctas: string,
  monthlyAmountOctas: string,
  months: number,
  firstPaymentDueTimestamp: string,
  description: string
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::create_emi_agreement`,
        functionArguments: [
          CONTRACT_ADDRESS,
          userAddress,
          totalAmountOctas,
          monthlyAmountOctas,
          months.toString(),
          firstPaymentDueTimestamp,
          description,
        ],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error creating EMI agreement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create EMI agreement",
    };
  }
};

/**
 * Approve auto-pay for EMI agreement (User function)
 */
export const approveEmiAutoPay = async (
  account: Account,
  companyAddress: string,
  emiId: number,
  depositAmountOctas: string
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::approve_emi_auto_pay`,
        functionArguments: [
          CONTRACT_ADDRESS,
          companyAddress,
          emiId.toString(),
          depositAmountOctas,
        ],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error approving EMI auto-pay:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve EMI auto-pay",
    };
  }
};

/**
 * Add funds to EMI auto-pay account (User function)
 */
export const addEmiFunds = async (
  account: Account,
  companyAddress: string,
  emiId: number,
  amountOctas: string
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::add_emi_funds`,
        functionArguments: [CONTRACT_ADDRESS, companyAddress, emiId.toString(), amountOctas],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error adding EMI funds:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add EMI funds",
    };
  }
};

/**
 * Collect EMI payment (Company function)
 */
export const collectEmiPayment = async (
  account: Account,
  userAddress: string,
  emiId: number
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::collect_emi_payment`,
        functionArguments: [CONTRACT_ADDRESS, userAddress, emiId.toString()],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error collecting EMI payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to collect EMI payment",
    };
  }
};

/**
 * Create coupon template (Company function)
 */
export const createCouponTemplate = async (
  account: Account,
  title: string,
  description: string,
  discountPercentage: number,
  maxDiscountAmountOctas: string,
  validDays: number,
  imageUrl: string
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::create_coupon_template`,
        functionArguments: [
          CONTRACT_ADDRESS,
          title,
          description,
          discountPercentage.toString(),
          maxDiscountAmountOctas,
          validDays.toString(),
          imageUrl,
        ],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error creating coupon template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create coupon template",
    };
  }
};

/**
 * Deactivate coupon template (Company function)
 */
export const deactivateCouponTemplate = async (
  account: Account,
  templateId: number
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::deactivate_coupon_template`,
        functionArguments: [CONTRACT_ADDRESS, templateId.toString()],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error deactivating coupon template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deactivate coupon template",
    };
  }
};

/**
 * Mint coupon NFT to specific user (Company function)
 */
export const mintCouponNftToUser = async (
  account: Account,
  userAddress: string,
  templateId: number
): Promise<TransactionResult> => {
  try {
    const transaction = await aptos.transaction.build.simple({
      sender: account.accountAddress,
      data: {
        function: `${MODULE_ID}::mint_coupon_nft_to_user`,
        functionArguments: [CONTRACT_ADDRESS, userAddress, templateId.toString()],
      },
    });

    const pendingTxn = await aptos.signAndSubmitTransaction({
      signer: account,
      transaction,
    });

    const response = await aptos.waitForTransaction({
      transactionHash: pendingTxn.hash,
    });

    return {
      success: response.success,
      hash: pendingTxn.hash,
      vm_status: response.vm_status,
    };
  } catch (error) {
    console.error("Error minting coupon NFT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mint coupon NFT",
    };
  }
};

// ============================================================================
// View Functions (Read-only operations)
// ============================================================================

/**
 * Get address by wallet ID
 */
export const getAddressByWalletId = async (walletId: string): Promise<string | null> => {
  const cacheKey = generateCacheKey('getAddressByWalletId', walletId);
  
  return rpcCache.get(
    cacheKey,
    async () => {
      try {
        console.log(`🔍 Looking up wallet ID "${walletId}" in contract ${CONTRACT_ADDRESS}`);
        const result = await aptos.view({
          payload: {
            function: `${MODULE_ID}::get_address_by_wallet_id`,
            functionArguments: [CONTRACT_ADDRESS, walletId],
          },
        });

        console.log(`📥 Raw result for wallet ID "${walletId}":`, result);

        // Result is Option<address>, check if vec is not empty
        if (result && Array.isArray(result) && result.length > 0) {
          const option = result[0] as Record<string, unknown>;
          if (option.vec && Array.isArray(option.vec) && option.vec.length > 0) {
            const address = option.vec[0];
            console.log(`✅ Found address for wallet ID "${walletId}": ${address}`);
            return address;
          }
        }
        console.log(`❌ Wallet ID "${walletId}" not found in registry`);
        return null;
      } catch (error) {
        console.error(`Error getting address by wallet ID "${walletId}":`, error);
        return null;
      }
    },
    60000 // Cache for 60 seconds - wallet IDs rarely change
  );
};

/**
 * Get address by UPI ID
 */
export const getAddressByUpiId = async (upiId: string): Promise<string | null> => {
  const cacheKey = generateCacheKey('getAddressByUpiId', upiId);
  
  return rpcCache.get(
    cacheKey,
    async () => {
      try {
        const result = await aptos.view({
          payload: {
            function: `${MODULE_ID}::get_address_by_upi_id`,
            functionArguments: [CONTRACT_ADDRESS, upiId],
          },
        });

        if (result && Array.isArray(result) && result.length > 0) {
          const option = result[0] as Record<string, unknown>;
          if (option.vec && Array.isArray(option.vec) && option.vec.length > 0) {
            return option.vec[0];
          }
        }
        return null;
      } catch (error) {
        console.error("Error getting address by UPI ID:", error);
        return null;
      }
    },
    60000 // Cache for 60 seconds - UPI IDs rarely change
  );
};

/**
 * Get wallet ID by address
 */
export const getWalletIdByAddress = async (userAddress: string): Promise<string | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_wallet_id_by_address`,
        functionArguments: [CONTRACT_ADDRESS, userAddress],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      const option = result[0] as Record<string, unknown>;
      if (option.vec && Array.isArray(option.vec) && option.vec.length > 0) {
        return option.vec[0];
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting wallet ID by address:", error);
    return null;
  }
};

/**
 * Get UPI ID by address
 */
export const getUpiIdByAddress = async (userAddress: string): Promise<string | null> => {
  try {
    // Normalize the address to ensure consistent format
    const normalizedAddress = AccountAddress.fromString(userAddress).toString();
    
    console.log('=== FETCHING UPI ID ===');
    console.log('Original Address:', userAddress);
    console.log('Normalized Address:', normalizedAddress);
    console.log('Contract Address:', CONTRACT_ADDRESS);
    console.log('Function:', `${MODULE_ID}::get_upi_id_by_address`);
    
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_upi_id_by_address`,
        functionArguments: [CONTRACT_ADDRESS, normalizedAddress],
      },
    });

    console.log('Raw blockchain result:', JSON.stringify(result, null, 2));

    if (result && Array.isArray(result) && result.length > 0) {
      const option = result[0] as Record<string, unknown>;
      console.log('Option object:', JSON.stringify(option, null, 2));
      
      // Check if vec exists and has content
      if (option && typeof option === 'object' && 'vec' in option) {
        const vec = option.vec;
        console.log('Vec array:', vec);
        
        if (Array.isArray(vec) && vec.length > 0) {
          const upiId = String(vec[0]);
          console.log('✅ Found UPI ID:', upiId, 'for address:', userAddress);
          return upiId;
        } else {
          console.log('❌ Vec is empty - No UPI ID registered for this address');
        }
      } else {
        console.log('❌ No vec property found - No UPI ID registered');
      }
    } else {
      console.log('❌ Invalid result format from blockchain');
    }
    
    console.log('=== NO UPI ID FOUND ===');
    return null;
  } catch (error) {
    console.error("❌ Error getting UPI ID by address:", error);
    return null;
  }
};

/**
 * Get payment request details
 */
export const getPaymentRequest = async (requestId: number): Promise<PaymentRequest | null> => {
  const cacheKey = generateCacheKey('getPaymentRequest', requestId);
  
  return rpcCache.get(
    cacheKey,
    async () => {
      try {
        const result = await aptos.view({
          payload: {
            function: `${MODULE_ID}::get_payment_request`,
            functionArguments: [CONTRACT_ADDRESS, requestId.toString()],
          },
        });

        console.log(`📋 Raw payment request ${requestId} result:`, JSON.stringify(result, null, 2));

        if (result && Array.isArray(result) && result.length > 0) {
          const option = result[0] as Record<string, unknown>;
          if (option.vec && Array.isArray(option.vec) && option.vec.length > 0) {
            const data = option.vec[0] as Record<string, unknown>;
            
            // Validate data structure
            if (!data || typeof data !== 'object') {
              console.error(`❌ Payment request ${requestId} has invalid data structure:`, data);
              return null;
            }

            // Check for required fields
            const requiredFields = ['from', 'to', 'amount', 'description', 'created_at', 'status'];
            const missingFields = requiredFields.filter(field => !(field in data));
            
            if (missingFields.length > 0) {
              console.error(`❌ Payment request ${requestId} missing fields:`, missingFields, 'Data:', data);
              return null;
            }

            return {
              id: requestId.toString(),
              from_address: data.from as string,
              to_address: data.to as string,
              amount: data.amount as string,
              description: data.description as string,
              created_at: data.created_at as string,
              status: data.status as number,
            };
          }
        }
        return null;
      } catch (error) {
        console.error(`Error getting payment request ${requestId}:`, error);
        return null;
      }
    },
    10000 // Cache for 10 seconds
  );
};

/**
 * Get user's received payment requests
 */
export const getUserPaymentRequests = async (userAddress: string): Promise<number[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_user_payment_requests`,
        functionArguments: [CONTRACT_ADDRESS, userAddress],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      return result[0] as number[];
    }
    return [];
  } catch (error) {
    console.error("Error getting user payment requests:", error);
    
    // Check if it's a network/API issue
    if (error instanceof Error && 
        (error.message.includes('Unexpected token') || 
         error.message.includes('Bad Gateway') ||
         error.message.includes('502') ||
         error.message.includes('503'))) {
      console.error("🔴 Aptos Testnet API is down. Payment requests cannot be loaded.");
      throw new Error('Aptos Testnet API is temporarily unavailable. Please try again later.');
    }
    return [];
  }
};

/**
 * Get user's sent payment requests
 */
export const getUserSentRequests = async (userAddress: string): Promise<number[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_user_sent_requests`,
        functionArguments: [CONTRACT_ADDRESS, userAddress],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      return result[0] as number[];
    }
    return [];
  } catch (error) {
    console.error("Error getting user sent requests:", error);
    
    // Check if it's a network/API issue
    if (error instanceof Error && 
        (error.message.includes('Unexpected token') || 
         error.message.includes('Bad Gateway') ||
         error.message.includes('502') ||
         error.message.includes('503'))) {
      console.error("🔴 Aptos Testnet API is down. Payment requests cannot be loaded.");
      throw new Error('Aptos Testnet API is temporarily unavailable. Please try again later.');
    }
    return [];
  }
};

/**
 * Get split bill details
 */
export const getSplitBill = async (splitId: number): Promise<SplitBill | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_split_bill`,
        functionArguments: [CONTRACT_ADDRESS, splitId.toString()],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      const option = result[0] as Record<string, unknown>;
      if (option.vec && Array.isArray(option.vec) && option.vec.length > 0) {
        const data = option.vec[0];
        return {
          id: splitId.toString(),
          creator: data.creator,
          total_amount: data.total_amount,
          description: data.description,
          splits: data.splits,
          created_at: data.created_at,
          paid_participants: data.paid_participants,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting split bill:", error);
    return null;
  }
};

/**
 * Get user's split bills
 */
export const getUserSplitBills = async (userAddress: string): Promise<number[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_user_split_bills`,
        functionArguments: [CONTRACT_ADDRESS, userAddress],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      return result[0] as number[];
    }
    return [];
  } catch (error) {
    console.error("Error getting user split bills:", error);
    return [];
  }
};

/**
 * Get EMI agreement details
 */
export const getEmiAgreement = async (emiId: number): Promise<EmiAgreement | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_emi_agreement`,
        functionArguments: [CONTRACT_ADDRESS, emiId.toString()],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      const option = result[0] as Record<string, unknown>;
      if (option.vec && Array.isArray(option.vec) && option.vec.length > 0) {
        const data = option.vec[0];
        return {
          id: emiId.toString(),
          user: data.user,
          company: data.company,
          total_amount: data.total_amount,
          monthly_amount: data.monthly_amount,
          months: data.months,
          months_paid: data.months_paid,
          description: data.description,
          created_at: data.created_at,
          next_payment_due: data.next_payment_due,
          status: data.status,
          auto_pay_approved: data.auto_pay_approved,
          auto_pay_balance: data.auto_pay_balance,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting EMI agreement:", error);
    return null;
  }
};

/**
 * Get user's EMI agreements (EMIs they are paying)
 */
export const getUserEmis = async (userAddress: string): Promise<number[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_user_emis`,
        functionArguments: [CONTRACT_ADDRESS, userAddress],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      return result[0] as number[];
    }
    return [];
  } catch (error) {
    console.error("Error getting user EMIs:", error);
    return [];
  }
};

/**
 * Get company's EMI agreements (EMIs they are receiving)
 */
export const getCompanyEmis = async (companyAddress: string): Promise<number[]> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_company_emis`,
        functionArguments: [CONTRACT_ADDRESS, companyAddress],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      return result[0] as number[];
    }
    return [];
  } catch (error) {
    console.error("Error getting company EMIs:", error);
    return [];
  }
};

/**
 * Get user statistics for loyalty tracking
 */
export const getUserStats = async (userAddress: string): Promise<UserStats | null> => {
  const cacheKey = generateCacheKey('getUserStats', userAddress);
  
  return rpcCache.get(
    cacheKey,
    async () => {
      try {
        const result = await aptos.view({
          payload: {
            function: `${MODULE_ID}::get_user_stats`,
            functionArguments: [CONTRACT_ADDRESS, userAddress],
          },
        });

        if (result && Array.isArray(result) && result.length > 0) {
          const option = result[0] as Record<string, unknown>;
          if (option.vec && Array.isArray(option.vec) && option.vec.length > 0) {
            const data = option.vec[0] as Record<string, unknown>;
            console.log('📊 User stats from contract:', data);
            return {
              total_transactions: (data.total_transactions || '0') as string,
              last_transaction_date: (data.last_transaction_date || '0') as string,
              loyalty_nfts_minted: (data.loyalty_nfts_minted || []) as number[],
            };
          }
        }
        console.log('❌ No user stats found for:', userAddress);
        return null;
      } catch (error) {
        console.error("Error getting user stats:", error);
        return null;
      }
    },
    30000 // Cache for 30 seconds - stats don't change frequently
  );
};

/**
 * Get all coupon NFT instances for a user
 */
export const getUserCouponNFTInstances = async (userAddress: string) => {
  const cacheKey = generateCacheKey('getUserCouponNFTInstances', userAddress);
  
  return rpcCache.get(
    cacheKey,
    async () => {
      try {
        const result = await aptos.view({
          payload: {
            function: `${MODULE_ID}::get_user_coupon_nft_instances`,
            functionArguments: [CONTRACT_ADDRESS, userAddress],
          },
        });

        if (result && Array.isArray(result) && result.length > 0) {
          const coupons = result[0] as Array<Record<string, unknown>>;
          console.log('🎟️ User coupon NFTs from contract:', coupons);
          return coupons.map((coupon: Record<string, unknown>) => ({
            id: coupon.id as string,
            template_id: coupon.template_id as string,
            owner: coupon.owner as string,
            company: coupon.company as string,
            discount_percentage: coupon.discount_percentage as number,
            discount_link: coupon.discount_link as string,
            description: coupon.description as string,
            expires_at: coupon.expires_at as string,
            created_at: coupon.created_at as string,
            is_redeemed: coupon.is_redeemed as boolean,
            metadata: coupon.metadata as Record<string, unknown>,
          }));
        }
        console.log('❌ No coupon NFTs found for:', userAddress);
        return [];
      } catch (error) {
        console.error("Error getting user coupon NFTs:", error);
        return [];
      }
    },
    10000 // Cache for 10 seconds
  );
};

/**
 * Get coupon template details
 */
export const getCouponTemplate = async (templateId: number): Promise<CouponTemplate | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${MODULE_ID}::get_coupon_template`,
        functionArguments: [CONTRACT_ADDRESS, templateId.toString()],
      },
    });

    if (result && Array.isArray(result) && result.length > 0) {
      const option = result[0] as Record<string, unknown>;
      if (option.vec && Array.isArray(option.vec) && option.vec.length > 0) {
        const data = option.vec[0];
        return {
          id: templateId.toString(),
          company: data.company,
          title: data.title,
          description: data.description,
          discount_percentage: data.discount_percentage,
          max_discount_amount: data.max_discount_amount,
          valid_days: data.valid_days,
          image_url: data.image_url,
          total_minted: data.total_minted,
          is_active: data.is_active,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting coupon template:", error);
    return null;
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert APT to Octas (1 APT = 100,000,000 octas)
 */
export const aptToOctas = (apt: number): string => {
  return Math.floor(apt * 100000000).toString();
};

/**
 * Convert Octas to APT
 */
export const octasToApt = (octas: string): number => {
  return parseInt(octas) / 100000000;
};

/**
 * Legacy parseContractError - kept for backward compatibility
 * @deprecated Use parseContractError from errorHandler.ts instead
 */
export const parseContractErrorLegacy = (error: string): string => {
  const errorMap: { [key: string]: string } = {
    "E_WALLET_ID_ALREADY_EXISTS": "This wallet ID is already registered",
    "E_UPI_ID_ALREADY_EXISTS": "This UPI ID is already registered",
    "E_WALLET_ID_NOT_FOUND": "Wallet ID not found",
    "E_UPI_ID_NOT_FOUND": "UPI ID not found",
    "E_PAYMENT_REQUEST_NOT_FOUND": "Payment request not found",
    "E_SPLIT_BILL_NOT_FOUND": "Split bill not found",
    "E_NOT_AUTHORIZED": "You are not authorized for this action",
    "E_INVALID_AMOUNT": "Invalid amount",
    "E_WALLET_NOT_INITIALIZED": "Wallet not initialized",
    "E_EMI_NOT_FOUND": "EMI agreement not found",
    "E_EMI_ALREADY_EXISTS": "EMI agreement already exists",
    "E_EMI_COMPLETED": "EMI already completed",
    "E_EMI_PAYMENT_TOO_EARLY": "EMI payment not due yet",
    "E_INSUFFICIENT_BALANCE": "Insufficient balance",
    "E_INVALID_SPLIT_DATA": "Invalid split bill data",
    "E_EMI_NOT_DUE": "EMI payment not due yet",
    "E_LOYALTY_NFT_ALREADY_EXISTS": "Loyalty NFT already minted for this tier",
    "E_COUPON_NFT_NOT_FOUND": "Coupon NFT not found",
    "E_COUPON_NFT_EXPIRED": "Coupon NFT has expired",
    "E_AUTO_PAY_NOT_APPROVED": "Auto-pay not approved for this EMI",
  };

  for (const [code, message] of Object.entries(errorMap)) {
    if (error.includes(code)) {
      return message;
    }
  }

  return error;
};

/**
 * Resolve recipient identifier (address, wallet ID, or UPI ID)
 * Returns the wallet address or null if not found
 */
export const resolveRecipient = async (identifier: string): Promise<{
  address: string | null;
  type: 'address' | 'walletId' | 'upiId';
}> => {
  // Check if it's a valid address (starts with 0x and has correct length)
  if (identifier.startsWith('0x') && identifier.length === 66) {
    return { address: identifier, type: 'address' };
  }

  // Check if it's a UPI ID (contains @)
  if (identifier.includes('@')) {
    const address = await getAddressByUpiId(identifier);
    return { address, type: 'upiId' };
  }

  // Assume it's a wallet ID
  const address = await getAddressByWalletId(identifier);
  return { address, type: 'walletId' };
};

/**
 * Invalidate cache for a specific user (call after transactions)
 */
export const invalidateUserCache = (userAddress: string): void => {
  rpcCache.invalidate(generateCacheKey('getUserStats', userAddress));
  rpcCache.invalidate(generateCacheKey('getUserPaymentRequests', userAddress));
  rpcCache.invalidate(generateCacheKey('getUserSentRequests', userAddress));
  rpcCache.invalidate(generateCacheKey('getUserSplitBills', userAddress));
  rpcCache.invalidate(generateCacheKey('getUserEmis', userAddress));
  console.log('🔄 Invalidated cache for user:', userAddress.slice(0, 10) + '...');
};

/**
 * Invalidate specific payment request cache
 */
export const invalidatePaymentRequestCache = (requestId: number): void => {
  rpcCache.invalidate(generateCacheKey('getPaymentRequest', requestId));
  console.log('🔄 Invalidated cache for payment request:', requestId);
};

// ============================================================================
// Transaction History Functions
// ============================================================================

interface TransactionEvent {
  type: string;
  data?: Record<string, unknown>;
}

export interface EnhancedTransaction {
  hash: string;
  version: string;
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  gas_used: string;
  timestamp: string;
  success: boolean;
  vm_status: string;
  payload: {
    function: string;
    type_arguments: string[];
    arguments: unknown[];
    type: string;
  } | null;
  events: TransactionEvent[];
  // Enhanced fields
  type: 'coin_transfer' | 'payment_request' | 'split_bill' | 'emi_payment' | 'nft_mint' | 'other';
  amount?: string;
  amount_apt?: number;
  recipient?: string;
  description?: string;
  direction: 'sent' | 'received' | 'self';
  module_name?: string;
  function_name?: string;
}

/**
 * Fetch and enhance account transactions with parsed details
 */
export const getEnhancedAccountTransactions = async (
  address: string,
  limit: number = 50
): Promise<EnhancedTransaction[]> => {
  try {
    console.log('🔍 Fetching enhanced transactions for:', address);
    
    const transactions = await aptos.getAccountTransactions({
      accountAddress: address,
      options: { limit }
    });

    const enhanced: EnhancedTransaction[] = transactions.map((tx: Record<string, unknown>) => {
      // Base transaction data with type assertions
      const enhancedTx: EnhancedTransaction = {
        hash: tx.hash as string,
        version: tx.version as string,
        sender: tx.sender as string,
        sequence_number: tx.sequence_number as string,
        max_gas_amount: tx.max_gas_amount as string,
        gas_unit_price: tx.gas_unit_price as string,
        gas_used: tx.gas_used as string,
        timestamp: tx.timestamp as string,
        success: tx.success as boolean,
        vm_status: tx.vm_status as string,
        payload: (tx.payload || null) as EnhancedTransaction['payload'],
        events: (tx.events || []) as TransactionEvent[],
        type: 'other',
        direction: 'sent'
      };

      // Parse payload if it exists
      if (tx.payload) {
        const payload = tx.payload as Record<string, unknown>;
        
        // Extract module and function name
        const funcName = payload.function as string | undefined;
        const args = payload.arguments as unknown[] | undefined;
        
        if (funcName) {
          const parts = funcName.split('::');
          if (parts.length >= 3) {
            enhancedTx.module_name = parts[1];
            enhancedTx.function_name = parts[2];
          }
        }

        // Determine transaction type and extract details
        if (funcName?.includes('aptos_account::transfer')) {
          enhancedTx.type = 'coin_transfer';
          if (args && args.length >= 2) {
            enhancedTx.recipient = args[0] as string;
            enhancedTx.amount = args[1] as string;
            enhancedTx.amount_apt = parseFloat(args[1] as string) / 100000000;
          }
        } else if (funcName?.includes('coin::transfer')) {
          enhancedTx.type = 'coin_transfer';
          if (args && args.length >= 2) {
            enhancedTx.recipient = args[0] as string;
            enhancedTx.amount = args[1] as string;
            enhancedTx.amount_apt = parseFloat(args[1] as string) / 100000000;
          }
        } else if (funcName?.includes('wallet_system::send_money')) {
          enhancedTx.type = 'coin_transfer';
          if (args && args.length >= 2) {
            enhancedTx.recipient = args[0] as string;
            enhancedTx.amount = args[1] as string;
            enhancedTx.amount_apt = parseFloat(args[1] as string) / 100000000;
          }
        } else if (funcName?.includes('wallet_system::create_payment_request')) {
          enhancedTx.type = 'payment_request';
          if (args && args.length >= 3) {
            enhancedTx.recipient = args[0] as string;
            enhancedTx.amount = args[1] as string;
            enhancedTx.amount_apt = parseFloat(args[1] as string) / 100000000;
            enhancedTx.description = args[2] as string;
          }
        } else if (funcName?.includes('wallet_system::pay_request')) {
          enhancedTx.type = 'payment_request';
          // Get payment request details from events
          const txEvents = tx.events as unknown[] | undefined;
          const payEvent = txEvents?.find((e: unknown) => {
            const event = e as TransactionEvent;
            return event.type?.includes('PaymentRequestPaidEvent');
          }) as TransactionEvent | undefined;
          
          if (payEvent && payEvent.data) {
            enhancedTx.amount = payEvent.data.amount as string;
            enhancedTx.amount_apt = parseFloat((payEvent.data.amount as string) || '0') / 100000000;
            enhancedTx.recipient = payEvent.data.to as string;
          }
        } else if (funcName?.includes('wallet_system::create_split_bill')) {
          enhancedTx.type = 'split_bill';
          if (args && args.length >= 1) {
            enhancedTx.amount = args[0] as string;
            enhancedTx.amount_apt = parseFloat(args[0] as string) / 100000000;
          }
        } else if (funcName?.includes('wallet_system::pay_emi')) {
          enhancedTx.type = 'emi_payment';
          const txEvents = tx.events as unknown[] | undefined;
          const emiEvent = txEvents?.find((e: unknown) => {
            const event = e as TransactionEvent;
            return event.type?.includes('EmiPaymentEvent');
          }) as TransactionEvent | undefined;
          
          if (emiEvent && emiEvent.data) {
            enhancedTx.amount = emiEvent.data.installment_amount as string;
            enhancedTx.amount_apt = parseFloat((emiEvent.data.installment_amount as string) || '0') / 100000000;
            enhancedTx.recipient = emiEvent.data.company as string;
          }
        } else if (funcName?.includes('wallet_system::mint_loyalty_nft')) {
          enhancedTx.type = 'nft_mint';
          enhancedTx.description = 'Loyalty NFT Minted';
        }

        // Determine direction (sent/received/self)
        if (tx.sender === address) {
          if (enhancedTx.recipient === address) {
            enhancedTx.direction = 'self';
          } else {
            enhancedTx.direction = 'sent';
          }
        } else {
          enhancedTx.direction = 'received';
        }
      }

      // Check events for received transfers
      const txEvents = tx.events as unknown[] | undefined;
      if (txEvents && txEvents.length > 0) {
        const receiveEvent = txEvents.find((e: unknown) => {
          const event = e as TransactionEvent;
          return event.type?.includes('CoinDeposit') || event.type?.includes('DepositEvent');
        }) as TransactionEvent | undefined;
        
        if (receiveEvent && receiveEvent.data && tx.sender !== address) {
          enhancedTx.direction = 'received';
          if (receiveEvent.data.amount) {
            enhancedTx.amount = receiveEvent.data.amount as string;
            enhancedTx.amount_apt = parseFloat(receiveEvent.data.amount as string) / 100000000;
          }
        }
      }

      return enhancedTx;
    });

    console.log('✅ Enhanced', enhanced.length, 'transactions');
    return enhanced;
  } catch (error) {
    console.error('Error fetching enhanced transactions:', error);
    return [];
  }
};

/**
 * Get transaction statistics for a given address
 */
export const getTransactionStatistics = async (address: string) => {
  try {
    const transactions = await getEnhancedAccountTransactions(address, 100);
    
    const stats = {
      total: transactions.length,
      successful: transactions.filter(tx => tx.success).length,
      failed: transactions.filter(tx => !tx.success).length,
      sent: transactions.filter(tx => tx.direction === 'sent').length,
      received: transactions.filter(tx => tx.direction === 'received').length,
      totalSent: 0,
      totalReceived: 0,
      byType: {
        coin_transfer: 0,
        payment_request: 0,
        split_bill: 0,
        emi_payment: 0,
        nft_mint: 0,
        other: 0
      },
      recentActivity: transactions.slice(0, 10)
    };

    transactions.forEach(tx => {
      if (tx.amount_apt) {
        if (tx.direction === 'sent') {
          stats.totalSent += tx.amount_apt;
        } else if (tx.direction === 'received') {
          stats.totalReceived += tx.amount_apt;
        }
      }
      stats.byType[tx.type]++;
    });

    return stats;
  } catch (error) {
    console.error('Error calculating transaction statistics:', error);
    return null;
  }
};
