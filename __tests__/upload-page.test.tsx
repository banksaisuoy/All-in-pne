import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';
import * as uploadAction from '@/lib/actions/upload-product';

jest.mock('@/lib/actions/upload-product');

describe('MagicUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window as unknown as Window).URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  it('renders the initial state', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('handles image upload and analyze', async () => {
    const mockMetadata = {
        name: 'Test Name',
        description_html: '<p>Test</p>',
        category: 'Test Category',
        price: 15,
        tags: ['test1', 'test2']
    };

    (uploadAction.generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'mock-base64',
      onloadend: null,
    };
    (window as unknown as Window & { FileReader: typeof FileReader }).FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

    render(<MagicUploader />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
    });

    const analyzeButton = screen.getByRole('button', { name: /Analyze Image/i });

    await act(async () => {
        fireEvent.click(analyzeButton);
    });

    // Simulate FileReader onloadend
    if (mockFileReader.onloadend) {
        await act(async () => {
            (mockFileReader.onloadend as unknown as () => void)();
        });
    }

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
      expect(screen.getByText('#test1')).toBeInTheDocument();
    });
  });
});
