import { searchSimilarProducts } from '@/lib/actions/visual-search';
import { generateObject, embed } from 'ai';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  embed: jest.fn(),
}));

describe('searchSimilarProducts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle mock scenario when keys are missing', async () => {
    (generateObject as jest.Mock).mockResolvedValue({
      object: { description: 'A red shirt' },
    });
    (embed as jest.Mock).mockResolvedValue({
      embedding: [0.1, 0.2, 0.3],
    });

    const results = await searchSimilarProducts('mock-base64-image');
    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Mock Product 1');
  });
});
