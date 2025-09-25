import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, DollarSign, MessageSquare, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { createPaymentRequest } from '@/utils/paymentRequestStorage';

interface SendPaymentRequestProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
}

export const SendPaymentRequest: React.FC<SendPaymentRequestProps> = ({
  isOpen,
  onClose,
  userAddress
}) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  function createPayload(functionName: string, args: any[]) {
    return {
      function: `0x1::PaymentRequests::${functionName}`,
      type_arguments: [],
      arguments: args,
    };
  } 

  const userAddresss= "0xuseraddress";
  const adminAddress = "0xadminaddress";
  const toWalletId = "0xtowalletid";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!recipientAddress.trim()) {
      setError('Please enter a recipient address');
      setIsSubmitting(false);
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }

    if (recipientAddress === userAddress) {
      setError('You cannot send a payment request to yourself');
      setIsSubmitting(false);
      return;
    }

    // Validate address format (basic validation)
    if (!recipientAddress.startsWith('0x') || recipientAddress.length < 10) {
      setError('Please enter a valid Aptos address (must start with 0x)');
      setIsSubmitting(false);
      return;
    }

    try {
      // Add realistic delay for request processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const request = createPaymentRequest(
        userAddress,
        recipientAddress,
        amount,
        description || undefined
      );

      toast({
        title: "Payment Request Sent! 💸",
        description: `Request for ${amount} APT sent to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
        duration: 5000,
      });

      // Reset form
      setRecipientAddress('');
      setAmount('');
      setDescription('');
      onClose();
      
    } catch (error) {
      console.error('Error creating payment request:', error);
      setError('Failed to send payment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  async function createPaymentRequests(
  requesterAccount: Account,
  adminAddress: string,
  toWalletId: string,
  amount: number,
  description: string,
  aptos?: Aptos
): Promise<string> {
  const client = aptos ;
  
  const payload = createPayload("create_payment_request", [
    adminAddress,
    toWalletId,
    amount.toString(),
    description,
  ]);

  const transaction = await client.transaction.build.simple({
    sender: requesterAccount.accountAddress,
    data: payload.data,
  });

  const pendingTxn = await client.signAndSubmitTransaction({
    signer: requesterAccount,
    transaction,
  });

  const txnResult = await client.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });

  return txnResult.hash;
}


createPaymentRequests(userAddresss, adminAddress, toWalletId, amount, description);

  const handleClose = () => {
    setRecipientAddress('');
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-black/95 backdrop-blur-md border border-gray-800 shadow-2xl">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-800/50 rounded-full text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <DialogHeader className="pt-4">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center">
              <Send className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-center text-white">
            Send Payment Request
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Request money from another wallet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          {error && (
            <Alert className="bg-red-900/50 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Recipient Address
            </Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x1234567890abcdef..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 font-mono text-sm"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Enter the Aptos wallet address of the person you want to request money from
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount (APT)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              required
              disabled={isSubmitting}
            />
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-xs text-gray-500">
                ≈ ₹{(parseFloat(amount) * 373).toFixed(2)} INR
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="What's this request for? (e.g., Dinner bill split, Movie tickets...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 min-h-[80px] resize-none"
              disabled={isSubmitting}
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Add a note to help them understand what this request is for
              </p>
              <span className="text-xs text-gray-500">{description.length}/200</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Request
                </div>
              )}
            </Button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400">
              💡 The recipient will receive your payment request and can choose to accept or reject it. 
              You'll be notified once they respond.
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};