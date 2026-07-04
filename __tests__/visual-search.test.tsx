import { render, screen, fireEvent, act } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';

jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Test Product',
      description: 'A test product',
      price: 10,
      imageUrl: '/test.jpg',
      similarity: 0.9,
    },
  ]),
}));

describe('VisualSearchPage', () => {
  beforeAll(() => {
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  it('renders correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
  });

  it('handles file upload and search', async () => {
    render(<VisualSearchPage />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    let resolveFileReader: (value: unknown) => void;
    const fileReaderPromise = new Promise((resolve) => {
      resolveFileReader = resolve;
    });

    const originalFileReader = window.FileReader;
    window.FileReader = jest.fn().mockImplementation(() => ({
      readAsDataURL: jest.fn(function(this: Record<string, unknown>) {
        setTimeout(() => {
          this.result = 'data:image/png;base64,dummy';
          if (typeof this.onloadend === 'function') {
            this.onloadend();
          }
          resolveFileReader(undefined);
        }, 0);
      }),
    })) as unknown as typeof window.FileReader;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(searchButton);
    });

    await act(async () => {
        await fileReaderPromise;
    });

    expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();

    window.FileReader = originalFileReader;
  });
});
