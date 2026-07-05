import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';
import { searchSimilarProducts } from '@/lib/actions/visual-search';

// Mock the server action
jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByText('Find Similar Items')).toBeInTheDocument();
  });

  it('handles file upload and visual search', async () => {
    const mockSearchResults = [
      { id: '1', name: 'Test Product', description: 'Desc', price: 99, imageUrl: '/test.jpg', similarity: 0.9 },
    ];
    (searchSimilarProducts as jest.Mock).mockResolvedValue(mockSearchResults);

    render(<VisualSearchPage />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    // 1. Upload file
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(screen.getByAltText('Preview')).toBeInTheDocument();

    // 2. Click Search
    const searchButton = screen.getByRole('button', { name: /Search/i });
    expect(searchButton).not.toBeDisabled();

    let readerOnloadend: () => void = () => {};
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      set onloadend(fn: () => void) {
        readerOnloadend = fn;
      }
    };
    (window as unknown as Window & { FileReader: unknown }).FileReader = jest.fn(() => mockFileReader);

    await act(async () => {
      fireEvent.click(searchButton);
    });

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();

    // Simulate FileReader finishing
    await act(async () => {
      readerOnloadend();
    });

    await waitFor(() => {
      expect(searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
    });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('90% Match')).toBeInTheDocument();
  });

  it('handles search errors gracefully', async () => {
    (searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<VisualSearchPage />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const searchButton = screen.getByRole('button', { name: /Search/i });

    let readerOnloadend: () => void = () => {};
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      set onloadend(fn: () => void) {
        readerOnloadend = fn;
      }
    };
    (window as unknown as Window & { FileReader: unknown }).FileReader = jest.fn(() => mockFileReader);

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await act(async () => {
      readerOnloadend();
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to find similar products. Please try again.')).toBeInTheDocument();
    });
  });
});
