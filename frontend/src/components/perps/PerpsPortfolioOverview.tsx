import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserPositions } from '@/services/kana/perpsService';
import { getAccountBalance, octasToApt } from '@/services/nodit/accountService';

interface PerpsPortfolioOverviewProps {
  walletAddress: string;
}

export const PerpsPortfolioOverview: React.FC<PerpsPortfolioOverviewProps> = ({ walletAddress }) => {
  const [spotBalance, setSpotBalance] = useState<number>(0);
  const [totalMargin, setTotalMargin] = useState<number>(0);
  const [totalPnL, setTotalPnL] = useState<number>(0);
  const [openPositions, setOpenPositions] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolioData();
  }, [walletAddress]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);

      // Load spot balance from Nodit
      const balance = await getAccountBalance(walletAddress);
      if (balance) {
        setSpotBalance(octasToApt(balance.coin.value));
      }

      // Load perps positions from Kana
      const positions = await getUserPositions(walletAddress);
      const openPos = positions.filter(p => p.status === 'open');
      
      setOpenPositions(openPos.length);
      setTotalMargin(openPos.reduce((sum, pos) => sum + pos.margin, 0));
      setTotalPnL(openPos.reduce((sum, pos) => sum + pos.unrealized_pnl, 0));
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPortfolioValue = spotBalance + totalMargin + totalPnL;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Portfolio Value */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
            <h2 className="text-4xl font-bold text-foreground">
              ${totalPortfolioValue.toFixed(2)}
            </h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Card>

      {/* Portfolio Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spot Balance</p>
              <p className="text-lg font-bold text-foreground">
                ${spotBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Perps Margin</p>
              <p className="text-lg font-bold text-foreground">
                ${totalMargin.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              totalPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              {totalPnL >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unrealized PnL</p>
              <p className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open Positions</p>
              <p className="text-lg font-bold text-foreground">
                {openPositions}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Allocation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio Allocation</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Spot Wallet</span>
              <span className="font-semibold text-foreground">
                {totalPortfolioValue > 0 ? ((spotBalance / totalPortfolioValue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: totalPortfolioValue > 0 ? `${(spotBalance / totalPortfolioValue) * 100}%` : '0%' }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Perps Margin</span>
              <span className="font-semibold text-foreground">
                {totalPortfolioValue > 0 ? ((totalMargin / totalPortfolioValue) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-500"
                style={{ width: totalPortfolioValue > 0 ? `${(totalMargin / totalPortfolioValue) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
