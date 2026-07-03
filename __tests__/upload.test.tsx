import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MagicUploader from '../app/admin/upload/page';
import * as uploadActions from '../lib/actions/upload-product';

jest.mock('../lib/actions/upload-product', () => ({
    generateProductMetadata: jest.fn(),
    saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.URL.createObjectURL = jest.fn(() => 'mock-url');
    });

    it('renders correctly', () => {
        render(<MagicUploader />);
        expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /analyze image/i })).toBeDisabled();
    });

    it('enables analyze button on file select', async () => {
        render(<MagicUploader />);
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /analyze image/i })).not.toBeDisabled();
        });
    });

    it('analyzes image and shows generated metadata', async () => {
        const mockMetadata = {
            name: 'Cool Shirt',
            price: 25,
            tags: ['summer', 'casual'],
            description_html: '<p>Nice shirt</p>'
        };
        (uploadActions.generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);

        const mockFileReader = {
            readAsDataURL: jest.fn(),
            result: 'data:image/png;base64,mock',
            onloadend: null as unknown as () => void,
        };
        (window as unknown as Window).FileReader = jest.fn(() => mockFileReader);

        render(<MagicUploader />);

        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        const analyzeBtn = screen.getByRole('button', { name: /analyze image/i });
        fireEvent.click(analyzeBtn);

        await act(async () => {
            mockFileReader.onloadend();
        });

        await waitFor(() => {
            expect(uploadActions.generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,mock');
            expect(screen.getByDisplayValue('Cool Shirt')).toBeInTheDocument();
            expect(screen.getByDisplayValue('25')).toBeInTheDocument();
            expect(screen.getByText('#summer')).toBeInTheDocument();
        });
    });
});
