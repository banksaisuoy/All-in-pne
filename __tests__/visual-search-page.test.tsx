import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VisualSearchPage from '../app/shop/visual-search/page';
import { searchSimilarProducts } from '../lib/actions/visual-search';

jest.mock('../lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    window.URL.revokeObjectURL = jest.fn();
  });

  it('renders initial state', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByText('Click or drop image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
    expect(screen.getByText('Results will appear here')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    render(<VisualSearchPage />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement;

    await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
    });

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).not.toBeDisabled();
  });

  it('performs search and displays results', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'Cool Shirt',
        description: 'A very cool shirt',
        price: 25.99,
        imageUrl: '/shirt.jpg',
        similarity: 0.95
      }
    ];
    (searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    render(<VisualSearchPage />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mock',
      onloadend: null as any,
    };
    window.FileReader = jest.fn(() => mockFileReader) as any;

    await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
    });

    const searchButton = screen.getByRole('button', { name: 'Search' });

    await act(async () => {
        fireEvent.click(searchButton);
    });

    expect(screen.getByText('Searching...')).toBeInTheDocument();

    await act(async () => {
        if (mockFileReader.onloadend) {
            await mockFileReader.onloadend({} as any);
        }
    });

    await waitFor(() => {
        expect(searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,mock');
        expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
        expect(screen.getByText('Cool Shirt')).toBeInTheDocument();
        expect(screen.getByText('A very cool shirt')).toBeInTheDocument();
        expect(screen.getByText('$25.99')).toBeInTheDocument();
        expect(screen.getByText('95% Match')).toBeInTheDocument();
    });
  });

  it('displays error message on search failure', async () => {
    (searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('Search failed'));

    render(<VisualSearchPage />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mock',
      onloadend: null as any,
    };
    window.FileReader = jest.fn(() => mockFileReader) as any;

    await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
    });

    const searchButton = screen.getByRole('button', { name: 'Search' });

    await act(async () => {
        fireEvent.click(searchButton);
    });

    await act(async () => {
        if (mockFileReader.onloadend) {
            await mockFileReader.onloadend({} as any);
        }
    });

    await waitFor(() => {
        expect(screen.getByText('Failed to find similar products. Please try again.')).toBeInTheDocument();
    });
  });
});