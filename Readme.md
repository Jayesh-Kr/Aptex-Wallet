# Aptex Wallet - Web3 Payment & Wallet Ecosystem for Aptos

<div align="center">
  <img src="frontend/public/logo.png" alt="Aptos RiseIn Logo" width="200"/>
  
  **Move money like messages, bring real-world assets on-chain.**
  
  [![Aptos](https://img.shields.io/badge/Built%20on-Aptos-00D4FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiMwMEQ0RkYiLz4KPC9zdmc+)](https://aptoslabs.com/)
  [![Move](https://img.shields.io/badge/Smart%20Contract-Move-FF6B35?style=for-the-badge)](https://move-language.github.io/move/)
  [![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
</div>

---
<p align="center">
  <b>🎬 Watch Demo</b><br><br>
  <a href="https://youtu.be/nlB3flo-IWk">
    <img src="https://img.youtube.com/vi/nlB3flo-IWk/0.jpg" 
         alt="Watch the video" 
         width="600" 
         style="border-radius:15px;"/>
  </a>
</p>


## Overview

**Aptex** is a comprehensive Web3 payment ecosystem built on the Aptos blockchain that revolutionizes digital transactions by combining traditional fintech convenience with blockchain innovation. Our platform transforms complex blockchain addresses into user-friendly identifiers while providing advanced financial primitives like Autopay systems, bill splitting, and gamified rewards through NFTs.

### Vision
To make blockchain payments as simple as sending a text message while unlocking the full potential of decentralized finance for everyday users.

---

## Key Features

### **User-Friendly Wallet System**
- **Human-Readable IDs**: Convert complex blockchain addresses to simple `wallet_id` and `upi_id` formats
- **Secure Key Management**: Client-side wallet generation and management
- **Multi-Account Support**: Manage multiple wallets from a single interface
- **QR Code Integration**: Easy scanning for quick transactions

### **Advanced Payment Infrastructure**

#### **Peer-to-Peer Payments**
- Instant INR conversion to APT in real time and transfer
- Payment request system with approval/rejection workflow
- Transaction history with detailed analytics
- Cross-border remittances support

#### **Smart Bill Splitting**
- **Custom Split Amounts**: Define individual amounts for each participant
- **Automatic Request Generation**: Creates individual payment requests for all participants
- **Real-time Tracking**: Monitor payment status from all participants
- **Flexible Distribution**: Support for unequal splits based on consumption

#### **Auto System**
- **On-Chain Credit Agreements**: Trustless autopay contracts between users and companies
- **Auto-Pay Mechanism**: Pre-deposit funds for automatic monthly deductions
- **Payment Scheduling**: Enforced due dates with early payment protection
- **Transparent Terms**: All agreement terms stored on-chain
- **Default Protection**: Built-in safeguards against payment defaults

### **Gamified Rewards System**

#### **Loyalty NFT Program** 
Progressive tier system based on transaction activity:
- **Bronze** (1+ transactions): Entry-level rewards
- **Silver** (10+ transactions): Enhanced benefits
- **Gold** (50+ transactions): Premium perks
- **Platinum** (100+ transactions): VIP status
- **Diamond** (250+ transactions): Ultimate tier

#### **Dynamic Coupon NFTs** 
- **Company-Created Templates**: Businesses can create promotional offers
- **Automated Distribution**: Random rewards after transactions
- **Expiration Management**: Time-bound validity for urgency
- **Transferable Assets**: Trade and gift coupon NFTs
- **Real-world Integration**: Redeem for actual products/services

### **Analytics & Insights**
- **Transaction Analytics**: Detailed spending patterns and trends
- **Portfolio Tracking**: Real-time balance monitoring across accounts
- **Reward Tracking**: Monitor loyalty progress and earned benefits
- **Export Functionality**: Download transaction history as Excel files

---

## Architecture

### **Frontend (React + TypeScript)**
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── contexts/           # React context providers
│   ├── utils/              # Utility functions
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

### **Smart Contract (Move)**
```
contract/
├── sources/
│   └── wallet_system.move  # Main contract implementation
├── tests/
│   └── wallet_tests.move   # Comprehensive test suite
├── Move.toml              # Project configuration
└── build/                 # Compiled bytecode
```

---

## Smart Contract Deep Dive

### **Core Data Structures**

#### **PaymentRequest**
```move
struct PaymentRequest has store, drop, copy {
    id: u64,
    from: address,
    to: address,
    amount: u64,
    message: String,
    status: u8,
    created_at: u64,
}
```

#### **SplitBill**
```move
struct SplitBill has store, drop, copy {
    id: u64,
    creator: address,
    total_amount: u64,
    description: String,
    splits: vector<SplitEntry>,
    created_at: u64,
}
```

#### **EmiAgreement**
```move
struct EmiAgreement has store, drop {
    id: u64,
    user: address,
    company: address,
    total_amount: u64,
    monthly_amount: u64,
    months_total: u64,
    months_paid: u64,
    next_due_date: u64,
    status: u8,
    auto_pay_approved: bool,
    deposited_amount: u64,
}
```

### **Key Functions**

#### **Wallet Management**
- `register_wallet_id()`: Register human-readable wallet ID
- `register_upi_id()`: Register UPI-style identifier
- `get_address_by_wallet_id()`: Resolve wallet ID to blockchain address

#### **Payment Operations**
- `create_payment_request()`: Create P2P payment request
- `pay_request()`: Process payment request
- `direct_transfer()`: Instant APT transfer between addresses

#### **Bill Splitting**
- `create_split_bill()`: Initialize bill splitting with custom amounts
- `join_split_bill()`: Add participants to existing split
- `pay_split_amount()`: Process individual split payments

#### **EMI Management**
- `create_emi_agreement()`: Establish EMI contract
- `deposit_for_auto_pay()`: Pre-fund for automatic payments
- `process_emi_payment()`: Execute monthly EMI deduction
- `approve_auto_pay()`: Enable automatic payment collection

#### **NFT Rewards**
- `mint_loyalty_nft()`: Award loyalty tier NFTs
- `create_coupon_template()`: Company creates promotional offers
- `mint_coupon_nft()`: Distribute coupon rewards
- `redeem_coupon()`: Use coupon for discounts

---

## Getting Started

### **Prerequisites**
- Node.js (v18+)
- npm or yarn
- Aptos CLI
- Git

### **Installation**

1. **Clone Repository**
```bash
git clone https://github.com/your-username/aptos-risein.git
cd aptos-risein
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

3. **Smart Contract Deployment**
```bash
cd contract
aptos init
aptos move compile
aptos move publish
```

### **Environment Configuration**

Create `.env` file in frontend directory:
```env
VITE_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
VITE_APTOS_FAUCET_URL=https://faucet.devnet.aptoslabs.com
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

---

## Use Cases

### **For Individual Users**
- **Daily Payments**: Seamless APT transfers with INR reference
- **Group Expenses**: Split restaurant bills, travel costs, and shared purchases
- **Savings Goals**: EMI-based systematic investment plans
- **Rewards Collection**: Earn and trade loyalty NFTs and coupons

### **For Businesses**
- **Customer Payments**: Accept crypto payments with traditional UX
- **Loyalty Programs**: Create engaging NFT-based reward systems
- **Recurring Billing**: Implement subscription models with EMI contracts
- **Marketing Campaigns**: Distribute promotional NFT coupons

### **For Financial Services**
- **Lending Products**: Offer EMI-based loans with automated collection
- **Remittances**: Facilitate cross-border money transfers
- **Payment Processing**: Integrate blockchain payments into existing systems
- **Reward Programs**: Launch innovative NFT-based customer engagement

---

## Security Features

### **Smart Contract Security**
- **Access Control**: Role-based permissions for sensitive operations
- **Input Validation**: Comprehensive parameter checking
- **Overflow Protection**: Safe arithmetic operations
- **Reentrancy Guards**: Protection against recursive calls

### **Frontend Security**
- **Client-Side Encryption**: Sensitive data encrypted before storage
- **Secure Key Management**: Private keys never leave the browser
- **Input Sanitization**: Protection against XSS and injection attacks
- **HTTPS Enforcement**: All communications encrypted in transit

---

## Roadmap

### **Phase 1: Foundation** 
- [x] Core wallet functionality
- [x] Basic P2P payments
- [x] User registration system

### **Phase 2: Advanced Features** 
- [x] Bill splitting mechanism
- [x] EMI system implementation
- [x] NFT rewards system

### **Phase 3: Ecosystem Expansion** 
- [ ] Merchant partnerships
- [ ] Advanced analytics

### **Phase 4: Enterprise** 
- [ ] B2B payment solutions
- [ ] White-label solutions
- [ ] Compliance tools

---

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

---

<div align="center">
  <p><strong>Built with ❤️ for the future of payments</strong></p>
  <p>© 2025 Aptex Wallet. All rights reserved.</p>
</div>
