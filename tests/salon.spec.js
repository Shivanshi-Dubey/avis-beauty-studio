const { test, expect } = require('@playwright/test');

test('Complete Salon Website Test', async ({ page }) => {
  await page.goto('https://avisbeautystudio.ca');

  await expect(page).toHaveTitle(/Avi/i);

  await page.screenshot({
    path: 'homepage.png',
    fullPage: true,
  });
});