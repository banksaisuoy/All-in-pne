import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MagicUploader from '../app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '../lib/actions/upload-product';
import userEvent from '@testing-library/user-event';

jest.mock('../lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    window.URL.revokeObjectURL = jest.fn();
  });

  it('renders the initial state correctly', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze Image' })).toBeDisabled();
  });

  it('handles file selection and enables analysis', async () => {
    render(<MagicUploader />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload/i) as HTMLInputElement;

    await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
    });

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    const analyzeButton = screen.getByRole('button', { name: 'Analyze Image' });
    expect(analyzeButton).not.toBeDisabled();
  });

  it('analyzes image and displays generated metadata', async () => {
    const mockMetadata = {
      name: 'Test Product',
      description: 'Test Description',
      description_html: '<p>Test</p>',
      price: 100,
      tags: ['test', 'product'],
      color: 'blue'
    };
    (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);

    render(<MagicUploader />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload/i) as HTMLInputElement;

    // Simulate reading file
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mock',
      onloadend: null as any,
    };
    window.FileReader = jest.fn(() => mockFileReader) as any;

    await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
    });

    const analyzeButton = screen.getByRole('button', { name: 'Analyze Image' });

    await act(async () => {
        fireEvent.click(analyzeButton);
    });

    expect(screen.getByText('Sending to Gemini Vision API...')).toBeInTheDocument();

    await act(async () => {
        if (mockFileReader.onloadend) {
            await mockFileReader.onloadend({} as any);
        }
    });

    await waitFor(() => {
        expect(generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,mock');
        expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
        expect(screen.getByText('#test')).toBeInTheDocument();
        expect(screen.getByText('#product')).toBeInTheDocument();
    });
  });

  it('saves product successfully', async () => {
    const mockMetadata = {
      name: 'Test Product',
      description: 'Test Description',
      description_html: '<p>Test</p>',
      price: 100,
      tags: ['test', 'product'],
      color: 'blue'
    };
    (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    (saveProductToDb as jest.Mock).mockResolvedValue({ success: true });

    render(<MagicUploader />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload/i) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mock',
      onloadend: null as any,
    };
    window.FileReader = jest.fn(() => mockFileReader) as any;

    await act(async () => {
        fireEvent.change(input, { target: { files: [file] } });
    });

    const analyzeButton = screen.getByRole('button', { name: 'Analyze Image' });

    await act(async () => {
        fireEvent.click(analyzeButton);
        if (mockFileReader.onloadend) {
            await mockFileReader.onloadend({} as any);
        }
    });

    await waitFor(() => {
        expect(screen.getByText('Approve & Publish')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Approve & Publish');

    await act(async () => {
        fireEvent.click(saveButton);
    });

    await waitFor(() => {
        expect(saveProductToDb).toHaveBeenCalledWith({
            ...mockMetadata,
            imageUrl: 'mock-url'
        });
        expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });
});