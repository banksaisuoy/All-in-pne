import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';
import { searchSimilarProducts } from '@/lib/actions/visual-search';

// Mock the server action
jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

// Mock NEXT_PUBLIC_SUPABASE_URL and Anon key just to avoid next/image complaints if any
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon';

describe('VisualSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).URL.createObjectURL = jest.fn(() => 'blob:test-url');
  });

  it('renders the initial state correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByText('Click or drop image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
    expect(screen.getByText('Results will appear here')).toBeInTheDocument();
  });

  it('allows user to upload an image and preview it', async () => {
    render(<VisualSearchPage />);
    const fileInput = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement || document.querySelector('input[type="file"]');

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const img = screen.getByAltText('Preview');
      expect(img).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /search/i })).not.toBeDisabled();
  });

  it('performs a search and displays results', async () => {
    (searchSimilarProducts as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Product A', description: 'Desc A', price: 99.99, imageUrl: '/imgA.jpg', similarity: 0.95 }
    ]);

    render(<VisualSearchPage />);
    const fileInput = document.querySelector('input[type="file"]')!;
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,hello',
      onloadend: null as any,
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Trigger onloadend manually
    mockFileReader.onloadend();

    await waitFor(() => {
      expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });
});
