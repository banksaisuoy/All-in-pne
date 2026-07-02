import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MagicUploader from '../app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';

// Mock the server actions
jest.mock('@/lib/actions/upload-product', () => ({
    generateProductMetadata: jest.fn(),
    saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock URL.createObjectURL
        window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    });

    it('renders the initial state correctly', () => {
        render(<MagicUploader />);
        expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
        expect(screen.getByText('Analyze Image')).toBeDisabled();
        expect(screen.getByText('Waiting for analysis...')).toBeInTheDocument();
    });

    it('enables the analyze button when a file is selected', async () => {
        render(<MagicUploader />);

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Click to upload/i) as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Analyze Image')).not.toBeDisabled();
        });
    });

    it('calls generateProductMetadata when analyze is clicked and renders results', async () => {
        const mockMetadata = {
            name: 'Test Product',
            price: 99.99,
            tags: ['test', 'mock'],
            description: 'Mock desc',
            description_html: '<p>Mock desc</p>',
            color: 'red'
        };
        (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);

        render(<MagicUploader />);

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Click to upload/i) as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        // Mock FileReader
        const mockFileReader = {
            readAsDataURL: jest.fn(),
            onloadend: null as any,
            result: 'data:image/png;base64,mockbase64'
        };
        window.FileReader = jest.fn(() => mockFileReader) as any;

        const analyzeButton = screen.getByText('Analyze Image');
        fireEvent.click(analyzeButton);

        // Trigger the onloadend
        await waitFor(() => {
            mockFileReader.onloadend();
        });

        await waitFor(() => {
            expect(generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,mockbase64');
            expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
            expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();
            expect(screen.getByText('#test')).toBeInTheDocument();
        });
    });

    it('calls saveProductToDb when save is clicked', async () => {
        const mockMetadata = {
            name: 'Test Product',
            price: 99.99,
            tags: ['test'],
            description: 'Mock desc',
            description_html: '<p>Mock</p>',
            color: 'red'
        };
        (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
        (saveProductToDb as jest.Mock).mockResolvedValue({ success: true });

        render(<MagicUploader />);

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Click to upload/i) as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        // Mock FileReader
        const mockFileReader = {
            readAsDataURL: jest.fn(),
            onloadend: null as any,
            result: 'data:image/png;base64,mockbase64'
        };
        window.FileReader = jest.fn(() => mockFileReader) as any;

        fireEvent.click(screen.getByText('Analyze Image'));
        await waitFor(() => {
            mockFileReader.onloadend();
        });

        await waitFor(() => {
            expect(screen.getByText('Approve & Publish')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Approve & Publish'));

        await waitFor(() => {
            expect(saveProductToDb).toHaveBeenCalledWith({
                ...mockMetadata,
                imageUrl: 'blob:mock-url'
            });
            expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
        });
    });
});
