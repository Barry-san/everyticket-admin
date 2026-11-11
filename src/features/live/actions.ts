import type { RecordItem, Resource } from "./contracts";
export const actionFieldLabels = {
	mode: "Mode",
	feeValue: "Fixed amount (kobo) or percentage (basis points)",
	effectiveAt: "Effective at (Africa/Lagos)",
	reason: "Reason",
	ticketRefundKobo: "Ticket refund (kobo)",
	platformFeeRefundKobo: "Platform fee refund (kobo)",
	gatewayRefundReference: "Gateway refund reference",
	gatewayStatus: "Gateway status",
	transferReference: "Transfer reference",
	transferDate: "Transfer date (Africa/Lagos)",
};
export type ActionField = keyof typeof actionFieldLabels;
export type Action = {
	label: string;
	successMessage: string;
	method: "post" | "patch" | "put";
	path: string;
	fields: ActionField[];
	fixed?: Record<string, unknown>;
};
export const addFeeRuleAction: Action = {
	label: "Add fee rule",
	successMessage: "Fee rule added",
	method: "post",
	path: "/admin/platform-fee-rule",
	fields: ["mode", "feeValue", "effectiveAt", "reason"],
};
function recordAction(endpoint: string, id: string) {
	return (
		label: string,
		suffix: string,
		successMessage: string,
		fields: ActionField[] = [],
	): Action => ({
		label,
		successMessage,
		method: "post",
		path: `/admin/${endpoint}/${encodeURIComponent(id)}/${suffix}`,
		fields,
	});
}
function eventActions(row: RecordItem): Action[] {
	const action = recordAction("events", row.id);

	if (row.status === "PUBLISHED")
		return [
			action("Suspend event", "suspend", "Event suspended", ["reason"]),
			{
				...action(
					row.featured ? "Remove feature" : "Feature event",
					"featured",
					row.featured ? "Event feature removed" : "Event featured",
				),
				method: "patch",
				fixed: { featured: !row.featured },
			},
		];
	if (row.status === "SUSPENDED")
		return [action("Restore event", "restore", "Event restored")];

	return [];
}
function refundActions(row: RecordItem): Action[] {
	const action = recordAction("refund-requests", row.id);

	if (row.status === "REQUESTED")
		return [
			action("Approve refund", "approve", "Refund approved", [
				"ticketRefundKobo",
				"platformFeeRefundKobo",
				"reason",
			]),
			action("Reject refund", "reject", "Refund rejected", ["reason"]),
		];
	if (row.status === "APPROVED")
		return [
			action("Execute refund", "execute", "Refund processing started"),
			gatewayCompletion(row.id),
		];
	if (row.status === "PROCESSING" && row.gatewayRefundReference)
		return [
			action("Reconcile refund", "reconcile", "Refund reconciled"),
			gatewayCompletion(row.id),
		];

	return [];
}
function payoutActions(row: RecordItem): Action[] {
	const action = recordAction("payout-requests", row.id);

	if (row.status === "REQUESTED")
		return [
			action("Approve payout", "approve", "Payout approved", ["reason"]),
			action("Reject payout", "reject", "Payout rejected", ["reason"]),
		];
	if (row.status === "APPROVED")
		return [
			action("Record transfer", "mark-paid", "Payout transfer recorded", [
				"transferReference",
				"transferDate",
			]),
		];

	return [];
}
function gatewayCompletion(id: string): Action {
	return recordAction("refund-requests", id)(
		"Record gateway completion",
		"mark-processed",
		"Gateway completion recorded",
		["gatewayRefundReference", "gatewayStatus"],
	);
}
function profileActions(row: RecordItem): Action[] {
	if (row.role === "ADMIN") return [];
	const action = recordAction("users", row.id);
	const blocked = row.status === "BLOCKED";
	return [
		action(
			blocked ? "Unblock profile" : "Block profile",
			blocked ? "unblock" : "block",
			blocked ? "User unblocked" : "User blocked",
			blocked ? [] : ["reason"],
		),
	];
}
function feeRuleActions(): Action[] {
	return [
		{
			label: "Replace active fee rule",
			successMessage: "Fee rule replaced",
			method: "put",
			path: "/admin/platform-fee-rule",
			fields: ["mode", "feeValue", "effectiveAt", "reason"],
		},
	];
}
export function actionsFor(resource: Resource, row: RecordItem): Action[] {
	switch (resource) {
		case "events":
			return eventActions(row);
		case "users":
			return profileActions(row);
		case "refunds":
			return refundActions(row);
		case "payouts":
			return payoutActions(row);
		case "fee-rules":
			return feeRuleActions();
		default:
			return [];
	}
}
export function actionBody(action: Action, values: Record<string, string>) {
	const body: Record<string, unknown> = { ...values, ...action.fixed };
	for (const field of action.fields) {
		if (field.endsWith("Kobo")) body[field] = Number(values[field]);
		if (field === "transferDate" || field === "effectiveAt")
			body[field] = new Date(`${values[field]}+01:00`).toISOString();
	}
	if (action.fields.includes("feeValue")) {
		body[
			values.mode === "FIXED" ? "fixedAmountKobo" : "percentageBasisPoints"
		] = Number(values.feeValue);
		delete body.feeValue;
	}
	return body;
}
