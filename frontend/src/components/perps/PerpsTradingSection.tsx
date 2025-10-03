import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerpMarket } from '@/services/kana/perpsService';
import { PerpsMarketsList } from './PerpsMarketsList';
import { PerpsTradingPanel } from './PerpsTradingPanel';
import { PerpsPositionsManager } from './PerpsPositionsManager';

interface PerpsTradingSectionProps {
  walletAddress: string;
}

export const PerpsTradingSection: React.FC<PerpsTradingSectionProps> = ({ walletAddress }) => {
  const [selectedMarket, setSelectedMarket] = useState<PerpMarket | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectMarket = (market: PerpMarket) => {
    setSelectedMarket(market);
  };

  const handleTradeComplete = () => {
    setRefreshTrigger(prev => prev + 1);
    setSelectedMarket(null);
  };

  const handleBackToMarkets = () => {
    setSelectedMarket(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Perpetual Futures Trading</h1>
          <p className="text-muted-foreground">
            Trade crypto perps with up to 125x leverage powered by Kana Labs
          </p>
        </div>
      </div>

      {/* Main Content */}
      {selectedMarket ? (
        <PerpsTradingPanel
          market={selectedMarket}
          walletAddress={walletAddress}
          onTradeComplete={handleTradeComplete}
          onBack={handleBackToMarkets}
        />
      ) : (
        <Tabs defaultValue="markets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="markets">
              <Activity className="h-4 w-4 mr-2" />
              Markets
            </TabsTrigger>
            <TabsTrigger value="positions">
              <History className="h-4 w-4 mr-2" />
              Positions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="mt-6">
            <PerpsMarketsList onSelectMarket={handleSelectMarket} />
          </TabsContent>

          <TabsContent value="positions" className="mt-6">
            <PerpsPositionsManager
              walletAddress={walletAddress}
              refreshTrigger={refreshTrigger}
            />
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
};
