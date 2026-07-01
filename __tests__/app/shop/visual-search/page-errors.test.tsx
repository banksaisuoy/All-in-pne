import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('VisualSearchPage FileReader error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles FileReader error', async () => {
    // Mock FileReader with an error when readAsDataURL is called
    const mockFileReader = {
      readAsDataURL: jest.fn(() => {
        throw new Error('FileReader sync error');
      }),
      onloadend: null as unknown,
      result: null
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown;

    render(<VisualSearchPage />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Error processing image.')).toBeInTheDocument();
    });
  });
});
