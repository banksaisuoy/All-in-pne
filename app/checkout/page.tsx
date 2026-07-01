'use client';

import { useState } from 'react';
import { useCart } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { verifySlip, createOrder } from '@/lib/actions/checkout';
import { Loader2, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function CheckoutPage() {
  const { items, removeItem, clearCart, getTotal } = useCart();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const total = getTotal();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setVerificationResult(null);
      setOrderStatus('idle');
    }
  };

  const handleCheckout = async () => {
    if (!file) return;

    setIsVerifying(true);
    setOrderStatus('idle');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // 1. Verify the slip
        const verifyRes = await verifySlip(base64String, total);

        if (verifyRes.success && verifyRes.data) {
            setVerificationResult(verifyRes.data);

            // 2. If valid, create order
            if (verifyRes.data.finalDecision) {
                const orderRes = await createOrder(total);
                if (orderRes.success) {
                    setOrderStatus('success');
                    clearCart();
                } else {
                    setOrderStatus('error');
                }
            } else {
                 setOrderStatus('error');
            }
        } else {
            setOrderStatus('error');
        }
        setIsVerifying(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
      setOrderStatus('error');
    }
  };

  if (orderStatus === 'success') {
    return (
        <div className="container mx-auto p-4 max-w-2xl py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Confirmed!</h1>
            <p className="text-muted-foreground mb-8">Your order has been successfully placed.</p>
            <Button onClick={() => window.location.href = '/'}>Return to Shop</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl grid md:grid-cols-2 gap-8">
      {/* Cart Summary */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>

        {items.length === 0 ? (
          <p className="text-muted-foreground">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center text-xl font-bold pt-4 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Actions */}
      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length > 0 ? (
                <>
                <p className="text-sm text-muted-foreground">
                    Please upload your payment slip (transfer receipt) to complete the order. Our AI will automatically verify the amount.
                </p>
                <div className="space-y-2">
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                {previewUrl && (
                    <div className="mt-4 border rounded-lg p-2 bg-muted/30">
                        <img src={previewUrl} alt="Slip Preview" className="max-h-48 mx-auto object-contain rounded" />
                    </div>
                )}
                </div>

                {verificationResult && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 ${verificationResult.finalDecision ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {verificationResult.finalDecision ? <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">{verificationResult.finalDecision ? 'Slip Verified Successfully' : 'Verification Failed'}</p>
                            <p>Detected Amount: ${verificationResult.detectedAmount}</p>
                            <p className="text-xs opacity-80">{verificationResult.reasoning}</p>
                        </div>
                    </div>
                )}
                </>
            ) : (
                 <p className="text-sm text-muted-foreground text-center py-8">Add items to your cart to checkout.</p>
            )}
          </CardContent>
          <CardFooter>
             <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={items.length === 0 || !file || isVerifying}
            >
                {isVerifying ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Slip...</>
                ) : (
                    'Confirm & Pay'
                )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
