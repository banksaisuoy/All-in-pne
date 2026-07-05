import { searchSimilarProducts } from '../lib/actions/visual-search';
import { generateObject, embed } from 'ai';
import { createClient } from '@supabase/supabase-js';

jest.mock('ai', () => ({
    generateObject: jest.fn(),
    embed: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(),
}));

describe('searchSimilarProducts action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-supabase.com';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    });

    it('returns expected search results', async () => {
        (generateObject as jest.Mock).mockResolvedValue({
            object: { description: 'A red t-shirt' }
        });

        (embed as jest.Mock).mockResolvedValue({
            embedding: [0.1, 0.2, 0.3]
        });

        const mockRpc = jest.fn().mockResolvedValue({
            data: [
                {
                    id: '1',
                    name: 'Red Tee',
                    description: 'Nice red tee',
                    price: 20,
                    image_url: 'http://test.com/red.jpg',
                    similarity: 0.95
                }
            ],
            error: null
        });

        (createClient as jest.Mock).mockReturnValue({
            rpc: mockRpc
        });

        const results = await searchSimilarProducts('base64image');

        expect(generateObject).toHaveBeenCalled();
        expect(embed).toHaveBeenCalledWith(expect.objectContaining({ value: 'A red t-shirt' }));
        expect(mockRpc).toHaveBeenCalledWith('search_products', expect.any(Object));

        expect(results).toEqual([
            {
                id: '1',
                name: 'Red Tee',
                description: 'Nice red tee',
                price: 20,
                imageUrl: 'http://test.com/red.jpg',
                similarity: 0.95
            }
        ]);
    });

    it('throws error when supabase query fails', async () => {
        (generateObject as jest.Mock).mockResolvedValue({
            object: { description: 'A red t-shirt' }
        });

        (embed as jest.Mock).mockResolvedValue({
            embedding: [0.1, 0.2, 0.3]
        });

        const mockRpc = jest.fn().mockResolvedValue({
            data: null,
            error: new Error('DB error')
        });

        (createClient as jest.Mock).mockReturnValue({
            rpc: mockRpc
        });

        await expect(searchSimilarProducts('base64image')).rejects.toThrow('Failed to perform visual search.');
    });
});
