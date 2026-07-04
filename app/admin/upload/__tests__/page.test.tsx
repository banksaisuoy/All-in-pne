import { render, screen, act } from '@testing-library/react';
import MagicUploader from '../page';

import userEvent from '@testing-library/user-event';

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn(),
  saveProductToDb: jest.fn(),
}));

describe('MagicUploader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload interface', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    const user = userEvent.setup();
    render(<MagicUploader />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Click to upload/i) as HTMLInputElement;

    await act(async () => {
      await user.upload(input, file);
    });

    expect(screen.getByAltText('Preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Image/i })).not.toBeDisabled();
  });
});
