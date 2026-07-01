import { HeroBanner } from '@/components/shop/HeroBanner';
import { ProductCard } from '@/components/shop/ProductCard';
import { mockProducts } from '@/lib/db/mock';

export default function Home() {
  return (
    <div className="p-4 md:p-8">
      <HeroBanner />

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
        <p className="text-muted-foreground">Curated list of our best sellers.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-24 md:pb-8">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
