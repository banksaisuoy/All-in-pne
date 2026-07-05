import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VisualSearchPage from '../app/shop/visual-search/page';
import * as actions from '../lib/actions/visual-search';
import { act } from '@testing-library/react';

jest.mock('../lib/actions/visual-search', () => ({
    searchSimilarProducts: jest.fn()
}));

describe('VisualSearchPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('handles image upload and displays results', async () => {
        render(<VisualSearchPage />);

        expect(screen.getByText('Snap to Shop')).toBeInTheDocument();

        // Search by container or placeholder text since label isn't "upload"
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['dummy'], 'dummy.png', { type: 'image/png' });

        const dummyFileReader = {
            readAsDataURL: jest.fn(),
            result: 'data:image/png;base64,dummy',
            onloadend: null as any
        };
        (window as any).FileReader = jest.fn(() => dummyFileReader);

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        expect(screen.getByAltText('Preview')).toBeInTheDocument();

        (actions.searchSimilarProducts as jest.Mock).mockResolvedValue([
            {
                id: '1',
                name: 'Test Item',
                description: 'Test description',
                price: 50,
                imageUrl: 'http://test.com/item.jpg',
                similarity: 0.99
            }
        ]);

        const searchButton = screen.getByText('Search');

        await act(async () => {
            fireEvent.click(searchButton);
            if (dummyFileReader.onloadend) {
                await dummyFileReader.onloadend();
            }
        });

        expect(actions.searchSimilarProducts).toHaveBeenCalledWith('data:image/png;base64,dummy');

        await waitFor(() => {
            expect(screen.getByText('Found 1 matches')).toBeInTheDocument();
            expect(screen.getByText('Test Item')).toBeInTheDocument();
            expect(screen.getByText('99% Match')).toBeInTheDocument();
        });
    });
});
