import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VisualSearchPage from './page';
import { searchSimilarProducts } from '@/lib/actions/visual-search';

// Mock the searchSimilarProducts action
jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
  let originalCreateObjectURL: typeof window.URL.createObjectURL;

  beforeEach(() => {
    originalCreateObjectURL = window.URL.createObjectURL;
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    jest.clearAllMocks();
  });

  it('renders the initial state correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByText('Find Similar Items')).toBeInTheDocument();
    expect(screen.getByText('Click or drop image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeDisabled();
  });

  it('handles file selection and enables search button', async () => {
    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    expect(searchButton).toBeEnabled();
  });

  it('performs search and displays results', async () => {
    const mockResults = [
      { id: '1', name: 'Cool Shirt', description: 'A cool shirt', price: 29.99, imageUrl: '/shirt.png', similarity: 0.9 }
    ];
    (searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const searchButton = screen.getByRole('button', { name: /Search/i });

    // Mock FileReader to avoid act warnings
    const originalFileReader = global.FileReader;
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: null as unknown as () => void,
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    await act(async () => {
      fireEvent.click(searchButton);
    });

    // Simulate onloadend resolving
    await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
      }
    });

    await waitFor(() => {
      expect(searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
      expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
      expect(screen.getByText('Cool Shirt')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });

    global.FileReader = originalFileReader;
  });

  it('handles search errors gracefully', async () => {
    (searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const searchButton = screen.getByRole('button', { name: /Search/i });

    const originalFileReader = global.FileReader;
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: null as unknown as () => void,
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to find similar products. Please try again.')).toBeInTheDocument();
    });

    global.FileReader = originalFileReader;
  });
});
