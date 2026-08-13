const { test, expect } = require('@playwright/test');

test('Navigation menu works', async ({ page }) => {

  const pages = [
    { text: 'About', url: /about/ },
    { text: 'Services', url: /service/ },
    { text: 'Packages', url: /packages/ },
    { text: 'Laser', url: /laser/ },
    { text: 'Gallery', url: /gallery/ },
    { text: 'Contact', url: /contact/ },
    { text: 'Login', url: /login/ }
  ];

  for (const item of pages) {

    await page.goto('https://avisbeautystudio.ca');

     // Wait until loader disappears
  await page.locator('#luxLoader').waitFor({
    state: 'hidden'
  });

    // Click the FIRST matching link
    await page.getByRole('link', {
      name: item.text,
      exact: true
    }).first().click();

    await expect(page).toHaveURL(item.url);

  }

});