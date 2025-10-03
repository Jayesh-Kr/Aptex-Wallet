# Aptex Wallet - Web3 Payment & Wallet Ecosystem for Aptos

<div align="center">
  <img src="frontend/public/logo.png" alt="Aptos RiseIn Logo" width="200"/>
  
  **Move money like messages, bring real-world assets on-chain.**
  
  [![Aptos](https://img.shields.io/badge/Built%20on-Aptos-00D4FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiMwMEQ0RkYiLz4KPC9zdmc+)](https://aptoslabs.com/)
  [![Move](https://img.shields.io/badge/Smart%20Contract-Move-FF6B35?style=for-the-badge)](https://move-language.github.io/move/)
  [![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  
  [![Nodit](https://img.shields.io/badge/Infrastructure-Nodit-7C3AED?style=for-the-badge)](https://nodit.io/)
  [![Kana Labs](https://img.shields.io/badge/Trading-Kana%20Labs-10B981?style=for-the-badge)](https://kanalabs.io/)
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

**Aptex** is a comprehensive Web3 payment and trading ecosystem built on the Aptos blockchain that revolutionizes digital transactions by combining traditional fintech convenience with blockchain innovation and advanced DeFi features. Our platform transforms complex blockchain addresses into user-friendly identifiers while providing advanced financial primitives like Autopay systems, bill splitting, gamified rewards through NFTs, and **professional-grade perpetual futures trading powered by Kana Labs**.

Built on **enterprise-grade infrastructure by Nodit**, Aptex ensures lightning-fast blockchain queries, reliable data access, and seamless user experience. The integration of Kana Labs enables traders to access leveraged perpetual futures markets directly from their wallet, creating a unified platform for payments, savings, and trading.

### Vision
To make blockchain payments as simple as sending a text message while unlocking the full potential of decentralized finance for everyday users - from simple peer-to-peer payments to advanced leveraged trading.

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

### **🚀 Advanced Trading Features (Kana Labs Integration)**

#### **Perpetual Futures Trading**
- **Leveraged Trading**: Trade crypto perps with up to 125x leverage
- **Real-time Markets**: Access live perpetual futures markets on Aptos
- **Advanced Order Types**: Market orders, limit orders, stop-loss, and take-profit
- **Position Management**: Track and manage open positions with live P&L
- **Risk Indicators**: Real-time liquidation prices and margin utilization
- **Trading History**: Complete history of all trades and positions
- **Market Analytics**: 24h volume, price changes, funding rates, and open interest

#### **Portfolio Overview**
- **Combined Holdings**: View spot and perps positions in one place
- **Unrealized P&L**: Real-time profit/loss tracking for open positions
- **Risk Management**: Monitor margin requirements and liquidation risks
- **Performance Metrics**: Track trading performance over time

### **⚡ Blockchain Infrastructure (Nodit Integration)**

#### **Real-time Data API**
- **Enhanced Balance Fetching**: Fast and reliable account balance queries
- **Transaction History**: Comprehensive transaction data with filtering
- **Token Metadata**: Detailed token information, logos, and prices
- **Multi-token Support**: Track all tokens and assets in one call
- **Account Resources**: Access complete on-chain account data

#### **Advanced Query Capabilities**
- **Historical Data**: Access blockchain state at any point in time
- **Batch Queries**: Efficient multi-data point retrieval
- **Smart Filtering**: Advanced search and filter capabilities
- **Analytics Ready**: Data optimized for analytics and reporting

#### **Infrastructure Benefits**
- **High Availability**: 99.9% uptime guarantee
- **Low Latency**: Sub-second response times for blockchain queries
- **Scalability**: Handle high-volume requests without rate limiting issues
- **Reliability**: Enterprise-grade infrastructure for production applications

---

## Architecture

### **Frontend (React + TypeScript)**
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── perps/          # Perpetual futures trading components
│   │   │   ├── PerpsTradingSection.tsx
│   │   │   ├── PerpsMarketsList.tsx
│   │   │   ├── PerpsTradingPanel.tsx
│   │   │   ├── PerpsPositionsManager.tsx
│   │   │   └── PerpsPortfolioOverview.tsx
│   │   └── ...             # Other UI components
│   ├── pages/              # Main application pages
│   ├── contexts/           # React context providers
│   ├── services/           # External API integrations
│   │   ├── nodit/         # Nodit blockchain infrastructure
│   │   │   ├── noditClient.ts
│   │   │   ├── accountService.ts
│   │   │   └── tokenService.ts
│   │   └── kana/          # Kana Labs perps trading
│   │       ├── kanaClient.ts
│   │       └── perpsService.ts
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

# Nodit Infrastructure (Optional but recommended for enhanced performance)
VITE_NODIT_API_KEY=your_nodit_api_key
VITE_NODIT_BASE_URL=https://aptos-mainnet.nodit.io

# Kana Labs Perps Trading (Required for trading features)
VITE_KANA_API_URL=https://api.kanalabs.io
VITE_KANA_WS_URL=wss://ws.kanalabs.io
```

### **API Keys Setup**

#### **Nodit API (Optional)**
1. Visit [Nodit.io](https://nodit.io/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Generate a new API key
5. Add to `.env` file as `VITE_NODIT_API_KEY`

**Benefits:** Enhanced blockchain data queries, faster balance fetching, comprehensive transaction history

#### **Kana Labs API (Required for Trading)**
1. Visit [Kana Labs](https://kanalabs.io/)
2. Register for API access
3. Generate API credentials
4. Add to `.env` file


**Features Enabled:** Perpetual futures trading, leverage trading, position management

---

## 🎯 Feature Guides

### **Getting Started with Perps Trading**

1. **Access Trading Section**
   - Navigate to "Perps Trading" in the dashboard sidebar
   - Browse available perpetual futures markets
   - View real-time prices, 24h changes, and funding rates

2. **Open a Position**
   - Select a market (e.g., APT-PERP, BTC-PERP)
   - Choose Long or Short direction
   - Set leverage (1x to 125x)
   - Enter position size
   - Add optional stop-loss/take-profit levels
   - Review and confirm order

3. **Manage Positions**
   - Monitor open positions in the Positions tab
   - View real-time P&L and liquidation prices
   - Close positions partially or fully
   - Adjust stop-loss/take-profit levels
   - Track performance metrics

### **Using Nodit-Powered Features**

1. **Enhanced Balance Viewing**
   - Real-time balance updates via Nodit API
   - Faster load times compared to standard RPC
   - Multi-token balance tracking

2. **Transaction History**
   - Comprehensive transaction data
   - Advanced filtering by date, amount, and type
   - Export functionality for record-keeping

3. **Token Information**
   - Automatic token metadata fetching
   - Display token logos and symbols
   - Price information and statistics

---

## Use Cases


---

## 🎯 Feature Guides

### **For Individual Users**
- **Daily Payments**: Seamless APT transfers with INR reference
- **Group Expenses**: Split restaurant bills, travel costs, and shared purchases
- **Savings Goals**: EMI-based systematic investment plans
- **Rewards Collection**: Earn and trade loyalty NFTs and coupons
- **Trading & Investing**: Access perpetual futures markets with leverage
- **Portfolio Management**: Track all assets and positions in real-time
- **Advanced Trading**: Use stop-loss/take-profit orders for risk management

### **For Businesses**
- **Customer Payments**: Accept crypto payments with traditional UX
- **Loyalty Programs**: Create engaging NFT-based reward systems
- **Recurring Billing**: Implement subscription models with EMI contracts
- **Marketing Campaigns**: Distribute promotional NFT coupons
- **Trading Infrastructure**: Integrate perps trading for advanced users

### **For Traders & Investors**
- **Leveraged Trading**: Access up to 125x leverage on perpetual futures
- **Risk Management**: Use advanced order types and position monitoring
- **Market Analysis**: Real-time data, funding rates, and open interest
- **Portfolio Tracking**: Combined view of spot and derivative positions
- **Performance Analytics**: Track trading history and P&L metrics

### **For Financial Services**
- **Lending Products**: Offer EMI-based loans with automated collection
- **Remittances**: Facilitate cross-border money transfers
- **Payment Processing**: Integrate blockchain payments into existing systems
- **Reward Programs**: Launch innovative NFT-based customer engagement
- **Trading Services**: Provide derivatives trading to customers

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
- [x] Merchant partnerships
- [x] Advanced analytics
- [x] Perpetual futures trading integration (Kana Labs)
- [x] Enhanced blockchain infrastructure (Nodit)
- [ ] Cross-chain bridges
- [ ] Additional trading pairs

### **Phase 4: Enterprise** 
- [ ] B2B payment solutions
- [ ] White-label solutions
- [ ] Compliance tools
- [ ] Institutional trading features

---

## 🛠️ Technology Stack

### **Blockchain & Smart Contracts**
- **Aptos Blockchain**: High-performance L1 blockchain
- **Move Language**: Secure smart contract development
- **Aptos SDK**: Official TypeScript SDK for Aptos integration

### **Frontend Technologies**
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations
- **React Query**: Data fetching and caching
- **Recharts**: Data visualization

### **External Integrations**

#### **Nodit - Aptos Infrastructure** 🚀
- **Provider**: Enterprise-grade Aptos blockchain infrastructure
- **Features Used**:
  - Web3 Data API for real-time balance queries
  - Enhanced transaction history retrieval
  - Token metadata and information services
  - Account resource queries
- **Benefits**: 
  - 99.9% uptime guarantee
  - Sub-second response times
  - Reduced load on public RPC nodes
  - Advanced query capabilities
- **Documentation**: [Nodit API Docs](https://developer.nodit.io/)
- **Integration Files**: `frontend/src/services/nodit/`

#### **Kana Labs - Perpetual Futures** 📈
- **Provider**: Leading DeFi derivatives protocol on Aptos
- **Features Used**:
  - Perpetual futures markets access
  - Real-time market data and pricing
  - Order execution (market, limit, stop orders)
  - Position management and tracking
  - P&L calculation and risk metrics
- **Benefits**:
  - Up to 125x leverage
  - Low latency trading
  - Deep liquidity
  - Advanced order types
- **Documentation**: [Kana Labs Docs](https://docs.kanalabs.io/)
- **Integration Files**: `frontend/src/services/kana/`

### **Development Tools**
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Zod**: Runtime type validation
- **React Hook Form**: Form management

---

## 📚 Additional Resources

### **Integration Guides**
- [Nodit Integration Guide](NODIT_INTEGRATION_GUIDE.md) - Complete guide for Nodit API integration
- [Perps Trading Integration](PERPS_TRADING_INTEGRATION.md) - Guide for Kana Labs perps trading
- [Contract Deployment Guide](contract/DEPLOYMENT_GUIDE.md) - Smart contract deployment instructions

### **API Documentation**
- **Nodit API**: Real-time blockchain data and infrastructure
- **Kana Labs API**: Perpetual futures trading and market data
- **Aptos SDK**: Blockchain interaction and transaction signing

### **Component Documentation**
- **Perps Trading Components**: `frontend/src/components/perps/`
  - `PerpsTradingSection.tsx` - Main trading interface
  - `PerpsMarketsList.tsx` - Market browser
  - `PerpsTradingPanel.tsx` - Order placement
  - `PerpsPositionsManager.tsx` - Position tracking
  - `PerpsPortfolioOverview.tsx` - Portfolio summary

### **Service Modules**
- **Nodit Services**: `frontend/src/services/nodit/`
  - `noditClient.ts` - API client configuration
  - `accountService.ts` - Account and balance queries
  - `tokenService.ts` - Token metadata and information
- **Kana Services**: `frontend/src/services/kana/`
  - `kanaClient.ts` - Trading API client
  - `perpsService.ts` - Trading operations and data

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
