import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VisualSearchPage from '@/app/shop/visual-search/page';
import { searchSimilarProducts } from '@/lib/actions/visual-search';

// Mock dependencies
jest.mock('@/lib/actions/visual-search', () => ({
    searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.URL.createObjectURL = jest.fn(() => 'blob:test-url') as any;
    });

    it('renders the initial state correctly', () => {
        render(<VisualSearchPage />);

        expect(screen.getByText('Snap to Shop')).toBeTruthy();
        expect(screen.getByText('Find Similar Items')).toBeTruthy();
        expect(screen.getByText('Click or drop image')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
        expect(screen.getByText('Results will appear here')).toBeTruthy();
    });

    it('updates preview when file is selected', async () => {
        render(<VisualSearchPage />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Click or drop image');

        fireEvent.change(input, { target: { files: [file] } });

        const preview = await screen.findByAltText('Preview');
        expect(preview).toBeTruthy();
        expect(preview.getAttribute('src')).toContain('blob:test-url');

        expect(screen.getByRole('button', { name: 'Search' })).not.toBeDisabled();
    });

    it('handles search success and displays results', async () => {
        const mockResults = [
            { id: '1', name: 'Product 1', description: 'Desc 1', price: 10, imageUrl: '/img1.png', similarity: 0.95 },
            { id: '2', name: 'Product 2', description: 'Desc 2', price: 20, imageUrl: '/img2.png', similarity: 0.85 },
        ];
        (searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

        window.FileReader = jest.fn().mockImplementation(() => {
            const reader = {
                result: '',
                onloadend: null as any,
                readAsDataURL: jest.fn().mockImplementation(function(this: any) {
                    reader.result = 'data:image/png;base64,testbase64';
                    setTimeout(() => {
                       if (reader.onloadend) reader.onloadend();
                    }, 0);
                }),
            };
            return reader;
        }) as any;

        render(<VisualSearchPage />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Click or drop image');
        fireEvent.change(input, { target: { files: [file] } });

        const searchButton = screen.getByRole('button', { name: 'Search' });
        await waitFor(() => expect(searchButton).not.toBeDisabled());
        fireEvent.click(searchButton);

        expect(screen.getByText('Searching...')).toBeTruthy();

        await waitFor(() => {
            expect(searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,testbase64');
        });

        await waitFor(() => {
            expect(screen.getByText('Found 2 matches')).toBeTruthy();
            expect(screen.getByText('Product 1')).toBeTruthy();
            expect(screen.getByText('Product 2')).toBeTruthy();
            expect(screen.getByText('95% Match')).toBeTruthy();
            expect(screen.getByText('85% Match')).toBeTruthy();
        });
    });

    it('handles search error correctly', async () => {
        (searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('Search Error'));

        window.FileReader = jest.fn().mockImplementation(() => {
            const reader = {
                result: '',
                onloadend: null as any,
                readAsDataURL: jest.fn().mockImplementation(function(this: any) {
                    reader.result = 'data:image/png;base64,testbase64';
                    setTimeout(() => {
                       if (reader.onloadend) reader.onloadend();
                    }, 0);
                }),
            };
            return reader;
        }) as any;

        render(<VisualSearchPage />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Click or drop image');
        fireEvent.change(input, { target: { files: [file] } });

        const searchButton = screen.getByRole('button', { name: 'Search' });
        await waitFor(() => expect(searchButton).not.toBeDisabled());
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to find similar products. Please try again.')).toBeTruthy();
        });
    });
});
