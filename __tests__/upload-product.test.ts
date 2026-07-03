import { generateProductMetadata } from '@/lib/actions/upload-product';
import { generateObject } from 'ai';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
}));

describe('generateProductMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call generateObject and return metadata', async () => {
    (generateObject as jest.Mock).mockResolvedValue({
      object: {
        name: 'Mock Product',
        description_html: '<p>Mock</p>',
        category: 'Electronics',
        price: 99.99,
        tags: ['mock', 'test']
      },
    });

    const metadata = await generateProductMetadata('mock-base64-image');
    expect(metadata.name).toBe('Mock Product');
    expect(metadata.price).toBe(99.99);
  });
});
