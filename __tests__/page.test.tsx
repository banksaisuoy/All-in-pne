import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Page', () => {
  it('renders correctly', () => {
    render(<Home />);

    // Check main heading
    expect(screen.getByText(/To get started, edit the page.tsx file/i)).toBeInTheDocument();

    // Check links
    expect(screen.getByRole('link', { name: /Deploy Now/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Documentation/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Templates/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Learning/i })).toBeInTheDocument();

    // Check images
    expect(screen.getByAltText(/Next.js logo/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Vercel logomark/i)).toBeInTheDocument();
  });
});
