/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";

/**
 * Auth fixture for Playwright tests
 * Provides helpers for authentication in E2E tests
 */

// Mock user data for testing
export const TEST_USERS = {
  photographer: {
    id: "test-photographer-1",
    email: "fotografo@test.com",
    displayName: "Fotógrafo Teste",
    username: "fotografo_teste",
  },
  buyer: {
    id: "test-buyer-1",
    email: "comprador@test.com",
    displayName: "Comprador Teste",
  },
};

/**
 * Extended test with authentication helpers
 */
export const test = base.extend({
  /**
   * Automatically authenticate as a photographer
   */
  authenticatedAsPhotographer: async ({ page, context }, use) => {
    // Mock Stack Auth session
    await context.addCookies([
      {
        name: "stack-session",
        value: "mock-photographer-session-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    // Mock Stack Auth API calls (External)
    await page.route("**/*stack-auth.com/**/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: TEST_USERS.photographer.id,
          primary_email: TEST_USERS.photographer.email,
          display_name: TEST_USERS.photographer.displayName,
          profile_image_url: null,
          client_metadata: { role: "PHOTOGRAPHER" },
        }),
      });
    });

    // Mock API responses for photographer (Internal)
    await page.route("**/api/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(TEST_USERS.photographer),
      });
    });

    await page.route("**/api/fotografos/resolve**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            id: "foto-profile-1",
            userId: TEST_USERS.photographer.id,
            username: TEST_USERS.photographer.username,
            displayName: TEST_USERS.photographer.displayName,
            _count: { colecoes: 5, fotos: 120 },
          },
        }),
      });
    });

    await use(page);
  },

  /**
   * Automatically authenticate as a buyer
   */
  authenticatedAsBuyer: async ({ page, context }, use) => {
    // Mock Stack Auth session
    await context.addCookies([
      {
        name: "stack-session",
        value: "mock-buyer-session-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    // Mock Stack Auth API calls (External)
    await page.route("**/*stack-auth.com/**/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: TEST_USERS.buyer.id,
          primary_email: TEST_USERS.buyer.email,
          display_name: TEST_USERS.buyer.displayName,
          profile_image_url: null,
          client_metadata: { role: "CLIENTE" },
        }),
      });
    });

    // Mock API responses for buyer
    await page.route("**/api/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(TEST_USERS.buyer),
      });
    });

    await use(page);
  },
});

/**
 * Helper to mock authenticated state
 * Use this in tests that need custom auth setup
 */
export async function mockAuthSession(page, user) {
  await page.evaluate((userData) => {
    // Mock localStorage or sessionStorage if your app uses it
    localStorage.setItem("user", JSON.stringify(userData));
  }, user);
}

/**
 * Helper to clear authentication
 */
export async function clearAuth(context, page) {
  await context.clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export { expect };
