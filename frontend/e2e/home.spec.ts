import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display main elements', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Smet App/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /rewards collection/i })).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /transactions/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
    
    // Check wallet connect button
    await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible();
  });

  test('should show wallet connection prompt', async ({ page }) => {
    await page.goto('/');
    
    // Should show warning about connecting wallet
    await expect(page.getByText(/connect your wallet to open rewards/i)).toBeVisible();
  });

  test('should navigate to other pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to transactions
    await page.getByRole('link', { name: /transactions/i }).click();
    await expect(page).toHaveURL('/transactions');
    await expect(page.getByRole('heading', { name: /transaction history/i })).toBeVisible();
    
    // Navigate to analytics
    await page.getByRole('link', { name: /analytics/i }).click();
    await expect(page).toHaveURL('/analytics');
    await expect(page.getByRole('heading', { name: /reward analytics/i })).toBeVisible();
    
    // Navigate back to home
    await page.getByRole('link', { name: /home/i }).click();
    await expect(page).toHaveURL('/');
  });
});