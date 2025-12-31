import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

test('Skeleton renders pulse animation', () => {
  const { container } = render(<Skeleton className="test-skel" />);
  const el = container.firstChild as HTMLElement;
  expect(el).toBeDefined();
  expect(el.className).toContain('animate-pulse');
});
