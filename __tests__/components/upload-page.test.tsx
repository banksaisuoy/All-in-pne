import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';

// Mock the server actions
jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).URL.createObjectURL = jest.fn(() => 'blob:test-url');
  });

  it('renders correctly initially', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze image/i })).toBeDisabled();
  });

  it('allows image upload and metadata generation', async () => {
    (generateProductMetadata as jest.Mock).mockResolvedValue({
      name: 'Test Generated',
      description: 'Desc',
      description_html: '<p>Desc</p>',
      price: 50,
      tags: ['cool'],
      color: 'blue'
    });

    render(<MagicUploader />);

    // Upload image
    const fileInput = document.querySelector('input[type="file"]')!;
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,hello',
      onloadend: null as any,
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    // Click Analyze
    const analyzeButton = screen.getByRole('button', { name: /analyze image/i });
    fireEvent.click(analyzeButton);

    // Trigger FileReader finish
    await act(async () => {
      mockFileReader.onloadend();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Generated')).toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });
  });

  it('handles save after generation', async () => {
    (generateProductMetadata as jest.Mock).mockResolvedValue({
      name: 'Test Generated',
      description: 'Desc',
      description_html: '<p>Desc</p>',
      price: 50,
      tags: ['cool'],
      color: 'blue'
    });

    (saveProductToDb as jest.Mock).mockResolvedValue({ success: true, data: { id: '1' } });

    render(<MagicUploader />);

    // Upload image
    const fileInput = document.querySelector('input[type="file"]')!;
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,hello',
      onloadend: null as any,
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    // Click Analyze
    const analyzeButton = screen.getByRole('button', { name: /analyze image/i });
    fireEvent.click(analyzeButton);

    await act(async () => {
      mockFileReader.onloadend();
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Generated')).toBeInTheDocument();
    });

    // Click Save
    const saveButton = screen.getByRole('button', { name: /approve & publish/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveProductToDb).toHaveBeenCalled();
      expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });
});
