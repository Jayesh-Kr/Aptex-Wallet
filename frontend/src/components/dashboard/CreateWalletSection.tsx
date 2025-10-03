import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Plus } from 'lucide-react';

interface CreateWalletSectionProps {
  onCreateWallet: () => void;
  isLoading: boolean;
}

export const CreateWalletSection: React.FC<CreateWalletSectionProps> = ({
  onCreateWallet,
  isLoading
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <Card className="w-full max-w-md cosmic-glow bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-foreground">
            <Wallet className="h-6 w-6 text-primary" />
            Welcome to CrypPal
          </CardTitle>
          <CardDescription>
            Create your first wallet to get started with Aptos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            You'll get a secure wallet with seed phrase backup and 1 APT on testnet for testing.
          </p>
          <Button
            onClick={onCreateWallet}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};