'use client';

import { createClient } from '@/lib/db/client'; // Use client-side for fetching list
import { useEffect, useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { createProduct } from '@/lib/actions/products';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (formData: FormData) => {
      // Simulate image upload returning URL
      // In real app, upload file -> get public URL -> save
      formData.append('imageUrl', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999');

      const res = await createProduct(formData);
      if (res?.error) {
          alert(res.error);
      } else {
          setIsAdding(false);
          fetchProducts();
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
          >
              <Plus className="w-4 h-4" /> Add New
          </button>
      </div>

      {isAdding && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100 animate-in fade-in slide-in-from-top-4">
              <h2 className="font-bold mb-4">Add Product</h2>
              <form action={handleCreate} className="space-y-4">
                  <input name="title" placeholder="Product Name" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3" />
                  <textarea name="description" placeholder="Description" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3" />
                  <div className="flex gap-4">
                      <input name="price" type="number" step="0.01" placeholder="Price" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3" />
                      <input name="stock" type="number" placeholder="Stock" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3" />
                  </div>
                  {/* Image upload simulated */}
                  <div className="text-xs text-gray-400">Image will be auto-set to a placeholder for demo.</div>

                  <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold">Save Product</button>
              </form>
          </div>
      )}

      <div className="grid gap-4">
          {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{p.name || p.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{p.description}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-orange-600 font-bold">${p.price}</span>
                          <span className="text-gray-400">{p.stock} in stock</span>
                      </div>
                  </div>
              </div>
          ))}
          {products.length === 0 && !isAdding && (
              <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                  <Package className="w-10 h-10 mb-2 opacity-20" />
                  No products yet.
              </div>
          )}
      </div>
    </div>
  );
}
