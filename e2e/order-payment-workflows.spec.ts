import { expect, test } from "@playwright/test";

test("administrator can inspect an Order and open its Payment exception", async ({
	page,
}) => {
	await page.goto("/orders?record=ET-10472");
	await expect(
		page.getByRole("heading", { name: "Every ticket starts here." }),
	).toBeVisible({ timeout: 15_000 });

	const order = page.getByRole("dialog", { name: "ET-10472" });
	await expect(order.getByText(/2 payment attempts/)).toBeVisible();
	await expect(order.getByText("₦25,875 verified as received")).toBeVisible();
	await expect(
		order.getByText("Needs resolution", { exact: true }),
	).toBeVisible();

	await order.getByRole("link", { name: "Review exception" }).click();
	await expect(page).toHaveURL(/\/reconciliation\?record=RC-901$/);
	const exception = page.getByRole("dialog", { name: "ET-10472" });
	await expect(exception.getByText("Exact match")).toBeVisible();
	await expect(
		exception.getByRole("button", { name: "Fulfil manually" }),
	).toBeEnabled();
	await expect(
		exception.getByRole("button", { name: "Start tracked refund" }),
	).toBeVisible();
});

test("administrator can fulfil an exact Payment exception with confirmation and reason", async ({
	page,
}) => {
	await page.goto("/reconciliation?record=RC-901");
	const details = page.getByRole("dialog", { name: "ET-10472" });
	await details.getByRole("button", { name: "Fulfil manually" }).click();

	const confirmation = page.getByRole("dialog", { name: "Fulfil paid order" });
	const submit = confirmation.getByRole("button", { name: "Confirm fulfil" });
	await expect(submit).toBeDisabled();
	await confirmation.getByRole("checkbox").check();
	await submit.click();
	await expect(confirmation.getByRole("textbox")).toBeFocused();

	await confirmation
		.getByRole("textbox")
		.fill("Capacity and exact payment verified.");
	await submit.click();

	await expect(confirmation).not.toBeVisible();
	await expect(details.getByText("Resolved", { exact: true })).toBeVisible();
	await expect(
		details.getByRole("button", { name: "Fulfil manually" }),
	).not.toBeVisible();
	await expect(page.getByRole("status")).toContainText(
		"Fulfilled payment exception. Demo data updated.",
	);

	await details.getByRole("link", { name: "ET-10472" }).click();
	await expect(page).toHaveURL(/\/orders\?record=ET-10472$/);
	await expect(
		page
			.getByRole("dialog", { name: "ET-10472" })
			.getByText("Paid", { exact: true }),
	).toBeVisible();
});

test("administrator can start a tracked Refund for a mismatched Payment exception", async ({
	page,
}) => {
	await page.goto("/reconciliation?record=RC-902");
	const details = page.getByRole("dialog", { name: "ET-10431" });
	await expect(
		details.getByRole("button", { name: "Fulfil manually" }),
	).toBeDisabled();
	await details.getByRole("button", { name: "Start tracked refund" }).click();

	const confirmation = page.getByRole("dialog", {
		name: "Start a tracked refund",
	});
	const reason = confirmation.getByRole("textbox");
	await reason.evaluate((field) => {
		field.removeAttribute("required");
		field.removeAttribute("minlength");
	});
	await confirmation.getByRole("checkbox").check();
	await confirmation
		.getByRole("button", { name: "Confirm refund request" })
		.click();
	await expect(
		confirmation
			.getByRole("alert")
			.getByText("Add a reason with at least 5 characters."),
	).toBeVisible();
	await expect(confirmation).toBeVisible();

	await reason.fill("Refund the verified amount after mismatch review.");
	await confirmation
		.getByRole("button", { name: "Confirm refund request" })
		.click();

	await expect(confirmation).not.toBeVisible();
	await expect(details.getByText("Resolved", { exact: true })).toBeVisible();
	await expect(page.getByRole("status")).toContainText(
		"Requested exception refund. Demo data updated.",
	);

	await details.getByRole("link", { name: "ET-10431" }).click();
	await expect(page).toHaveURL(/\/orders\?record=ET-10431$/);
	await expect(
		page
			.getByRole("dialog", { name: "ET-10431" })
			.getByText("Refund requested", { exact: true }),
	).toBeVisible();
});

test("Order and Payment exception layouts remain stable", async ({ page }) => {
	await page.goto("/orders?record=ET-10472");
	await expect(
		page.getByRole("heading", { name: "Every ticket starts here." }),
	).toBeVisible({ timeout: 15_000 });
	await expect(page).toHaveScreenshot("order-inspection-desktop.png", {
		animations: "disabled",
	});

	await page.goto("/reconciliation?record=RC-901");
	await expect(
		page.getByRole("heading", { name: "Make every payment add up." }),
	).toBeVisible({ timeout: 15_000 });
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page).toHaveScreenshot("payment-exception-narrow.png", {
		animations: "disabled",
	});
});
