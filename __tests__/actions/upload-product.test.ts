import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';
import { generateObject, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => {
  const selectMock = jest.fn();
  const singleMock = jest.fn();
  const insertMock = jest.fn(() => ({
    select: selectMock.mockReturnValue({
      single: singleMock,
    }),
  }));
  return {
    createClient: jest.fn(() => ({
      from: jest.fn(() => ({
        insert: insertMock,
      })),
    })),
  };
});

describe('upload-product actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateProductMetadata', () => {
    it('returns generated metadata on success', async () => {
      const mockObj = {
        name: 'Test Product',
        description: 'Test Desc',
        description_html: '<p>Test Desc</p>',
        price: 100,
        tags: ['test'],
        color: 'red'
      };
      (generateObject as jest.Mock).mockResolvedValue({ object: mockObj });

      const result = await generateProductMetadata('base64');
      expect(result).toEqual(mockObj);
    });

    it('throws error if generation fails', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('AI failed'));
      await expect(generateProductMetadata('base64')).rejects.toThrow('Failed to generate product metadata.');
    });
  });

  describe('saveProductToDb', () => {
    const mockData = {
      name: 'Test Product',
      description: 'Test Desc',
      description_html: '<p>Test Desc</p>',
      price: 100,
      tags: ['test'],
      color: 'red',
      imageUrl: '/img.jpg'
    };

    it('returns simulated success when keys are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const result = await saveProductToDb(mockData);
      expect(result.success).toBe(true);
      expect(result.embedding_simulated).toBe(true);
    });

    it('saves to database when keys are present', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

      (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2] });

      const client = createClient('','');
      // We know from mock structure that from().insert().select().single() is called.
      // We need to properly mock the nested chain. Let's setup the mock specifically for this test.
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'db-1', ...mockData }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

      (createClient as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await saveProductToDb(mockData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('db-1');
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Product',
        vector_embedding: [0.1, 0.2]
      }));
    });

    it('throws if embedding fails when keys are present', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

      (embed as jest.Mock).mockRejectedValue(new Error('Embed failed'));
      await expect(saveProductToDb(mockData)).rejects.toThrow('Failed to generate vector embedding.');
    });

    it('throws if db insert fails', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

      (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2] });

      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: new Error('DB Error') });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

      (createClient as jest.Mock).mockReturnValue({ from: mockFrom });

      await expect(saveProductToDb(mockData)).rejects.toThrow('Failed to save product to database');
    });
  });
});
