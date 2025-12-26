import { google } from '@ai-sdk/google';

export const aiModel = google('models/gemini-1.5-flash-latest');
export const embeddingModel = google.textEmbeddingModel('text-embedding-004');
