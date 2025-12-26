import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/db/server';
import { generateEmbedding } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export default async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;

  // In a real app, we would search by embedding here using the query 'q'
  // But since we just want to show the flow:
  // 1. Generate embedding for 'q'
  // 2. Query Supabase

  // Mock results for now since we don't have real data seeded with embeddings
  const results = [
      { id: 1, title: 'Red Running Shoes', price: 89.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070' },
      { id: 2, title: 'Sports Sneakers', price: 120.50, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1974' },
      { id: 3, title: 'Casual Trainers', price: 65.00, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1996' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       <div className="bg-white sticky top-0 z-30 px-4 py-3 shadow-sm flex items-center gap-4">
           <Link href="/" className="text-gray-600">
               <ArrowLeft className="w-6 h-6" />
           </Link>
           <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-800 truncate">
               &quot;{q}&quot;
           </div>
       </div>

       <div className="p-4">
           <p className="text-gray-500 text-sm mb-4">Found {results.length} items based on visual match</p>

           <div className="grid grid-cols-2 gap-4">
               {results.map((item) => (
                   <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                       <div className="h-40 bg-gray-200 relative">
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                       </div>
                       <div className="p-3">
                           <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{item.title}</h3>
                           <p className="text-orange-600 font-bold mt-1">${item.price}</p>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
}
