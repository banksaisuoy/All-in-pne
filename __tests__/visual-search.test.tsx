import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VisualSearchPage from '../app/shop/visual-search/page';

// Mock the action
jest.mock('../lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn(),
}));

import { searchSimilarProducts } from '../lib/actions/visual-search';

describe('Visual Search Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.URL.createObjectURL as unknown) = jest.fn(() => 'mock-url');
  });

  it('renders the initial state correctly', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    expect(screen.getByText('Click or drop image')).toBeInTheDocument();
  });

  it('allows file upload and shows preview', async () => {
    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  it('performs search when button is clicked', async () => {
    const mockResults = [
      { id: '1', name: 'Cool Shirt', description: 'Very cool', price: 20, imageUrl: '/shirt.jpg', similarity: 0.99 }
    ];
    (searchSimilarProducts as jest.Mock).mockResolvedValue(mockResults);

    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    await userEvent.upload(input, file);

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    await userEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
      expect(screen.getByText('Cool Shirt')).toBeInTheDocument();
      expect(screen.getByText('$20')).toBeInTheDocument();
    });
  });


  it('handles search action failure', async () => {
    (searchSimilarProducts as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    await userEvent.upload(input, file);

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    await userEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to find similar products. Please try again.')).toBeInTheDocument();
    });
  });
  it('handles FileReader error', async () => {
    const originalFileReader = global.FileReader;
    class MockFileReader {
      onloadend: () => void = () => {};
      readAsDataURL() {
        throw new Error('FileReader Error');
      }
    }
    global.FileReader = MockFileReader as unknown as typeof global.FileReader;

    render(<VisualSearchPage />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click or drop image/i);

    await userEvent.upload(input, file);

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    await userEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Error processing image.')).toBeInTheDocument();
    });

    global.FileReader = originalFileReader;
  });

});
