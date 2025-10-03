import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PerpMarket, OrderRequest, placeOrder, calculateLiquidationPrice } from '@/services/kana/perpsService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PerpsTradingPanelProps {
  market: PerpMarket;
  walletAddress: string;
  onTradeComplete: () => void;
  onBack: () => void;
}

export const PerpsTradingPanel: React.FC<PerpsTradingPanelProps> = ({
  market,
  walletAddress,
  onTradeComplete,
  onBack,
}) => {
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [size, setSize] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(10);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const calculateMargin = (): number => {
    const sizeNum = parseFloat(size) || 0;
    const price = orderType === 'limit' ? parseFloat(limitPrice) : market.price;
    return (sizeNum * price) / leverage;
  };

  const calculateLiqPrice = (): number => {
    const entryPrice = orderType === 'limit' ? parseFloat(limitPrice) : market.price;
    return calculateLiquidationPrice(side, entryPrice, leverage);
  };

  const handlePlaceOrder = async () => {
    if (!size || parseFloat(size) <= 0) {
      toast({
        title: 'Invalid Size',
        description: 'Please enter a valid position size',
        variant: 'destructive',
      });
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid limit price',
        variant: 'destructive',
      });
      return;
    }

    const order: OrderRequest = {
      market_id: market.id,
      side,
      size: parseFloat(size),
      leverage,
      order_type: orderType,
      limit_price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
      stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
      take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
    };

    try {
      setLoading(true);
      const result = await placeOrder(walletAddress, order);
      
      toast({
        title: 'Order Placed Successfully',
        description: `${side.toUpperCase()} ${size} ${market.symbol} at ${leverage}x leverage`,
      });

      // Reset form
      setSize('');
      setLimitPrice('');
      setStopLoss('');
      setTakeProfit('');
      
      onTradeComplete();
    } catch (error) {
      console.error('Failed to place order:', error);
      toast({
        title: 'Order Failed',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const margin = calculateMargin();
  const liqPrice = size ? calculateLiqPrice() : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back to Markets
        </Button>
        <Badge variant="outline" className="text-sm">
          Max {market.max_leverage}x
        </Badge>
      </div>

      {/* Market Info Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{market.symbol}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {market.base_asset} Perpetual
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              ${market.price.toLocaleString()}
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
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
      </Card>

      {/* Trading Form */}
      <Card className="p-6">
        {/* Long/Short Tabs */}
        <Tabs value={side} onValueChange={(value) => setSide(value as 'long' | 'short')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="long" className="data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500">
              <TrendingUp className="h-4 w-4 mr-2" />
              Long
            </TabsTrigger>
            <TabsTrigger value="short" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500">
              <TrendingDown className="h-4 w-4 mr-2" />
              Short
            </TabsTrigger>
          </TabsList>

          <TabsContent value={side} className="space-y-6">
            {/* Order Type */}
            <div>
              <Label>Order Type</Label>
              <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="limit">Limit</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Limit Price (if limit order) */}
            {orderType === 'limit' && (
              <div>
                <Label htmlFor="limitPrice">Limit Price (USDC)</Label>
                <Input
                  id="limitPrice"
                  type="number"
                  placeholder="0.00"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            {/* Position Size */}
            <div>
              <Label htmlFor="size">Size ({market.base_asset})</Label>
              <Input
                id="size"
                type="number"
                placeholder="0.00"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Leverage Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Leverage</Label>
                <Badge variant="secondary" className="text-lg font-bold">
                  {leverage}x
                </Badge>
              </div>
              <Slider
                value={[leverage]}
                onValueChange={(value) => setLeverage(value[0])}
                min={1}
                max={market.max_leverage}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1x</span>
                <span>{market.max_leverage}x</span>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <Label htmlFor="stopLoss">Stop Loss (Optional)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  placeholder="0.00"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="takeProfit">Take Profit (Optional)</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  placeholder="0.00"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Order Summary */}
            {size && (
              <Card className="p-4 bg-muted/30">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Margin Required</span>
                    <span className="font-semibold">${margin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Liquidation Price</span>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-yellow-500">
                        ${liqPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position Value</span>
                    <span className="font-semibold">
                      ${((parseFloat(size) || 0) * market.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={loading || !size || (orderType === 'limit' && !limitPrice)}
              className={`w-full h-14 text-lg font-bold ${
                side === 'long'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Placing Order...
                </div>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  {side === 'long' ? 'Open Long' : 'Open Short'} Position
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
