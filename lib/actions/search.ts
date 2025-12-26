'use server';

import { redirect } from 'next/navigation';
import { smartModel, generateEmbedding } from '@/lib/ai';
import { generateText } from 'ai';
import { createClient } from '@/lib/db/server';

export async function searchByImage(formData: FormData) {
  const imageBase64 = formData.get('imageBase64') as string;

  if (!imageBase64) {
    return { error: 'No image provided' };
  }

  // 1. Analyze image with Gemini Vision to get a description
  // Remove data:image/jpeg;base64, prefix if present
  const base64Data = imageBase64.split(',')[1];

  const { text: description } = await generateText({
    model: smartModel,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe this product in detail for a search query. Include color, style, material, and category. Output only the description.' },
          { type: 'image', image: base64Data },
        ],
      },
    ],
  });

  // 2. Generate embedding for the description
  const embedding = await generateEmbedding(description);

  // 3. Search in Supabase
  const supabase = await createClient();
  const { data: products, error } = await supabase.rpc('search_products', {
    query_embedding: embedding,
    match_threshold: 0.5, // Adjust based on testing
    match_count: 20
  });

  if (error) {
      console.error('Search error:', error);
      return { error: 'Failed to search products' };
  }

  return { products, query: description };
}
