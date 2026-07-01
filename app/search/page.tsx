'use client';

import { useState } from 'react';
import { mockProducts } from '@/lib/db/mock';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const { addItem } = useCartStore();

    const filteredProducts = mockProducts.filter(product => {
        const lowerQuery = query.toLowerCase();
        return product.name.toLowerCase().includes(lowerQuery) ||
               product.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    });

    return (
        <div className="container mx-auto p-4 max-w-4xl pt-8">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Search className="h-8 w-8 text-blue-600" />
                Search Products
            </h1>

            <div className="mb-8 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search by name or tags..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-12 text-lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video relative bg-muted">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                                    }}
                                />
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="font-bold text-xl">${product.price}</span>
                                    <Button onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}>
                                        Add to Cart
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No products found matching "{query}"
                    </div>
                )}
            </div>
        </div>
    );
}
