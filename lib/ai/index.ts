import { google } from '@ai-sdk/google';
import { embed } from 'ai';

// Use Flash for fast tasks (chat, UI text)
export const fastModel = google('gemini-1.5-flash');

// Use Pro for complex tasks (vision, reasoning)
export const smartModel = google('gemini-1.5-pro');

export async function generateEmbedding(text: string) {
  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: text,
  });
  return embedding;
}
