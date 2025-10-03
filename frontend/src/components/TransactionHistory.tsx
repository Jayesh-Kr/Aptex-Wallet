import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Search, Filter, ExternalLink, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle, RefreshCw, Users, FileImage, Wallet, Receipt, DollarSign } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { getEnhancedAccountTransactions, EnhancedTransaction } from '@/utils/contractUtils';
import { SplitBillModal } from './SplitBillModal';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { InvoiceData, downloadInvoice } from '@/utils/invoiceGenerator';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// Updated transaction interface to match enhanced blockchain transactions
interface PaymentTransaction {
  from: string;
  to: string;
  ethAmount: string; // Keep same field names for compatibility
  aptosAmount: string;
  inrAmount: number;
  timestamp: Date;
  txHash?: string;
  type: 'sent' | 'received' | 'other';
  status: 'confirmed' | 'failed';
  gasUsed?: string;
  function?: string;
  // Enhanced fields from blockchain
  transactionType?: 'coin_transfer' | 'payment_request' | 'split_bill' | 'emi_payment' | 'nft_mint' | 'other';
  description?: string;
  version?: string;
}

export const TransactionHistory: React.FC<{ refreshFlag?: number }> = ({ refreshFlag }) => {
  // Get current address from local storage
  const getCurrentAddress = () => {
    try {
      const walletData = localStorage.getItem('cryptal_wallet');
      if (walletData) {
        const parsedData = JSON.parse(walletData);
        const currentIndex = parsedData.currentAccountIndex || 0;
        return parsedData.accounts?.[currentIndex]?.address || null;
      }
    } catch (error) {
      console.error('Error reading wallet from localStorage:', error);
    }
    return null;
  };

  const address = getCurrentAddress();
  const isConnected = !!address;
  
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Split Bill Modal state
  const [splitBillModal, setSplitBillModal] = useState<{
    isOpen: boolean;
    transaction: PaymentTransaction | null;
  }>({
    isOpen: false,
    transaction: null
  });

  // Invoice Modal state
  const [invoiceModal, setInvoiceModal] = useState<{
    isOpen: boolean;
    transaction: PaymentTransaction | null;
  }>({
    isOpen: false,
    transaction: null
  });

  const { toast } = useToast();

  // Mock APT to INR conversion (1 APT = 373 INR for demo)
  const convertAPTToINR = (aptAmount: string): number => {
    return parseFloat(aptAmount) * 373;
  };

  // Get user-friendly transaction description
  const getTransactionDescription = (tx: EnhancedTransaction): string => {
    switch (tx.type) {
      case 'coin_transfer':
        return tx.direction === 'sent' ? 'Sent APT' : 'Received APT';
      case 'payment_request':
        return tx.function_name?.includes('create') ? 'Payment Request Created' : 'Payment Request Paid';
      case 'split_bill':
        return 'Split Bill Created';
      case 'emi_payment':
        return 'EMI Payment';
      case 'nft_mint':
        return 'NFT Minted';
      default:
        return tx.function_name || 'Transaction';
    }
  };

  // Invoice generation functions
  const handleGenerateInvoice = (transaction: PaymentTransaction) => {
    setInvoiceModal({
      isOpen: true,
      transaction: transaction
    });
  };

  const closeInvoiceModal = () => {
    setInvoiceModal({
      isOpen: false,
      transaction: null
    });
  };

  const convertToInvoiceData = (transaction: PaymentTransaction): InvoiceData => {
    return {
      transactionHash: transaction.txHash || `mock-${Date.now()}`,
      from: transaction.from,
      to: transaction.to,
      amount: transaction.aptosAmount,
      type: transaction.type === 'other' ? 'sent' : transaction.type,
      timestamp: transaction.timestamp,
      status: transaction.status || 'confirmed'
    };
  };

  const handleQuickDownload = async (transaction: PaymentTransaction) => {
    try {
      const invoiceData = convertToInvoiceData(transaction);
      const success = await downloadInvoice(invoiceData);
      
      if (success) {
        toast({
          title: "Invoice Downloaded! 📄",
          description: "Your transaction invoice NFT has been saved to your device.",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Download Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };



  const loadTransactions = useCallback(async (refresh = false) => {
    if (!isConnected || !address) return;

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('🔍 Loading enhanced transaction history for:', address);
      
      // Get enhanced transactions from blockchain with parsed details
      const enhancedTxs = await getEnhancedAccountTransactions(address, 50);
      
      // Transform to expected format
      const formattedTransactions: PaymentTransaction[] = enhancedTxs.map((tx: EnhancedTransaction) => {
        const aptAmount = tx.amount_apt?.toString() || '0';
        const inrAmount = convertAPTToINR(aptAmount);
        
        return {
          from: tx.sender,
          to: tx.recipient || (tx.direction === 'received' ? address : 'Unknown'),
          ethAmount: '0',
          aptosAmount: aptAmount,
          inrAmount: inrAmount,
          timestamp: new Date(parseInt(tx.timestamp) / 1000),
          txHash: tx.hash,
          type: tx.direction === 'sent' ? 'sent' as const : 
                tx.direction === 'received' ? 'received' as const : 'other' as const,
          status: tx.success ? 'confirmed' as const : 'failed' as const,
          gasUsed: tx.gas_used,
          function: tx.payload?.function,
          transactionType: tx.type,
          description: tx.description || getTransactionDescription(tx),
          version: tx.version
        };
      });

      console.log('✅ Loaded', formattedTransactions.length, 'enhanced transactions from blockchain');
      setTransactions(formattedTransactions);
      
      if (formattedTransactions.length > 0) {
        toast({
          title: "Transactions Loaded",
          description: `Found ${formattedTransactions.length} transaction${formattedTransactions.length > 1 ? 's' : ''} on-chain`,
          duration: 3000,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load transactions';
      setError(errorMessage);
      console.error('Transaction fetch error:', error);
      toast({
        title: "Error Loading Transactions",
        description: "Could not fetch transaction history from blockchain",
        variant: "destructive",
        duration: 4000,
      });
      // If there's an error, just show empty transactions
      setTransactions([]);
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [isConnected, address, toast]);

  // Initial load
  useEffect(() => {
    if (isConnected && address) {
      loadTransactions();
    }
  }, [isConnected, address, loadTransactions]);

  // Refresh on refreshFlag change
  useEffect(() => {
    if (isConnected && address && typeof refreshFlag !== 'undefined') {
      loadTransactions(true); // force refresh on flag change
    }
  }, [isConnected, address, refreshFlag, loadTransactions]);

  // Apply filters
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      // Filter by transaction status
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, typeFilter, statusFilter]);

  const exportToExcel = () => {
    try {
      const exportData = filteredTransactions.map(tx => ({
        'Hash': tx.txHash,
        'From': tx.from,
        'To': tx.to,
        'Amount (APT)': tx.aptosAmount,
        'Amount (INR)': tx.inrAmount.toFixed(2),
        'Type': tx.type,
        'Date': tx.timestamp.toLocaleDateString(),
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      const filename = `aptex-wallet-transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Handle split bill
  const handleSplitBill = (transaction: PaymentTransaction) => {
    if (!transaction.txHash) {
      console.error('Cannot split bill: Transaction hash is missing');
      return;
    }

    setSplitBillModal({
      isOpen: true,
      transaction
    });
  };

  // Close split bill modal
  const closeSplitBillModal = () => {
    setSplitBillModal({
      isOpen: false,
      transaction: null
    });
  };
  const getStatusBadge = (status: 'confirmed' | 'pending' | 'failed') => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-muted/20 text-muted-foreground border-border">
            {status}
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: 'sent' | 'received' | 'other') => {
    switch (type) {
      case 'sent':
        return <ArrowUpCircle className="h-5 w-5 text-red-500" />;
      case 'received':
        return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
      case 'other':
        return <Clock className="h-5 w-5 text-blue-500" />; // Contract interaction icon
      default:
        return <div className="h-5 w-5" />; // Placeholder
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view your transaction history.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full bg-background border-border">
      <CardHeader className="border-b border-border p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl font-medium text-foreground">Transaction History</CardTitle>
            <CardDescription className="text-muted-foreground">Your on-chain Aptex wallet transactions.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => loadTransactions(true)} 
              variant="outline" 
              size="sm" 
              disabled={refreshing || loading}
              className="border-border bg-background hover:bg-muted/20 text-foreground"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              onClick={exportToExcel} 
              variant="outline" 
              size="sm" 
              disabled={filteredTransactions.length === 0}
              className="border-border bg-background hover:bg-muted/20 text-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by address or hash..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full border-border bg-background text-foreground">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full border-border bg-background text-foreground">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert className="mb-4 border-red-500/20 bg-red-500/5">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center p-8">
              <div className="flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading transactions from Aptos testnet...</p>
                <p className="text-xs text-muted-foreground">This may take a few seconds</p>
              </div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(tx.type)}
                      <div>
                        <div className="font-medium text-foreground capitalize">{tx.type}</div>
                        {tx.description && (
                          <div className="text-xs text-purple-400 font-medium">{tx.description}</div>
                        )}
                        {tx.transactionType && tx.transactionType !== 'coin_transfer' && (
                          <Badge variant="outline" className="text-xs mt-1 border-blue-600/30 text-blue-400">
                            {tx.transactionType.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(tx.status || 'confirmed')}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <div className="text-right">
                        <div className="font-medium text-foreground">{parseFloat(tx.aptosAmount).toFixed(6)} APT</div>
                        <div className="text-xs text-muted-foreground">₹{tx.inrAmount.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {tx.type === 'sent' ? 'To:' : 'From:'}
                      </span>
                      <div className="font-mono text-xs text-foreground text-right break-all">
                        {(tx.type === 'sent' ? tx.to : tx.from).substring(0, 10)}...
                        {(tx.type === 'sent' ? tx.to : tx.from).slice(-8)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Hash:</span>
                      <a 
                        href={`https://explorer.aptoslabs.com/txn/${tx.txHash}?network=testnet`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:text-primary/80 transition-colors"
                      >
                        <span className="font-mono text-xs">{tx.txHash?.substring(0, 6)}...{tx.txHash?.substring(tx.txHash.length - 4)}</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    
                    {tx.gasUsed && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Gas Used:</span>
                        <span className="text-xs text-foreground">{parseInt(tx.gasUsed).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {tx.txHash && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleSplitBill(tx)}
                          variant="outline"
                          size="sm"
                          className="text-xs hover:bg-purple-600/10 hover:border-purple-600/20 hover:text-purple-400"
                        >
                          <Users className="h-3 w-3 mr-2" />
                          Split Bill
                        </Button>
                        <Button
                          onClick={() => handleGenerateInvoice(tx)}
                          variant="outline"
                          size="sm"
                          className="text-xs hover:bg-blue-600/10 hover:border-blue-600/20 hover:text-blue-400"
                        >
                          <FileImage className="h-3 w-3 mr-2" />
                          Invoice NFT
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleQuickDownload(tx)}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs hover:bg-green-600/10 hover:border-green-600/20 hover:text-green-400"
                      >
                        <Download className="h-3 w-3 mr-2" />
                        Quick Download Invoice
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-8">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No On-Chain Transactions Found</h3>
                <p className="text-muted-foreground max-w-sm">Pull to refresh or make a payment to see your history.</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Type</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">From / To</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Amount</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Date</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Hash</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-muted-foreground">Loading transactions from Aptos testnet...</p>
                      <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="p-4">{getTypeIcon(tx.type)}</td>
                    <td className="p-4">
                      <div className="font-mono text-xs text-foreground">
                        {tx.type === 'sent' ? (
                          <>
                            <span className="text-muted-foreground">To:</span> {tx.to.substring(0, 6)}...{tx.to.substring(tx.to.length - 4)}
                          </>
                        ) : (
                          <>
                            <span className="text-muted-foreground">From:</span> {tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{parseFloat(tx.aptosAmount).toFixed(6)} APT</div>
                      <div className="text-xs text-muted-foreground">₹{tx.inrAmount.toLocaleString()}</div>
                      {tx.function && (
                        <div className="text-xs text-blue-400 mt-1">{tx.function}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-foreground">
                        {tx.timestamp.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.timestamp.toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(tx.status || 'confirmed')}</td>
                    <td className="p-4">
                      <a 
                        href={`https://explorer.aptoslabs.com/txn/${tx.txHash}?network=testnet`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:text-primary/80 transition-colors"
                      >
                        <span className="font-mono text-xs">{tx.txHash?.substring(0, 6)}...{tx.txHash?.substring(tx.txHash.length - 4)}</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </td>
                    <td className="p-4">
                      {tx.txHash && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleSplitBill(tx)}
                            variant="outline"
                            size="sm"
                            className="text-xs hover:bg-purple-600/10 hover:border-purple-600/20 hover:text-purple-400"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Split
                          </Button>
                          <Button
                            onClick={() => handleGenerateInvoice(tx)}
                            variant="outline"
                            size="sm"
                            className="text-xs hover:bg-blue-600/10 hover:border-blue-600/20 hover:text-blue-400"
                          >
                            <FileImage className="h-3 w-3 mr-1" />
                            Invoice
                          </Button>
                          <Button
                            onClick={() => handleQuickDownload(tx)}
                            variant="outline"
                            size="sm"
                            className="text-xs hover:bg-green-600/10 hover:border-green-600/20 hover:text-green-400"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center p-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">No On-Chain Transactions Found</h3>
                      <p className="text-muted-foreground max-w-sm">Pull to refresh or make a payment to see your history.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Split Bill Modal */}
      {splitBillModal.transaction && (
        <SplitBillModal
          isOpen={splitBillModal.isOpen}
          onClose={closeSplitBillModal}
          originalTransaction={{
            txHash: splitBillModal.transaction.txHash || '',
            amount: splitBillModal.transaction.aptosAmount,
            description: `Transaction ${splitBillModal.transaction.txHash?.slice(0, 8)}...`
          }}
          userAddress={address || ''}
        />
      )}

      {/* Invoice Preview Modal */}
      {invoiceModal.transaction && (
        <InvoicePreviewModal
          isOpen={invoiceModal.isOpen}
          onClose={closeInvoiceModal}
          transaction={convertToInvoiceData(invoiceModal.transaction)}
        />
      )}
    </Card>
  );
};