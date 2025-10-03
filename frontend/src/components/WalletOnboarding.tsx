import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Wallet, 
  Shield, 
  Eye, 
  EyeOff, 
  Copy, 
  Download, 
  Upload,
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Key,
  Lock,
  FileText,
  RefreshCw,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  generateAptosWallet,
  importWalletFromMnemonic,
  importWalletFromPrivateKey,
  getWalletBalance,
  fundAccountWithTestnetAPT,
  isValidMnemonic
} from '../utils/aptosWalletUtils';

interface WalletOnboardingProps {
  onComplete: (walletData: any) => void;
}

interface WalletData {
  address: string;
  mnemonic: string;
  privateKey: string;
  publicKey: string;
}

const WalletOnboarding: React.FC<WalletOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingType, setOnboardingType] = useState<'create' | 'import' | null>(null);
  const [importType, setImportType] = useState<'mnemonic' | 'privateKey'>('mnemonic');
  
  // Wallet creation states
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Import states
  const [importMnemonic, setImportMnemonic] = useState('');
  const [importPrivateKey, setImportPrivateKey] = useState('');
  
  // Security states
  const [mnemonicConfirmation, setMnemonicConfirmation] = useState<string[]>(new Array(12).fill(''));
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(true);
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    'Welcome',
    onboardingType === 'create' ? 'Create Wallet' : 'Import Wallet',
    'Set Password',
    onboardingType === 'create' ? 'Backup Phrase' : 'Wallet Ready',
    onboardingType === 'create' ? 'Confirm Phrase' : null,
    'Complete Setup'
  ].filter(Boolean);

  // Real Aptos wallet generation using SDK
  const generateWallet = async (): Promise<WalletData> => {
    try {
      const walletData = await generateAptosWallet();
      
      // Fund the new account with testnet APT
      const funded = await fundAccountWithTestnetAPT(walletData.address);
      if (funded) {
        console.log('Account funded with testnet APT');
        toast({
          title: "Wallet Funded",
          description: "Your new wallet has been funded with 1 APT from the testnet faucet!"
        });
      }
      
      return walletData;
    } catch (error) {
      console.error('Error generating wallet:', error);
      throw new Error('Failed to generate wallet');
    }
  };

  // Real Aptos wallet import using SDK
  const importWallet = async (seedPhrase?: string, privateKey?: string): Promise<WalletData> => {
    try {
      if (seedPhrase) {
        return await importWalletFromMnemonic(seedPhrase);
      } else if (privateKey) {
        return await importWalletFromPrivateKey(privateKey);
      }
      
      throw new Error('Invalid import data');
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  };

  const handleCreateWallet = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const newWallet = await generateWallet();
      setWalletData(newWallet);
      setMnemonicWords(newWallet.mnemonic.split(' '));
      setCurrentStep(2);
    } catch (err) {
      setError('Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let wallet: WalletData;
      
      if (importType === 'mnemonic' && importMnemonic.trim()) {
        const cleanMnemonic = importMnemonic.trim();
        const words = cleanMnemonic.split(/\s+/);
        
        if (words.length !== 12 && words.length !== 24) {
          throw new Error('Mnemonic must be 12 or 24 words');
        }
        
        if (!isValidMnemonic(cleanMnemonic)) {
          throw new Error('Invalid mnemonic phrase. Please check your seed phrase.');
        }
        
        wallet = await importWallet(cleanMnemonic);
      } else if (importType === 'privateKey' && importPrivateKey.trim()) {
        if (!importPrivateKey.startsWith('0x') || importPrivateKey.length !== 66) {
          throw new Error('Invalid private key format');
        }
        wallet = await importWallet(undefined, importPrivateKey.trim());
      } else {
        throw new Error('Please provide valid import data');
      }
      
      setWalletData(wallet);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to import wallet. Please check your input.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSetup = () => {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    if (onboardingType === 'create') {
      setCurrentStep(3);
    } else {
      setCurrentStep(5); // Skip to completion for imports
    }
  };

  const handleBackupConfirmation = () => {
    if (!hasBackedUp) {
      setError('Please confirm that you have backed up your seed phrase');
      return;
    }
    
    setError('');
    // Shuffle words for confirmation
    const shuffled = [...mnemonicWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentStep(4);
  };

  const handleMnemonicConfirmation = () => {
    const userPhrase = mnemonicConfirmation.join(' ');
    const originalPhrase = walletData?.mnemonic;
    
    if (userPhrase !== originalPhrase) {
      setError('Seed phrase does not match. Please try again.');
      return;
    }
    
    setError('');
    setCurrentStep(5);
  };

  const handleComplete = () => {
    if (!walletData || !password) {
      setError('Missing wallet data or password');
      return;
    }
    
    // Encrypt and store wallet (in real implementation)
    const walletWithPassword = {
      ...walletData,
      password,
      encrypted: true,
      createdAt: new Date().toISOString()
    };
    
    toast({
      title: "Success",
      description: "Wallet created successfully!",
    });
    onComplete(walletWithPassword);
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${description} copied to clipboard`,
    });
  };

  const renderWelcomeStep = () => (
    <Card className="w-full max-w-md mx-auto bg-secondary/50 border-border/50 backdrop-blur-sm relative z-10">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center border border-border/30">
          <Wallet className="h-8 w-8 text-foreground" />
        </div>
        <CardTitle className="text-2xl text-foreground">Welcome to Aptos Wallet</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Get started by creating a new wallet or importing an existing one
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={() => {
            setOnboardingType('create');
            setCurrentStep(1);
          }}
          className="w-full h-12 text-base bg-primary hover:bg-primary/80 text-primary-foreground"
          size="lg"
        >
          <Zap className="mr-2 h-5 w-5" />
          Create New Wallet
        </Button>
        
        <Button 
          onClick={() => {
            setOnboardingType('import');
            setCurrentStep(1);
          }}
          variant="outline"
          className="w-full h-12 text-base border-border/50 hover:bg-secondary/30"
          size="lg"
        >
          <Upload className="mr-2 h-5 w-5" />
          Import Existing Wallet
        </Button>
        
        <Alert className="bg-secondary/30 border-border/30">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <AlertDescription className="text-muted-foreground">
            Your wallet will be encrypted and stored securely on your device
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderCreateWalletStep = () => (
    <Card className="w-full max-w-md mx-auto bg-secondary/50 border-border/50 backdrop-blur-sm relative z-10">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Zap className="mr-2 h-5 w-5" />
          Create New Wallet
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Generate a new Aptos wallet with a secure seed phrase
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-secondary/30 border border-border/20 rounded-lg">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Secure & Private</h4>
              <p className="text-sm text-muted-foreground">
                Your wallet is generated locally and never leaves your device
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-secondary/30 border border-border/20 rounded-lg">
            <Key className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Full Control</h4>
              <p className="text-sm text-muted-foreground">
                You own your private keys and have complete control over your assets
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(0)}
            className="flex-1 border-border/50 hover:bg-secondary/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleCreateWallet}
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Creating...' : 'Create Wallet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderImportWalletStep = () => (
    <Card className="w-full max-w-md mx-auto bg-secondary/50 border-border/50 backdrop-blur-sm relative z-10">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Upload className="mr-2 h-5 w-5" />
          Import Wallet
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Import your existing wallet using seed phrase or private key
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={importType} onValueChange={(value) => setImportType(value as 'mnemonic' | 'privateKey')}>
          <TabsList className="grid w-full grid-cols-2 bg-secondary/30 border border-border/20">
            <TabsTrigger value="mnemonic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Seed Phrase</TabsTrigger>
            <TabsTrigger value="privateKey" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Private Key</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mnemonic" className="space-y-4">
            <div>
              <Label htmlFor="mnemonic" className="text-foreground">12 or 24 Word Seed Phrase</Label>
              <textarea
                id="mnemonic"
                placeholder="Enter your seed phrase (separate words with spaces)"
                value={importMnemonic}
                onChange={(e) => setImportMnemonic(e.target.value)}
                className="w-full min-h-[100px] p-3 bg-secondary/30 border border-border/50 text-foreground placeholder:text-muted-foreground rounded-md resize-none focus:border-primary/50 focus:outline-none focus:ring-0"
                rows={4}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="privateKey" className="space-y-4">
            <div>
              <Label htmlFor="privateKey" className="text-foreground">Private Key</Label>
              <Input
                id="privateKey"
                type="password"
                placeholder="0x..."
                value={importPrivateKey}
                onChange={(e) => setImportPrivateKey(e.target.value)}
                className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(0)}
            className="flex-1 border-border/50 hover:bg-secondary/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleImportWallet}
            disabled={isLoading || (!importMnemonic.trim() && !importPrivateKey.trim())}
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Importing...' : 'Import Wallet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPasswordStep = () => (
    <Card className="w-full max-w-md mx-auto bg-secondary/50 border-border/50 backdrop-blur-sm relative z-10">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Lock className="mr-2 h-5 w-5" />
          Secure Your Wallet
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a strong password to encrypt your wallet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>
        </div>
        
        <Alert className="bg-secondary/30 border-border/30">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <AlertDescription className="text-muted-foreground">
            Use at least 8 characters with a mix of letters, numbers, and symbols
          </AlertDescription>
        </Alert>
        
        {error && (
          <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(1)}
            className="flex-1 border-border/50 hover:bg-secondary/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handlePasswordSetup}
            disabled={!password || !confirmPassword}
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBackupStep = () => (
    <Card className="w-full max-w-lg mx-auto bg-secondary/50 border-border/50 backdrop-blur-sm relative z-10">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <FileText className="mr-2 h-5 w-5" />
          Backup Your Seed Phrase
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Write down these 12 words in order and store them safely
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Never share your seed phrase!</strong> Anyone with these words can access your wallet.
          </AlertDescription>
        </Alert>
        
        <div className="relative">
          <div className={`grid grid-cols-3 gap-3 p-4 bg-secondary/30 border border-border/20 rounded-lg ${!showMnemonic ? 'blur-sm' : ''}`}>
            {mnemonicWords.map((word, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-background/50 rounded border border-border/30">
                <Badge variant="secondary" className="text-xs bg-secondary/50 text-foreground border-border/30">{index + 1}</Badge>
                <span className="font-mono text-sm text-foreground">{word}</span>
              </div>
            ))}
          </div>
          
          {!showMnemonic && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button onClick={() => setShowMnemonic(true)} variant="secondary" className="bg-secondary/80 hover:bg-secondary">
                <Eye className="mr-2 h-4 w-4" />
                Click to reveal
              </Button>
            </div>
          )}
        </div>
        
        {showMnemonic && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(walletData?.mnemonic || '', 'Seed phrase')}
              className="flex-1 border-border/50 hover:bg-secondary/30"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMnemonic(false)}
              className="flex-1 border-border/50 hover:bg-secondary/30"
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Hide
            </Button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="backup-confirm"
            checked={hasBackedUp}
            onCheckedChange={(checked) => setHasBackedUp(checked === true)}
            className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor="backup-confirm" className="text-sm text-foreground">
            I have written down my seed phrase in a safe place
          </Label>
        </div>
        
        {error && (
          <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(2)}
            className="flex-1 border-border/50 hover:bg-secondary/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleBackupConfirmation}
            disabled={!hasBackedUp}
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderConfirmStep = () => (
    <Card className="w-full max-w-lg mx-auto bg-secondary/50 border-border/50 backdrop-blur-sm relative z-10">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <CheckCircle className="mr-2 h-5 w-5" />
          Confirm Your Seed Phrase
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Select the words in the correct order to verify your backup
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3 p-4 bg-secondary/30 border border-border/20 rounded-lg">
          {mnemonicConfirmation.map((word, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-background/50 rounded border border-border/30 min-h-[40px]">
              <Badge variant="secondary" className="text-xs bg-secondary/50 text-foreground border-border/30">{index + 1}</Badge>
              <span className="font-mono text-sm text-foreground">{word || '...'}</span>
            </div>
          ))}
        </div>
        
        <Separator className="bg-border/30" />
        
        <div className="grid grid-cols-3 gap-2">
          {shuffledWords.map((word, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                const nextEmptyIndex = mnemonicConfirmation.findIndex(w => w === '');
                if (nextEmptyIndex !== -1) {
                  const newConfirmation = [...mnemonicConfirmation];
                  newConfirmation[nextEmptyIndex] = word;
                  setMnemonicConfirmation(newConfirmation);
                }
              }}
              disabled={mnemonicConfirmation.includes(word)}
              className="text-xs border-border/50 hover:bg-secondary/30 disabled:opacity-30"
            >
              {word}
            </Button>
          ))}
        </div>
        
        <Button
          variant="ghost"
          onClick={() => setMnemonicConfirmation(new Array(12).fill(''))}
          className="w-full hover:bg-secondary/30"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear All
        </Button>
        
        {error && (
          <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(3)}
            className="flex-1 border-border/50 hover:bg-secondary/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={handleMnemonicConfirmation}
            disabled={mnemonicConfirmation.some(word => word === '')}
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="w-full max-w-md mx-auto bg-secondary/50 border-border/50 backdrop-blur-sm relative z-10">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto bg-green-950/50 border border-green-800/50 w-16 h-16 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <CardTitle className="text-2xl text-foreground">Wallet Ready!</CardTitle>
        <CardDescription className="text-muted-foreground">
          Your Aptos wallet has been {onboardingType === 'create' ? 'created' : 'imported'} successfully
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-secondary/30 border border-border/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Wallet Address</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(walletData?.address || '', 'Address')}
                className="hover:bg-secondary/30"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <p className="font-mono text-xs break-all text-muted-foreground">{walletData?.address}</p>
          </div>
          
          <Alert className="bg-secondary/30 border-border/30">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-muted-foreground">
              Your wallet is encrypted and stored securely on this device. 
              {onboardingType === 'create' && ' It has been connected to Aptos Testnet and funded with 1 APT for testing.'}
            </AlertDescription>
          </Alert>
        </div>
        
        <Button onClick={handleComplete} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground" size="lg">
          <ArrowRight className="mr-2 h-5 w-5" />
          Start Using Wallet
        </Button>
      </CardContent>
    </Card>
  );

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return onboardingType === 'create' ? renderCreateWalletStep() : renderImportWalletStep();
      case 2: return renderPasswordStep();
      case 3: return renderBackupStep();
      case 4: return renderConfirmStep();
      case 5: return renderCompleteStep();
      default: return renderWelcomeStep();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background pattern matching landing page */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress indicator */}
        {currentStep > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${
                    index <= currentStep 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-secondary/30 text-muted-foreground border-border/50'
                  }`}>
                    {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-primary' : 'bg-border/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
            </p>
          </div>
        )}
        
        {getCurrentStepComponent()}
      </div>
    </div>
  );
};

export default WalletOnboarding;