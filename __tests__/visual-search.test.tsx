import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '../app/shop/visual-search/page';
import { searchSimilarProducts } from '@/lib/actions/visual-search';

// Mock the server actions
jest.mock('@/lib/actions/visual-search', () => ({
    searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    });

    it('renders the initial state correctly', () => {
        render(<VisualSearchPage />);
        expect(screen.getByText('Find Similar Items')).toBeInTheDocument();
        expect(screen.getByText('Results will appear here')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Search/i })).toBeDisabled();
    });

    it('enables the search button when a file is selected', async () => {
        render(<VisualSearchPage />);

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Search/i })).not.toBeDisabled();
        });
    });

    it('calls searchSimilarProducts when search is clicked and renders results', async () => {
        const mockResults = [
            { id: '1', name: 'Mock Product 1', description: 'Similar product found', price: 99.99, imageUrl: '/mock1.jpg', similarity: 0.95 },
            { id: '2', name: 'Mock Product 2', description: 'Another similar product', price: 49.99, imageUrl: '/mock2.jpg', similarity: 0.88 },
        ];
        (searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

        render(<VisualSearchPage />);

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        // Mock FileReader
        const mockFileReader = {
            readAsDataURL: jest.fn(),
            onloadend: null as any,
            result: 'data:image/png;base64,mockbase64'
        };
        window.FileReader = jest.fn(() => mockFileReader) as any;

        const searchButton = screen.getByRole('button', { name: /Search/i });
        fireEvent.click(searchButton);

        // Trigger the onloadend
        await waitFor(() => {
            mockFileReader.onloadend();
        });

        await waitFor(() => {
            expect(searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
            expect(screen.getByText('Found 2 matches')).toBeInTheDocument();
            expect(screen.getByText('Mock Product 1')).toBeInTheDocument();
            expect(screen.getByText('Mock Product 2')).toBeInTheDocument();
        });
    });

    it('displays error message on search failure', async () => {
        (searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('Search failed'));

        render(<VisualSearchPage />);

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        // Mock FileReader
        const mockFileReader = {
            readAsDataURL: jest.fn(),
            onloadend: null as any,
            result: 'data:image/png;base64,mockbase64'
        };
        window.FileReader = jest.fn(() => mockFileReader) as any;

        const searchButton = screen.getByRole('button', { name: /Search/i });
        fireEvent.click(searchButton);

        await waitFor(() => {
            mockFileReader.onloadend();
        });

        await waitFor(() => {
            expect(screen.getByText('Failed to find similar products. Please try again.')).toBeInTheDocument();
        });
    });
});
