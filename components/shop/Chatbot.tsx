'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
            "fixed bottom-20 md:bottom-6 right-4 md:right-6 rounded-full w-14 h-14 shadow-lg z-40",
            isOpen && "hidden"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 w-80 md:w-96 bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 h-[500px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-medium">
                <Bot className="w-5 h-5" />
                Personal Shopper
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/90">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground mt-8 text-sm">
                    Hi! I'm your AI shopping assistant. How can I help you today?
                </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                    "flex gap-3 max-w-[85%]",
                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                    "p-3 rounded-2xl text-sm",
                    m.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                         <Bot className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-sm text-sm flex gap-1 items-center">
                        <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                        <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t bg-muted/30 flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about products..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
