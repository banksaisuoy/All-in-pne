import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';

// Mock the AI generation
jest.mock('ai', () => ({
  generateObject: jest.fn().mockResolvedValue({
    object: {
      name: 'Mock Product',
      description: 'Mock Description',
      description_html: '<p>Mock Description</p>',
      price: 100,
      tags: ['mock', 'product'],
      color: 'red'
    }
  }),
  embed: jest.fn().mockResolvedValue({
    embedding: [0.1, 0.2, 0.3]
  })
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const insertMock = jest.fn().mockReturnThis();
  const selectMock = jest.fn().mockReturnThis();
  const singleMock = jest.fn().mockResolvedValue({
    data: { id: 'test-id', name: 'Mock Product' },
    error: null
  });

  return {
    createClient: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        insert: insertMock,
        select: selectMock,
        single: singleMock,
      })
    })
  };
});

describe('upload-product server actions', () => {
  const mockBase64 = 'data:image/jpeg;base64,mockbase64data';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateProductMetadata', () => {
    it('generates product metadata successfully', async () => {
      const result = await generateProductMetadata(mockBase64);
      expect(result).toEqual({
        name: 'Mock Product',
        description: 'Mock Description',
        description_html: '<p>Mock Description</p>',
        price: 100,
        tags: ['mock', 'product'],
        color: 'red'
      });
    });
  });

  describe('saveProductToDb', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('returns simulated success when supabase keys are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const data = {
        name: 'Mock',
        description: 'Mock',
        description_html: '<p>Mock</p>',
        price: 10,
        tags: ['a'],
        color: 'red',
        imageUrl: 'http://test.com/image.jpg'
      };

      const result = await saveProductToDb(data);
      expect(result).toEqual({
        success: true,
        id: 'simulated-id',
        embedding_simulated: true,
        ...data
      });
    });

    it('saves product to DB successfully when keys are present', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock-supabase.com';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

      const data = {
        name: 'Mock',
        description: 'Mock',
        description_html: '<p>Mock</p>',
        price: 10,
        tags: ['a'],
        color: 'red',
        imageUrl: 'http://test.com/image.jpg'
      };

      const result = await saveProductToDb(data);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
