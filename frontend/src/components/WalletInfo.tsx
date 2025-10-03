import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, RefreshCw, Wallet, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getWalletBalance, checkAccountExists } from '@/utils/aptosWalletUtils';
import { toast } from '@/hooks/use-toast';

interface WalletInfoProps {
  address: string;
  balance?: string;
  network: string;
  isConnected: boolean;
  onRefresh: () => void;
  onDisconnect?: () => void;
}

const WalletInfo: React.FC<WalletInfoProps> = ({
  address,
  balance: initialBalance,
  network,
  isConnected,
  onRefresh,
  onDisconnect
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(initialBalance || '0');
  const [isLoading, setIsLoading] = useState(false);
  const [accountExists, setAccountExists] = useState(false);

  // Fetch real balance from Aptos testnet
  const fetchBalance = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const [balanceResult, exists] = await Promise.all([
        getWalletBalance(address),
        checkAccountExists(address)
      ]);
      
      setBalance(balanceResult);
      setAccountExists(exists);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balance on component mount and when address changes
  useEffect(() => {
    if (address && isConnected) {
      fetchBalance();
    }
  }, [address, isConnected]);

  const handleRefresh = () => {
    fetchBalance();
    onRefresh();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard"
    });
  };

  const formatBalance = (bal: string) => {
    const numBalance = parseFloat(bal);
    return `${numBalance.toFixed(8)} APT`;
  };

  const formatFiatValue = (bal: string) => {
    const numBalance = parseFloat(bal);
    // Using approximate APT to INR rate
    return `≈ ₹${(numBalance * 373).toFixed(2)}`;
  };

  return (
    <Card className="w-full bg-secondary/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="h-5 w-5" />
            Wallet Information
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"} className="bg-primary text-primary-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant="outline" className="border-border/50">{network}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Section */}
        <div className="bg-secondary/30 border border-border/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="h-8 w-8 p-0 hover:bg-secondary/30"
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <div className="animate-pulse bg-secondary/50 h-8 w-32 rounded"></div>
              ) : showBalance ? (
                formatBalance(balance)
              ) : (
                '••••••••'
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <div className="animate-pulse bg-secondary/50 h-4 w-20 rounded"></div>
              ) : showBalance ? (
                formatFiatValue(balance)
              ) : (
                '••••••'
              )}
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Wallet Address</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(address)}
                className="h-8 w-8 p-0 hover:bg-secondary/30"
                title="Copy Address"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-secondary/30"
                title="View on Explorer"
                onClick={() => window.open(`https://explorer.aptoslabs.com/account/${address}?network=testnet`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border/20 rounded-lg p-3">
            <code className="text-sm font-mono text-foreground break-all">{address}</code>
          </div>
        </div>

        {/* Network Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/30 border border-border/20 rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Network</div>
            <div className="text-sm font-medium text-foreground mt-1 capitalize">{network}</div>
          </div>
          <div className="bg-secondary/30 border border-border/20 rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</div>
            <div className="text-sm font-medium text-foreground mt-1">
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        {/* Account Status */}
        {address && (
          <div className="bg-secondary/30 border border-border/20 rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Status</div>
            <div className="text-sm font-medium text-foreground mt-1">
              {accountExists ? (
                <span className="text-green-400">Active on Testnet</span>
              ) : (
                <span className="text-yellow-400">Not found on Testnet</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className={`${onDisconnect ? 'flex-1' : 'w-full'} h-10 border-border/50 hover:bg-secondary/30`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Balance'}
          </Button>
          {onDisconnect && (
            <Button
              variant="destructive"
              onClick={onDisconnect}
              className="flex-1 h-10 bg-red-600 hover:bg-red-700"
            >
              Disconnect Wallet
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletInfo;