import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VisualSearchPage from '../app/shop/visual-search/page';

// Mock window.URL.createObjectURL
beforeAll(() => {
    window.URL.createObjectURL = jest.fn(() => 'mock-url');
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('VisualSearchPage', () => {
    it('renders the page title', () => {
        render(<VisualSearchPage />);
        expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
    });

    it('handles file upload and preview', async () => {
        render(<VisualSearchPage />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).toBeInTheDocument();

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        // The image preview should now be rendered (an Image component with the mock URL)
        const previewImage = screen.getByAltText('Preview');
        expect(previewImage).toBeInTheDocument();
    });
});
