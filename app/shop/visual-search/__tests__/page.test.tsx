import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VisualSearchPage from '../page';
import { searchSimilarProducts } from '@/lib/actions/visual-search';

jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

describe('VisualSearchPage', () => {
  let consoleErrorMock: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  it('renders correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByText('Click or drop image')).toBeInTheDocument();
  });

  it('handles file selection and enables search', async () => {
    const user = userEvent.setup();
    render(<VisualSearchPage />);

    const file = new File(['mock-image-content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement;

    await act(async () => {
      await user.upload(input, file);
    });

    expect(screen.getByAltText('Preview')).toBeInTheDocument();
    const searchButton = screen.getByRole('button', { name: /Search/i });
    expect(searchButton).not.toBeDisabled();
  });

  it('handles search correctly', async () => {
    const mockResults = [
      { id: '1', name: 'Mock Product 1', description: 'desc', price: 100, imageUrl: '/img.png', similarity: 0.9 }
    ];
    (searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    const user = userEvent.setup();
    render(<VisualSearchPage />);

    const file = new File(['mock-image-content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i) as HTMLInputElement;

    await act(async () => {
      await user.upload(input, file);
    });

    const searchButton = screen.getByRole('button', { name: /Search/i });

    await act(async () => {
      await user.click(searchButton);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(searchSimilarProducts).toHaveBeenCalled();
    expect(await screen.findByText('Mock Product 1')).toBeInTheDocument();
  });
});
