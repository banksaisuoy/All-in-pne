import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MagicUploader from '../app/admin/upload/page';
import * as actions from '../lib/actions/upload-product';
import { act } from '@testing-library/react';

// Mock the actions
jest.mock('../lib/actions/upload-product', () => ({
    generateProductMetadata: jest.fn(),
    saveProductToDb: jest.fn()
}));

describe('MagicUploader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders uploader and handles file upload', async () => {
        render(<MagicUploader />);

        expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
        expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();

        const fileInput = screen.getByLabelText(/upload/i, { selector: 'input[type="file"]' });

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });

        // Mock FileReader
        const dummyFileReader = {
            readAsDataURL: jest.fn(),
            result: 'data:image/png;base64,dummy',
            onloadend: null as any
        };
        (window as any).FileReader = jest.fn(() => dummyFileReader);

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        // Test preview image uses the mock URL we setup in jest.setup.js
        expect(screen.getByAltText('Preview')).toBeInTheDocument();

        // Simulate analysis
        (actions.generateProductMetadata as jest.Mock).mockResolvedValue({
            name: 'Cool Product',
            description_html: '<p>A cool product</p>',
            price: 99.99,
            category: 'Gadgets',
            tags: ['cool', 'gadget']
        });

        const analyzeButton = screen.getByText('Analyze Image');

        await act(async () => {
            fireEvent.click(analyzeButton);
            if (dummyFileReader.onloadend) {
                await dummyFileReader.onloadend();
            }
        });

        expect(actions.generateProductMetadata).toHaveBeenCalledWith('data:image/png;base64,dummy');

        await waitFor(() => {
            expect(screen.getByDisplayValue('Cool Product')).toBeInTheDocument();
            expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();
        });

        // Simulate save
        (actions.saveProductToDb as jest.Mock).mockResolvedValue(undefined);

        const saveButton = screen.getByText('Approve & Publish');
        await act(async () => {
            fireEvent.click(saveButton);
        });

        expect(actions.saveProductToDb).toHaveBeenCalledWith({
            name: 'Cool Product',
            description_html: '<p>A cool product</p>',
            price: 99.99,
            category: 'Gadgets',
            tags: ['cool', 'gadget'],
            imageUrl: 'mock-url'
        });

        await waitFor(() => {
            expect(screen.getByText('Product successfully published!')).toBeInTheDocument();
        });
    });
});
