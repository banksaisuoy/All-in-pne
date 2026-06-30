'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ProductProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string;
  rating?: number;
}

export function ProductCard({ name, price, imageUrl, category, rating = 4.5 }: ProductProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border"
    >
      <div className="aspect-[4/5] relative bg-muted overflow-hidden">
        {/* Placeholder for actual Next.js Image */}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
           <img
              src={imageUrl}
              alt={name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x500?text=Product+Image';
              }}
           />
        </div>

        {/* Quick actions overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <Button className="w-full rounded-full shadow-lg backdrop-blur-md bg-background/90 text-foreground hover:bg-background">
            <ShoppingBag className="w-4 h-4 mr-2" /> Quick Add
          </Button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {category && (
          <span className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
            {category}
          </span>
        )}
        <h3 className="font-semibold text-base line-clamp-2 mb-2">
          {name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold">
            ${price.toFixed(2)}
          </span>
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="w-3.5 h-3.5 fill-primary text-primary mr-1" />
            {rating}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
