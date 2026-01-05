import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test('should display mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');
    
    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /toggle menu/i });
    await expect(menuButton).toBeVisible();
    
    // Desktop navigation should be hidden
    await expect(page.locator('nav').first()).not.toBeVisible();
    
    // Click menu button to open mobile menu
    await menuButton.click();
    
    // Mobile menu should be visible
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /transactions/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
  });

  test('should display desktop navigation on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 }); // Desktop size
    await page.goto('/');
    
    // Desktop navigation should be visible
    await expect(page.locator('nav').first()).toBeVisible();
    
    // Mobile menu button should be hidden
    await expect(page.getByRole('button', { name: /toggle menu/i })).not.toBeVisible();
    
    // Navigation links should be visible
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /transactions/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
  });

  test('should adapt reward grid layout on different screen sizes', async ({ page }) => {
    await page.goto('/');
    
    // Mobile layout (single column)
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileGrid = page.locator('.grid-cols-1');
    await expect(mobileGrid).toBeVisible();
    
    // Tablet layout (2 columns)
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletGrid = page.locator('.sm\\:grid-cols-2');
    await expect(tabletGrid).toBeVisible();
    
    // Desktop layout (multiple columns)
    await page.setViewportSize({ width: 1024, height: 768 });
    const desktopGrid = page.locator('.lg\\:grid-cols-3');
    await expect(desktopGrid).toBeVisible();
  });
});