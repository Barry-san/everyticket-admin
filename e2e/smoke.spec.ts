import { expect, test } from "@playwright/test";

test("administrator can open the demo workspace and navigate", async ({
	page,
}) => {
	await page.goto("/");

	await expect(page).toHaveURL(/\/overview$/);
	await expect(
		page.getByRole("heading", { name: "Everything in view." }),
	).toBeVisible();
	await expect(page.getByText("Demo mode", { exact: true })).toBeVisible();

	await page
		.getByRole("navigation", { name: "Main navigation" })
		.getByRole("link", { name: /^Refunds/ })
		.click();

	await expect(page).toHaveURL(/\/refunds$/);
	await expect(
		page.getByRole("heading", { name: "A fair outcome, every time." }),
	).toBeVisible();
});
