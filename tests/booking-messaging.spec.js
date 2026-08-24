const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8765';

async function completeBookingFlow(page) {
  await page.goto(`${BASE}/index.html`);
  await page.waitForTimeout(800); // loader

  await page.getByRole('button', { name: 'Book Now' }).first().click();
  await expect(page.locator('#overlay')).toHaveClass(/open/);

  // Step 1: service + stylist
  await page.locator('.svc-opt[data-svc="Facials"]').click();
  await page.locator('.staff-c[data-staff="Raman Batth"]').click();
  await page.locator('#pg1 button.btn-primary').click();

  // Step 2: date + time
  await page.locator('.d-cell').first().click();
  await page.locator('.t-slot').first().click();
  await page.locator('#pg2 button.btn-primary').click();

  // Step 3: details
  await page.locator('#fname').fill('Test');
  await page.locator('#lname').fill('Customer');
  await page.locator('#phone').fill('+1 647 555 1234');
  await page.locator('#email').fill('test@example.com');
  await page.locator('#pg3 button.btn-primary').click();

  await expect(page.locator('#pg4')).toHaveClass(/show/);
  await expect(page.locator('#summaryBox')).toContainText('Facials');
  await expect(page.locator('#summaryBox')).toContainText('Raman Batth');
  await expect(page.locator('#summaryBox')).toContainText('Test');
}

test.describe('Booking & messaging — real browser tests', () => {
  test('Book Now opens modal and steps work', async ({ page }) => {
    await completeBookingFlow(page);
  });

  test('Confirm Booking opens WhatsApp with appointment details', async ({ page, context }) => {
    await completeBookingFlow(page);

    const popupPromise = context.waitForEvent('page');
    await page.locator('button:has-text("Confirm Booking")').click();

    const popup = await popupPromise;
    const url = popup.url();

    expect(url).toMatch(/wa\.me\/16477176747/);
    expect(decodeURIComponent(url)).toContain('Facials');
    expect(decodeURIComponent(url)).toContain('Raman Batth');
    expect(decodeURIComponent(url)).toContain('Test');
    expect(decodeURIComponent(url)).toContain('647');

    await popup.close();

    await expect(page.locator('#successView')).toHaveClass(/show/);
    await expect(page.locator('#bkRef')).toContainText(/WhatsApp/i);
  });

  test('Contact form opens WhatsApp with message', async ({ page, context }) => {
    await page.goto(`${BASE}/contact.html`);
    await page.waitForTimeout(800);

    await page.locator('#contactName').fill('Jane Doe');
    await page.locator('#contactPhone').fill('+1 647 555 9999');
    await page.locator('#contactMessage').fill('I want to book a facial next week.');

    const popupPromise = context.waitForEvent('page');
    await page.locator('#contactSubmit').click();

    const popup = await popupPromise;
    const url = popup.url();
    const decoded = decodeURIComponent(url);

    expect(url).toMatch(/wa\.me\/16477176747/);
    expect(decoded).toContain('Jane Doe');
    expect(decoded).toContain('facial');

    await popup.close();
  });

  test('Floating WhatsApp button has correct link', async ({ page }) => {
    await page.goto(`${BASE}/index.html`);
    const wa = page.locator('a.wa-btn');
    await expect(wa).toBeVisible();
    await expect(wa).toHaveAttribute('href', 'https://wa.me/16477176747');
  });

  test('Booking works from services page', async ({ page, context }) => {
    await page.goto(`${BASE}/service.html`);
    await page.waitForTimeout(800);

    await page.getByRole('button', { name: 'Book Appointment' }).first().click();
    await expect(page.locator('#overlay')).toHaveClass(/open/);

    await page.locator('.svc-opt[data-svc="Bridal Makeup"]').click();
    await page.locator('.staff-c[data-staff="Senior Stylist"]').click();
    await page.locator('#pg1 button.btn-primary').click();
    await page.locator('.d-cell').first().click();
    await page.locator('.t-slot').first().click();
    await page.locator('#pg2 button.btn-primary').click();
    await page.locator('#fname').fill('Bride');
    await page.locator('#phone').fill('+1 647 111 2222');
    await page.locator('#pg3 button.btn-primary').click();

    const popupPromise = context.waitForEvent('page');
    await page.locator('button:has-text("Confirm Booking")').click();
    const popup = await popupPromise;

    expect(decodeURIComponent(popup.url())).toContain('Bridal Makeup');
    await popup.close();
  });
});
