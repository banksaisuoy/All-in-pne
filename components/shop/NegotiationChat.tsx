'use client';

import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NegotiationChat({ productId, price }: { productId: string, price: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
      { role: 'ai', text: "Hi! Interested in this item? I might have a special deal for you." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
      if (!input.trim()) return;
      const userMsg = input;
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setInput('');
      setLoading(true);

      try {
          const res = await fetch('/api/ai/negotiate', {
              method: 'POST',
              body: JSON.stringify({ message: userMsg, productId, currentPrice: price })
          });
          const data = await res.json();
          setMessages(prev => [...prev, { role: 'ai', text: data.reply || "Thinking..." }]);
      } catch (e) {
          setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I lost connection." }]);
      } finally {
          setLoading(false);
      }
  };

  return (
    <>
        <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 bg-orange-600 text-white p-4 rounded-full shadow-lg z-40 hover:scale-110 transition-transform"
        >
            <MessageSquare className="w-6 h-6" />
        </button>

        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-24 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-orange-200 overflow-hidden z-50 flex flex-col h-96"
                >
                    <div className="bg-orange-600 p-3 text-white font-bold flex justify-between items-center">
                        <span>AI Negotiator</span>
                        <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-orange-100 text-orange-900' : 'bg-white border text-gray-800 shadow-sm'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs text-gray-400 animate-pulse ml-2">Typing...</div>}
                    </div>

                    <div className="p-3 bg-white border-t flex gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Offer a price..."
                            className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 text-black"
                        />
                        <button onClick={sendMessage} className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  );
}
