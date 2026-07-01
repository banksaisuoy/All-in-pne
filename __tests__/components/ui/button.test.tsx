import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('supports asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    expect(screen.getByRole('link', { name: /link button/i })).toBeInTheDocument();
  });

  it('supports different variants', () => {
    render(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole('button', { name: /destructive/i })).toHaveClass('bg-destructive');
  });

  it('supports different sizes', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button', { name: /small/i })).toHaveClass('h-8'); // the size is actually h-8 for sm in tailwind/shadcn
  });
});
