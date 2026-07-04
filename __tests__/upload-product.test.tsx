import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';
import * as actions from '@/lib/actions/upload-product';

// Mock the server action
jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    jest.clearAllMocks();
  });

  it('renders correctly initially', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    expect(screen.getByText('Product Image')).toBeInTheDocument();
    expect(screen.getByText('Analyze Image')).toBeDisabled();
  });

  it('handles file upload and displays preview', async () => {
    render(<MagicUploader />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Analyze Image')).not.toBeDisabled();
    });
  });

  it('analyzes image and displays metadata', async () => {
    const mockMetadata = {
      name: 'Test Product',
      description: 'Test Description',
      description_html: '<p>Test Description HTML</p>',
      price: 99.99,
      tags: ['test', 'product'],
      color: 'blue'
    };

    (actions.generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: null as unknown as () => void,
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    render(<MagicUploader />);

    // Upload file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // Click analyze
    const analyzeButton = screen.getByText('Analyze Image');
    fireEvent.click(analyzeButton);

    // Trigger onloadend
    expect(mockFileReader.readAsDataURL).toHaveBeenCalled();
    mockFileReader.onloadend();

    await waitFor(() => {
      expect(actions.generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByText('#product')).toBeInTheDocument();
      expect(screen.getByText('<p>Test Description HTML</p>')).toBeInTheDocument();
    });
  });

  it('saves product to db', async () => {
    const mockMetadata = {
      name: 'Test Product',
      description: 'Test Description',
      description_html: '<p>Test Description HTML</p>',
      price: 99.99,
      tags: ['test', 'product'],
      color: 'blue'
    };

    (actions.generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    (actions.saveProductToDb as jest.Mock).mockResolvedValue({ success: true });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: null as unknown as () => void,
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    render(<MagicUploader />);

    // Upload file
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // Click analyze
    const analyzeButton = screen.getByText('Analyze Image');
    fireEvent.click(analyzeButton);

    // Trigger onloadend
    mockFileReader.onloadend();

    // Wait for metadata to load
    await waitFor(() => {
      expect(screen.getByText('Approve & Publish')).toBeInTheDocument();
    });

    // Click save
    const saveButton = screen.getByText('Approve & Publish');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(actions.saveProductToDb).toHaveBeenCalledWith({
        ...mockMetadata,
        imageUrl: 'mock-url'
      });
      expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });
});
