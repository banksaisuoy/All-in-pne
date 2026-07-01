import { streamText } from 'ai';
import { aiModel } from '@/lib/ai/config';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response('No image provided', { status: 400 });
  }

  const result = await streamText({
    model: aiModel,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this product image. Write a detailed, high-converting product description including potential name, price, and category. Format it nicely.' },
          { type: 'image', image: prompt }, // The prompt from useCompletion is the base64 image
        ],
      },
    ],
  });

  return result.toDataStreamResponse();
}
