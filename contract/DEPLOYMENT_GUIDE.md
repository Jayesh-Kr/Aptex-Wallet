# 🚀 Contract Deployment Guide - Aptos Testnet

## Current Status

✅ **Aptos CLI**: Installed (v7.8.1)  
✅ **Network**: Configured for Testnet  
✅ **Account Address**: `0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c`  
⚠️ **Faucet**: Temporarily unavailable via CLI

---

## Step 1: Fund Your Account 💰

Since the CLI faucet is temporarily down, use the web faucet:

### Option A: Web Faucet (Recommended)
1. Visit: **https://faucet.testnet.aptoslabs.com/**
2. Enter your address: `0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c`
3. Click "Submit" to receive 1 APT
4. Wait 30-60 seconds for the transaction to process

### Option B: Discord Faucet
1. Join Aptos Discord: https://discord.gg/aptoslabs
2. Go to #testnet-faucet channel
3. Use command: `!faucet 0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c`

### Verify Funding
After funding, run this command to check your balance:
```bash
cd contract
aptos account list --profile default
```

You should see approximately 1 APT (100000000 Octas).

---

## Step 2: Compile the Contract 🔨

Build your Move contract to check for errors:

```bash
cd contract
aptos move compile --named-addresses aptos_contract=default
```

This will:
- Check for syntax errors
- Verify dependencies
- Generate bytecode in `build/` directory

---

## Step 3: Deploy the Contract 🚀

Once you have funds, deploy with:

```bash
aptos move publish --profile default --named-addresses aptos_contract=default
```

**Expected Output:**
```json
{
  "Result": {
    "transaction_hash": "0x...",
    "gas_used": ...,
    "gas_unit_price": ...,
    "sender": "0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c",
    "success": true,
    "version": ...,
    "vm_status": "Executed successfully"
  }
}
```

**Note**: The contract will be deployed at your account address:
`0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c`

---

## Step 4: Update Frontend Configuration 🔧

After successful deployment, update the contract address in your frontend:

**File**: `frontend/src/utils/contractUtils.ts`

Change line 23:
```typescript
// OLD (devnet address)
export const CONTRACT_ADDRESS = "0x26edd69f33b924746d8bcc972027477d46e79406975f9c370260fd9c99aa255d";

// NEW (your testnet address)
export const CONTRACT_ADDRESS = "0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c";
```

---

## Step 5: Verify Deployment ✅

### Check on Explorer
Visit: https://explorer.aptoslabs.com/account/0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c?network=testnet

You should see:
- Your account details
- Deployed modules (wallet_system)
- Transaction history

### Verify Contract Functions
```bash
aptos move view --function-id "0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c::wallet_system::function_name" --profile default
```

---

## Step 6: Initialize Contract (if needed) 🎯

Check your contract's `wallet_system.move` for any initialization functions. Based on your contract structure, users initialize their own wallets when they first interact, so **no global initialization is required**.

---

## Troubleshooting 🔧

### ❌ "Insufficient balance"
- Fund your account from web faucet (Step 1)
- Each deployment costs ~0.01-0.05 APT

### ❌ "Module already exists"
- Contract already deployed at this address
- Use `--override` flag to upgrade: `aptos move publish --override --profile default`

### ❌ "Compilation errors"
- Review error messages carefully
- Check Move syntax
- Verify framework dependencies in `Move.toml`

### ❌ "Network error"
- Check internet connection
- Verify testnet is operational: https://status.aptoslabs.com/
- Try again after a few minutes

---

## Quick Command Reference 📝

```bash
# Navigate to contract directory
cd contract

# Check balance
aptos account list --profile default

# Compile contract
aptos move compile --named-addresses aptos_contract=default

# Deploy contract
aptos move publish --profile default --named-addresses aptos_contract=default

# Upgrade existing contract
aptos move publish --override --profile default --named-addresses aptos_contract=default

# View account on explorer
start https://explorer.aptoslabs.com/account/0x9c2fe13427bfa2d51671cdc2c04b4915ed4ef81709ccd8cd31c1150769596d2c?network=testnet
```

---

## Next Steps After Deployment 🎉

1. ✅ Update `CONTRACT_ADDRESS` in `contractUtils.ts`
2. ✅ Test wallet creation from frontend
3. ✅ Test sending transactions
4. ✅ Test payment requests
5. ✅ Test EMI agreements
6. ✅ Test NFT minting
7. ✅ Verify transaction history

---

## Important Notes 📌

- **Contract Address = Your Account Address**: In Aptos, contracts are deployed to your account
- **Testnet Persistence**: Your contract and data will persist (no daily resets like devnet)
- **Gas Costs**: Keep some APT in your account for future transactions
- **Contract Updates**: Use `--override` flag to upgrade your deployed contract

---

## Need Help? 🆘

- Aptos Discord: https://discord.gg/aptoslabs
- Aptos Docs: https://aptos.dev/
- Move Book: https://move-book.com/
- Explorer: https://explorer.aptoslabs.com/?network=testnet

---

*Good luck with your deployment! 🚀*
