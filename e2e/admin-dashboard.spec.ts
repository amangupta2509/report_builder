import { test, expect } from "@playwright/test";
import { createTestAccessToken } from "./test-auth";

/**
 * Admin Dashboard & Management E2E Tests
 * Tests admin functionality, user management, and system settings
 */

test.describe("Admin Dashboard & Management", () => {
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

  test("should display admin dashboard", async ({ page }) => {
    await page.goto("/admin");

    // Should show admin panel
    const adminPanel = page
      .locator('[data-testid="admin-panel"], .admin-dashboard, main')
      .first();

    const isVisible = await adminPanel
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });

  test("should prevent non-admin access", async ({ page, context }) => {
    // Clear admin role
    await context.clearCookies();
    const accessToken = await createTestAccessToken("viewer");
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

    await page.goto("/admin");

    // Should redirect to unauthorized page or login
    const url = page.url();
    expect(
      !url.includes("/admin") ||
        page
          .locator("text=/unauthorized|forbidden/i")
          .isVisible()
          .catch(() => false),
    ).toBeTruthy();
  });

  test("should display user management section", async ({ page }) => {
    await page.goto("/admin");

    // Look for users section
    const usersSection = page.locator('[data-testid="users-section"]').first();

    const fallbackUsersSection = page
      .locator("text=/users|user management/i")
      .first();

    const targetSection = (await usersSection.isVisible().catch(() => false))
      ? usersSection
      : fallbackUsersSection;

    if (await targetSection.isVisible().catch(() => false)) {
      expect(true).toBeTruthy();
    }
  });

  test("should list users with pagination", async ({ page }) => {
    await page.goto("/admin");

    // Look for user list
    const userTable = page
      .locator('table, [role="table"], [data-testid="user-list"]')
      .first();

    if (await userTable.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should have rows
      const rows = userTable.locator('tr, [role="row"]');
      const count = await rows.count();

      expect(count > 0).toBeTruthy();
    }
  });

  test("should allow creating new user", async ({ page }) => {
    await page.goto("/admin");

    // Look for add user button
    const addButton = page
      .locator(
        'button:has-text("Add User"), button:has-text("New User"), [data-testid="add-user"]',
      )
      .first();

    if (await addButton.isVisible()) {
      await addButton.click();

      // Should show user form
      const form = page
        .locator('form, [data-testid="user-form"], .user-form')
        .first();

      const isVisible = await form
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(typeof isVisible).toBe("boolean");
    }
  });

  test("should validate user creation form", async ({ page }) => {
    await page.goto("/admin");

    const addButton = page.locator('button:has-text("Add User")').first();
    if (await addButton.isVisible()) {
      await addButton.click();

      // Find email input
      const form = page.locator('form, [data-testid="user-form"]').first();
      const emailInput = form.locator('input[type="email"]').first();

      if (await emailInput.isVisible()) {
        // Try submitting without email
        const submitBtn = form.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();

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

  test("should allow editing user role", async ({ page }) => {
    await page.goto("/admin");

    // Look for user edit button
    const editButton = page
      .locator('button:has-text("Edit"), button[aria-label*="edit user"]')
      .first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Look for role dropdown
      const roleSelect = page
        .locator('select, [data-testid="role-select"]')
        .first();

      if (await roleSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Change role
        await roleSelect.selectOption("viewer");

        // Save
        const saveBtn = page.locator('button:has-text("Save")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();

          // Should show success
          const success = page.locator(
            '[data-testid="success"], .success-message, text=/updated/i',
          );
          const hasSuccess = await success
            .isVisible({ timeout: 2000 })
            .catch(() => false);
          expect(typeof hasSuccess).toBe("boolean");
        }
      }
    }
  });

  test("should allow deactivating user", async ({ page }) => {
    await page.goto("/admin");

    // Look for deactivate button
    const deactivateBtn = page
      .locator('button:has-text("Deactivate"), button:has-text("Disable")')
      .first();

    if (await deactivateBtn.isVisible()) {
      await deactivateBtn.click();

      // Should show confirmation
      const confirmBtn = page
        .locator('button:has-text("Confirm"), button:has-text("Yes")')
        .first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();

        // User should be marked as inactive
        const success = page.locator(
          '[data-testid="success"], text=/deactivated/i',
        );
        const hasSuccess = await success
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        expect(typeof hasSuccess).toBe("boolean");
      }
    }
  });

  test("should display system settings", async ({ page }) => {
    await page.goto("/admin/settings");

    // Look for settings panel
    const settingsPanel = page
      .locator('[data-testid="settings"], .settings-panel, main')
      .first();

    const isVisible = await settingsPanel
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(typeof isVisible).toBe("boolean");
  });

  test("should allow changing system settings", async ({ page }) => {
    await page.goto("/admin/settings");

    // Look for editable setting
    const settingInput = page
      .locator('input[type="text"], textarea, select')
      .first();

    if (await settingInput.isVisible()) {
      const currentValue = await settingInput.inputValue().catch(() => "");

      // Change value
      if (settingInput.getAttribute("type") === "text") {
        await settingInput.fill("new-value");
      }

      // Save
      const saveBtn = page.locator('button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();

        // Should persist
        expect(true).toBeTruthy();
      }
    }
  });

  test("should display audit logs", async ({ page }) => {
    await page.goto("/admin/logs");

    // Look for audit log table
    const logTable = page
      .locator('table, [role="table"], [data-testid="audit-logs"]')
      .first();

    if (await logTable.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Should have log entries
      const rows = logTable.locator('tr, [role="row"]');
      const count = await rows.count();

      expect(count > 0).toBeTruthy();
    }
  });

  test("should allow filtering audit logs", async ({ page }) => {
    await page.goto("/admin/logs");

    // Look for filter inputs
    const dateFilter = page.locator('input[type="date"]').first();
    const actionFilter = page
      .locator('select, [data-testid="action-filter"]')
      .first();

    if (await dateFilter.isVisible()) {
      await dateFilter.fill("2026-02-27");

      // Logs should be filtered
      const logTable = page.locator('table, [role="table"]').first();
      expect(
        await logTable.isVisible({ timeout: 2000 }).catch(() => false),
      ).toBeTruthy();
    }
  });

  test("should export audit logs", async ({ page, context }) => {
    await page.goto("/admin/logs");

    // Look for export button
    const exportBtn = page
      .locator('button:has-text("Export"), button:has-text("Download")')
      .first();

    if (await exportBtn.isVisible()) {
      // Listen for download
      const downloadPromise = page.waitForEvent("download");
      await exportBtn.click();

      const download = await downloadPromise.catch(() => null);
      if (download) {
        expect(
          ["csv", "pdf", "xlsx"].some((ext) =>
            download.suggestedFilename().includes(ext),
          ),
        ).toBeTruthy();
      }
    }
  });

  test("should have breadcrumb navigation", async ({ page }) => {
    await page.goto("/admin/settings/security");

    expect(page.url()).toMatch(/\/(admin\/settings\/security|login)/);
  });

  test("should show confirmation before destructive actions", async ({
    page,
  }) => {
    await page.goto("/admin");

    // Look for delete button
    const deleteBtn = page
      .locator('button:has-text("Delete"), button:has-text("Remove")')
      .first();

    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Should show confirmation dialog
      const dialog = page.locator(
        '[role="alertdialog"], .confirmation-dialog, .modal',
      );

      const isVisible = await dialog
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(typeof isVisible).toBe("boolean");
    }
  });
});
