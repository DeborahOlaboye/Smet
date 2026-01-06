import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test('should display analytics components', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check page title and description
    await expect(page.getByRole('heading', { name: /reward analytics/i })).toBeVisible();
    await expect(page.getByText(/visualizations for reward distribution/i)).toBeVisible();
    
    // Check statistics cards
    await expect(page.getByText(/total opened/i)).toBeVisible();
    await expect(page.getByText(/total claimed/i)).toBeVisible();
    await expect(page.getByText(/claim rate/i)).toBeVisible();
    await expect(page.getByText(/total value/i)).toBeVisible();
    
    // Check refresh button
    await expect(page.getByRole('button', { name: /refresh data/i })).toBeVisible();
  });

  test('should display charts and visualizations', async ({ page }) => {
    await page.goto('/analytics');
    
    // Wait for charts to load
    await page.waitForTimeout(1000);
    
    // Check for chart containers
    await expect(page.getByText(/reward distribution/i)).toBeVisible();
    await expect(page.getByText(/reward probabilities/i)).toBeVisible();
    
    // Check for reward breakdown table
    await expect(page.getByText(/reward breakdown/i)).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /reward/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /probability/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /claims/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /rarity/i })).toBeVisible();
  });

  test('should refresh data when refresh button is clicked', async ({ page }) => {
    await page.goto('/analytics');
    
    const refreshButton = page.getByRole('button', { name: /refresh data/i });
    await expect(refreshButton).toBeVisible();
    
    // Click refresh button
    await refreshButton.click();
    
    // Button should show loading state briefly
    await expect(refreshButton).toBeDisabled();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/analytics');
    
    // Statistics should stack vertically on mobile
    const statsGrid = page.locator('.grid-cols-1');
    await expect(statsGrid).toBeVisible();
    
    // Charts should be responsive
    await expect(page.getByText(/reward distribution/i)).toBeVisible();
    await expect(page.getByText(/reward probabilities/i)).toBeVisible();
  });
});