'use server';

import { generateObject, embed } from 'ai';
import { aiModel, embeddingModel } from '@/lib/ai/config';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Define the schema for the AI output
const productDescriptionSchema = z.object({
  description: z.string().describe('A detailed visual description of the product in the image, focusing on key features, style, and category.'),
});

export type SearchResult = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  similarity: number;
};

interface SupabaseSearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  similarity: number;
}

export async function searchSimilarProducts(imageBase64: string): Promise<SearchResult[]> {
  try {
    // 1. Analyze Image with Gemini Vision to get a text description
    const { object } = await generateObject({
      model: aiModel,
      schema: productDescriptionSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this product in detail for a visual search query. Focus on visual characteristics like color, shape, style, material, and category.' },
            { type: 'image', image: imageBase64 },
          ],
        },
      ],
    });

    const queryText = object.description;
    console.log("Visual Search Query:", queryText);

    // 2. Generate Vector Embedding for the description
    const { embedding } = await embed({
      model: embeddingModel,
      value: queryText,
    });

    // 3. Query Supabase using vector similarity
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Fallback for demo
    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn("Supabase keys missing. Returning mock results.");
        return [
            { id: '1', name: 'Mock Product 1', description: 'Similar product found', price: 99.99, imageUrl: '/mock1.jpg', similarity: 0.95 },
            { id: '2', name: 'Mock Product 2', description: 'Another similar product', price: 49.99, imageUrl: '/mock2.jpg', similarity: 0.88 },
        ];
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: searchResults, error } = await supabase.rpc('search_products', {
        query_embedding: embedding,
        match_threshold: 0.5, // Adjust as needed
        match_count: 10
    });

    if (error) {
        console.error("Supabase Search Error:", error);
        throw new Error("Failed to search products.");
    }

    return searchResults.map((item: SupabaseSearchResult) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        similarity: item.similarity
    }));

  } catch (error) {
    console.error('Visual Search Error:', error);
    throw new Error('Failed to perform visual search.');
  }
}
