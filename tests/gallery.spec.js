const { test, expect } = require('@playwright/test');

test('Gallery page opens', async ({ page }) => {

  await page.goto('https://avisbeautystudio.ca/gallery.html');

  await expect(page).toHaveURL(/gallery/);

  await expect(page.locator('body')).toBeVisible();

});