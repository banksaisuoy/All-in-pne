import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';
import * as actions from '@/lib/actions/upload-product';

// Mock actions
jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn()
}));

// Setup window.URL.createObjectURL
beforeAll(() => {
  window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
});

// Setup FileReader mock properly
class MockFileReader {
  onloadend: (() => void) | null = null;
  result: string | null = null;

  readAsDataURL() {
    this.result = 'data:image/jpeg;base64,mock';
    setTimeout(() => {
      if (this.onloadend) {
        this.onloadend();
      }
    }, 0);
  }
}
(window as any).FileReader = MockFileReader;

describe('MagicUploader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    expect(screen.getByText('Analyze Image')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Image/i })).toBeDisabled();
  });

  it('handles file upload and analyze flow', async () => {
    const mockMetadata = {
      name: 'Generated Hat',
      description: 'A cool hat',
      description_html: '<p>A cool hat</p>',
      price: 25,
      tags: ['hat', 'cool'],
      color: 'blue'
    };
    (actions.generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);

    render(<MagicUploader />);

    // Upload file
    const file = new File(['dummy content'], 'hat.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload/i) || document.querySelector('input[type="file"]');

    // We need to bypass the fact that input is hidden by using standard dom query or label.
    // It is wrapped in a label.
    fireEvent.change(input as Element, { target: { files: [file] } });

    // Analyze button should be enabled
    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    expect(analyzeBtn).not.toBeDisabled();

    // Click analyze
    fireEvent.click(analyzeBtn);

    // Should show loading
    expect(screen.getByText(/Sending to Gemini/i)).toBeInTheDocument();

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByDisplayValue('Generated Hat')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    });

    // Check if approve & publish button appears
    const publishBtn = screen.getByRole('button', { name: /Approve & Publish/i });
    expect(publishBtn).toBeInTheDocument();

    // Mock save
    (actions.saveProductToDb as jest.Mock).mockResolvedValue({ success: true });

    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });
});
