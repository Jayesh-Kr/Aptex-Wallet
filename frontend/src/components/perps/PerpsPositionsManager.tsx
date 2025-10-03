import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, X, AlertTriangle, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PerpPosition, getUserPositions, closePosition, calculatePnL } from '@/services/kana/perpsService';
import { useToast } from '@/hooks/use-toast';

interface PerpsPositionsManagerProps {
  walletAddress: string;
  refreshTrigger: number;
}

export const PerpsPositionsManager: React.FC<PerpsPositionsManagerProps> = ({
  walletAddress,
  refreshTrigger,
}) => {
  const [positions, setPositions] = useState<PerpPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [positionToClose, setPositionToClose] = useState<PerpPosition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPositions();
  }, [walletAddress, refreshTrigger]);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getUserPositions(walletAddress);
      setPositions(data.filter(p => p.status === 'open'));
    } catch (error) {
      console.error('Failed to load positions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load positions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (position: PerpPosition) => {
    setPositionToClose(position);
  };

  const confirmClosePosition = async () => {
    if (!positionToClose) return;

    try {
      setClosingPositionId(positionToClose.id);
      await closePosition(positionToClose.id);
      
      toast({
        title: 'Position Closed',
        description: `Closed ${positionToClose.side} position on ${positionToClose.market_symbol}`,
      });

      await loadPositions();
      setPositionToClose(null);
    } catch (error) {
      console.error('Failed to close position:', error);
      toast({
        title: 'Error',
        description: 'Failed to close position',
        variant: 'destructive',
      });
    } finally {
      setClosingPositionId(null);
    }
  };

  const calculatePnLPercentage = (position: PerpPosition): number => {
    return (position.unrealized_pnl / position.margin) * 100;
  };

  const getTotalPnL = (): number => {
    return positions.reduce((sum, pos) => sum + pos.unrealized_pnl, 0);
  };

  const getTotalMargin = (): number => {
    return positions.reduce((sum, pos) => sum + pos.margin, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <DollarSign className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Open Positions</h3>
        <p className="text-muted-foreground">
          Start trading to open your first position
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Summary Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Open Positions</p>
              <p className="text-2xl font-bold text-foreground">{positions.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Margin</p>
              <p className="text-2xl font-bold text-foreground">
                ${getTotalMargin().toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total PnL</p>
              <p className={`text-2xl font-bold ${getTotalPnL() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getTotalPnL() >= 0 ? '+' : ''}${getTotalPnL().toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        {/* Positions List */}
        <div className="space-y-3">
          {positions.map((position, index) => (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:border-primary/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Badge
                      className={`${
                        position.side === 'long'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      {position.side === 'long' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {position.side.toUpperCase()}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground">
                      {position.market_symbol}
                    </h3>
                    <Badge variant="outline">{position.leverage}x</Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClosePosition(position)}
                    disabled={closingPositionId === position.id}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    {closingPositionId === position.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Close
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Size</p>
                    <p className="text-sm font-semibold text-foreground">
                      {position.size.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Entry Price</p>
                    <p className="text-sm font-semibold text-foreground">
                      ${position.entry_price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mark Price</p>
                    <p className="text-sm font-semibold text-foreground">
                      ${position.mark_price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Unrealized PnL</p>
                    <p className={`text-sm font-semibold ${position.unrealized_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {position.unrealized_pnl >= 0 ? '+' : ''}${position.unrealized_pnl.toFixed(2)}
                      <span className="ml-1 text-xs">
                        ({calculatePnLPercentage(position).toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Liq. Price
                    </p>
                    <p className="text-sm font-semibold text-yellow-500">
                      ${position.liquidation_price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
                  <span>Margin: ${position.margin.toFixed(2)}</span>
                  <span>Opened: {new Date(position.opened_at).toLocaleDateString()}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Close Position Confirmation Dialog */}
      <AlertDialog open={!!positionToClose} onOpenChange={() => setPositionToClose(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this {positionToClose?.side} position on{' '}
              {positionToClose?.market_symbol}?
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Current PnL:</span>
                  <span className={positionToClose && positionToClose.unrealized_pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {positionToClose && positionToClose.unrealized_pnl >= 0 ? '+' : ''}$
                    {positionToClose?.unrealized_pnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Position Value:</span>
                  <span>
                    ${positionToClose && (positionToClose.size * positionToClose.mark_price).toFixed(2)}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClosePosition}
              className="bg-red-500 hover:bg-red-600"
            >
              Close Position
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
