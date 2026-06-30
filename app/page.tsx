import { HeroBanner } from '@/components/shop/HeroBanner';
import { ProductGrid } from '@/components/shop/ProductGrid';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    price: 299.99,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Electronics',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Minimalist Mechanical Keyboard',
    price: 149.50,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    category: 'Accessories',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Ceramic Pour-Over Coffee Maker',
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
    category: 'Home & Kitchen',
    rating: 4.6,
  },
  {
    id: '4',
    name: 'Ergonomic Office Chair',
    price: 399.00,
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80',
    category: 'Furniture',
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Smart Fitness Watch',
    price: 199.99,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    category: 'Wearables',
    rating: 4.7,
  },
  {
    id: '6',
    name: 'Organic Cotton T-Shirt',
    price: 28.00,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    category: 'Apparel',
    rating: 4.4,
  },
  {
    id: '7',
    name: 'Stainless Steel Water Bottle',
    price: 35.00,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    category: 'Accessories',
    rating: 4.8,
  },
  {
    id: '8',
    name: 'Leather Weekend Duffel',
    price: 215.00,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    category: 'Travel',
    rating: 4.9,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen pb-10">
      <HeroBanner />
      <ProductGrid title="Trending Now" products={MOCK_PRODUCTS} />
    </div>
  );
}
