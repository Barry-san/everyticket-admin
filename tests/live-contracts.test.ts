import { describe, expect, test } from "bun:test";
import { actionBody, actionsFor } from "../src/features/live/actions";

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
	test("terminal financial states expose no repeat action", () => {
		expect(
			actionsFor("refunds", { id: "refund", status: "PROCESSED" }),
		).toEqual([]);
		expect(actionsFor("payouts", { id: "payout", status: "PAID" })).toEqual([]);
	});
});
