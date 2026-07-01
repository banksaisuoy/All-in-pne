'use client';

import { motion } from 'framer-motion';
import { mockProducts } from '@/lib/db/mock';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

export default function Home() {
    const { addItem } = useCartStore();

    return (
        <div className="min-h-screen bg-zinc-50 pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-black text-white h-[60vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="z-10 text-center px-4"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Welcome to OmniFlow</h1>
                    <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-8">
                        The AI-driven high-performance e-commerce platform of the future.
                    </p>
                    <Button size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg px-8 rounded-full">
                        Shop Now
                    </Button>
                </motion.div>

                {/* Auto-sliding background effect could go here */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 z-0" />
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-10 text-center tracking-tight">Featured Products</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow border-none bg-white rounded-2xl">
                                <div className="aspect-square relative bg-muted group overflow-hidden">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                                        }}
                                    />
                                    {product.stock_quantity < 20 && (
                                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            Low Stock
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-6 flex-grow flex flex-col">
                                    <h3 className="font-bold text-xl mb-2 line-clamp-1">{product.name}</h3>
                                    <p className="text-muted-foreground line-clamp-2 mb-4 flex-grow">{product.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-2xl font-black">${product.price}</span>
                                        <Button
                                            onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
                                            className="rounded-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
