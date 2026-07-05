import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import UploadProductPage from '@/app/admin/upload/page';
import * as uploadActions from '@/lib/actions/upload-product';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('UploadProductPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.URL.createObjectURL as any) = jest.fn(() => 'mock-url');
    console.error = jest.fn(); // Suppress specific react errors during tests
  });

  it('renders upload area initially', () => {
    render(<UploadProductPage />);
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('handles image upload and generates metadata', async () => {
    const mockMetadata = {
        name: 'Test Name',
        description: 'Test Description',
        description_html: '<p>Test Description</p>',
        price: 19.99,
        tags: ['test', 'product'],
        color: 'red'
    };
    (uploadActions.generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);

    render(<UploadProductPage />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: jest.fn(function(this: any) {
        setTimeout(() => {
            this.result = 'data:image/png;base64,hello';
            this.onloadend?.({} as any);
        }, 0);
      }),
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(screen.getByAltText('Preview')).toBeInTheDocument();

    const analyzeButton = screen.getByText('Analyze Image');

    await act(async () => {
        fireEvent.click(analyzeButton);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    });
  });

  it('saves product on submit', async () => {
      const mockMetadata = {
        name: 'Test Name',
        description: 'Test Description',
        description_html: '<p>Test Description</p>',
        price: 19.99,
        tags: ['test', 'product'],
        color: 'red'
    };
    (uploadActions.generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
    (uploadActions.saveProductToDb as jest.Mock).mockResolvedValue({ success: true });

    render(<UploadProductPage />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: jest.fn(function(this: any) {
        setTimeout(() => {
            this.result = 'data:image/png;base64,hello';
            this.onloadend?.({} as any);
        }, 0);
      }),
    };
    (window as any).FileReader = jest.fn(() => mockFileReader);

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const analyzeButton = screen.getByText('Analyze Image');

    await act(async () => {
        fireEvent.click(analyzeButton);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Name')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Approve & Publish');

    await act(async () => {
        fireEvent.click(saveButton);
    });

    await waitFor(() => {
        expect(uploadActions.saveProductToDb).toHaveBeenCalled();
        expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });
});
