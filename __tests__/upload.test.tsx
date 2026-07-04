import { render, screen, fireEvent, act } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn().mockResolvedValue({
    name: 'Test Generated Product',
    price: 99.99,
    description_html: '<p>Test description</p>',
    tags: ['test', 'magic'],
    category: 'Electronics'
  }),
  saveProductToDb: jest.fn().mockResolvedValue(true),
}));

describe('MagicUploader', () => {
  beforeAll(() => {
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  it('renders correctly', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
  });

  it('handles file upload and generation', async () => {
    render(<MagicUploader />);

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

    const analyzeButton = screen.getByRole('button', { name: /analyze image/i });
    expect(analyzeButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(analyzeButton);
    });

    await act(async () => {
        await fileReaderPromise;
    });

    // Wait for the mock to resolve and update the UI
    await screen.findByDisplayValue('Test Generated Product');
    expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();
    expect(screen.getByText('Approve & Publish')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /approve & publish/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(await screen.findByText('Product successfully published!')).toBeInTheDocument();

    window.FileReader = originalFileReader;
  });
});
