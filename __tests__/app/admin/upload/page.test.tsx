import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
  });

  it('handles the full upload, analyze, and save flow', async () => {
    const mockMetadata = {
      name: 'Magic Wand',
      description: 'A magical wand.',
      description_html: '<h3>Magic Wand</h3><p>A magical wand.</p>',
      price: 100,
      tags: ['magic', 'wand'],
      color: 'brown',
    };

    (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    (saveProductToDb as jest.Mock).mockResolvedValue({ success: true, data: { id: '1' } });

    render(<MagicUploader />);

    const file = new File(['dummy content'], 'wand.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    // 1. Upload File
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(screen.getByAltText('Preview')).toBeInTheDocument();

    const analyzeButton = screen.getByRole('button', { name: /Analyze Image/i });
    expect(analyzeButton).not.toBeDisabled();

    // 2. Analyze Image
    let readerOnloadend: () => void = () => {};
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,mockbase64',
      set onloadend(fn: () => void) {
        readerOnloadend = fn;
      }
    };
    (window as unknown as Window & { FileReader: unknown }).FileReader = jest.fn(() => mockFileReader);

    await act(async () => {
      fireEvent.click(analyzeButton);
    });

    expect(screen.getByText('Analyzing with Gemini...')).toBeInTheDocument();

    await act(async () => {
      readerOnloadend();
    });

    await waitFor(() => {
      expect(generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
    });

    // Check if metadata is populated
    expect(screen.getByDisplayValue('Magic Wand')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByText('#magic')).toBeInTheDocument();

    // 3. Save Product
    const saveButton = screen.getByRole('button', { name: /Approve & Publish/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(saveProductToDb).toHaveBeenCalledWith({
        ...mockMetadata,
        imageUrl: 'mock-url', // URL.createObjectURL mock returns this
      });
    });

    expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
  });
});
