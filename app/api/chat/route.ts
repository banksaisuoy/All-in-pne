import { streamText } from 'ai';
import { aiModel } from '@/lib/ai/config';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: aiModel,
    messages,
    system: "You are a helpful Personal Shopper for the OmniFlow e-commerce store. Be polite, concise, and help users find products or answer their questions about shopping.",
  });

  return result.toDataStreamResponse();
}
