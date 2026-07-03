import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import VisualSearchPage from '@/app/shop/visual-search/page';
import * as visualSearchAction from '@/lib/actions/visual-search';

jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  it('renders initial state', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Find Similar Items')).toBeTruthy();
    expect(screen.getByText('Search')).toBeTruthy();
    expect(screen.getByText('Results will appear here')).toBeTruthy();
  });

  it('handles file upload and search', async () => {
    const mockResults = [
      { id: '1', name: 'Test Product 1', description: 'Desc 1', price: 10, imageUrl: 'https://placehold.co/400x400.png', similarity: 0.9 },
    ];
    (visualSearchAction.searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/jpeg;base64,mockbase64',
      onloadend: null as EventListener | null,
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof window.FileReader;

    render(<VisualSearchPage />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);

    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    expect(screen.getByText('Analyzing...')).toBeTruthy();

    await act(async () => {
      // Trigger FileReader onloadend
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend(new Event('loadend'));
      }
    });

    await waitFor(() => {
      expect(visualSearchAction.searchSimilarProducts).toHaveBeenCalledWith('data:image/jpeg;base64,mockbase64');
    });

    const resultElement = await screen.findByText('Test Product 1');
    expect(resultElement).toBeTruthy();
  });
});
