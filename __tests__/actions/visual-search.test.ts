import { searchSimilarProducts } from '@/lib/actions/visual-search';
import { generateObject, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => {
  const rpcMock = jest.fn();
  return {
    createClient: jest.fn(() => ({
      rpc: rpcMock,
    })),
  };
});

describe('visual-search action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns mock results when supabase keys are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    (generateObject as jest.Mock).mockResolvedValue({
      object: { description: 'test query' }
    });
    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3]
    });

    const results = await searchSimilarProducts('base64image');
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
  });

  it('returns data from supabase when keys are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

    (generateObject as jest.Mock).mockResolvedValue({
      object: { description: 'test query' }
    });
    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3]
    });

    const mockRpc = jest.fn().mockResolvedValue({
      data: [
        { id: '10', name: 'Real Product', description: 'Desc', price: 10, image_url: '/img.jpg', similarity: 0.99 }
      ],
      error: null
    });

    (createClient as jest.Mock).mockReturnValue({
      rpc: mockRpc
    });

    const results = await searchSimilarProducts('base64image');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('10');
    expect(mockRpc).toHaveBeenCalledWith('search_products', {
      query_embedding: [0.1, 0.2, 0.3],
      match_threshold: 0.5,
      match_count: 10
    });
  });

  it('throws an error if ai generation fails', async () => {
    (generateObject as jest.Mock).mockRejectedValue(new Error('AI failed'));

    await expect(searchSimilarProducts('base64image')).rejects.toThrow('Failed to perform visual search.');
  });
});
