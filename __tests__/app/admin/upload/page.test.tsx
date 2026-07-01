import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';
import { act } from '@testing-library/react';

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn()
}));

global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

describe('MagicUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
  });

  it('handles file selection', () => {
    render(<MagicUploader />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByRole('button', { name: /Analyze Image/i })).not.toBeDisabled();
  });

  it('handles empty file selection gracefully', () => {
    render(<MagicUploader />);

    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: null } });

    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('handles file analysis success', async () => {
    (generateProductMetadata as jest.Mock).mockResolvedValue({
      name: 'Test Product',
      description: 'Test Description',
      description_html: '<p>Test</p>',
      price: 100,
      tags: ['test'],
      color: 'blue'
    });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as unknown,
      result: 'data:image/png;base64,test'
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown;

    render(<MagicUploader />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    fireEvent.click(analyzeBtn);

    // Trigger FileReader loadend
    await act(async () => {
      mockFileReader.onloadend();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      // Description might not be displayed depending on UI layout, check for something present
      expect(screen.getByText(/#test/)).toBeInTheDocument();
    });
  });

  it('handles file analysis failure', async () => {
    (generateProductMetadata as jest.Mock).mockRejectedValue(new Error('AI Failed'));

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as unknown,
      result: 'data:image/png;base64,test'
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown;

    render(<MagicUploader />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    fireEvent.click(analyzeBtn);

    // Trigger FileReader loadend
    await act(async () => {
        mockFileReader.onloadend();
    });

    await waitFor(() => {
      expect(screen.getByText('Error analyzing image.')).toBeInTheDocument();
    });
  });

  it('handles saving product successfully', async () => {
    (generateProductMetadata as jest.Mock).mockResolvedValue({
      name: 'Test Product',
      description: 'Test Description',
      description_html: '<p>Test</p>',
      price: 100,
      tags: ['test'],
      color: 'blue'
    });

    (saveProductToDb as jest.Mock).mockResolvedValue({ success: true });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as unknown,
      result: 'data:image/png;base64,test'
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown;

    render(<MagicUploader />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    fireEvent.click(analyzeBtn);

    await act(async () => {
        mockFileReader.onloadend();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole('button', { name: /Approve & Publish/i });

    await act(async () => {
        fireEvent.click(approveBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });

  it('handles saving product failure', async () => {
    (generateProductMetadata as jest.Mock).mockResolvedValue({
      name: 'Test Product',
      description: 'Test Description',
      description_html: '<p>Test</p>',
      price: 100,
      tags: ['test'],
      color: 'blue'
    });

    (saveProductToDb as jest.Mock).mockRejectedValue(new Error('DB Failed'));

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onloadend: null as unknown,
      result: 'data:image/png;base64,test'
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown;

    render(<MagicUploader />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const realInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(realInput, { target: { files: [file] } });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    fireEvent.click(analyzeBtn);

    await act(async () => {
        mockFileReader.onloadend();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    });

    const approveBtn = screen.getByRole('button', { name: /Approve & Publish/i });

    await act(async () => {
        fireEvent.click(approveBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to save product.')).toBeInTheDocument();
    });
  });
});
