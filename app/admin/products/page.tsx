'use client';

import { useState, useEffect } from 'react';
import { getProducts, deleteProduct, createProduct } from '@/lib/actions/admin';
import { Product } from '@/lib/db/mock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts([...data]); // Force new reference
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    loadProducts();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.imageUrl) return;

    await createProduct({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        imageUrl: form.imageUrl,
    });
    setForm({ name: '', description: '', price: '', imageUrl: '' });
    loadProducts();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <div className="space-x-2">
            <Link href="/admin/orders">
                <Button variant="outline">View Orders</Button>
            </Link>
            <Link href="/admin/upload">
                <Button>Magic Upload</Button>
            </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit">
            <CardHeader>
                <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        placeholder="Product Name"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        required
                    />
                    <Input
                        placeholder="Description"
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})}
                    />
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={form.price}
                        onChange={e => setForm({...form, price: e.target.value})}
                        required
                    />
                    <Input
                        placeholder="Image URL"
                        value={form.imageUrl}
                        onChange={e => setForm({...form, imageUrl: e.target.value})}
                        required
                    />
                    <Button type="submit" className="w-full">
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                    </Button>
                </form>
            </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Inventory List</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8" /></div>
                ) : (
                    <div className="space-y-4">
                        {products.map(p => (
                            <div key={p.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded bg-muted" />
                                <div className="flex-1">
                                    <h4 className="font-semibold">{p.name}</h4>
                                    <p className="text-sm text-muted-foreground">${p.price.toFixed(2)}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
