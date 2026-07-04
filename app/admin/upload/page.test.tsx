import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MagicUploader from './page';
import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';

// Mock the actions
jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
  let originalCreateObjectURL: typeof window.URL.createObjectURL;

  beforeEach(() => {
    originalCreateObjectURL = window.URL.createObjectURL;
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  afterEach(() => {
    window.URL.createObjectURL = originalCreateObjectURL;
    jest.clearAllMocks();
  });

  it('renders initial state', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Image/i })).toBeDisabled();
    expect(screen.getByText('Waiting for analysis...')).toBeInTheDocument();
  });

  it('handles file upload and enables analyze button', async () => {
    render(<MagicUploader />);
    const file = new File(['dummy'], 'dummy.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    expect(analyzeBtn).toBeEnabled();
  });

  it('analyzes image and populates metadata', async () => {
    const mockMetadata = {
      name: 'Smart Watch',
      description: 'A very smart watch',
      description_html: '<p>A very smart watch</p>',
      price: 199.99,
      tags: ['electronics', 'wearable'],
      color: 'black'
    };
    (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);

    render(<MagicUploader />);

    const file = new File(['dummy'], 'dummy.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });

    const originalFileReader = global.FileReader;
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: null as unknown as () => void,
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    await act(async () => {
      fireEvent.click(analyzeBtn);
    });

    await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
      }
    });

    await waitFor(() => {
      expect(generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
      expect(screen.getByDisplayValue('Smart Watch')).toBeInTheDocument();
      expect(screen.getByDisplayValue('199.99')).toBeInTheDocument();
      expect(screen.getByText('Analysis complete! Please review.')).toBeInTheDocument();
    });

    global.FileReader = originalFileReader;
  });

  it('handles saving the product', async () => {
    const mockMetadata = {
      name: 'Smart Watch',
      description: 'A very smart watch',
      description_html: '<p>A very smart watch</p>',
      price: 199.99,
      tags: ['electronics', 'wearable'],
      color: 'black'
    };
    (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    (saveProductToDb as jest.Mock).mockResolvedValue({ success: true, id: '1' });

    render(<MagicUploader />);

    const file = new File(['dummy'], 'dummy.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const originalFileReader = global.FileReader;
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      onloadend: null as unknown as () => void,
    };
    global.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Analyze Image/i }));
    });

    await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend();
      }
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Approve & Publish/i })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Approve & Publish/i }));
    });

    await waitFor(() => {
      expect(saveProductToDb).toHaveBeenCalledWith({ ...mockMetadata, imageUrl: 'mock-url' });
      expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });

    global.FileReader = originalFileReader;
  });
});
