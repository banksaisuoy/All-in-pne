import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import VisualSearchPage from '../app/shop/visual-search/page';
import { searchSimilarProducts } from '../lib/actions/visual-search';

jest.mock('../lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
  });

  it('handles image upload and search', async () => {
    const mockResults = [
        { id: '1', name: 'Test Product', description: 'desc', price: 99, imageUrl: 'img.jpg', similarity: 0.9 }
    ];
    (searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    // Create a spy for FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,hello',
      onloadend: null as unknown as () => void,
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof window.FileReader;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const searchButton = screen.getByRole('button', { name: /Search/i });
    expect(searchButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(searchButton);
    });

    // Simulate FileReader onloadend
    await act(async () => {
        if (mockFileReader.onloadend) {
            mockFileReader.onloadend();
        }
    });

    await waitFor(() => {
        expect(searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,hello');
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('90% Match')).toBeInTheDocument();
    });
  });
});
