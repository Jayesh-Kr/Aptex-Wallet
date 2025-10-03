import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWalletBalance } from '@/utils/aptosWalletUtils';

export const BalanceTester: React.FC = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBalance = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);
    setBalance(null);

    try {
      console.log('Testing balance for address:', address);
      const result = await getWalletBalance(address.trim());
      console.log('Balance result:', result);
      setBalance(result);
    } catch (err) {
      console.error('Balance test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testWithSampleAddress = () => {
    // Use a known testnet address with balance for testing
    setAddress('0x1');
    setTimeout(() => testBalance(), 100);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Balance Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Enter wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mb-2"
          />
          <div className="flex gap-2">
            <Button 
              onClick={testBalance} 
              disabled={loading || !address.trim()}
              className="flex-1"
            >
              {loading ? 'Testing...' : 'Test Balance'}
            </Button>
            <Button 
              onClick={testWithSampleAddress} 
              variant="outline"
              disabled={loading}
            >
              Test 0x1
            </Button>
          </div>
        </div>

        {balance !== null && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              Balance: {balance} APT
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              ≈ ₹{(parseFloat(balance) * 373).toFixed(2)}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            <div className="text-sm font-medium text-red-800 dark:text-red-200">
              Error: {error}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>This tool tests the balance fetching function directly.</p>
          <p>Address 0x1 is a system address that should have balance.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceTester;