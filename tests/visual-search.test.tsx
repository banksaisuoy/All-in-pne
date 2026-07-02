import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '../app/shop/visual-search/page';
import { searchSimilarProducts } from '@/lib/actions/visual-search';

// Mock the server action
jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL.createObjectURL to avoid errors in JSDOM
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  });

  it('renders the initial state correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Find Similar Items')).toBeInTheDocument();
    expect(screen.getByText('Click or drop image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
    expect(screen.getByText('Results will appear here')).toBeInTheDocument();
  });

  it('enables the search button and shows a preview when an image is selected', async () => {
    render(<VisualSearchPage />);
    const file = new File(['mock content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/click or drop image/i, { selector: 'input[type="file"]' }) || document.querySelector('input[type="file"]');

    if (input) {
        fireEvent.change(input, { target: { files: [file] } });
    }

    await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled();
    });
  });

  it('performs a search and displays results', async () => {
    const mockResults = [
      { id: '1', name: 'Cool Shirt', description: 'A very cool shirt', price: 25.99, imageUrl: '/shirt.jpg', similarity: 0.95 },
    ];
    (searchSimilarProducts as jest.Mock).mockResolvedValueOnce(mockResults);

    render(<VisualSearchPage />);

    const file = new File(['mock content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    if (input) {
         fireEvent.change(input, { target: { files: [file] } });
    }

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled();
    });

    // We have to mock FileReader for this test because JSDOM's readAsDataURL can be tricky
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: jest.fn(),
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    // Simulate FileReader finishing
    if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
    }

    await waitFor(() => {
        expect(searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
        expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
        expect(screen.getByText('Cool Shirt')).toBeInTheDocument();
        expect(screen.getByText('$25.99')).toBeInTheDocument();
    });
  });
});
