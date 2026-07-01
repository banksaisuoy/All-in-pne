import { generateProductMetadata } from '@/lib/actions/upload-product';
import { generateObject } from 'ai';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn()
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('upload-product errors', () => {
  it('generateProductMetadata handles generation error', async () => {
    (generateObject as jest.Mock).mockRejectedValue(new Error('AI Service Offline'));
    await expect(generateProductMetadata('base64')).rejects.toThrow('Failed to generate product metadata.');
  });
});
