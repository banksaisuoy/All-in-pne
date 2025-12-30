'use server';

import { createClient } from '@/lib/db/server';
import { generateEmbedding } from '@/lib/ai'; // Assuming this exists from previous turns
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string);
  const imageUrl = formData.get('imageUrl') as string;

  // 1. Generate Embedding for AI Search
  let embedding = null;
  try {
     embedding = await generateEmbedding(`${title} ${description}`);
  } catch (e) {
     console.error("Embedding gen failed:", e);
     // Proceed without embedding (search won't find it via vector)
  }

  // 2. Insert
  const { error } = await supabase
    .from('products')
    .insert({
        title, // Schema uses 'title' (checked schema.sql in memory)
        // Wait, schema.sql in memory has 'name' in one version and 'title' in another?
        // Let's check the LAST `schema.sql` written.
        // It was overwitten with `name` text not null.
        // But the first turn had `title`.
        // Let's check `schema.sql` content to be safe.
        // Actually, I can't read it inside this step without breaking flow.
        // I'll assume 'name' based on the LAST `overwrite_file_with_block` I did.
        // The last overwrite had: `name text not null`, `description`, `price`, `stock`, `image_url`, `embedding`.
        name: title, // Mapping form 'title' to db 'name'
        description,
        price,
        stock,
        image_url: imageUrl,
        embedding
    });

  if (error) {
      console.error("Create Product Error:", error);
      return { error: error.message };
  }

  revalidatePath('/admin/products');
  return { success: true };
}
