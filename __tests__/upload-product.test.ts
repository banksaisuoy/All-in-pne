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
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-supabase.com';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    });

    describe('generateProductMetadata', () => {
        it('returns generated metadata', async () => {
            (generateObject as jest.Mock).mockResolvedValue({
                object: {
                    name: 'Test Product',
                    description_html: '<p>Test</p>',
                    price: 10,
                    category: 'Test Category',
                    tags: ['test']
                }
            });

            const result = await generateProductMetadata('base64');

            expect(generateObject).toHaveBeenCalled();
            expect(result.name).toBe('Test Product');
        });
    });

    describe('saveProductToDb', () => {
        it('saves product successfully', async () => {
            (embed as jest.Mock).mockResolvedValue({
                embedding: [0.1, 0.2]
            });

            const mockSingle = jest.fn().mockResolvedValue({ error: null, data: { id: 1 } });
            const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
            const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

            (createClient as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    insert: mockInsert
                })
            });

            await expect(saveProductToDb({
                name: 'Test Product',
                description_html: '<p>Test</p>',
                price: 10,
                category: 'Test Category',
                tags: ['test'],
                imageUrl: 'url'
            })).resolves.not.toThrow();

            expect(embed).toHaveBeenCalled();
            expect(mockInsert).toHaveBeenCalled();
        });

        it('throws an error if DB insert fails', async () => {
            (embed as jest.Mock).mockResolvedValue({
                embedding: [0.1, 0.2]
            });

            const mockSingle = jest.fn().mockResolvedValue({ error: new Error('DB Failed') });
            const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
            const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });

            (createClient as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    insert: mockInsert
                })
            });

            await expect(saveProductToDb({
                name: 'Test Product',
                description_html: '<p>Test</p>',
                price: 10,
                category: 'Test Category',
                tags: ['test'],
                imageUrl: 'url'
            })).rejects.toThrow('Failed to save product to database');
        });
    });
});
