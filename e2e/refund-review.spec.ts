import { expect, test } from "@playwright/test";

test("administrator can find and inspect a Refund", async ({ page }) => {
  await page.goto("/refunds");

  await page.getByRole("searchbox", { name: "Search records" }).fill("RF-2081");
  await expect(page).toHaveURL(/\/refunds\?q=RF-2081$/);

  await page.getByRole("button", { name: "View RF-2081" }).click();

  await expect(page).toHaveURL(/\/refunds\?q=RF-2081&record=RF-2081$/);
  const details = page.getByRole("dialog", { name: "RF-2081" });
  await expect(details.getByText("ET-10465", { exact: true })).toBeVisible();
  await expect(
    details.getByText(
      "Customer can no longer attend; organizer approved cancellation.",
    ),
  ).toBeVisible();
  await expect(
    details.getByRole("button", { name: "Approve refund" }),
  ).toBeVisible();
  await expect(
    details.getByRole("button", { name: "Reject request" }),
  ).toBeVisible();

  await details.getByRole("link", { name: "ET-10465" }).click();
  await expect(page).toHaveURL(/\/orders\?record=ET-10465$/);
});

test("administrator can approve a Refund only with a recorded reason", async ({
  page,
}) => {
  await page.goto("/refunds?record=RF-2081");
  const details = page.getByRole("dialog", { name: "RF-2081" });
  await details.getByRole("button", { name: "Approve refund" }).click();

  const confirmation = page.getByRole("dialog", { name: "Approve refund" });
  const submit = confirmation.getByRole("button", { name: "Confirm approve" });
  await expect(submit).toBeDisabled();

  await confirmation.getByRole("checkbox").check();
  await submit.click();
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole("textbox")).toBeFocused();

  const reason = confirmation.getByRole("textbox");
  await reason.evaluate((field) => {
    field.removeAttribute("required");
    field.removeAttribute("minlength");
  });
  await submit.click();
  await expect(
    confirmation
      .locator(".form-error")
      .getByText("Add a reason with at least 5 characters."),
  ).toBeVisible();
  await expect(confirmation).toBeVisible();

  await reason.fill("Evidence checked with the organizer.");
  await submit.click();

  await expect(confirmation).not.toBeVisible();
  await expect(details.getByText("Processing", { exact: true })).toBeVisible();
  await expect(
    details.getByRole("button", { name: "Approve refund" }),
  ).not.toBeVisible();
  const toast = page.getByRole("status");
  await expect(toast).toContainText("Approved refund. Demo data updated.");
  await expect(toast).toBeVisible();
  await toast.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(toast).not.toBeVisible();
});

test("administrator can reject a Refund and see the outcome", async ({
  page,
}) => {
  await page.goto("/refunds?record=RF-2080");
  const details = page.getByRole("dialog", { name: "RF-2080" });
  await details.getByRole("button", { name: "Reject request" }).click();

  const confirmation = page.getByRole("dialog", { name: "Reject refund" });
  await confirmation
    .getByRole("textbox")
    .fill("Duplicate booking evidence confirmed.");
  await confirmation.getByRole("checkbox").check();
  await confirmation.getByRole("button", { name: "Confirm reject" }).click();

  await expect(confirmation).not.toBeVisible();
  await expect(details.getByText("Rejected", { exact: true })).toBeVisible();
  await expect(
    details.getByRole("button", { name: "Reject request" }),
  ).not.toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "Rejected refund. Demo data updated.",
  );
});

test("Refund records mechanics preserve filters, export, and nested dialogs", async ({
  page,
}) => {
  await page.goto("/refunds");

  await page.getByRole("button", { name: /^Processing/ }).click();
  await expect(
    page.getByRole("button", { name: "View RF-2078" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "View RF-2081" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText("Showing 1–3 of 3 records")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Previous page" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export records" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("everyticket-refunds.csv");

  await page.getByRole("button", { name: "View RF-2081" }).click();
  const details = page.getByRole("dialog", { name: "RF-2081" });
  await details.getByRole("button", { name: "Approve refund" }).click();
  const confirmation = page.getByRole("dialog", { name: "Approve refund" });
  await expect(
    confirmation.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await page.keyboard.press("Escape");
  await expect(confirmation).not.toBeVisible();
  await expect(details).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await page.keyboard.press("Escape");
  await expect(details).not.toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "visible");
});

test("Refund review layout remains stable", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/refunds?record=RF-2081");
  await expect(page.getByRole("dialog", { name: "RF-2081" })).toBeVisible({
    timeout: 30000,
  });
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("refund-review-desktop.png", {
    animations: "disabled",
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveScreenshot("refund-review-narrow.png", {
    animations: "disabled",
  });
});
