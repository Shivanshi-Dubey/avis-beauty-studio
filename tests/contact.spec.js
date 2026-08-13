const { test, expect } = require('@playwright/test');

test('Contact page opens', async ({ page }) => {

  await page.goto('https://avisbeautystudio.ca/contact.html');

  await expect(page).toHaveURL(/contact/);

  await expect(page.locator('body')).toBeVisible();

});