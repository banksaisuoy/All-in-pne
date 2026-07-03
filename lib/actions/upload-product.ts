'use server';

import { generateObject, embed } from 'ai';
import { aiModel, embeddingModel } from '@/lib/ai/config';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Define the schema for the AI output
const productMetadataSchema = z.object({
    name: z.string().describe('A catchy, SEO-friendly name for the product.'),
    description: z.string().describe('A short, plain-text description of the product.'),
    description_html: z.string().describe('A detailed, HTML-formatted description of the product. Use <p>, <ul>, <li>.'),
    category: z.string().describe('The main category for the product (e.g., Electronics, Home, Fashion).'),
    price: z.number().describe('A suggested retail price in USD.'),
    tags: z.array(z.string()).describe('An array of 3-5 relevant tags for searchability.'),
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
                        { type: 'text', text: 'Analyze this image and generate comprehensive product metadata for an e-commerce store.' },
                        { type: 'image', image: imageBase64 },
                    ],
                },
            ],
        });

        return object;
    } catch (error) {
        console.error("Failed to generate metadata:", error);
        throw new Error("AI analysis failed.");
    }
}

export async function saveProductToDb(product: ProductMetadata & { imageUrl: string }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn("Supabase keys missing. Mocking db save.");
        // Mock save delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, id: 'mock-id' };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate embedding for semantic search
    const embeddingText = `${product.name} ${product.category} ${product.tags.join(' ')}`;
    const { embedding } = await embed({
        model: embeddingModel,
        value: embeddingText,
    });

    const { data, error } = await supabase
        .from('products')
        .insert([
            {
                name: product.name,
                description: product.description,
                description_html: product.description_html,
                price: product.price,
                image_url: product.imageUrl,
                tags: product.tags,
                vector_embedding: embedding
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Supabase insert error:", error);
        throw new Error("Failed to save to database.");
    }

    return { success: true, id: data.id };
}
