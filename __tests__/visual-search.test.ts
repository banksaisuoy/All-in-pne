import { searchSimilarProducts } from '@/lib/actions/visual-search';

jest.mock('ai', () => ({
  generateObject: jest.fn().mockResolvedValue({
    object: {
      description: 'A mock visual description'
    }
  }),
  embed: jest.fn().mockResolvedValue({
    embedding: [0.1, 0.2, 0.3]
  })
}));

jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn().mockReturnValue({
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'mock-id-1',
            name: 'DB Product 1',
            description: 'Desc 1',
            price: 50,
            image_url: '/mock1.jpg',
            similarity: 0.99
          }
        ],
        error: null
      })
    })
  };
});

describe('visual-search server actions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns mock results if supabase keys are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const result = await searchSimilarProducts('mock-base64');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
  });

  it('queries database and formats results if keys are present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock-supabase.com';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

    const result = await searchSimilarProducts('mock-base64');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('mock-id-1');
    expect(result[0].name).toBe('DB Product 1');
    expect(result[0].imageUrl).toBe('/mock1.jpg');
  });
});
