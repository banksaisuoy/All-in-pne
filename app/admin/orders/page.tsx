'use client';

import { createClient } from '@/lib/db/client';
import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const supabase = createClient();

  const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`
            *,
            profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });
      if (data) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();

    // Realtime subscription for new orders
    const channel = supabase
        .channel('admin-orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
            setOrders(prev => [payload.new, ...prev]);
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
      await supabase.from('orders').update({ status }).eq('id', id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="grid gap-4">
          {orders.map(o => (
              <div key={o.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">#{o.id.slice(0, 8)}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                  {o.status}
                              </span>
                          </div>
                          <p className="text-xs text-gray-500">
                              {new Date(o.created_at).toLocaleString()} • {o.profiles?.email || 'Guest'}
                          </p>
                      </div>
                      <div className="text-right">
                          <p className="font-bold text-lg">${o.total}</p>
                          {o.slip_url && (
                              <a href={o.slip_url} target="_blank" className="text-xs text-orange-600 underline">View Slip</a>
                          )}
                      </div>
                  </div>

                  <div className="flex gap-2 border-t pt-4">
                      {o.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(o.id, 'paid')}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold"
                          >
                              Approve Payment
                          </button>
                      )}
                      {o.status === 'paid' && (
                          <button
                            onClick={() => updateStatus(o.id, 'shipped')}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold"
                          >
                              Ship Order
                          </button>
                      )}
                  </div>
              </div>
          ))}
          {orders.length === 0 && (
              <div className="text-center py-10 text-gray-400">No orders yet.</div>
          )}
      </div>
    </div>
  );
}
