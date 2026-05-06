import { expect, test } from "@playwright/test";

test.describe("rotas públicas (smoke)", () => {
  test("login exibe formulário e landmark principal", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("textbox", { name: /^E-mail$/ })).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Informações legais" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Política de privacidade" })).toBeVisible();
  });

  test("política de privacidade carrega e cita LGPD", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page.getByRole("heading", { level: 1, name: /privacidade/i })).toBeVisible();
    await expect(page.getByText(/LGPD/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Voltar ao login" })).toBeVisible();
  });

  test("home tem link para login e política", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Informações legais" })).toBeVisible();
  });
});
