import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PerpMarket, getPerpsMarkets } from '@/services/kana/perpsService';
import { useToast } from '@/hooks/use-toast';

interface PerpsMarketsListProps {
  onSelectMarket: (market: PerpMarket) => void;
}

export const PerpsMarketsList: React.FC<PerpsMarketsListProps> = ({ onSelectMarket }) => {
  const [markets, setMarkets] = useState<PerpMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const data = await getPerpsMarkets();
      setMarkets(data);
    } catch (error) {
      console.error('Failed to load markets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load perp markets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(decimals)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(decimals)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Perp Markets</h2>
        <Button variant="outline" size="sm" onClick={loadMarkets}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {markets.map((market, index) => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="p-6 cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
              onClick={() => onSelectMarket(market)}
            >
              <div className="flex items-center justify-between">
                {/* Market Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{market.symbol}</h3>
                    <p className="text-sm text-muted-foreground">
                      {market.base_asset}/{market.quote_asset}
                    </p>
                  </div>
                </div>

                {/* Price Info */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    ${market.price.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {market.price_change_24h >= 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-500">
                          +{market.price_change_24h.toFixed(2)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-500">
                          {market.price_change_24h.toFixed(2)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatNumber(market.volume_24h)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Open Interest</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatNumber(market.open_interest)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Funding Rate</p>
                  <p className={`text-sm font-semibold ${market.funding_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(market.funding_rate * 100).toFixed(4)}%
                  </p>
                </div>
              </div>

              {/* Max Leverage Badge */}
              <div className="mt-4">
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Max {market.max_leverage}x Leverage
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
