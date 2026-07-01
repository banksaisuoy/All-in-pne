'use client';

import { useState } from 'react';
import { mockProducts } from '@/lib/db/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminProductsPage() {
    const [products, setProducts] = useState(mockProducts);
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');

    const handleAddProduct = () => {
        if (!newProductName || !newProductPrice) return;
        const newProduct = {
            id: `p-${Date.now()}`,
            name: newProductName,
            description: 'A newly added product.',
            description_html: '<p>A newly added product.</p>',
            price: parseFloat(newProductPrice),
            currency: 'USD',
            image_url: 'https://placehold.co/400x400?text=' + encodeURIComponent(newProductName),
            stock_quantity: 10,
            tags: ['new'],
            vector_embedding: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        setProducts([...products, newProduct]);
        setNewProductName('');
        setNewProductPrice('');
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl pt-8">
            <h1 className="text-3xl font-bold mb-8">Product Management</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add New Product (Mock)</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input
                        placeholder="Product Name"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="Price"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                    />
                    <Button onClick={handleAddProduct}>Add Product</Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <Card key={product.id}>
                        <div className="aspect-video relative bg-muted">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">${product.price}</p>
                            <p className="text-sm text-muted-foreground mt-1">Stock: {product.stock_quantity}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
