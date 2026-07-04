import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';

// Mock the server actions
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
    expect(screen.getByText('Product Image')).toBeInTheDocument();
    expect(screen.getByText('AI Intelligence')).toBeInTheDocument();
  });

  it('handles image upload, analysis, and save', async () => {
    // Mock the FileReader to simulate reading a file
    const readAsDataURLMock = jest.fn();
    const dummyFileReader = {
        readAsDataURL: readAsDataURLMock,
        result: 'data:image/jpeg;base64,dummy',
        onloadend: null as unknown as () => void,
    };
    (window as unknown as Window & { FileReader: any }).FileReader = jest.fn(() => dummyFileReader);

    // Mock AI response
    const mockMetadata = {
        name: 'AI Generated Product',
        description_html: '<p>Desc</p>',
        category_id: 'test-cat',
        price: 49.99,
        tags: ['test', 'ai'],
    };
    (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    (saveProductToDb as jest.Mock).mockResolvedValue(undefined);

    render(<MagicUploader />);

    // Simulate file upload
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Verify preview is set
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(file);
    const analyzeButton = screen.getByRole('button', { name: /Analyze Image/i });
    expect(analyzeButton).not.toBeDisabled();

    // Trigger analysis
    await act(async () => {
        fireEvent.click(analyzeButton);
    });

    // Simulate FileReader onloadend
    await act(async () => {
        if (dummyFileReader.onloadend) {
            (dummyFileReader.onloadend as () => void)();
        }
    });

    // Wait for analysis results
    await waitFor(() => {
      expect(generateProductMetadata).toHaveBeenCalledWith('data:image/jpeg;base64,dummy');
      // Using value instead of getByDisplayValue to be safe with uncontrolled/controlled inputs
      const nameInput = screen.getByDisplayValue('AI Generated Product');
      expect(nameInput).toBeInTheDocument();
    });

    // Trigger save
    const saveButton = screen.getByRole('button', { name: /Approve & Publish/i });
    await act(async () => {
        fireEvent.click(saveButton);
    });

    // Wait for save action
    await waitFor(() => {
      expect(saveProductToDb).toHaveBeenCalledWith({
          ...mockMetadata,
          imageUrl: 'mock-url'
      });
      expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });
});
