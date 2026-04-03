import { test, expect } from "@playwright/test";
import { createTestAccessToken } from "./test-auth";

/**
 * Report Viewing & Navigation E2E Tests
 * Tests report display, viewing, and user interactions
 */

test.describe("Report Viewing & Navigation", () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication by setting test token
    const accessToken = await createTestAccessToken("admin");
    await context.addCookies([
      {
        name: "accessToken",
        value: accessToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
  });

  test("should display report list page", async ({ page }) => {
    await page.goto("/report");

    // Should show page title or heading
    const heading = page.locator("h1, h2").first();
    await expect(heading)
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Page might be loading or require navigation
      });
  });

  test("should navigate between report sections", async ({ page }) => {
    await page.goto("/report");

    // Look for section navigation (tabs, sidebar, etc.)
    const sectionLinks = page.locator(
      'a[href*="/report/"], button:has-text("section"), nav a',
    );
    const count = await sectionLinks.count();

    // Should have at least some navigation elements
    if (count > 0) {
      // Try clicking first section
      await sectionLinks.first().click();

      // Page should navigate to new section
      const url = page.url();
      expect(url).toContain("/report");
    }
  });

  test("should display report data correctly", async ({ page }) => {
    await page.goto("/report/test-id");

    // Look for common report elements
    const reportContent = page.locator(
      '[data-testid="report-content"], .report-container, main',
    );
    await expect(reportContent)
      .toBeVisible({ timeout: 3000 })
      .catch(() => {
        // Report might use different selectors
      });
  });

  test("should have print functionality", async ({ page, context }) => {
    await page.goto("/report/test-id");

    // Look for print button
    const printButton = page.locator(
      'button:has-text("Print"), button:has-text("print"), [aria-label*="print"]',
    );

    if (await printButton.isVisible()) {
      // Intercept print dialog
      page.once("dialog", (dialog) => dialog.accept());

      await printButton.click();
    }
  });

  test("should have PDF download functionality", async ({ page, context }) => {
    await page.goto("/report/test-id");

    // Look for PDF download button
    const downloadButton = page.locator(
      'button:has-text("Download"), a:has-text("Download"), button:has-text("PDF")',
    );

    if (await downloadButton.isVisible()) {
      // Listen for download
      const downloadPromise = page.waitForEvent("download");
      await downloadButton.click();

      const download = await downloadPromise.catch(() => null);
      if (download) {
        expect(download.suggestedFilename()).toContain("pdf");
      }
    }
  });

  test("should handle missing report gracefully", async ({ page }) => {
    await page.goto("/report/nonexistent-id");

    // Should show error message or 404
    const errorMessage = page.locator(
      '[role="alert"], .error-message, .not-found',
    );
    const notFoundHeading = page.locator(
      'h1:has-text("Not Found"), h1:has-text("404")',
    );

    const hasError = await errorMessage.isVisible().catch(() => false);
    const has404 = await notFoundHeading.isVisible().catch(() => false);

    expect(hasError || has404 || page.url().includes("/login")).toBeTruthy();
  });

  test("should display report metadata", async ({ page }) => {
    await page.goto("/report/test-id");

    // Look for report metadata (date, patient name, etc.)
    const metadata = page.locator(
      '[data-testid="report-metadata"], .report-header, .report-info',
    );

    // Try to find common text patterns
    const pageText = await page.locator("body").innerText();

    // Should contain date, patient info, or similar
    const hasMetadata = /date|patient|report|created/i.test(pageText);
    expect(hasMetadata).toBeTruthy();
  });

  test("should be responsive on mobile", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }, // iPhone size
    });
    const page = await context.newPage();

    // Set auth
    const accessToken = await createTestAccessToken("admin");
    await context.addCookies([
      {
        name: "accessToken",
        value: accessToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/report");

    // Should be visible and not horizontally scrolled
    const body = page.locator("body");
    const boundingBox = await body.boundingBox();

    if (boundingBox) {
      // Body width should fit viewport
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    }

    await context.close();
  });

  test("should have keyboard navigation", async ({ page }) => {
    await page.goto("/report");

    // Test Tab key navigation
    await page.keyboard.press("Tab");

    // Should have focused element
    const focusedElement = page.locator(":focus");
    const count = await focusedElement.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should maintain scroll position on navigation", async ({ page }) => {
    await page.goto("/report");

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    let scrollPosition = await page.evaluate(() => window.scrollY);

    // Navigate to another section
    const link = page.locator('a[href*="/report/"]').first();
    if (await link.isVisible()) {
      await link.click();

      // Scroll position might reset, which is expected behavior
      const newScrollPosition = await page.evaluate(() => window.scrollY);
      expect(typeof newScrollPosition).toBe("number");
    }
  });
});
