import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';
import * as actions from '@/lib/actions/visual-search';

// Mock the server action
jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    jest.clearAllMocks();
  });

  it('renders correctly initially', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByText('Find Similar Items')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeDisabled();
  });

  it('handles file upload and displays preview', async () => {
    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Search')).not.toBeDisabled();
    });
  });

  it('performs search and displays results', async () => {
    const mockResults = [
      {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        imageUrl: '/test.jpg',
        similarity: 0.95,
      },
    ];

    (actions.searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: null as unknown as () => void,
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    render(<VisualSearchPage />);

    // Upload file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // Click search
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    // Trigger onloadend
    expect(mockFileReader.readAsDataURL).toHaveBeenCalled();
    mockFileReader.onloadend();

    await waitFor(() => {
      expect(actions.searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
      expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('95% Match')).toBeInTheDocument();
    });
  });

  it('handles search errors', async () => {
    (actions.searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('Search failed'));

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: null as unknown as () => void,
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    render(<VisualSearchPage />);

    // Upload file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // Click search
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    // Trigger onloadend
    expect(mockFileReader.readAsDataURL).toHaveBeenCalled();
    mockFileReader.onloadend();

    await waitFor(() => {
      expect(screen.getByText('Failed to find similar products. Please try again.')).toBeInTheDocument();
    });
  });
});
