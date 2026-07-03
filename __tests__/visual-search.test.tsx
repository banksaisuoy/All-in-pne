import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '../app/shop/visual-search/page';
import * as visualSearchActions from '../lib/actions/visual-search';

// Mock the action
jest.mock('../lib/actions/visual-search', () => ({
    searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock URL.createObjectURL
        window.URL.createObjectURL = jest.fn(() => 'mock-url');
    });

    it('renders the initial state correctly', () => {
        render(<VisualSearchPage />);
        expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
        expect(screen.getByText('Click or drop image')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
    });

    it('enables the search button when an image is uploaded', async () => {
        render(<VisualSearchPage />);
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled();
        });
    });

    it('shows loading state and calls search action', async () => {
        const mockResults = [
            { id: '1', name: 'Product A', price: 99.99, description: 'Desc A', similarity: 0.95, imageUrl: '/a.png' }
        ];
        (visualSearchActions.searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

        // Mock FileReader
        const mockFileReader = {
            readAsDataURL: jest.fn(),
            result: 'data:image/png;base64,mock',
            onloadend: null as unknown as () => void,
        };
        (window as unknown as Window).FileReader = jest.fn(() => mockFileReader);

        render(<VisualSearchPage />);

        // Upload
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        // Click search
        const searchButton = screen.getByRole('button', { name: /search/i });
        fireEvent.click(searchButton);

        // Simulate FileReader loadend
        mockFileReader.onloadend();

        await waitFor(() => {
            expect(visualSearchActions.searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,mock');
            expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
            expect(screen.getByText('Product A')).toBeInTheDocument();
        });
    });
});
