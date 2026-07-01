import { ProductCard } from '@/components/shop/ProductCard';
import { mockProducts } from '@/lib/db/mock';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';

  const results = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.description.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          {q ? `Showing results for "${q}"` : 'Showing all products'}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-24 md:pb-8">
            {results.map((product) => (
            <ProductCard key={product.id} product={product} />
            ))}
        </div>
      )}
    </div>
  );
}
