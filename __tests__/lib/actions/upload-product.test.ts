import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';
import { generateObject, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn()
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
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

  it('generateProductMetadata calls generateObject', async () => {
    (generateObject as jest.Mock).mockResolvedValue({
      object: {
        name: 'Test Product',
        description: 'Test Desc',
        description_html: '<p>Test Desc</p>',
        price: 10,
        tags: ['test'],
        color: 'red'
      }
    });

    const result = await generateProductMetadata('base64');
    expect(result.name).toBe('Test Product');
    expect(generateObject).toHaveBeenCalled();
  });

  it('saveProductToDb handles missing keys and returns fallback', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.SUPABASE_SERVICE_ROLE_KEY = '';

    const data = {
      name: 'Test Product',
      description: 'Test Desc',
      description_html: '<p>Test Desc</p>',
      price: 10,
      tags: ['test'],
      color: 'red',
      imageUrl: '/img.png'
    };

    const result = await saveProductToDb(data);
    expect(result.success).toBe(true);
    expect((result as unknown).id).toBe('simulated-id');
    expect((result as unknown).embedding_simulated).toBe(true);
  });

  it('saveProductToDb handles embedding error', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

    (embed as jest.Mock).mockRejectedValue(new Error('Embedding failed'));

    const data = {
      name: 'Test Product',
      description: 'Test Desc',
      description_html: '<p>Test Desc</p>',
      price: 10,
      tags: ['test'],
      color: 'red',
      imageUrl: '/img.png'
    };

    await expect(saveProductToDb(data)).rejects.toThrow('Failed to generate vector embedding.');
  });

  it('saveProductToDb handles supabase success', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

    (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2] });

    const mockSingle = jest.fn().mockResolvedValue({
      data: { id: 'real-id' },
      error: null
    });

    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom
    });

    const data = {
      name: 'Test Product',
      description: 'Test Desc',
      description_html: '<p>Test Desc</p>',
      price: 10,
      tags: ['test'],
      color: 'red',
      imageUrl: '/img.png'
    };

    const result = await saveProductToDb(data);
    expect(result.success).toBe(true);
    expect((result as unknown).data).toEqual({ id: 'real-id' });
  });

  it('saveProductToDb handles supabase error', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';

    (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2] });

    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: new Error('DB error')
    });

    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom
    });

    const data = {
      name: 'Test Product',
      description: 'Test Desc',
      description_html: '<p>Test Desc</p>',
      price: 10,
      tags: ['test'],
      color: 'red',
      imageUrl: '/img.png'
    };

    await expect(saveProductToDb(data)).rejects.toThrow('Failed to save product to database');
  });
});
