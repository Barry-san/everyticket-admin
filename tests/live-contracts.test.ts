import { describe, expect, test } from "bun:test";
import {
	type Action,
	actionBody,
	actionsFor,
} from "../src/features/live/actions";

describe("live action contracts", () => {
	test("refund review preserves integer kobo and uses the canonical endpoint", () => {
		const action = actionsFor("refunds", {
			id: "refund-1",
			status: "REQUESTED",
		})[0];
		expect(action.path).toBe("/admin/refund-requests/refund-1/approve");
		expect(
			actionBody(action, {
				ticketRefundKobo: "12500",
				platformFeeRefundKobo: "50",
				reason: "Approved",
			}),
		).toEqual({
			ticketRefundKobo: 12500,
			platformFeeRefundKobo: 50,
			reason: "Approved",
		});
	});
	test("fee replacement uses basis points and converts Lagos time to an instant", () => {
		const action = actionsFor("fee-rules", { id: "rule" })[0];
		expect(
			actionBody(action, {
				mode: "PERCENTAGE",
				feeValue: "250",
				effectiveAt: "2026-11-11T10:30",
				reason: "Updated fee",
			}),
		).toEqual({
			mode: "PERCENTAGE",
			percentageBasisPoints: 250,
			effectiveAt: "2026-11-11T09:30:00.000Z",
			reason: "Updated fee",
		});
	});
});

import type { RecordItem, Resource } from "../src/features/live/contracts";

const selectionCases: {
	name: string;
	resource: Resource;
	row: RecordItem;
	expected: Action[];
}[] = [
	{
		name: "published event without feature",
		resource: "events",
		row: {
			id: "record/? #",
			status: "PUBLISHED",
			featured: false,
		},
		expected: [
			{
				label: "Suspend event",
				successMessage: "Event suspended",
				method: "post",
				path: "/admin/events/record%2F%3F%20%23/suspend",
				fields: ["reason"],
			},
			{
				label: "Feature event",
				successMessage: "Event featured",
				method: "patch",
				path: "/admin/events/record%2F%3F%20%23/featured",
				fields: [],
				fixed: {
					featured: true,
				},
			},
		],
	},
	{
		name: "published event with feature",
		resource: "events",
		row: {
			id: "record/? #",
			status: "PUBLISHED",
			featured: true,
		},
		expected: [
			{
				label: "Suspend event",
				successMessage: "Event suspended",
				method: "post",
				path: "/admin/events/record%2F%3F%20%23/suspend",
				fields: ["reason"],
			},
			{
				label: "Remove feature",
				successMessage: "Event feature removed",
				method: "patch",
				path: "/admin/events/record%2F%3F%20%23/featured",
				fields: [],
				fixed: {
					featured: false,
				},
			},
		],
	},
	{
		name: "suspended event",
		resource: "events",
		row: {
			id: "record/? #",
			status: "SUSPENDED",
		},
		expected: [
			{
				label: "Restore event",
				successMessage: "Event restored",
				method: "post",
				path: "/admin/events/record%2F%3F%20%23/restore",
				fields: [],
			},
		],
	},
	{
		name: "CUSTOMER profile ACTIVE",
		resource: "users",
		row: {
			id: "record/? #",
			role: "CUSTOMER",
			status: "ACTIVE",
		},
		expected: [
			{
				label: "Block profile",
				successMessage: "User blocked",
				method: "post",
				path: "/admin/users/record%2F%3F%20%23/block",
				fields: ["reason"],
			},
		],
	},
	{
		name: "CUSTOMER profile BLOCKED",
		resource: "users",
		row: {
			id: "record/? #",
			role: "CUSTOMER",
			status: "BLOCKED",
		},
		expected: [
			{
				label: "Unblock profile",
				successMessage: "User unblocked",
				method: "post",
				path: "/admin/users/record%2F%3F%20%23/unblock",
				fields: [],
			},
		],
	},
	{
		name: "CUSTOMER profile UNKNOWN",
		resource: "users",
		row: {
			id: "record/? #",
			role: "CUSTOMER",
			status: "UNKNOWN",
		},
		expected: [
			{
				label: "Block profile",
				successMessage: "User blocked",
				method: "post",
				path: "/admin/users/record%2F%3F%20%23/block",
				fields: ["reason"],
			},
		],
	},
	{
		name: "CUSTOMER profile without status",
		resource: "users",
		row: {
			id: "record/? #",
			role: "CUSTOMER",
		},
		expected: [
			{
				label: "Block profile",
				successMessage: "User blocked",
				method: "post",
				path: "/admin/users/record%2F%3F%20%23/block",
				fields: ["reason"],
			},
		],
	},
	{
		name: "ORGANIZER profile ACTIVE",
		resource: "users",
		row: {
			id: "record/? #",
			role: "ORGANIZER",
			status: "ACTIVE",
		},
		expected: [
			{
				label: "Block profile",
				successMessage: "User blocked",
				method: "post",
				path: "/admin/users/record%2F%3F%20%23/block",
				fields: ["reason"],
			},
		],
	},
	{
		name: "ORGANIZER profile BLOCKED",
		resource: "users",
		row: {
			id: "record/? #",
			role: "ORGANIZER",
			status: "BLOCKED",
		},
		expected: [
			{
				label: "Unblock profile",
				successMessage: "User unblocked",
				method: "post",
				path: "/admin/users/record%2F%3F%20%23/unblock",
				fields: [],
			},
		],
	},
	{
		name: "requested refund",
		resource: "refunds",
		row: {
			id: "record/? #",
			status: "REQUESTED",
		},
		expected: [
			{
				label: "Approve refund",
				successMessage: "Refund approved",
				method: "post",
				path: "/admin/refund-requests/record%2F%3F%20%23/approve",
				fields: ["ticketRefundKobo", "platformFeeRefundKobo", "reason"],
			},
			{
				label: "Reject refund",
				successMessage: "Refund rejected",
				method: "post",
				path: "/admin/refund-requests/record%2F%3F%20%23/reject",
				fields: ["reason"],
			},
		],
	},
	{
		name: "approved refund",
		resource: "refunds",
		row: {
			id: "record/? #",
			status: "APPROVED",
		},
		expected: [
			{
				label: "Execute refund",
				successMessage: "Refund processing started",
				method: "post",
				path: "/admin/refund-requests/record%2F%3F%20%23/execute",
				fields: [],
			},
			{
				label: "Record gateway completion",
				successMessage: "Gateway completion recorded",
				method: "post",
				path: "/admin/refund-requests/record%2F%3F%20%23/mark-processed",
				fields: ["gatewayRefundReference", "gatewayStatus"],
			},
		],
	},
	{
		name: "processing refund with reference",
		resource: "refunds",
		row: {
			id: "record/? #",
			status: "PROCESSING",
			gatewayRefundReference: "gateway",
		},
		expected: [
			{
				label: "Reconcile refund",
				successMessage: "Refund reconciled",
				method: "post",
				path: "/admin/refund-requests/record%2F%3F%20%23/reconcile",
				fields: [],
			},
			{
				label: "Record gateway completion",
				successMessage: "Gateway completion recorded",
				method: "post",
				path: "/admin/refund-requests/record%2F%3F%20%23/mark-processed",
				fields: ["gatewayRefundReference", "gatewayStatus"],
			},
		],
	},
	{
		name: "requested payout",
		resource: "payouts",
		row: {
			id: "record/? #",
			status: "REQUESTED",
		},
		expected: [
			{
				label: "Approve payout",
				successMessage: "Payout approved",
				method: "post",
				path: "/admin/payout-requests/record%2F%3F%20%23/approve",
				fields: ["reason"],
			},
			{
				label: "Reject payout",
				successMessage: "Payout rejected",
				method: "post",
				path: "/admin/payout-requests/record%2F%3F%20%23/reject",
				fields: ["reason"],
			},
		],
	},
	{
		name: "approved payout",
		resource: "payouts",
		row: {
			id: "record/? #",
			status: "APPROVED",
		},
		expected: [
			{
				label: "Record transfer",
				successMessage: "Payout transfer recorded",
				method: "post",
				path: "/admin/payout-requests/record%2F%3F%20%23/mark-paid",
				fields: ["transferReference", "transferDate"],
			},
		],
	},
	{
		name: "fee rule replacement",
		resource: "fee-rules",
		row: {
			id: "record/? #",
		},
		expected: [
			{
				label: "Replace active fee rule",
				successMessage: "Fee rule replaced",
				method: "put",
				path: "/admin/platform-fee-rule",
				fields: ["mode", "feeValue", "effectiveAt", "reason"],
			},
		],
	},
];
for (const entry of selectionCases) {
	test(entry.name, () =>
		expect(actionsFor(entry.resource, entry.row)).toEqual(entry.expected),
	);
}

const unavailableCases: { resource: Resource; row: RecordItem }[] = [];
for (const resource of ["events", "refunds", "payouts"] as const) {
	for (const status of [
		undefined,
		"UNKNOWN",
		"DRAFT",
		"CANCELLED",
		"REJECTED",
		"PROCESSED",
		"PAID",
		"FAILED",
	]) {
		unavailableCases.push({ resource, row: { id: "id", status } });
	}
}
for (const resource of ["orders", "audit"] as const) {
	unavailableCases.push({ resource, row: { id: "id" } });
}
for (const status of [undefined, "ACTIVE", "BLOCKED", "UNKNOWN"]) {
	unavailableCases.push({
		resource: "users",
		row: { id: "admin", role: "ADMIN", status },
	});
}
for (const gatewayRefundReference of [undefined, ""]) {
	unavailableCases.push({
		resource: "refunds",
		row: { id: "refund", status: "PROCESSING", gatewayRefundReference },
	});
}
for (const [index, entry] of unavailableCases.entries()) {
	test(`unavailable action selection ${index}: ${entry.resource} ${entry.row.status}`, () =>
		expect(actionsFor(entry.resource, entry.row)).toEqual([]));
}
