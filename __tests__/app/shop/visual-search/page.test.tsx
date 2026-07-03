import { render, screen } from '@testing-library/react';
import VisualSearchPage from '@/app/shop/visual-search/page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} priority={props.priority ? "true" : undefined} />;
  },
}));

jest.mock('@/lib/actions/visual-search', () => ({
  searchSimilarProducts: jest.fn().mockResolvedValue([]),
}));

describe('VisualSearchPage', () => {
  beforeAll(() => {
    (window.URL.createObjectURL as any) = jest.fn(() => 'mock-url');
    (window.FileReader as any) = jest.fn(() => ({
      readAsDataURL: jest.fn(),
      onloadend: jest.fn(),
    }));
  });

  it('renders the visual search page', () => {
    render(<VisualSearchPage />);
    expect(screen.getByText('Snap to Shop')).toBeInTheDocument();
  });
});
