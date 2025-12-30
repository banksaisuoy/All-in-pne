'use client';

import { useCartStore } from '@/lib/store/cart';
import { useState } from 'react';
import { createOrder } from '@/lib/actions/orders';
import { Upload, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [slip, setSlip] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (items.length === 0) {
      return <div className="p-10 text-center">Your cart is empty.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      // 1. Simulate Slip Upload (In real app, upload to Supabase Storage here)
      // For now, we mock it by creating a fake URL or base64
      let slipUrl = "https://example.com/slip-placeholder.jpg";
      if (slip) {
          // Mock upload delay
          await new Promise(r => setTimeout(r, 1000));
          slipUrl = "https://example.com/uploaded-slip.jpg";
      }

      // 2. Create Order via Server Action
      const formData = new FormData();
      formData.append('address', address);
      formData.append('slipUrl', slipUrl);
      formData.append('cartItems', JSON.stringify(items));
      formData.append('total', total().toString());

      // Note: We use a wrapper/client-side call pattern here
      // Ideally use `useActionState` in React 19, but standard async/await for now
      const result = await createOrder(null, formData);

      if (result?.success) {
          clearCart();
          alert("Order placed successfully!");
          router.push('/');
      } else {
          alert(result?.error || "Checkout failed");
      }
      setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
       <h1 className="text-2xl font-bold mb-6">Checkout</h1>

       <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
           <h2 className="font-bold mb-4">Order Summary</h2>
           {items.map(item => (
               <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                   <div className="flex gap-2">
                       <span className="font-medium text-gray-800">{item.quantity}x</span>
                       <span className="text-gray-600">{item.name}</span>
                   </div>
                   <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
               </div>
           ))}
           <div className="flex justify-between mt-4 pt-4 border-t font-bold text-lg">
               <span>Total</span>
               <span className="text-orange-600">${total().toFixed(2)}</span>
           </div>
       </div>

       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
               <textarea
                   required
                   value={address}
                   onChange={e => setAddress(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                   rows={3}
                   placeholder="123 Main St..."
               />
           </div>

           <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Slip</label>
               <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer relative">
                   <input
                       type="file"
                       accept="image/*"
                       onChange={e => setSlip(e.target.files?.[0] || null)}
                       className="absolute inset-0 opacity-0 cursor-pointer"
                   />
                   {slip ? (
                       <div className="flex flex-col items-center text-green-600">
                           <CheckCircle className="w-8 h-8 mb-2" />
                           <span className="text-sm font-medium">{slip.name}</span>
                       </div>
                   ) : (
                       <div className="flex flex-col items-center">
                           <Upload className="w-8 h-8 mb-2" />
                           <span className="text-sm">Click to upload slip</span>
                       </div>
                   )}
               </div>
           </div>

           <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 disabled:opacity-50 transition-all"
           >
               {loading ? "Processing..." : "Confirm Order"}
           </button>
       </form>
    </div>
  );
}
