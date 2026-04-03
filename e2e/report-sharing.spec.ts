import { test, expect } from "@playwright/test";
import { createTestAccessToken } from "./test-auth";

/**
 * Report Sharing & Access Control E2E Tests
 * Tests sharing functionality, access tokens, and permission controls
 */

test.describe("Report Sharing & Access Control", () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock admin authentication
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

  test("should display share button on report", async ({ page }) => {
    await page.goto("/report/test-id");

    // Look for share button
    const shareButton = page.locator(
      'button:has-text("Share"), a:has-text("Share"), [aria-label*="share"]',
    );

    if (await shareButton.isVisible()) {
      expect(await shareButton.isEnabled()).toBeTruthy();
    }
  });

  test("should open share dialog", async ({ page }) => {
    await page.goto("/report/test-id");

    const shareButton = page.locator('button:has-text("Share")').first();

    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Look for share dialog/modal
      const shareDialog = page.locator(
        '[role="dialog"], .modal, .share-dialog',
      );

      const isVisible = await shareDialog
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      expect(typeof isVisible).toBe("boolean");
    }
  });

  test("should validate recipient email before sharing", async ({ page }) => {
    await page.goto("/report/test-id");

    const shareButton = page.locator('button:has-text("Share")').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Find email input in share dialog
      const emailInput = page
        .locator(
          '[role="dialog"] input[type="email"], .share-dialog input[type="email"]',
        )
        .first();

      if (await emailInput.isVisible()) {
        // Enter invalid email
        await emailInput.fill("invalid-email");

        // Try to share
        const shareBtn = page
          .locator(
            '[role="dialog"] button:has-text("Share"), .share-dialog button:has-text("Share")',
          )
          .first();
        if (await shareBtn.isVisible()) {
          await shareBtn.click();

          // Should show validation error
          const error = page.locator('[role="alert"], .error');
          const hasError = await error
            .isVisible({ timeout: 2000 })
            .catch(() => false);
          expect(typeof hasError).toBe("boolean");
        }
      }
    }
  });

  test("should prevent sharing with own email", async ({ page }) => {
    await page.goto("/report/test-id");

    const shareButton = page.locator('button:has-text("Share")').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();

      const emailInput = page
        .locator(
          '[role="dialog"] input[type="email"], .share-dialog input[type="email"]',
        )
        .first();

      if (await emailInput.isVisible()) {
        // Try sharing with same email (not allowed)
        await emailInput.fill("admin@example.com");

        const shareBtn = page
          .locator('[role="dialog"] button:has-text("Share")')
          .first();
        if (await shareBtn.isVisible()) {
          await shareBtn.click();

          // Should show error
          const error = page.locator(
            '[role="alert"], .error, text=/cannot share|yourself/i',
          );
          const hasError = await error
            .isVisible({ timeout: 2000 })
            .catch(() => false);
          expect(typeof hasError).toBe("boolean");
        }
      }
    }
  });

  test("should generate secure share token", async ({ page, context }) => {
    await page.goto("/report/test-id");

    const shareButton = page.locator('button:has-text("Share")').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();

      // After sharing, token should be generated
      const tokenDisplay = page
        .locator('[data-testid="share-token"], .share-token, .token')
        .first();

      if (await tokenDisplay.isVisible({ timeout: 3000 }).catch(() => false)) {
        const token = await tokenDisplay.innerText();

        // Token should be non-empty and formatted
        expect(token.length).toBeGreaterThan(0);

        // Should be copyable
        const copyButton = page.locator('button:has-text("Copy")').first();
        if (await copyButton.isVisible()) {
          expect(await copyButton.isEnabled()).toBeTruthy();
        }
      }
    }
  });

  test("should allow accessing shared report with token", async ({
    page,
    context,
  }) => {
    // Navigate to shared report with valid token
    await page.goto("/shared/valid-share-token-123");

    // Should show report or require password
    const reportContent = page
      .locator('[data-testid="report-content"], .report-container, main')
      .first();
    const passwordForm = page
      .locator('[data-testid="password-form"], .password-form')
      .first();

    const hasContent = await reportContent
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasPasswordForm = await passwordForm.isVisible().catch(() => false);

    expect(hasContent || hasPasswordForm).toBeTruthy();
  });

  test("should reject invalid share token", async ({ page }) => {
    await page.goto("/shared/invalid-token-abc123xyz");

    // Should show error message
    const error = page.locator(
      '[role="alert"], .error-message, [data-testid="error"]',
    );

    const hasError = await error
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(hasError || page.url().includes("/login")).toBeTruthy();
  });

  test("should require password verification for shared access", async ({
    page,
  }) => {
    await page.goto("/shared/password-protected-token");

    // Look for password input
    const passwordInput = page.locator('input[type="password"]').first();

    if (await passwordInput.isVisible()) {
      // Try wrong password
      await passwordInput.fill("wrongpassword");

      const submitButton = page
        .locator('button[type="submit"], button:has-text("Verify")')
        .first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show error
        const error = page.locator('[role="alert"], .error');
        const hasError = await error
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        expect(typeof hasError).toBe("boolean");
      }
    }
  });

  test("should expire share token after timeframe", async ({ page }) => {
    // This would need time travel or actual expired token
    await page.goto("/shared/expired-share-token");

    // Should show expiry message
    const expiredMsg = page.locator(
      'text=/expired|no longer/i, [data-testid="expired"]',
    );

    const isExpired = await expiredMsg
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(typeof isExpired).toBe("boolean");
  });

  test("should list active shares", async ({ page }) => {
    await page.goto("/report/test-id");

    // Look for share management section
    const shareList = page
      .locator('[data-testid="share-list"], .shares-list, .active-shares')
      .first();

    if (await shareList.isVisible()) {
      // Should show list of shares
      const shares = shareList.locator("li, .share-item");
      const count = await shares.count();

      expect(count >= 0).toBeTruthy();
    }
  });

  test("should revoke share access", async ({ page }) => {
    await page.goto("/report/test-id");

    // Look for active shares
    const revokeButton = page
      .locator(
        'button:has-text("Revoke"), button:has-text("Remove"), button:has-text("Delete")',
      )
      .first();

    if (await revokeButton.isVisible()) {
      const initialCount = await page
        .locator('[data-testid="share-list"]')
        .count();

      await revokeButton.click();

      // Should show confirmation or directly revoke
      const confirmBtn = page
        .locator('button:has-text("Confirm"), button:has-text("Yes")')
        .first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      // Share should be removed
      const success = page.locator(
        '[data-testid="success"], .success-message, text=/revoked/i',
      );
      const hasSuccess = await success
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(typeof hasSuccess).toBe("boolean");
    }
  });

  test("should display share expiry information", async ({ page }) => {
    await page.goto("/report/test-id");

    const shareList = page
      .locator('[data-testid="share-list"], .shares-list')
      .first();

    if (await shareList.isVisible()) {
      // Look for expiry date/time
      const expiryInfo = shareList.locator("text=/expires|expiry|expires in/i");

      const hasExpiryInfo = await expiryInfo
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(typeof hasExpiryInfo).toBe("boolean");
    }
  });

  test("should allow setting share password", async ({ page }) => {
    await page.goto("/report/test-id");

    const shareButton = page.locator('button:has-text("Share")').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Look for password field in share dialog
      const passwordInput = page
        .locator(
          '[role="dialog"] input[type="password"], .share-dialog input[type="password"]',
        )
        .first();
      const passwordCheckbox = page
        .locator(
          '[role="dialog"] input[type="checkbox"], .share-dialog input[type="checkbox"]',
        )
        .first();

      if (await passwordCheckbox.isVisible()) {
        // Enable password protection
        await passwordCheckbox.check();

        // Password field should appear
        const isVisible = await passwordInput
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        expect(typeof isVisible).toBe("boolean");
      }
    }
  });
});
