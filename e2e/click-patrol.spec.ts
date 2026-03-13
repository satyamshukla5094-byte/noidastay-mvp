import { test, expect } from '@playwright/test';

test.describe('The Click Patrol', () => {
  test('Search and verify Show Number functionality', async ({ page }) => {
    // 1. Opens the homepage
    await page.goto('/');

    // 2. Types 'Knowledge Park' in the search bar
    const searchInput = page.getByPlaceholder('Search by College or Sector');
    await searchInput.fill('Knowledge Park');
    // Wait for debounce track
    await page.waitForTimeout(1000);

    // 3. Clicks a property card (first one that matches)
    const propertyCard = page.locator('a[href^="/property/"]').first();
    await propertyCard.click();

    // 4. Verifies that the 'Show Number' button is clickable and reveals a number
    const showNumberBtn = page.getByRole('button', { name: /Show Number/i });
    
    // Ensure button is visible and clickable
    await expect(showNumberBtn).toBeVisible();
    await showNumberBtn.click();

    // Verify button state changes to loading then shows the number
    const buttonAfterClick = page.getByRole('button', { name: /\+91/i });
    await expect(buttonAfterClick).toBeVisible({ timeout: 5000 });
    await expect(buttonAfterClick).toContainText('+91 99999 99999');
  });
});
