import { expect, test } from "@playwright/test";

for (const section of ["events", "refunds"]) {
	test(`${section} exports report download success and failures`, async ({
		page,
	}) => {
		await page.goto(`/${section}`);
		const download = page.waitForEvent("download");
		await page
			.getByRole("button", { name: /^Export/ })
			.first()
			.click();
		expect((await download).suggestedFilename()).toBe(
			`everyticket-${section}.csv`,
		);
		await expect(page.getByRole("status")).toContainText("Exported");
		await page.evaluate(() => {
			URL.createObjectURL = () => {
				throw new Error("Download unavailable");
			};
		});
		await page
			.getByRole("button", { name: /^Export/ })
			.first()
			.click();
		const error = page.getByRole("alert");
		await expect(error).toHaveText(
			"Unable to export records. Please try again.",
		);
		await error.getByRole("button", { name: "Dismiss notification" }).click();
		await expect(error).not.toBeVisible();
	});
}

test("repeated notifications get a fresh timer and survive navigation", async ({
	page,
}) => {
	await page.clock.install();
	await page.goto("/events");
	const exportButton = page.getByRole("button", { name: /^Export/ }).first();
	await exportButton.click();
	const toast = page.getByRole("status");
	await expect(toast).toContainText("Exported");
	await page.clock.fastForward(5000);
	await exportButton.click();
	await page.clock.fastForward(2000);
	await expect(toast).toBeVisible();
	await page
		.getByRole("navigation", { name: "Main navigation" })
		.getByRole("link", { name: "Orders", exact: true })
		.click();
	await expect(toast).toBeVisible();
	await page.clock.fastForward(5000);
	await expect(toast).not.toBeVisible();
});
