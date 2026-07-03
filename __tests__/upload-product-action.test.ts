import { generateProductMetadata, saveProductToDb } from '../lib/actions/upload-product';
import { generateObject, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('../lib/ai/config', () => ({
    aiModel: 'mock-ai-model',
    embeddingModel: 'mock-embedding-model'
}));

describe('upload-product actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateProductMetadata', () => {
    it('should generate product metadata successfully', async () => {
      const mockObject = {
        name: 'Mock Product',
        description: 'Desc',
        description_html: '<p>Desc</p>',
        price: 99.99,
        tags: ['tag1'],
        color: 'red'
      };

      (generateObject as jest.Mock).mockResolvedValue({ object: mockObject });

      const result = await generateProductMetadata('base64data');

      expect(result).toEqual(mockObject);
      expect(generateObject).toHaveBeenCalled();
    });

    it('should handle errors during generation', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('Generation failed'));

      await expect(generateProductMetadata('base64data')).rejects.toThrow('Failed to generate product metadata.');
    });
  });

  describe('saveProductToDb', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should simulate db save if keys are missing', async () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;

        const data = {
            name: 'Mock',
            description: 'Desc',
            description_html: '<p>Desc</p>',
            price: 99,
            tags: ['tag1'],
            color: 'blue',
            imageUrl: 'url'
        };

        const result = await saveProductToDb(data);

        expect(result.success).toBe(true);
        expect(result.embedding_simulated).toBe(true);
    });

    it('should save to db successfully with keys', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

        const mockEmbedding = [0.1, 0.2, 0.3];
        (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null });

        const mockSupabaseClient = {
            from: jest.fn().mockReturnValue({
                insert: mockInsert,
                select: mockSelect,
                single: mockSingle,
            })
        };

        (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

        const data = {
            name: 'Mock',
            description: 'Desc',
            description_html: '<p>Desc</p>',
            price: 99,
            tags: ['tag1'],
            color: 'blue',
            imageUrl: 'url'
        };

        const result = await saveProductToDb(data);

        expect(embed).toHaveBeenCalled();
        expect(createClient).toHaveBeenCalled();
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
        expect(mockInsert).toHaveBeenCalledWith({
            name: data.name,
            description: data.description,
            description_html: data.description_html,
            price: data.price,
            image_url: data.imageUrl,
            tags: data.tags,
            vector_embedding: mockEmbedding,
        });
        expect(result.success).toBe(true);
        expect(result.data).toEqual({ id: 'mock-id' });
    });

    it('should throw error if embedding fails', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

        (embed as jest.Mock).mockRejectedValue(new Error('Embedding failed'));

        const data = {
            name: 'Mock',
            description: 'Desc',
            description_html: '<p>Desc</p>',
            price: 99,
            tags: ['tag1'],
            color: 'blue',
            imageUrl: 'url'
        };

        await expect(saveProductToDb(data)).rejects.toThrow('Failed to generate vector embedding.');
    });

    it('should throw error if db save fails', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

        const mockEmbedding = [0.1, 0.2, 0.3];
        (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockReturnThis();
        const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        const mockSupabaseClient = {
            from: jest.fn().mockReturnValue({
                insert: mockInsert,
                select: mockSelect,
                single: mockSingle,
            })
        };

        (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

        const data = {
            name: 'Mock',
            description: 'Desc',
            description_html: '<p>Desc</p>',
            price: 99,
            tags: ['tag1'],
            color: 'blue',
            imageUrl: 'url'
        };

        await expect(saveProductToDb(data)).rejects.toThrow('Failed to save product to database');
    });
  });
});
