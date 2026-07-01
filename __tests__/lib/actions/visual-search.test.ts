import { searchSimilarProducts } from '@/lib/actions/visual-search';
import { generateObject, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn()
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('visual-search actions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('handles fallback logic if supabase fails', async () => {
     (generateObject as jest.Mock).mockResolvedValue({
      object: {
        description: 'A test product'
      }
    });

    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3]
    });

    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';

    const results = await searchSimilarProducts('base64');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Mock');
  });

  it('handles supabase success', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

    (generateObject as jest.Mock).mockResolvedValue({
      object: { description: 'A test product' }
    });

    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3]
    });

    const mockRpc = jest.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Product A', description: 'desc', price: 10, image_url: '/img.png', similarity: 0.9 }
      ],
      error: null
    });

    (createClient as jest.Mock).mockReturnValue({
      rpc: mockRpc
    });

    const results = await searchSimilarProducts('base64');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Product A');
  });

  it('handles supabase error', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

    (generateObject as jest.Mock).mockResolvedValue({
      object: { description: 'A test product' }
    });

    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3]
    });

    const mockRpc = jest.fn().mockResolvedValue({
      data: null,
      error: new Error('DB Error')
    });

    (createClient as jest.Mock).mockReturnValue({
      rpc: mockRpc
    });

    await expect(searchSimilarProducts('base64')).rejects.toThrow('Failed to perform visual search.');
  });
});
