# Perpetual Futures Trading Integration Guide

## Kana Labs Perps Bounty Implementation for Aptex-Wallet

This document outlines all possibilities for implementing perpetual futures (perps) trading in the Aptex-Wallet dashboard.

---

## **1. Dedicated "Perp Trading" Section** ⭐ (Recommended)

### Layout Options:
- **Sidebar Item**: Add "Perp Trading" between existing sections
- **Badge/Indicator**: Show "NEW" or live market indicators
- **Icon**: Use a chart/trading icon to make it visually distinct

### Sub-navigation Structure:
```
📊 Perp Trading
   ├─ Markets (Browse available perps)
   ├─ Trade (Open/close positions)
   ├─ Positions (Active positions)
   ├─ History (Past trades)
   └─ Analytics (Performance metrics)
```

---

## **2. Integrated Quick Trade Panel**

### Possibilities:
- **Floating Widget**: Mini trading panel accessible from any page
- **Modal/Dialog**: Quick trade popup triggered from sidebar icon
- **Expandable Sidebar Section**: Collapsible panel with basic trading controls
- **Bottom Sheet**: Mobile-friendly sliding panel (using your `vaul` dependency)

---

## **3. Dashboard Enhancement Approaches**

### A. **Minimal Integration** (Start Small)
- Add single "Trade Perps" button in sidebar
- Link to dedicated full-page trading interface
- Show notification badge for open positions

### B. **Moderate Integration** (Balanced)
- Sidebar section with:
  - Quick market overview (top 3-5 markets)
  - "View All Markets" button
  - Active positions count/indicator
  - Quick access to trading page

### C. **Full Integration** (Feature-Rich)
- Complete trading interface accessible from sidebar
- Real-time price tickers in sidebar
- Position manager
- Portfolio summary with P&L
- Risk indicators

---

## **4. Visual Design Patterns**

### Navigation Styles:
1. **Accordion Menu**: Expandable "Trading" section
2. **Tab System**: Switch between Spot/Perps
3. **Dropdown Menu**: Hover reveals trading options
4. **Split Panel**: Sidebar + trading view side-by-side
5. **Overlay Mode**: Trading interface overlays main content

### Visual Indicators:
- 🟢 Green/Red indicators for market trends
- 📈 Mini sparkline charts for quick glance
- 💰 Live P&L display in sidebar
- ⚠️ Warning badges for at-risk positions
- 🔔 Notification dots for important events

---

## **5. User Experience Flows**

### Entry Points:
1. **Direct Navigation**: Click sidebar → Trade page
2. **Asset-Based**: Click any token → "Trade Perps" option
3. **Dashboard Widget**: Trading card on main dashboard
4. **Search Bar**: Quick search for markets
5. **Context Menu**: Right-click asset for trading options

### Trading Workflows:
1. **Simple Flow**: Market → Trade → Confirm
2. **Advanced Flow**: Market → Analysis → Strategy → Trade
3. **Quick Trade**: Pre-filled order from sidebar
4. **Copy Trading**: Follow successful traders

---

## **6. Information Display Options**

### Sidebar Content Possibilities:
- **Market Ticker**: Scrolling price feed
- **Watchlist**: User-selected markets
- **Hot Markets**: Trending/volatile pairs
- **Your Positions**: Quick summary
- **Alerts**: Price alerts, liquidation warnings
- **News Feed**: Market-moving events

### Data Visualization:
- Mini price charts (using your `recharts` dependency)
- Gauge meters for risk levels
- Progress bars for position performance
- Heat maps for market overview

---

## **7. Advanced Features Integration**

### Possible Enhancements:

#### 1. **Portfolio View**:
- Combined spot + perps holdings
- Total portfolio value
- Asset allocation pie chart
- Performance over time

#### 2. **Risk Management Dashboard**:
- Liquidation price calculator
- Position size recommendations
- Portfolio risk score
- Margin utilization meter

#### 3. **Trading Tools**:
- Stop-loss/Take-profit manager
- Position calculator
- Fee estimator
- Market depth viewer

#### 4. **Social Features**:
- Copy trading leaderboard
- Share positions
- Community sentiment

---

## **8. Mobile-Responsive Patterns**

### Mobile-Specific Options:
- **Bottom Navigation**: Perps tab in bottom nav
- **Swipe Gestures**: Swipe to access trading
- **Floating Action Button**: Quick trade FAB
- **Full-Screen Modal**: Immersive trading view
- **Drawer Navigation**: Pull-out trading panel

---

## **9. Progressive Disclosure Strategy**

### Phased Implementation:

**Phase 1**: Basic market viewing
- Display available perp markets
- Show current prices and 24h changes
- Market information cards

**Phase 2**: Simple buy/sell functionality
- Long/Short order placement
- Market orders only
- Basic position management

**Phase 3**: Advanced orders (limit, stop)
- Limit orders
- Stop-loss/Take-profit
- Conditional orders

**Phase 4**: Portfolio management
- Combined portfolio view
- P&L tracking
- Performance analytics

**Phase 5**: Analytics & strategies
- Advanced charting
- Technical indicators
- Trading strategies

---

## **10. Integration with Existing Features**

### Leverage Current Components:
- Use existing `@radix-ui` components for consistency
- Integrate with current wallet connection
- Reuse transaction signing flow
- Extend existing portfolio display
- Add to current notification system (`sonner`)

### Existing Dependencies to Utilize:
- `recharts` - For price charts and analytics
- `@radix-ui/*` - UI components (dialog, dropdown, tabs, etc.)
- `react-hook-form` + `zod` - Form validation
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `@tanstack/react-query` - API data fetching

---

## **Bounty Categories Alignment**

### Best Fit Options for Aptex-Wallet:

#### ✅ **User Portfolio Dashboard** (PRIMARY)
- Natural extension of wallet functionality
- Shows combined spot + perps holdings
- Portfolio analytics and P&L tracking
- Asset allocation visualization

#### ✅ **Touch Market Using Perps** (SECONDARY)
- Simple trading interface
- Direct buy/sell from wallet
- Market overview
- Quick position management

#### ✅ **Crypto Asset Portfolio Management Platform** (STRETCH)
- Full-featured portfolio management
- Advanced analytics
- Risk management tools
- Multi-asset tracking

---

## **Recommended Implementation (Hybrid Approach)**

### 1. **Sidebar Integration**
Add expandable "💱 Trading" section with:
- Quick market overview (top 5 markets)
- Active positions indicator with count badge
- P&L summary
- "Trade Now" primary action button

### 2. **Main Trading View**
Full trading interface accessible from sidebar with tabs:
- **Markets Tab**: Browse all available perp markets
- **Trade Tab**: Place orders with leverage control
- **Positions Tab**: Manage open positions
- **Portfolio Tab**: Combined spot + perps portfolio view
- **History Tab**: Trading history and performance

### 3. **Quick Actions**
- Floating trade button on main pages
- Quick position manager overlay
- One-click market access from any token
- Price alerts and notifications

### 4. **Visual Design**
- Consistent with existing wallet UI
- Dark mode optimized for trading
- Real-time price updates
- Clear P&L indicators (green/red)
- Risk level warnings

---

## **Technical Implementation Checklist**

### Frontend Components Needed:
- [ ] `PerpsMarketList` - Display available markets
- [ ] `PerpsTradingPanel` - Order placement interface
- [ ] `PerpsPositionManager` - Active positions view
- [ ] `PerpsPortfolioView` - Combined portfolio
- [ ] `PerpsChart` - Price charts
- [ ] `PerpsRiskCalculator` - Risk management tools
- [ ] `PerpsOrderHistory` - Transaction history

### Integration Points:
- [ ] Connect to Kana Labs Perps API
- [ ] Integrate with Aptos wallet
- [ ] Transaction signing flow
- [ ] Real-time price feeds (WebSocket)
- [ ] Position monitoring
- [ ] Liquidation alerts
- [ ] P&L calculations

### Backend/API Requirements:
- [ ] Kana Labs SDK integration
- [ ] Market data endpoints
- [ ] Position management API
- [ ] Historical data for charts
- [ ] Price alerts system
- [ ] Transaction history

---

## **Key Features to Implement**

### Core Features:
1. ✅ Market browsing and selection
2. ✅ Long/Short position opening
3. ✅ Leverage adjustment (1x to 125x)
4. ✅ Position closing
5. ✅ Real-time price updates
6. ✅ P&L tracking
7. ✅ Portfolio overview

### Advanced Features:
1. ⚡ Stop-loss/Take-profit orders
2. ⚡ Limit orders
3. ⚡ Position calculator
4. ⚡ Liquidation price display
5. ⚡ Risk management tools
6. ⚡ Trading analytics
7. ⚡ Price alerts
8. ⚡ Copy trading (optional)

---

## **User Flow Example**

### Opening a Perp Position:
1. User clicks "Trading" in sidebar
2. Browses available markets (APT-PERP, BTC-PERP, etc.)
3. Selects market and views price info
4. Chooses Long/Short
5. Sets position size and leverage
6. Reviews order details
7. Confirms and signs transaction
8. Position appears in "Active Positions"
9. Real-time P&L updates displayed

### Managing Portfolio:
1. User navigates to "Portfolio" tab
2. Sees combined view of:
   - Spot wallet balance
   - Open perp positions
   - Total portfolio value
   - Overall P&L
3. Can drill down into individual positions
4. Access risk metrics and analytics

---

## **Resources and Next Steps**

### Research:
1. Kana Labs Documentation: https://kanalabs.io/
2. Kana Labs Perps API documentation
3. Aptos Move contracts for perps
4. Similar projects for reference

### Development Steps:
1. Set up Kana Labs SDK/API integration
2. Create basic market viewing component
3. Implement wallet connection for trading
4. Build order placement interface
5. Add position management
6. Implement portfolio view
7. Add real-time updates
8. Testing on Aptos testnet
9. UI/UX refinement
10. Deploy to production

---

## **Success Metrics**

### For Bounty Submission:
- ✅ Working perps trading interface
- ✅ Portfolio management dashboard
- ✅ Real-time price updates
- ✅ Position management (open/close)
- ✅ P&L tracking
- ✅ Clean, intuitive UI
- ✅ Mobile responsive design
- ✅ Proper error handling
- ✅ Documentation and demo video

---

## **Conclusion**

The recommended approach for Aptex-Wallet is to implement a **Hybrid Integration** that:
- Adds a dedicated "Trading" section in the sidebar
- Provides quick access to markets and positions
- Offers a full-featured trading interface
- Enhances the portfolio view with perps data
- Maintains consistency with existing wallet UI

This approach balances **easy access**, **comprehensive functionality**, and **clean UX** while aligning perfectly with the bounty requirements for "User Portfolio Dashboard" and "Touch Market Using Perps".

**Estimated Implementation Time**: 2-3 weeks for core features, 1-2 additional weeks for advanced features and polish.

**Prize Potential**: $1,500 - $2,500 based on implementation quality and feature completeness.
