import { searchSimilarProducts } from '../lib/actions/visual-search';
import { generateObject, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

// Mock the 'ai' module
jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn(),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('searchSimilarProducts action', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return mock results if Supabase keys are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    (generateObject as jest.Mock).mockResolvedValue({
      object: { description: 'A red t-shirt' },
    });
    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3],
    });

    const results = await searchSimilarProducts('base64image');

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
    expect(createClient).not.toHaveBeenCalled();
  });

  it('should call Supabase and return mapped results on success', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret';

    (generateObject as jest.Mock).mockResolvedValue({
      object: { description: 'A red t-shirt' },
    });
    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3],
    });

    const mockRpc = jest.fn().mockResolvedValue({
      data: [
        {
          id: '123',
          name: 'Real Product',
          description: 'It is real',
          price: 20,
          image_url: '/real.jpg',
          similarity: 0.99,
        },
      ],
      error: null,
    });

    (createClient as jest.Mock).mockReturnValue({
      rpc: mockRpc,
    });

    const results = await searchSimilarProducts('base64image');

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('123');
    expect(results[0].imageUrl).toBe('/real.jpg');
    expect(mockRpc).toHaveBeenCalledWith('search_products', {
      query_embedding: [0.1, 0.2, 0.3],
      match_threshold: 0.5,
      match_count: 10,
    });
  });

  it('should throw an error if Supabase RPC fails', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret';

    (generateObject as jest.Mock).mockResolvedValue({
      object: { description: 'A red t-shirt' },
    });
    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3],
    });

    const mockRpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    (createClient as jest.Mock).mockReturnValue({
      rpc: mockRpc,
    });

    await expect(searchSimilarProducts('base64image')).rejects.toThrow('Failed to perform visual search.');
  });

  it('should throw an error if AI generation fails', async () => {
    (generateObject as jest.Mock).mockRejectedValue(new Error('AI failed'));

    await expect(searchSimilarProducts('base64image')).rejects.toThrow('Failed to perform visual search.');
  });
});
