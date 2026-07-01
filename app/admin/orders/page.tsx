'use client';

import { mockOrders } from '@/lib/db/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminOrdersPage() {
    return (
        <div className="container mx-auto p-4 max-w-4xl pt-8">
            <h1 className="text-3xl font-bold mb-8">Order Management</h1>
            <div className="space-y-4">
                {mockOrders.length > 0 ? (
                    mockOrders.map(order => (
                        <Card key={order.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex justify-between">
                                    <span>Order ID: {order.id}</span>
                                    <span className="text-blue-600">${order.totalAmount.toFixed(2)}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">User ID: {order.userId}</p>
                                <p className="text-sm text-gray-600 capitalize">Status: {order.status}</p>
                                <p className="text-xs text-gray-400 mt-2">Placed: {new Date(order.created_at).toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No orders found.
                    </div>
                )}
            </div>
        </div>
    );
}
