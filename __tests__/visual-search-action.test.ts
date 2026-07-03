import { searchSimilarProducts } from '../lib/actions/visual-search';
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

describe('visual-search actions', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        jest.clearAllMocks();

        // Mock console.log to avoid noise
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    it('should return mock results if keys are missing', async () => {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;

        (generateObject as jest.Mock).mockResolvedValue({ object: { description: 'query' } });
        (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2] });

        const result = await searchSimilarProducts('base64');
        expect(result.length).toBe(2);
        expect(result[0].id).toBe('1');
    });

    it('should search products successfully', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

        (generateObject as jest.Mock).mockResolvedValue({ object: { description: 'query' } });
        (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2] });

        const mockResults = [
            { id: '1', name: 'Product A', description: 'desc', price: 99, image_url: 'urlA', similarity: 0.9 },
        ];

        const mockRpc = jest.fn().mockResolvedValue({ data: mockResults, error: null });
        (createClient as jest.Mock).mockReturnValue({ rpc: mockRpc });

        const result = await searchSimilarProducts('base64');

        expect(result.length).toBe(1);
        expect(result[0].imageUrl).toBe('urlA');
        expect(mockRpc).toHaveBeenCalledWith('search_products', {
            query_embedding: [0.1, 0.2],
            match_threshold: 0.5,
            match_count: 10
        });
    });

    it('should throw error if db search fails', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

        (generateObject as jest.Mock).mockResolvedValue({ object: { description: 'query' } });
        (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2] });

        const mockRpc = jest.fn().mockResolvedValue({ data: null, error: { message: 'db error' } });
        (createClient as jest.Mock).mockReturnValue({ rpc: mockRpc });

        await expect(searchSimilarProducts('base64')).rejects.toThrow('Failed to perform visual search.');
    });

    it('should throw error if generation fails', async () => {
        (generateObject as jest.Mock).mockRejectedValue(new Error('gen error'));

        await expect(searchSimilarProducts('base64')).rejects.toThrow('Failed to perform visual search.');
    });
});
