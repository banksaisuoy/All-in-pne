'use server';

import { generateObject, embed } from 'ai';
import { aiModel, embeddingModel } from '@/lib/ai/config';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Define the schema for the AI output
const productMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  description_html: z.string().describe('HTML formatted description with h3, p, ul tags'),
  price: z.number(),
  tags: z.array(z.string()),
  color: z.string(),
});

export type ProductMetadata = z.infer<typeof productMetadataSchema>;

export async function generateProductMetadata(imageBase64: string): Promise<ProductMetadata> {
  try {
    // 1. Generate Metadata with Gemini Vision (Base64 handling ensures privacy/no public URL needed)
    const { object } = await generateObject({
      model: aiModel,
      schema: productMetadataSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this product image. Identify the product, create a high-converting SEO description (HTML format), suggest a market price, and generate tags.' },
            { type: 'image', image: imageBase64 },
          ],
        },
      ],
    });

    return object;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('Failed to generate product metadata.');
  }
}

export async function saveProductToDb(data: ProductMetadata & { imageUrl: string }) {
    // In a real app, we would use the server-side supabase client with service role for admin tasks
    // verifying permissions. For this demo, we assume the environment is set up.

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for admin writes

    // Fallback for demo if keys aren't present
    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn("Supabase keys missing. Simulating DB save with embedding.");
        return { success: true, id: 'simulated-id', ...data, embedding_simulated: true };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Generate Vector Embedding using text-embedding-004
    // We combine name, description, and tags for a rich semantic representation
    const textToEmbed = `${data.name} ${data.description} ${data.tags.join(' ')}`;

    let embedding: number[] = [];
    try {
        const { embedding: generatedEmbedding } = await embed({
            model: embeddingModel,
            value: textToEmbed,
        });
        embedding = generatedEmbedding;
    } catch (error) {
        console.error("Embedding Generation Error:", error);
        // We might choose to proceed without embedding or fail hard.
        // For a "God Mode" system, we likely want to fail or retry, but here we'll throw.
        throw new Error("Failed to generate vector embedding.");
    }

    // 3. Save to Supabase (Transactional atomic insert logic via single query)
    const { data: insertedData, error } = await supabase
        .from('products')
        .insert({
            name: data.name,
            description: data.description,
            description_html: data.description_html,
            price: data.price,
            image_url: data.imageUrl,
            tags: data.tags,
            vector_embedding: embedding, // Save the vector
        })
        .select()
        .single();

    if (error) {
        console.error("DB Error:", error);
        throw new Error("Failed to save product to database");
    }

    return { success: true, data: insertedData };
}
