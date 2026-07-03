import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import MagicUploader from '@/app/admin/upload/page';
import * as uploadProductAction from '@/lib/actions/upload-product';

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  it('renders initial state', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeTruthy();
    expect(screen.getByText('Analyze Image')).toBeTruthy();
  });

  it('handles analyze and save', async () => {
    const mockMetadata = {
      name: 'Test Name',
      description_html: '<p>Test</p>',
      category: 'Test Category',
      description: 'Test Description',
      price: 100,
      tags: ['tag1', 'tag2'],
    };
    (uploadProductAction.generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    (uploadProductAction.saveProductToDb as jest.Mock).mockResolvedValue(undefined);

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/jpeg;base64,mockbase64',
      onloadend: null as EventListener | null,
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof window.FileReader;

    render(<MagicUploader />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    const analyzeBtn = screen.getByRole('button', { name: 'Analyze Image' });
    fireEvent.click(analyzeBtn);

    await act(async () => {
      if (mockFileReader.onloadend) {
        mockFileReader.onloadend(new Event('loadend'));
      }
    });

    await waitFor(() => {
      expect(uploadProductAction.generateProductMetadata).toHaveBeenCalledWith('data:image/jpeg;base64,mockbase64');
    });

    expect(screen.getByDisplayValue('Test Name')).toBeTruthy();

    const saveBtn = screen.getByRole('button', { name: /Approve & Publish/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(uploadProductAction.saveProductToDb).toHaveBeenCalled();
    });

    expect(screen.getByText('Product successfully published!')).toBeTruthy();
  });
});
