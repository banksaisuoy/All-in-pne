'use client';

import { ProductCard, type ProductProps } from './ProductCard';

interface ProductGridProps {
  title?: string;
  products: ProductProps[];
}

export function ProductGrid({ title, products }: ProductGridProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
