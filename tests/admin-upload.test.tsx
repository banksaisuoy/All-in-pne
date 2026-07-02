import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MagicUploader from '../app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  });

  it('renders correctly and has disabled buttons initially', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Product Image')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze image/i })).toBeDisabled();
    expect(screen.getByText('Waiting for analysis...')).toBeInTheDocument();
  });

  it('allows file selection and analyzes it', async () => {
    const mockMetadata = {
      name: 'Test Product',
      price: 19.99,
      tags: ['test', 'magic'],
      description: 'A test product',
      description_html: '<p>A test product</p>',
      color: 'blue'
    };
    (generateProductMetadata as jest.Mock).mockResolvedValueOnce(mockMetadata);

    render(<MagicUploader />);

    const file = new File(['mock content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    if (input) {
         fireEvent.change(input, { target: { files: [file] } });
    }

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /analyze image/i })).not.toBeDisabled();
    });

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: jest.fn(),
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    fireEvent.click(screen.getByRole('button', { name: /analyze image/i }));

    if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
    }

    await waitFor(() => {
        expect(generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
        expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
        expect(screen.getByDisplayValue('19.99')).toBeInTheDocument();
        expect(screen.getByText('#test')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /approve & publish/i })).toBeInTheDocument();
    });
  });

  it('saves the product to the database', async () => {
    const mockMetadata = {
      name: 'Save Test',
      price: 99.99,
      tags: ['save'],
      description: 'save me',
      description_html: '<p>save me</p>',
      color: 'red'
    };
    (generateProductMetadata as jest.Mock).mockResolvedValueOnce(mockMetadata);
    (saveProductToDb as jest.Mock).mockResolvedValueOnce({ success: true });

    render(<MagicUploader />);

    const file = new File(['mock content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    if (input) {
         fireEvent.change(input, { target: { files: [file] } });
    }

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: jest.fn(),
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    await waitFor(() => {
         fireEvent.click(screen.getByRole('button', { name: /analyze image/i }));
    });

    if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
    }

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /approve & publish/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /approve & publish/i }));

    await waitFor(() => {
        expect(saveProductToDb).toHaveBeenCalledWith({
            ...mockMetadata,
            imageUrl: 'blob:mock-url'
        });
        expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });
});
