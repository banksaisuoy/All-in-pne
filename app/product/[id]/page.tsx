import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { createClient } from '@/lib/db/server';
import AddToCartButton from '@/components/shop/AddToCartButton';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    // Ideally use notFound() but for stability in this demo environment:
    return <div className="p-10 text-center">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-transparent text-white mix-blend-difference pointer-events-none">
         <Link href="/" className="bg-black/20 p-2 rounded-full backdrop-blur-md pointer-events-auto">
            <ArrowLeft className="w-6 h-6" />
         </Link>
         <Link href="/cart" className="bg-black/20 p-2 rounded-full backdrop-blur-md pointer-events-auto">
            <ShoppingCart className="w-6 h-6" />
         </Link>
      </div>

      {/* Image */}
      <div className="relative h-[50vh] bg-gray-100">
         {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
         ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
         )}
      </div>

      {/* Info */}
      <div className="p-6 -mt-6 rounded-t-3xl bg-white relative z-10 min-h-[50vh]">
         <div className="flex justify-between items-start mb-4">
             <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name || product.title}</h1>
                <div className="flex items-center gap-1 text-orange-500 mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-xs text-gray-400">(120 reviews)</span>
                </div>
             </div>
             <div className="text-2xl font-bold text-orange-600">
                 ${product.price}
             </div>
         </div>

         <p className="text-gray-500 leading-relaxed mb-8">
             {product.description || "No description available."}
         </p>

         {/* Sticky Footer Action */}
         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-4">
             <button className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold">
                 Chat AI
             </button>
             <AddToCartButton product={product} />
         </div>
      </div>
    </div>
  );
}
