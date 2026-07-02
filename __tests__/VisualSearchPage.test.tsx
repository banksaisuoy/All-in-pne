import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';
import * as actions from '@/lib/actions/visual-search';

jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn()
}));

// Setup window.URL.createObjectURL
beforeAll(() => {
  window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
});

// Setup FileReader mock
class MockFileReader {
  onloadend: (() => void) | null = null;
  result: string | null = null;

  readAsDataURL() {
    this.result = 'data:image/jpeg;base64,mock';
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend();
      }
    }, 0);
  }
}
(window as any).FileReader = MockFileReader;

describe('VisualSearchPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeDisabled();
    expect(screen.getByText('Results will appear here')).toBeInTheDocument();
  });

  it('handles file upload and search flow', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'Matching Shirt',
        description: 'Looks just like it',
        price: 29.99,
        imageUrl: '/mock.jpg',
        similarity: 0.95
      }
    ];
    (actions.searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    render(<VisualSearchPage />);

    // Upload file
    const file = new File(['dummy content'], 'shirt.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input as Element, { target: { files: [file] } });

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    expect(searchBtn).not.toBeDisabled();

    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
    });

    expect(screen.getByText('Matching Shirt')).toBeInTheDocument();
    expect(screen.getByText('95% Match')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('handles search error', async () => {
    (actions.searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('API failed'));

    render(<VisualSearchPage />);

    const file = new File(['dummy content'], 'shirt.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input as Element, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to find similar products. Please try again.')).toBeInTheDocument();
    });
  });
});
