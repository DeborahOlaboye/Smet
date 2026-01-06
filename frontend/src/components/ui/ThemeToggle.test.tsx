import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

test('ThemeToggle toggles dark class on documentElement', async () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );

  const btn = screen.getByRole('button', { name: /toggle theme/i });
  expect(document.documentElement.classList.contains('dark')).toBe(false);

  await userEvent.click(btn);
  expect(document.documentElement.classList.contains('dark')).toBe(true);

  await userEvent.click(btn);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
});
