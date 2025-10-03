import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  generateAptosWallet,
  getWalletBalance,
  checkAccountExists,
  fundAccountWithTestnetAPT,
  isValidAptosAddress,
  isValidMnemonic
} from '../utils/aptosWalletUtils';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Wallet, Copy, ExternalLink, Shield, CheckCircle } from 'lucide-react';

interface WalletData {
  address: string;
  mnemonic: string;
  privateKey: string;
  publicKey: string;
}

const AptosTestComponent: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [customBalance, setCustomBalance] = useState<string>('0');
  const [accountExists, setAccountExists] = useState(false);
  const [testMnemonic, setTestMnemonic] = useState('');
  const [mnemonicValid, setMnemonicValid] = useState(false);

  const handleGenerateWallet = async () => {
    setIsLoading(true);
    try {
      const newWallet = await generateAptosWallet();
      setWallet(newWallet);
      
      // Automatically fund with testnet APT
      const funded = await fundAccountWithTestnetAPT(newWallet.address);
      if (funded) {
        toast({
          title: "Success",
          description: "Wallet created and funded with testnet APT!"
        });
        
        // Wait a moment for funding to process, then check balance
        setTimeout(async () => {
          const newBalance = await getWalletBalance(newWallet.address);
          setBalance(newBalance);
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate wallet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    if (!wallet) return;
    
    setIsLoading(true);
    try {
      const newBalance = await getWalletBalance(wallet.address);
      setBalance(newBalance);
      toast({
        title: "Success",
        description: "Balance refreshed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh balance",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckCustomAddress = async () => {
    if (!customAddress || !isValidAptosAddress(customAddress)) {
      toast({
        title: "Error",
        description: "Please enter a valid Aptos address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const [balance, exists] = await Promise.all([
        getWalletBalance(customAddress),
        checkAccountExists(customAddress)
      ]);
      
      setCustomBalance(balance);
      setAccountExists(exists);
      
      toast({
        title: "Success",
        description: `Account ${exists ? 'exists' : 'does not exist'} on testnet`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check address",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`
    });
  };

  return (
    <div className="min-h-screen bg-black px-4 pt-16 pb-4 space-y-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <Card className="bg-secondary/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Aptos Devnet Integration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              This component tests real Aptos SDK integration with devnet. Click "Generate Wallet" to create 
              a new wallet and automatically fund it with devnet APT.
            </div>
            
            <Button 
              onClick={handleGenerateWallet} 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/80 text-primary-foreground"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Generating...' : 'Generate Wallet'}
            </Button>
          </CardContent>
        </Card>

        {wallet && (
          <Card className="bg-secondary/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Generated Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Address</Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary/30 border border-border/20 rounded p-2 flex-1">
                      <code className="text-sm font-mono text-foreground break-all">
                        {wallet.address}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(wallet.address, 'Address')}
                      className="hover:bg-secondary/30"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://explorer.aptoslabs.com/account/${wallet.address}?network=devnet`, '_blank')}
                      className="hover:bg-secondary/30"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Balance</Label>
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary/30 border border-border/20 rounded p-2 flex-1">
                      <span className="text-lg font-bold text-foreground">
                        {balance} APT
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshBalance}
                      disabled={isLoading}
                      className="border-border/50 hover:bg-secondary/30"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Mnemonic Phrase</Label>
                <div className="bg-secondary/30 border border-border/20 rounded p-3">
                  <code className="text-sm font-mono text-foreground">
                    {wallet.mnemonic}
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Private Key</Label>
                <div className="flex items-center gap-2">
                  <div className="bg-secondary/30 border border-border/20 rounded p-2 flex-1">
                    <code className="text-sm font-mono text-foreground break-all">
                      {wallet.privateKey}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                    className="hover:bg-secondary/30"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-secondary/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Check Any Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Aptos address (0x...)"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground"
              />
              <Button
                onClick={handleCheckCustomAddress}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/80 text-primary-foreground"
              >
                Check
              </Button>
            </div>
            
            {customAddress && isValidAptosAddress(customAddress) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/30 border border-border/20 rounded p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</div>
                  <div className="text-lg font-bold text-foreground mt-1">{customBalance} APT</div>
                </div>
                <div className="bg-secondary/30 border border-border/20 rounded p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</div>
                  <div className="text-sm font-medium mt-1">
                    {accountExists ? (
                      <Badge className="bg-green-600 text-white">Active on Devnet</Badge>
                    ) : (
                      <Badge variant="secondary">Not Found</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mnemonic Testing Card */}
        <Card className="bg-secondary/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              BIP39 Mnemonic Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Test Mnemonic Phrase</Label>
              <textarea
                value={testMnemonic}
                onChange={(e) => {
                  setTestMnemonic(e.target.value);
                  const isValid = isValidMnemonic(e.target.value.trim());
                  setMnemonicValid(isValid);
                }}
                placeholder="Enter a mnemonic phrase to validate (12 or 24 words)..."
                className="w-full bg-secondary/30 border border-border/20 rounded p-3 text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none focus:border-primary/50 focus:outline-none"
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${mnemonicValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${mnemonicValid ? 'text-green-600' : 'text-red-500'}`}>
                {testMnemonic.trim() 
                  ? (mnemonicValid ? 'Valid BIP39 Mnemonic' : 'Invalid BIP39 Mnemonic') 
                  : 'No mnemonic entered'
                }
              </span>
              {testMnemonic.trim() && (
                <Badge variant="outline" className="text-xs">
                  {testMnemonic.trim().split(' ').length} words
                </Badge>
              )}
            </div>
            
            <Button
              onClick={() => {
                const words = testMnemonic.trim().split(' ');
                toast({
                  title: "Mnemonic Analysis",
                  description: `Word count: ${words.length}, Valid BIP39: ${mnemonicValid ? 'Yes' : 'No'}`,
                  duration: 3000,
                });
              }}
              disabled={!testMnemonic.trim()}
              variant="outline"
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Analyze Mnemonic
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-muted-foreground text-sm">
          <p>🔗 Connected to Aptos Devnet</p>
          <p>All wallets are automatically funded with 1 APT for testing</p>
          <p>✅ Using proper BIP39 mnemonic generation</p>
        </div>
      </div>
    </div>
  );
};

export default AptosTestComponent;