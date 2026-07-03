import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MagicUploader from '../app/admin/upload/page';

jest.mock('../lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

import { generateProductMetadata, saveProductToDb } from '../lib/actions/upload-product';

describe('Magic Uploader Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.URL.createObjectURL as unknown) = jest.fn(() => 'mock-url');
  });

  it('renders initial state', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('allows file upload and shows preview', async () => {
    render(<MagicUploader />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  it('performs analysis and displays data', async () => {
    (generateProductMetadata as jest.Mock).mockResolvedValue({
      name: 'Test Product',
      description_html: '<p>Test</p>',
      category: 'Test',
      price: 99.99,
      tags: ['test']
    });

    render(<MagicUploader />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    await userEvent.upload(input, file);

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    await userEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();
      expect(screen.getByText('#test')).toBeInTheDocument();
    });
  });

  it('saves product successfully', async () => {
    (generateProductMetadata as jest.Mock).mockResolvedValue({
      name: 'Test Product',
      description_html: '<p>Test</p>',
      category: 'Test',
      price: 99.99,
      tags: ['test']
    });
    (saveProductToDb as jest.Mock).mockResolvedValue(true);

    render(<MagicUploader />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    await userEvent.upload(input, file);

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    await userEvent.click(analyzeBtn);

    const saveBtn = await screen.findByRole('button', { name: /Approve & Publish/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
    });
  });

  it('handles analysis failure', async () => {
    (generateProductMetadata as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<MagicUploader />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    await userEvent.upload(input, file);

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    await userEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText('Error analyzing image.')).toBeInTheDocument();
    });
  });

  it('handles FileReader error', async () => {
    const originalFileReader = global.FileReader;
    class MockFileReader {
      onloadend: () => void = () => {};
      readAsDataURL() {
        throw new Error('FileReader Error');
      }
    }
    global.FileReader = MockFileReader as unknown as typeof global.FileReader;

    render(<MagicUploader />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    await userEvent.upload(input, file);

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    await userEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText('Error processing file.')).toBeInTheDocument();
    });

    global.FileReader = originalFileReader;
  });

  it('handles save failure', async () => {
    (generateProductMetadata as jest.Mock).mockResolvedValue({
      name: 'Test Product',
      description_html: '<p>Test</p>',
      category: 'Test',
      price: 99.99,
      tags: ['test']
    });
    (saveProductToDb as jest.Mock).mockRejectedValue(new Error('DB Error'));

    render(<MagicUploader />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload or drag and drop/i);

    await userEvent.upload(input, file);

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Image/i });
    await userEvent.click(analyzeBtn);

    const saveBtn = await screen.findByRole('button', { name: /Approve & Publish/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Failed to save product.')).toBeInTheDocument();
    });
  });
});
