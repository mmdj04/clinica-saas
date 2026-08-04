import { expect, test } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/app/dashboard");
    await expect(page).toHaveURL(/.*login/);
  });

  test("renders login page correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
    await expect(
      page.getByPlaceholder("voce@clinica.com.br"),
    ).toBeVisible();
  });

  test("renders register page", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /criar conta/i }),
    ).toBeVisible();
  });

  test("shows error on invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("voce@clinica.com.br").fill("wrong@test.com");
    await page.getByPlaceholder("••••••••").fill("wrongpass123");
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page.getByText(/falha no login/i)).toBeVisible();
  });

  test("renders landing page", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/gestão completa para clínicas/i),
    ).toBeVisible();
  });
});

test.describe("Landing Page", () => {
  test("shows navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /entrar/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /criar conta/i }),
    ).toBeVisible();
  });

  test("shows feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/agenda inteligente/i)).toBeVisible();
    await expect(page.getByText(/pacientes/i).first()).toBeVisible();
    await expect(page.getByText(/financeiro/i).first()).toBeVisible();
  });
});