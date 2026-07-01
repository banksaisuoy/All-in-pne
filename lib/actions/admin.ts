'use server';

import { mockProducts, Product, addMockOrder } from '@/lib/db/mock';

export async function getProducts() {
  return mockProducts;
}

export async function deleteProduct(id: string) {
  const index = mockProducts.findIndex(p => p.id === id);
  if (index > -1) {
    mockProducts.splice(index, 1);
  }
  return { success: true };
}

export async function createProduct(product: Omit<Product, 'id'>) {
  const newProduct = {
    ...product,
    id: `PROD-${Math.floor(Math.random() * 10000)}`
  };
  mockProducts.push(newProduct);
  return { success: true, data: newProduct };
}
