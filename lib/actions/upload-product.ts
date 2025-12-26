'use server';

import { generateObject } from 'ai';
import { aiModel } from '@/lib/ai/config';
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

    // Note: We are using process.env here directly for the server action.
    // Ideally use createClient from @supabase/ssr or similar for auth context.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for admin writes if needed, or just standard if using RLS with user context

    // Fallback for demo if keys aren't present to prevent crash in non-configured env
    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn("Supabase keys missing. Simulating DB save.");
        return { success: true, id: 'simulated-id', ...data };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: insertedData, error } = await supabase
        .from('products')
        .insert({
            name: data.name,
            description: data.description,
            description_html: data.description_html,
            price: data.price,
            image_url: data.imageUrl,
            tags: data.tags,
            // embedding: ... (Would generate embedding here in a real scenario using another AI call or DB trigger)
        })
        .select()
        .single();

    if (error) {
        console.error("DB Error:", error);
        throw new Error("Failed to save product to database");
    }

    return { success: true, data: insertedData };
}
