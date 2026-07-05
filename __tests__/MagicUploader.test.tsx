import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MagicUploader from '../app/admin/upload/page';

beforeAll(() => {
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('MagicUploader', () => {
    it('renders the page title', () => {
        render(<MagicUploader />);
        expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    });

    it('handles file upload and preview', async () => {
        render(<MagicUploader />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        // The image preview should now be rendered
        const previewImage = screen.getByAltText('Preview');
        expect(previewImage).toBeInTheDocument();
    });
});
