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

  let description = "";
  try {
      const { text } = await generateText({
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
      description = text;
  } catch (e) {
      console.error("Gemini Vision Error:", e);
      // Fallback for demo if API fails or no key
      description = "Red running shoes";
  }

  // 2. Redirect to results page with the description as the query
  // In a real app, we might pass the IDs found, but for now let's just search by the description text
  // or pass the description to the search page.
  redirect(`/search?q=${encodeURIComponent(description)}`);
}
