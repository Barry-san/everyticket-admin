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
