import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Trash2, 
  DollarSign, 
  User, 
  X, 
  AlertCircle,
  Split
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  createBillSplit, 
  calculateEvenSplit, 
  calculateCustomSplit 
} from '@/utils/billSplitStorage';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTransaction: {
    txHash: string;
    amount: string;
    description?: string;
  };
  userAddress: string;
}

interface Participant {
  id: string;
  address: string;
  amount: string;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  originalTransaction,
  userAddress
}) => {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', address: '', amount: '' }
  ]);
  const [description, setDescription] = useState(originalTransaction.description || '');
  const [splitType, setSplitType] = useState<'even' | 'custom'>('even');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Generate unique ID for participants
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 5);

  // Add new participant
  const addParticipant = () => {
    setParticipants(prev => [
      ...prev,
      { id: generateId(), address: '', amount: '' }
    ]);
  };
function createPayloads(functionName: string, args: any[]) {
    return {
      function: `0x1::BillSplits::${functionName}`,
      type_arguments: [],
      arguments: args,
    };
  }
  // Remove participant
  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(prev => prev.filter(p => p.id !== id));
    }
  };

  // Update participant address
  const updateParticipantAddress = (id: string, address: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, address } : p
    ));
  };

  // Update participant amount (for custom split)
  const updateParticipantAmount = (id: string, amount: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, amount } : p
    ));
  };

  // Clear error
  const clearError = () => setError('');

  async function createSplitBill(
  creatorAccount: Account,
  adminAddress: string,
  totalAmount: number,
  description: string,
  participantWalletIds: string[],
  participantAmounts: number[],
  aptos?: Aptos
): Promise<string> {
  const client = aptos ;
  
  const payload = createPayloads("create_split_bill", [
    adminAddress,
    totalAmount.toString(),
    description,
    participantWalletIds,
    participantAmounts.map(amount => amount.toString()),
  ]);

  const transaction = await client.transaction.build.simple({
    sender: creatorAccount.accountAddress,
    data: payload.data,
  });

  const pendingTxn = await client.signAndSubmitTransaction({
    signer: creatorAccount,
    transaction,
  });

  const txnResult = await client.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });

  return txnResult.hash;
}

  // Close modal and reset state
  const handleClose = () => {
    setParticipants([{ id: '1', address: '', amount: '' }]);
    setDescription(originalTransaction.description || '');
    setSplitType('even');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  // Validate form
  const validateForm = () => {
    clearError();

    const validParticipants = participants.filter(p => p.address.trim());
    
    if (validParticipants.length === 0) {
      setError('Please add at least one participant');
      return false;
    }

    // Check for valid Aptos addresses (basic validation)
    for (const participant of validParticipants) {
      if (!participant.address.startsWith('0x') || participant.address.length < 10) {
        setError(`Invalid address: ${participant.address.slice(0, 20)}...`);
        return false;
      }
    }

    // For custom split, validate amounts
    if (splitType === 'custom') {
      for (const participant of validParticipants) {
        if (!participant.amount || parseFloat(participant.amount) <= 0) {
          setError('Please enter valid amounts for all participants');
          return false;
        }
      }

      // Check if total matches
      const customAmounts: Record<string, string> = {};
      validParticipants.forEach(p => {
        customAmounts[p.address] = p.amount;
      });

      const calculation = calculateCustomSplit(originalTransaction.amount, customAmounts);
      if (!calculation.valid) {
        setError(`Amount mismatch. Remaining: ${calculation.remaining} APT`);
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const validParticipants = participants.filter(p => p.address.trim());

      // Calculate final amounts
      let finalParticipants: { address: string; amount: string }[];
      
      if (splitType === 'even') {
        const evenAmount = calculateEvenSplit(originalTransaction.amount, validParticipants.length);
        finalParticipants = validParticipants.map(p => ({
          address: p.address,
          amount: evenAmount
        }));
      } else {
        finalParticipants = validParticipants.map(p => ({
          address: p.address,
          amount: p.amount
        }));
      }

      // Create bill split
      const billSplit = createBillSplit(
        originalTransaction.txHash,
        userAddress,
        originalTransaction.amount,
        description,
        finalParticipants
      );

      toast({
        title: "Bill Split Created",
        description: `Successfully created bill split for ${finalParticipants.length} participants`,
        duration: 3000,
      });

      handleClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create bill split');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-black border border-gray-800">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gray-900 rounded-full flex items-center justify-center">
              <Split className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            Split Transaction
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Divide this transaction among multiple participants
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Original Transaction Info */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Total Amount</span>
              <span className="text-lg font-semibold text-white">
                {originalTransaction.amount} APT
              </span>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {originalTransaction.txHash.slice(0, 20)}...{originalTransaction.txHash.slice(-15)}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-900/20 border-red-800 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Split Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm text-gray-300">Split Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => setSplitType('even')}
                variant={splitType === 'even' ? 'default' : 'outline'}
                className={`h-12 ${
                  splitType === 'even' 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'border-gray-700 hover:bg-gray-800'
                }`}
              >
                Even Split
              </Button>
              <Button
                type="button"
                onClick={() => setSplitType('custom')}
                variant={splitType === 'custom' ? 'default' : 'outline'}
                className={`h-12 ${
                  splitType === 'custom' 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'border-gray-700 hover:bg-gray-800'
                }`}
              >
                Custom Split
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Description</Label>
            <Textarea
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              disabled={isSubmitting}
              maxLength={200}
              rows={3}
            />
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-gray-300">
                Participants ({participants.filter(p => p.address.trim()).length})
              </Label>
              <Button
                type="button"
                onClick={addParticipant}
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-6 bg-gray-800 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-300">
                      Person {index + 1}
                    </span>
                    {participants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                        className="ml-auto h-6 w-6 p-0 hover:bg-red-900/20 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Input
                        placeholder="0x..."
                        value={participant.address}
                        onChange={(e) => updateParticipantAddress(participant.id, e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 font-mono text-sm"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    {splitType === 'custom' ? (
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="0.00"
                        value={participant.amount}
                        onChange={(e) => updateParticipantAmount(participant.id, e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        disabled={isSubmitting}
                      />
                    ) : (
                      participant.address.trim() && (
                        <div className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300">
                          {participants.filter(p => p.address.trim()).length > 0
                            ? calculateEvenSplit(originalTransaction.amount, participants.filter(p => p.address.trim()).length)
                            : '0.00'
                          } APT
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || participants.filter(p => p.address.trim()).length === 0}
              className="flex-1 bg-white text-black hover:bg-gray-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                `Create Split (${participants.filter(p => p.address.trim()).length})`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};