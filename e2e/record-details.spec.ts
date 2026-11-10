import { expect, test, type Page } from "@playwright/test";

const records: Record<string, Record<string, unknown>> = {
	events: {
		id: "event_id_exact",
		title: "Lagos live",
		slug: "lagos_live",
		description: "Full event description",
		timeZone: "Africa/Lagos",
		address: "123 Victoria Island, Lagos",
		ticketTypes: [
			{
				id: "vip",
				name: "VIP configuration",
				capacity: 50,
				isActive: false,
				priceKobo: 0,
			},
		],
		media: [
			{
				id: "cover",
				publicUrl: "https://media.example.test/cover.png",
				isCover: true,
			},
		],
		status: "PUBLISHED",
		featured: false,
		startAt: "2026-11-10T10:00:00Z",
		endAt: "2026-11-10T12:00:00Z",
		organizer: {
			id: "org_exact",
			user: { name: "Organizer", email: "org@example.com" },
		},
	},
	users: {
		id: "profile_exact",
		user: { name: "Buyer", email: "buyer@example.com" },
		role: "CUSTOMER",
		roles: ["CUSTOMER", "ORGANIZER"],
		blockedBy: null,
		status: "ACTIVE",
		createdAt: "2026-11-10T10:00:00Z",
		blockedAt: null,
		blockReason: null,
	},
	orders: {
		id: "order_exact",
		reference: "ORDER_ref_exact",
		buyerName: "Buyer",
		buyerEmail: "buyer@example.com",
		status: "PAID",
		totalKobo: 0,
		buyerPhone: "08000000000",
		currency: "NGN",
		ticketSubtotalKobo: 0,
		platformFeeKobo: 0,
		lines: [
			{ id: "line", ticketTypeName: "VIP line", unitPriceKobo: 0, quantity: 1 },
		],
		event: { id: "event_id_exact", title: "Lagos live" },
		paymentAttempts: [
			{
				id: "attempt_exact",
				reference: "PAY_ref_exact",
				status: "VERIFIED_SUCCESS",
				expectedAmountKobo: 12501,
			},
		],
	},
	refunds: {
		id: "refund_exact",
		status: "REQUESTED",
		ticketRefundKobo: 0,
		platformFeeRefundKobo: 0,
		totalRefundKobo: 0,
		order: { id: "order_exact", reference: "ORDER_ref_exact" },
		reason: "Requested refund",
		tickets: [
			{
				ticketId: "ticket_selected",
				ticket: {
					holderName: "Selected holder",
					ticketTypeName: "VIP",
					priceKobo: 0,
					status: "ACTIVE",
				},
			},
		],
	},
	payouts: {
		id: "payout_exact",
		status: "REQUESTED",
		requestedAmountKobo: 0,
		calculatedPayableKobo: 0,
		ticketSubtotalKobo: 10000,
		reservedRefundKobo: 1000,
		priorPaidKobo: 500,
		reviewer: null,
		transferReference: "TRANSFER_ref_exact",
		transferDate: null,
	},
	"fee-rules": {
		id: "rule_exact",
		version: 7,
		mode: "FIXED",
		fixedAmountKobo: 0,
		appliesToFreeOrder: false,
		activeFrom: "2026-11-10T10:00:00Z",
		activeUntil: "2026-11-11T10:00:00Z",
	},
	audit: {
		id: "audit_exact",
		action: "EVENT_SUSPENDED",
		actor: {
			id: "actor",
			role: "ADMIN",
			roles: ["ADMIN"],
			user: { name: "Audit administrator", email: "admin@example.test" },
		},
		targetId: "event_id_exact",
		targetType: "Event",
		createdAt: "2026-11-10T10:00:00Z",
		details: {
			reason: "audit_reason_exact",
			nested: { enabled: false, count: 0 },
			refs: ["ref_one", "ref_two"],
		},
		additionalField: { reference: "extra_ref_exact" },
	},
};
const endpoints: Record<string, string> = {
	refunds: "refund-requests",
	payouts: "payout-requests",
	"fee-rules": "platform-fee-rule",
	audit: "audit-logs",
};
async function mock(page: Page) {
	await page.route("**/api/auth/**", (route) =>
		route.fulfill({
			json: {
				user: {
					id: "admin",
					name: "Administrator",
					email: "admin@example.com",
					emailVerified: true,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				},
				session: {
					id: "session",
					userId: "admin",
					token: "test",
					expiresAt: "2099-01-01T00:00:00Z",
				},
			},
		}),
	);
	await page.route("**/api/v1/**", (route) => {
		const url = new URL(route.request().url());
		if (url.pathname.endsWith("/account/me"))
			return route.fulfill({
				json: {
					id: "admin",
					role: "ADMIN",
					roles: ["ADMIN"],
					status: "ACTIVE",
				},
			});
		const resource = Object.keys(records).find((name) =>
			url.pathname.includes(`/admin/${endpoints[name] || name}`),
		);
		if (!resource)
			return route.fulfill({
				status: 404,
				json: { message: "Unknown endpoint" },
			});
		return route.fulfill({
			json:
				resource === "fee-rules" ||
				url.pathname.endsWith(`/${records[resource].id}`)
					? records[resource]
					: {
							items: [records[resource]],
							page: Number(url.searchParams.get("page")) || 1,
							pageSize: 20,
							total: 1,
						},
		});
	});
}
for (const resource of Object.keys(records)) {
	test(`${resource}: direct entry, refresh, nested fields and narrow layout`, async ({
		page,
	}) => {
		await mock(page);
		const requests: string[] = [];
		page.on("request", (request) => {
			const path = new URL(request.url()).pathname;
			if (path.startsWith("/api/v1/admin/")) requests.push(path);
		});
		const record = records[resource];
		await page.goto(`/${resource}/${record.id}`);
		await expect(
			page.getByRole("link", {
				name: `Back to ${resource === "audit" ? "Audit log" : resource === "fee-rules" ? "Fee rules" : resource[0].toUpperCase() + resource.slice(1)}`,
			}),
		).toBeVisible();
		await expect(page.getByText("Loading fresh record details…")).toHaveCount(
			0,
		);
		await expect(page.locator(".detail-sections")).toBeVisible();
		if (resource === "orders") {
			await expect(
				page.getByRole("cell", { name: "PAY_ref_exact", exact: true }),
			).toBeVisible();
			await expect(
				page.getByRole("cell", { name: "₦125.01", exact: true }),
			).toBeVisible();
			await expect(
				page.locator("dd").filter({ hasText: /^ORDER_ref_exact$/ }),
			).toBeVisible();
		}
		if (resource === "events" || resource === "fee-rules")
			await expect(
				page.getByText("false", { exact: true }).first(),
			).toBeVisible();
		if (resource === "audit") {
			await expect(
				page.getByText("audit_reason_exact", { exact: true }),
			).toBeVisible();
			await expect(
				page.getByText("extra_ref_exact", { exact: true }),
			).toBeVisible();
			await expect(page.getByText("0", { exact: true })).toBeVisible();
		}
		if (["orders", "refunds", "payouts", "fee-rules"].includes(resource))
			await expect(page.getByText("₦0", { exact: true }).first()).toBeVisible();
		expect(requests).toEqual([
			`/api/v1/admin/${endpoints[resource] || resource}/${record.id}`,
		]);
		if (resource === "events")
			await expect(
				page.getByText("VIP configuration", { exact: true }),
			).toBeVisible();
		if (resource === "orders")
			await expect(page.getByText("VIP line", { exact: true })).toBeVisible();
		if (resource === "refunds")
			await expect(
				page.getByText("Selected holder", { exact: true }),
			).toBeVisible();
		if (resource === "fee-rules") {
			await expect(
				page.getByRole("heading", { name: "Version 7", exact: true }),
			).toBeVisible();
			await expect(
				page.getByRole("button", { name: "Replace active fee rule" }),
			).toBeVisible();
		}
		await page.reload();
		await expect(page.locator(".detail-sections")).toBeVisible();
		expect(requests).toHaveLength(2);
		await page.setViewportSize({ width: 390, height: 844 });
		await expect(page.locator(".detail-sections")).toBeVisible();
		expect(
			await page.evaluate(
				"document.documentElement.scrollWidth <= window.innerWidth",
			),
		).toBe(true);
	});
}
test("list and legacy links preserve search, filters and page across refresh", async ({
	page,
}) => {
	await mock(page);
	await page.goto("/orders?q=buyer&status=PAID&page=3");
	await page.getByRole("link", { name: "View details" }).click();
	await expect(page).toHaveURL(/\/orders\/order_exact\?from=/);
	await page.reload();
	await page.getByRole("link", { name: "Back to Orders" }).click();
	await expect(page).toHaveURL("/orders?q=buyer&status=PAID&page=3");
	await page.goto("/orders?q=buyer&status=PAID&page=3&record=order_exact");
	await expect(page).toHaveURL(/\/orders\/order_exact\?from=/);
	await page.getByRole("link", { name: "Back to Orders" }).click();
	await expect(page).toHaveURL("/orders?q=buyer&status=PAID&page=3");
});
test("confirmation cancellation, failure and refreshed action availability", async ({
	page,
}) => {
	await mock(page);
	let status = "REQUESTED";
	let fail = true;
	let submissions = 0;
	await page.route(/\/api\/v1\/admin\/refund-requests(?:[/?]|$)/, (route) => {
		if (route.request().method() === "POST") {
			submissions++;
			if (fail)
				return route.fulfill({
					status: 500,
					json: { message: "Review failed" },
				});
			status = "REJECTED";
			return route.fulfill({ json: { success: true } });
		}
		return route.fulfill({
			json: { ...records.refunds, status },
		});
	});
	await page.goto("/refunds/refund_exact");
	await page
		.getByRole("button", { name: "Reject refund", exact: true })
		.click();
	await page.getByRole("button", { name: "Cancel", exact: true }).click();
	expect(submissions).toBe(0);
	await page
		.getByRole("button", { name: "Reject refund", exact: true })
		.click();
	await page.getByRole("textbox").fill("Duplicate request");
	await page.getByRole("button", { name: "Confirm", exact: true }).click();
	await expect(page.getByRole("alert")).toHaveText("Review failed");
	fail = false;
	await page.getByRole("button", { name: "Confirm", exact: true }).click();
	await expect(page.getByRole("dialog")).toHaveCount(0);
	await expect(
		page.getByRole("button", { name: "Reject refund", exact: true }),
	).toHaveCount(0);
	await expect(page.getByText("REJECTED", { exact: true })).toBeVisible();
	expect(submissions).toBe(2);
});
test("detail errors retry and missing records show unavailable", async ({
	page,
}) => {
	await mock(page);
	let fail = true;
	await page.route(/\/api\/v1\/admin\/platform-fee-rule(?:[/?]|$)/, (route) =>
		fail
			? route.fulfill({ status: 500, json: { message: "Lookup failed" } })
			: route.fulfill({ status: 404, json: { message: "record not found" } }),
	);
	await page.goto("/fee-rules/old_rule");
	await expect(page.getByRole("alert")).toContainText("Lookup failed");
	fail = false;
	await page.getByRole("button", { name: "Try again" }).click();
	await expect(page.getByText(/This record is unavailable/)).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Replace active fee rule" }),
	).toHaveCount(0);
});

test("cached preview disables actions until fresh lookup, and navigation cancels lookup", async ({
	page,
}) => {
	await mock(page);
	await page.goto("/events");
	await expect(page.getByRole("link", { name: "View details" })).toBeVisible();
	let release: () => void = () => {};
	const gate = new Promise<void>((resolve) => {
		release = resolve;
	});
	let requested = false;
	await page.route(/\/api\/v1\/admin\/events(?:[/?]|$)/, async (route) => {
		requested = true;
		await gate;
		await route
			.fulfill({
				json: records.events,
			})
			.catch(() => {});
	});
	await page.getByRole("link", { name: "View details" }).click();
	await expect(
		page.getByRole("button", { name: "Suspend event" }),
	).toBeDisabled();
	await expect(page.getByText("false", { exact: true }).first()).toBeVisible();
	await expect.poll(() => requested).toBe(true);
	const cancelled = page.waitForEvent("requestfailed", (request) =>
		request.url().includes("/admin/events"),
	);
	await page.getByRole("link", { name: "Users", exact: true }).click();
	await cancelled;
	release();
	await expect(
		page.getByRole("heading", { name: "Users", exact: true }),
	).toBeVisible();
});

test("direct entry requests only the detail endpoint without collection scans", async ({
	page,
}) => {
	await mock(page);
	const paths: string[] = [];
	await page.route(/\/api\/v1\/admin\/orders(?:[/?]|$)/, (route) => {
		paths.push(new URL(route.request().url()).pathname);
		return route.fulfill({ json: records.orders });
	});
	await page.goto("/orders/order_exact?from=q%3Dbuyer%26page%3D9");
	await expect(
		page.getByRole("heading", { name: "ORDER_ref_exact", exact: true }),
	).toBeVisible();
	expect(paths).toEqual(["/api/v1/admin/orders/order_exact"]);
});

for (const mode of ["FIXED", "PERCENTAGE"]) {
	test(`fee rules: add ${mode} from ${mode === "FIXED" ? "empty" : "populated"} page`, async ({
		page,
	}) => {
		await mock(page);
		let reads = 0;
		const submissions: unknown[] = [];
		await page.route(
			/\/api\/v1\/admin\/platform-fee-rule(?:\?|$)/,
			async (route) => {
				if (route.request().method() === "POST") {
					submissions.push(route.request().postDataJSON());
					await new Promise((resolve) => setTimeout(resolve, 300));
					return route.fulfill({
						status: 201,
						json: { id: "new_rule", version: 8, mode },
					});
				}
				reads += 1;
				return route.fulfill({
					body: JSON.stringify(mode === "FIXED" ? null : records["fee-rules"]),
					contentType: "application/json",
				});
			},
		);
		await page.goto("/fee-rules");
		if (mode === "FIXED")
			await expect(page.getByText("No records found.")).toBeVisible();
		await page
			.getByRole("button", { name: "Add fee rule", exact: true })
			.click();
		const dialog = page.getByRole("dialog");
		await dialog.getByRole("combobox").selectOption(mode);
		await dialog
			.getByLabel("Fixed amount (kobo) or percentage (basis points)")
			.fill("250");
		await dialog
			.getByLabel("Effective at (Africa/Lagos)")
			.fill("2099-11-11T10:30");
		await dialog.getByLabel("Reason", { exact: true }).fill("New fee schedule");
		await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
		await expect(
			dialog.getByRole("button", { name: "Saving…" }),
		).toBeDisabled();
		await expect(dialog).not.toBeVisible();
		await expect(
			page.locator('[data-sonner-toast][data-type="success"]'),
		).toHaveCount(1);
		await expect(
			page.locator('[data-sonner-toast][data-type="success"]'),
		).toContainText("Fee rule added");
		await expect(
			page.getByRole("link", { name: "View added fee rule" }),
		).toHaveAttribute("href", /\/fee-rules\/new_rule/);
		expect(submissions).toEqual([
			{
				mode,
				[mode === "FIXED" ? "fixedAmountKobo" : "percentageBasisPoints"]: 250,
				effectiveAt: "2099-11-11T09:30:00.000Z",
				reason: "New fee schedule",
			},
		]);
		expect(reads).toBeGreaterThan(1);
		await page.getByRole("link", { name: "View added fee rule" }).click();
		await expect(page.locator(".detail-sections")).toBeVisible();
	});
}

test("fee rules: failed add preserves values and permits retry", async ({
	page,
}) => {
	await mock(page);
	let attempts = 0;
	await page.route(/\/api\/v1\/admin\/platform-fee-rule(?:\?|$)/, (route) => {
		if (route.request().method() !== "POST")
			return route.fulfill({ json: records["fee-rules"] });
		attempts += 1;
		return attempts === 1
			? route.fulfill({
					status: 409,
					json: { message: "A rule already starts at this time." },
				})
			: route.fulfill({
					status: 201,
					json: { id: "new_rule", version: 8, mode: "FIXED" },
				});
	});
	await page.goto("/fee-rules");
	await page.getByRole("button", { name: "Add fee rule", exact: true }).click();
	const dialog = page.getByRole("dialog");
	await dialog
		.getByLabel("Fixed amount (kobo) or percentage (basis points)")
		.fill("500");
	await dialog
		.getByLabel("Effective at (Africa/Lagos)")
		.fill("2099-11-11T10:30");
	await dialog.getByLabel("Reason", { exact: true }).fill("New fee schedule");
	await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
	await expect(dialog.getByRole("alert")).toHaveText(
		"A rule already starts at this time.",
	);
	await expect(
		page.locator('[data-sonner-toast][data-type="error"]'),
	).toHaveCount(1);
	await expect(
		page.locator('[data-sonner-toast][data-type="error"]'),
	).toContainText("A rule already starts at this time.");
	await expect(
		page.locator('[data-sonner-toast][data-type="success"]'),
	).toHaveCount(0);
	await expect(dialog.getByLabel("Reason", { exact: true })).toHaveValue(
		"New fee schedule",
	);
	await dialog
		.getByLabel("Effective at (Africa/Lagos)")
		.fill("2099-11-12T10:30");
	await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
	await expect(dialog).not.toBeVisible();
	await expect(
		page.locator('[data-sonner-toast][data-type="success"]'),
	).toHaveCount(1);
	expect(attempts).toBe(2);
});

const actionScenarios = [
	["users", "ACTIVE", "Block profile", "User blocked"],
	["users", "BLOCKED", "Unblock profile", "User unblocked"],
	["events", "PUBLISHED", "Suspend event", "Event suspended"],
	["events", "SUSPENDED", "Restore event", "Event restored"],
	["events", "PUBLISHED", "Feature event", "Event featured"],
	["events", "PUBLISHED", "Remove feature", "Event feature removed"],
	["refunds", "REQUESTED", "Approve refund", "Refund approved"],
	["refunds", "REQUESTED", "Reject refund", "Refund rejected"],
	["refunds", "APPROVED", "Execute refund", "Refund processing started"],
	["refunds", "PROCESSING", "Reconcile refund", "Refund reconciled"],
	[
		"refunds",
		"APPROVED",
		"Record gateway completion",
		"Gateway completion recorded",
	],
	["payouts", "REQUESTED", "Approve payout", "Payout approved"],
	["payouts", "REQUESTED", "Reject payout", "Payout rejected"],
	["payouts", "APPROVED", "Record transfer", "Payout transfer recorded"],
	["fee-rules", "ACTIVE", "Replace active fee rule", "Fee rule replaced"],
];
for (const [resource, status, label, message] of actionScenarios) {
	test(`action feedback: ${label}`, async ({ page }) => {
		await mock(page);
		const record = {
			...records[resource],
			status,
			featured: label === "Remove feature",
			gatewayRefundReference: "gateway_ref",
		};
		let submissions = 0;
		await page.route(
			`**/api/v1/admin/${endpoints[resource] || resource}/**`,
			async (route) => {
				if (route.request().method() !== "GET") {
					submissions++;
					await new Promise((resolve) => setTimeout(resolve, 200));
				}
				return route.fulfill({ json: record });
			},
		);
		// Fee replacement targets the collection endpoint.
		if (resource === "fee-rules")
			await page.route("**/api/v1/admin/platform-fee-rule", (route) => {
				submissions++;
				return route.fulfill({ json: record });
			});
		await page.goto(`/${resource}/${records[resource].id}`);
		await page.getByRole("button", { name: label, exact: true }).click();
		const dialog = page.getByRole("dialog");
		for (const input of await dialog.locator("input").all()) {
			const type = await input.getAttribute("type");
			await input.fill(
				type === "datetime-local"
					? "2099-11-11T10:30"
					: type === "number"
						? "100"
						: "Reviewed reference",
			);
		}
		await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
		await expect(dialog).not.toBeVisible();
		const toasts = page.locator('[data-sonner-toast][data-type="success"]');
		await expect(toasts).toHaveCount(1);
		await expect(toasts).toContainText(message);
		expect(submissions).toBe(1);
	});
}

test("cancel and invalid action submissions produce no toasts or requests", async ({
	page,
}) => {
	await mock(page);
	let submissions = 0;
	page.on("request", (request) => {
		if (request.method() === "POST") submissions++;
	});
	await page.goto("/users/profile_exact");
	await page.getByRole("button", { name: "Block profile" }).click();
	const dialog = page.getByRole("dialog");
	await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
	await expect(dialog.getByRole("alert")).toHaveText("Enter a valid value.");
	await dialog.getByRole("button", { name: "Cancel" }).click();
	await expect(dialog).not.toBeVisible();
	await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
	expect(submissions).toBe(0);
});

for (const width of [1440, 390]) {
	test(`brand surfaces and form states at ${width}px`, async ({
		page,
	}, testInfo) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto("/login");
		await expect(page.getByPlaceholder("you@everyticket.ng")).toBeVisible();
		const primary = page.getByRole("button", { name: "Sign in" });
		await expect(primary).toHaveCSS("background-color", "rgb(86, 0, 120)");
		await primary.hover();
		await expect(primary).toHaveCSS("background-color", "rgb(54, 0, 79)");
		await page.getByLabel("Password", { exact: true }).focus();
		await expect(page.getByLabel("Password", { exact: true })).toHaveCSS(
			"outline-color",
			"rgb(143, 34, 242)",
		);
		await page.screenshot({
			animations: "disabled",
			path: testInfo.outputPath(`login-${width}.png`),
			fullPage: true,
		});
		await mock(page);
		await page.route("**/api/v1/admin/summary", (route) =>
			route.fulfill({
				json: {
					paidOrderCount: 12,
					totalPaidKobo: 100000,
					platformFeeRevenueKobo: 2500,
					refundLiabilityKobo: 1000,
					payoutLiabilityKobo: 5000,
				},
			}),
		);
		await page.goto("/overview");
		await expect(page.locator(".overview-metric")).toHaveCount(5);
		await page.screenshot({
			animations: "disabled",
			path: testInfo.outputPath(`overview-${width}.png`),
			fullPage: true,
		});
		await page.goto("/fee-rules");
		await expect(page.locator(".nav-item.active")).toContainText("Fee rules");
		await page.screenshot({
			animations: "disabled",
			path: testInfo.outputPath(`list-${width}.png`),
			fullPage: true,
		});
		await page
			.getByRole("button", { name: "Add fee rule", exact: true })
			.click();
		await expect(page.getByLabel("Mode", { exact: true })).toBeVisible();
		await expect(page.getByLabel("Effective at (Africa/Lagos)")).toBeVisible();
		await page.screenshot({
			animations: "disabled",
			path: testInfo.outputPath(`dialog-${width}.png`),
			fullPage: true,
		});
	});
}
