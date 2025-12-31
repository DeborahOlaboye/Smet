import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders an element with aria-hidden', () => {
    const { container } = render(<Skeleton className="w-8 h-8" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-hidden');
  });
});
