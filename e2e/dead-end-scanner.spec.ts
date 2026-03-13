import { test, expect } from '@playwright/test';

// Add all routes that should be accessible and return 200 OK
const routesToCheck = [
  '/',
  '/login',
  '/signup',
  '/dashboard',
  '/dashboard/leads',
  '/dashboard/tenants',
  '/dashboard/settings',
  '/profile',
];

test.describe('Dead-End Scanner', () => {
  // Test dynamic routes separately to ensure mock data exists
  test('Verify dynamic property routes do not 404', async ({ page }) => {
    // Navigate to home to get a valid property ID from a card
    await page.goto('/');
    const propertyCard = page.locator('a[href^="/property/"]').first();
    const href = await propertyCard.getAttribute('href');
    
    // Ensure we actually found a link
    expect(href).toBeTruthy();
    
    // Navigate to that property page and ensure it loads successfully
    const response = await page.goto(href as string);
    expect(response?.status()).not.toBe(404);
    expect(response?.status()).toBe(200);

    // Verify title exists on the property page
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
  });

  // Test static routes using a loop
  for (const route of routesToCheck) {
    test(`Verify route ${route} does not 404`, async ({ page }) => {
      const response = await page.goto(route);
      
      // Ensure the response isn't a 404 Not Found error
      expect(response?.status()).not.toBe(404);
      
      // We expect a 200 OK response for all these standard routes
      expect(response?.status()).toBe(200);

      // Verify no UI generic Next.js 404 text is visible
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toContain('This page could not be found');
    });
  }
});
