import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
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
    expect(screen.getByText('Results will appear here')).toBeInTheDocument();
  });

  it('handles image upload and search', async () => {
    // Mock the FileReader to simulate reading a file
    const readAsDataURLMock = jest.fn();
    const dummyFileReader = {
        readAsDataURL: readAsDataURLMock,
        result: 'data:image/jpeg;base64,dummy',
        onloadend: null as unknown as () => void,
    };
    (window as unknown as Window & { FileReader: any }).FileReader = jest.fn(() => dummyFileReader);

    // Mock search action response
    (searchSimilarProducts as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Test Product', description: 'Test Desc', price: 10, imageUrl: '/test.jpg', similarity: 0.9 },
    ]);

    render(<VisualSearchPage />);

    // Simulate file upload
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Verify preview is set (via mock URL)
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    expect(searchButton).not.toBeDisabled();

    // Trigger search
    await act(async () => {
        fireEvent.click(searchButton);
    });

    // Simulate FileReader onloadend
    await act(async () => {
        if (dummyFileReader.onloadend) {
            (dummyFileReader.onloadend as () => void)();
        }
    });

    // Wait for results
    await waitFor(() => {
      expect(searchSimilarProducts).toHaveBeenCalledWith('data:image/jpeg;base64,dummy');
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$10')).toBeInTheDocument();
    });
  });
});
