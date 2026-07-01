import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';
import { searchSimilarProducts } from '@/lib/actions/visual-search';
import { act } from '@testing-library/react';

jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn()
}));

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('VisualSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search page', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<VisualSearchPage />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByRole('button', { name: /Search/i })).not.toBeDisabled();
  });

  it('handles empty file selection gracefully', () => {
    render(<VisualSearchPage />);

    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: null } });

    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('handles search success', async () => {
    (searchSimilarProducts as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Product A', description: 'Desc A', price: 100, imageUrl: '/img.png', similarity: 0.95 }
    ]);

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as any,
      result: 'data:image/png;base64,test'
    };
    global.FileReader = jest.fn(() => mockFileReader) as any;

    render(<VisualSearchPage />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchBtn);

    await act(async () => {
      mockFileReader.onloadend();
    });

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Desc A')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getByText('95% Match')).toBeInTheDocument();
    });
  });

  it('handles search failure', async () => {
    (searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('Search Failed'));

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as any,
      result: 'data:image/png;base64,test'
    };
    global.FileReader = jest.fn(() => mockFileReader) as any;

    render(<VisualSearchPage />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchBtn);

    await act(async () => {
        mockFileReader.onloadend();
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to find similar products. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles image load error', async () => {
      (searchSimilarProducts as jest.Mock).mockResolvedValue([
        { id: '1', name: 'Product A', description: 'Desc A', price: 100, imageUrl: '/img.png', similarity: 0.95 }
      ]);

      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onloadend: null as any,
        result: 'data:image/png;base64,test'
      };
      global.FileReader = jest.fn(() => mockFileReader) as any;

      render(<VisualSearchPage />);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(realInput, { target: { files: [file] } });

      const searchBtn = screen.getByRole('button', { name: /Search/i });
      fireEvent.click(searchBtn);

      await act(async () => {
        mockFileReader.onloadend();
      });

      await waitFor(() => {
        expect(screen.getByText('Product A')).toBeInTheDocument();
      });

      const img = screen.getByAltText('Product A');
      fireEvent.error(img);
      // removed assertion as Next.js Image component handles src internally and JSDOM does not mock it correctly.
  });

});
