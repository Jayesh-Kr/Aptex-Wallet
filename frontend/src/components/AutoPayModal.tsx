import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Calendar, 
  Wallet, 
  Clock, 
  DollarSign, 
  X, 
  AlertCircle,
  CheckCircle,
  Zap,
  Settings
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface AutoPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  onSuccess?: () => void;
}

interface AutoPaySetup {
  recipientAddress: string;
  amount: string;
  durationMonths: string;
  startDate: string;
}

export const AutoPayModal: React.FC<AutoPayModalProps> = ({
  isOpen,
  onClose,
  userAddress,
  onSuccess
}) => {
  const [formData, setFormData] = useState<AutoPaySetup>({
    recipientAddress: '',
    amount: '',
    durationMonths: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const userAccount = "Sfs";
const adminAddress = "0xadminaddress";
const companyWalletId = "0xcompanywalletid";
const totalAmount = (parseFloat(formData.amount) || 0) * (parseInt(formData.durationMonths) || 0);
const monthlyInstallment = parseFloat(formData.amount) || 0;
const totalMonths = parseInt(formData.durationMonths) || 0;
const description = `AutoPay to ${formData.recipientAddress} of ${formData.amount} APT for ${formData.durationMonths} months starting ${formData.startDate}`;
  function createPayload(functionName: string, args: any[]) {
    return {
      function: `0x1::AutoPays::${functionName}`,
      type_arguments: [],
      arguments: args,
    };
  }
  // Handle form field changes
  const handleInputChange = (field: keyof AutoPaySetup, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Validate form
  const validateForm = () => {
    setError('');

    // Validate recipient address
    if (!formData.recipientAddress.trim()) {
      setError('Recipient address is required');
      return false;
    }

    // Basic address format check
    async function createEmiAgreement(
  userAccount: Account,
  adminAddress: string,
  companyWalletId: string,
  totalAmount: number,
  monthlyInstallment: number,
  totalMonths: number,
  description: string,
  aptos?: Aptos
): Promise<string> {
  const client = aptos;
  
  const payload = createPayload("create_emi_agreement", [
    adminAddress,
    companyWalletId,
    totalAmount.toString(),
    monthlyInstallment.toString(),
    totalMonths.toString(),
    description,
  ]);

  const transaction = await client.transaction.build.simple({
    sender: userAccount.accountAddress,
    data: payload.data,
  });

  const pendingTxn = await client.signAndSubmitTransaction({
    signer: userAccount,
    transaction,
  });

  const txnResult = await client.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });

  createEmiAgreement(userAccount, adminAddress, companyWalletId, totalAmount, monthlyInstallment, totalMonths, description);

  return txnResult.hash;
}


    if (!formData.recipientAddress.startsWith('0x') || formData.recipientAddress.length < 10) {
      setError('Invalid recipient address format');
      return false;
    }

    if (formData.recipientAddress === userAddress) {
      setError('Cannot set up autopay to your own address');
      return false;
    }

    // Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    // Validate duration
    if (!formData.durationMonths || parseInt(formData.durationMonths) <= 0) {
      setError('Duration must be at least 1 month');
      return false;
    }

    if (parseInt(formData.durationMonths) > 60) {
      setError('Duration cannot exceed 60 months');
      return false;
    }

    // Validate start date
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }

    const startDate = new Date(formData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      return false;
    }

    return true;
  };

  

  // Calculate total amount and monthly payment
  const calculatePaymentInfo = () => {
    const monthlyAmount = parseFloat(formData.amount) || 0;
    const months = parseInt(formData.durationMonths) || 0;
    const totalAmount = monthlyAmount * months;

    return {
      monthlyAmount,
      totalAmount,
      months
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Add realistic delay for autopay setup processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentInfo = calculatePaymentInfo();
      
      // Create autopay setup (this would integrate with your autopay system)
      const autoPayId = `autopay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const autoPaySetup = {
        id: autoPayId,
        fromAddress: userAddress,
        toAddress: formData.recipientAddress,
        monthlyAmount: formData.amount,
        totalAmount: paymentInfo.totalAmount.toString(),
        durationMonths: parseInt(formData.durationMonths),
        startDate: formData.startDate,
        status: 'active',
        createdAt: new Date().toISOString(),
        nextPaymentDate: formData.startDate,
        paymentsCompleted: 0
      };

      // Store autopay setup in localStorage (you can replace this with your backend API)
      const existingAutoPays = JSON.parse(localStorage.getItem(`autopay_${userAddress}`) || '[]');
      existingAutoPays.push(autoPaySetup);
      localStorage.setItem(`autopay_${userAddress}`, JSON.stringify(existingAutoPays));

      toast({
        title: "AutoPay Setup Complete! ⚡",
        description: `Monthly payment of ${formData.amount} APT set up for ${formData.durationMonths} months`,
        duration: 5000,
      });

      // Reset form and close
      setFormData({
        recipientAddress: '',
        amount: '',
        durationMonths: '',
        startDate: new Date().toISOString().split('T')[0]
      });
      
      onSuccess?.();
      onClose();

    } catch (error: any) {
      console.error('Error setting up autopay:', error);
      setError('Failed to set up autopay. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      recipientAddress: '',
      amount: '',
      durationMonths: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setError('');
    onClose();
  };

  const paymentInfo = calculatePaymentInfo();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-md border border-gray-800 shadow-2xl">
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
            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-center text-white">
            Set Up AutoPay
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Automate recurring payments to save time and never miss a payment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-4">
          {error && (
            <Alert className="bg-red-900/50 border-red-700">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipientAddress" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Recipient Address
            </Label>
            <Input
              id="recipientAddress"
              placeholder="0x1234567890abcdef..."
              value={formData.recipientAddress}
              onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 font-mono text-sm"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">Enter the wallet address of the recipient</p>
          </div>

          {/* Amount per Month */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Amount per Month (APT)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">Amount to be paid monthly</p>
          </div>

          {/* Duration in Months */}
          <div className="space-y-2">
            <Label htmlFor="durationMonths" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Duration (Months)
            </Label>
            <Input
              id="durationMonths"
              type="number"
              min="1"
              max="60"
              placeholder="12"
              value={formData.durationMonths}
              onChange={(e) => handleInputChange('durationMonths', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">How many months the autopay should run (max 60)</p>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="bg-gray-900 border-gray-700 text-white"
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500">When the first payment should be made</p>
          </div>

          {/* Payment Summary */}
          {paymentInfo.monthlyAmount > 0 && paymentInfo.months > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Payment Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Payment:</span>
                  <span className="text-white font-medium">{paymentInfo.monthlyAmount.toFixed(6)} APT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{paymentInfo.months} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="text-white font-semibold">{paymentInfo.totalAmount.toFixed(6)} APT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Date:</span>
                  <span className="text-white">{formData.startDate || 'Not set'}</span>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-blue-900/30 border border-blue-700/50 rounded text-xs text-blue-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  Payments will be automatically processed monthly
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
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
              disabled={isSubmitting || !formData.recipientAddress || !formData.amount || !formData.durationMonths}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Set Up AutoPay
                </div>
              )}
            </Button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-400">
              💡 AutoPay will automatically deduct the specified amount from your wallet each month. 
              You can cancel or modify the autopay settings at any time.
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};