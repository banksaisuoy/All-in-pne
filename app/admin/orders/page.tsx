'use client';

import { useState, useEffect } from 'react';
import { mockOrders, Order } from '@/lib/db/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // In a real app, this would be a Supabase Realtime subscription
    // For mock, we just poll the mock array every 2 seconds to simulate realtime
    const interval = setInterval(() => {
        setOrders([...mockOrders].reverse());
    }, 2000);

    // Initial load
    setOrders([...mockOrders].reverse());

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Live Orders</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Live Updates
            </div>
        </CardHeader>
        <CardContent>
            {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono font-medium">{order.id}</span>
                                    <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                                        {order.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(order.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="text-xl font-bold text-right">
                                ${order.totalAmount.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
