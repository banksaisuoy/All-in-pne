import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';
import * as visualSearchAction from '@/lib/actions/visual-search';

jest.mock('@/lib/actions/visual-search');

describe('VisualSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as unknown as Window).URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  it('renders the initial state', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByText('Click or drop image')).toBeInTheDocument();
  });

  it('handles image upload and search', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'Test Product',
        description: 'Test Desc',
        price: 10,
        imageUrl: '/test.jpg',
        similarity: 0.9,
      },
    ];

    (visualSearchAction.searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'mock-base64',
      onloadend: null,
    };
    (window as unknown as Window & { FileReader: typeof FileReader }).FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    render(<VisualSearchPage />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const searchButton = screen.getByRole('button', { name: /Search/i });

    await act(async () => {
        fireEvent.click(searchButton);
    });

    // Simulate FileReader onloadend
    if (mockFileReader.onloadend) {
        await act(async () => {
            (mockFileReader.onloadend as unknown as () => void)();
        });
    }

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });
});
