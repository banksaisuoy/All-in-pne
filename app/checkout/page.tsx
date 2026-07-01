'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CheckoutPage() {
    const { items, clearCart } = useCartStore();
    const [isSuccess, setIsSuccess] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [creditCard, setCreditCard] = useState('');

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !address || !creditCard) {
            alert('Please fill out all fields.');
            return;
        }

        // Mock checkout process
        setIsSuccess(true);
        clearCart();
    };

    if (isSuccess) {
        return (
            <div className="container mx-auto p-4 max-w-4xl pt-16 text-center">
                <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful!</h1>
                <p className="text-lg text-gray-600 mb-8">Thank you for your order. Your items will be shipped soon.</p>
                <Button onClick={() => window.location.href = '/'}>Return to Home</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl pt-8 pb-20">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <p>Your cart is empty.</p>
                        ) : (
                            <ul className="space-y-4">
                                {items.map((item) => (
                                    <li key={item.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </li>
                                ))}
                                <li className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                                    <span>Total</span>
                                    <span>
                                        ${items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                                    </span>
                                </li>
                            </ul>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCheckout} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                                <Input
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="123 Main St, City"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Credit Card</label>
                                <Input
                                    value={creditCard}
                                    onChange={e => setCreditCard(e.target.value)}
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full mt-6"
                                disabled={items.length === 0}
                            >
                                Pay Now
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
