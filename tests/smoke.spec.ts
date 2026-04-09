import { test, expect } from '@playwright/test';

test('has title and fundamental controls', async ({ page }) => {
  await page.goto('./');

  // Check title
  await expect(page.locator('h1')).toContainText('GoldenPath');

  // Check for Mode Selector
  await expect(page.getByText('Processing Mode')).toBeVisible();

  // Check for API Key input
  await expect(page.getByPlaceholder('Enter your API Key...')).toBeVisible();

  // Check for Upload Zone (Drag & drop)
  await expect(page.getByText('Drag & drop log file')).toBeVisible();

  // Advanced Settings toggle
  const advancedBtn = page.getByRole('button', { name: 'Advanced Settings' });
  await expect(advancedBtn).toBeVisible();
  await advancedBtn.click();
  // Check for split range slider
  await expect(page.getByText('Turns per batch')).toBeVisible();
});
