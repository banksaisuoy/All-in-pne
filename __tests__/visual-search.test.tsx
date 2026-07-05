import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';
import * as searchActions from '@/lib/actions/visual-search';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.URL.createObjectURL as any) = jest.fn(() => 'mock-url');
    console.error = jest.fn(); // Suppress specific react errors during tests
  });

  it('renders upload area initially', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Click or drop image')).toBeInTheDocument();
  });

  it('handles image upload and displays preview', async () => {
    render(<VisualSearchPage />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(screen.getByAltText('Preview')).toBeInTheDocument();
  });

  it('performs search when button is clicked', async () => {
    const mockResults = [
        { id: '1', name: 'Test Product', description: 'desc', price: 10, imageUrl: 'test.jpg', similarity: 0.9 }
    ];
    (searchActions.searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    render(<VisualSearchPage />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const searchButton = screen.getByText('Search');

    // Mock FileReader implementation to resolve quickly
    const mockFileReader = {
      readAsDataURL: jest.fn(function(this: any) {
        setTimeout(() => {
            this.result = 'data:image/png;base64,hello';
            this.onloadend?.({} as any);
        }, 0);
      }),
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });
});
