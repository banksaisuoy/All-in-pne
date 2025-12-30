'use client';

import { useCartStore } from '@/lib/store/cart';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner'; // Assuming sonner is installed or I should use alert/console

export default function AddToCartButton({ product }: { product: { id: string, name: string, title?: string, price: number, image_url: string } }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem({
        id: product.id,
        name: product.name || product.title,
        price: product.price,
        image_url: product.image_url || '',
        quantity: 1
    });
    alert("Added to cart!");
  };

  return (
     <button
        onClick={handleAdd}
        className="flex-[2] bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
     >
         <ShoppingCart className="w-5 h-5" /> Add to Cart
     </button>
  );
}
