import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MagicUploader from '@/app/admin/upload/page';
import { generateProductMetadata, saveProductToDb } from '@/lib/actions/upload-product';

// Mock dependencies
jest.mock('@/lib/actions/upload-product', () => ({
    generateProductMetadata: jest.fn(),
    saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.URL.createObjectURL = jest.fn(() => 'blob:test-url') as any;
    });

    it('renders the initial state correctly', () => {
        render(<MagicUploader />);

        expect(screen.getByText('Magic Product Uploader')).toBeTruthy();
        expect(screen.getByText('Click to upload or drag and drop')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Analyze Image' })).toBeDisabled();
    });

    it('updates preview when file is selected', async () => {
        render(<MagicUploader />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Click to upload or drag and drop');

        fireEvent.change(input, { target: { files: [file] } });

        const preview = await screen.findByAltText('Preview');
        expect(preview).toBeTruthy();
        expect(preview.getAttribute('src')).toContain('blob:test-url');

        expect(screen.getByRole('button', { name: 'Analyze Image' })).not.toBeDisabled();
    });

    it('handles analysis success correctly', async () => {
        const mockMetadata = {
            name: 'Test Product',
            price: 99.99,
            tags: ['test', 'product'],
            description_html: '<p>Test description</p>'
        };

        (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);

        window.FileReader = jest.fn().mockImplementation(() => {
            const reader = {
                result: '',
                onloadend: null as any,
                readAsDataURL: jest.fn().mockImplementation(function(this: any) {
                    reader.result = 'data:image/png;base64,testbase64';
                    setTimeout(() => {
                       if (reader.onloadend) reader.onloadend();
                    }, 0);
                }),
            };
            return reader;
        }) as any;

        render(<MagicUploader />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Click to upload or drag and drop');
        fireEvent.change(input, { target: { files: [file] } });

        const analyzeButton = screen.getByRole('button', { name: 'Analyze Image' });
        await waitFor(() => expect(analyzeButton).not.toBeDisabled());
        fireEvent.click(analyzeButton);

        expect(screen.getByText('Sending to Gemini Vision API...')).toBeTruthy();

        await waitFor(() => {
            expect(generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,testbase64');
        });

        // Use findByDisplayValue to wait for the generated component to appear
        const nameInput = await screen.findByDisplayValue('Test Product');
        expect(nameInput).toBeTruthy();

        expect(screen.getByDisplayValue('99.99')).toBeTruthy();
        expect(screen.getByText('#test')).toBeTruthy();
        expect(screen.getByText('#product')).toBeTruthy();
        expect(screen.getByText('<p>Test description</p>')).toBeTruthy();
    });

    it('handles saving successfully', async () => {
        const mockMetadata = {
            name: 'Test Product',
            price: 99.99,
            tags: ['test', 'product'],
            description_html: '<p>Test description</p>'
        };

        (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
        (saveProductToDb as jest.Mock).mockResolvedValue(undefined);

        window.FileReader = jest.fn().mockImplementation(() => {
            const reader = {
                result: '',
                onloadend: null as any,
                readAsDataURL: jest.fn().mockImplementation(function(this: any) {
                    reader.result = 'data:image/png;base64,testbase64';
                    setTimeout(() => {
                        if (reader.onloadend) reader.onloadend();
                     }, 0);
                }),
            };
            return reader;
        }) as any;

        render(<MagicUploader />);

        // Upload and Analyze
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Click to upload or drag and drop');
        fireEvent.change(input, { target: { files: [file] } });

        const analyzeButton = screen.getByRole('button', { name: 'Analyze Image' });
        await waitFor(() => expect(analyzeButton).not.toBeDisabled());
        fireEvent.click(analyzeButton);

        const nameInput = await screen.findByDisplayValue('Test Product');
        expect(nameInput).toBeTruthy();

        // Save
        const saveButton = screen.getByRole('button', { name: /Approve & Publish/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(saveProductToDb).toHaveBeenCalledWith({
                ...mockMetadata,
                imageUrl: 'blob:test-url'
            });
            expect(screen.getByText('Product successfully published!')).toBeTruthy();
        });
    });
});

describe('MagicUploader Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.URL.createObjectURL = jest.fn(() => 'blob:test-url') as any;
    });

    it('handles analysis error correctly', async () => {
        (generateProductMetadata as jest.Mock).mockRejectedValue(new Error('API Error'));

        window.FileReader = jest.fn().mockImplementation(() => {
            const reader = {
                result: '',
                onloadend: null as any,
                readAsDataURL: jest.fn().mockImplementation(function(this: any) {
                    reader.result = 'data:image/png;base64,testbase64';
                    setTimeout(() => {
                       if (reader.onloadend) reader.onloadend();
                    }, 0);
                }),
            };
            return reader;
        }) as any;

        render(<MagicUploader />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Click to upload or drag and drop');
        fireEvent.change(input, { target: { files: [file] } });

        const analyzeButton = screen.getByRole('button', { name: 'Analyze Image' });
        await waitFor(() => expect(analyzeButton).not.toBeDisabled());
        fireEvent.click(analyzeButton);

        await waitFor(() => {
            expect(screen.getByText('Error analyzing image.')).toBeTruthy();
        });
    });

    it('handles save error correctly', async () => {
        const mockMetadata = {
            name: 'Test Product',
            price: 99.99,
            tags: ['test'],
            description_html: '<p>Test</p>'
        };
        (generateProductMetadata as jest.Mock).mockResolvedValue(mockMetadata);
        (saveProductToDb as jest.Mock).mockRejectedValue(new Error('Save Error'));

        window.FileReader = jest.fn().mockImplementation(() => {
            const reader = {
                result: '',
                onloadend: null as any,
                readAsDataURL: jest.fn().mockImplementation(function(this: any) {
                    reader.result = 'data:image/png;base64,testbase64';
                    setTimeout(() => {
                        if (reader.onloadend) reader.onloadend();
                     }, 0);
                }),
            };
            return reader;
        }) as any;

        render(<MagicUploader />);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Click to upload or drag and drop');
        fireEvent.change(input, { target: { files: [file] } });

        const analyzeButton = screen.getByRole('button', { name: 'Analyze Image' });
        await waitFor(() => expect(analyzeButton).not.toBeDisabled());
        fireEvent.click(analyzeButton);

        await screen.findByDisplayValue('Test Product');

        const saveButton = screen.getByRole('button', { name: /Approve & Publish/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to save product.')).toBeTruthy();
        });
    });
});
