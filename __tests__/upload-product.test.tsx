import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import MagicUploader from '../app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '../lib/actions/upload-product';

jest.mock('../lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
  });

  it('handles analyze and save workflow', async () => {
    const mockMetadata = {
        name: 'Test Name',
        description: 'Test Desc',
        description_html: '<p>Test</p>',
        price: 100,
        tags: ['test', 'tag'],
        color: 'red'
    };
    (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    (saveProductToDb as jest.Mock).mockResolvedValue({ success: true });

    render(<MagicUploader />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,hello',
      onloadend: null as unknown as () => void,
    };
    window.FileReader = jest.fn(() => mockFileReader) as unknown as typeof window.FileReader;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const analyzeButton = screen.getByRole('button', { name: /Analyze Image/i });
    expect(analyzeButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(analyzeButton);
    });

    await act(async () => {
        if (mockFileReader.onloadend) {
            mockFileReader.onloadend();
        }
    });

    await waitFor(() => {
        expect(generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,hello');
        expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /Approve & Publish/i });
    await act(async () => {
        fireEvent.click(saveButton);
    });

    await waitFor(() => {
        expect(saveProductToDb).toHaveBeenCalledWith({ ...mockMetadata, imageUrl: 'mock-url' });
        expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });
});
