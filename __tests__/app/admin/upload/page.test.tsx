import { render, screen, fireEvent } from '@testing-library/react';
import MagicUploader from '@/app/admin/upload/page';

// Mock dependencies
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} priority={props.priority ? "true" : undefined} />;
  },
}));

jest.mock('@/lib/actions/upload-product', () => ({
  generateProductMetadata: jest.fn().mockResolvedValue({
    name: 'Mock Product',
    price: 100,
    tags: ['tag1', 'tag2'],
    description_html: '<p>Mock Description</p>',
  }),
  saveProductToDb: jest.fn().mockResolvedValue(true),
}));

describe('MagicUploader', () => {
  beforeAll(() => {
    (window.URL.createObjectURL as any) = jest.fn(() => 'mock-url');
    (window.FileReader as any) = jest.fn(() => ({
      readAsDataURL: jest.fn(),
      onloadend: jest.fn(),
    }));
  });

  it('renders the uploader page', () => {
    render(<MagicUploader />);
    expect(screen.getByText('Magic Product Uploader')).toBeInTheDocument();
  });
});
