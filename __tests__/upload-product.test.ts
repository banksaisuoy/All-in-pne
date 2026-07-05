import { generateProductMetadata, saveProductToDb } from '../lib/actions/upload-product';
import { generateObject, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('upload-product actions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateProductMetadata', () => {
    it('should call generateObject and return the parsed metadata', async () => {
      const mockObject = {
        name: 'Cool Product',
        description: 'It is very cool',
        description_html: '<h3>Cool</h3>',
        price: 99,
        tags: ['cool'],
        color: 'red',
      };

      (generateObject as jest.Mock).mockResolvedValue({
        object: mockObject,
      });

      const result = await generateProductMetadata('base64');
      expect(result).toEqual(mockObject);
      expect(generateObject).toHaveBeenCalled();
    });

    it('should throw an error if generateObject fails', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('AI failed'));

      await expect(generateProductMetadata('base64')).rejects.toThrow('Failed to generate product metadata.');
    });
  });

  describe('saveProductToDb', () => {
    const mockData = {
      name: 'Cool Product',
      description: 'It is very cool',
      description_html: '<h3>Cool</h3>',
      price: 99,
      tags: ['cool'],
      color: 'red',
      imageUrl: '/image.jpg',
    };

    it('should simulate saving to DB if keys are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const result = await saveProductToDb(mockData);

      expect(result.success).toBe(true);
      expect(result.id).toBe('simulated-id');
      expect(result.embedding_simulated).toBe(true);
      expect(createClient).not.toHaveBeenCalled();
    });

    it('should generate embeddings and save to Supabase successfully', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret';

      (embed as jest.Mock).mockResolvedValue({
        embedding: [0.1, 0.2, 0.3],
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...mockData, id: 'inserted-id' },
        error: null,
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({ insert: mockInsert }),
      });

      const result = await saveProductToDb(mockData);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('inserted-id');
      expect(embed).toHaveBeenCalledWith(expect.objectContaining({
        value: expect.stringContaining('Cool Product It is very cool cool'),
      }));
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Cool Product',
        vector_embedding: [0.1, 0.2, 0.3],
      }));
    });

    it('should throw an error if embed fails', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret';

      (embed as jest.Mock).mockRejectedValue(new Error('Embed failed'));

      await expect(saveProductToDb(mockData)).rejects.toThrow('Failed to generate vector embedding.');
    });

    it('should throw an error if DB insert fails', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret';

      (embed as jest.Mock).mockResolvedValue({
        embedding: [0.1, 0.2, 0.3],
      });

      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({ insert: mockInsert }),
      });

      await expect(saveProductToDb(mockData)).rejects.toThrow('Failed to save product to database');
    });
  });
});
