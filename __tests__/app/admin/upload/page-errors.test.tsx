import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';
import { act } from '@testing-library/react';

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn()
}));

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('MagicUploader FileReader error handling', () => {
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

    render(<MagicUploader />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText('Error processing file.')).toBeInTheDocument();
    });
  });
});
