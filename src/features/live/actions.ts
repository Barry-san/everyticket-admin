import type { RecordItem, Resource } from "./contracts";
export type Action = {
	label: string;
	method: "post" | "patch" | "put";
	path: string;
	fields: string[];
	fixed?: Record<string, unknown>;
};
export function actionsFor(resource: Resource, row: RecordItem): Action[] {
	const action = (
		label: string,
		suffix: string,
		fields: string[] = [],
	): Action => ({
		label,
		method: "post",
		path: `/admin/${resource === "refunds" ? "refund-requests" : resource === "payouts" ? "payout-requests" : resource}/${encodeURIComponent(row.id)}/${suffix}`,
		fields,
	});
	if (resource === "events") {
		if (row.status === "PUBLISHED")
			return [
				action("Suspend event", "suspend", ["reason"]),
				{
					...action(
						row.featured ? "Remove feature" : "Feature event",
						"featured",
					),
					method: "patch",
					fixed: { featured: !row.featured },
				},
			];
		if (row.status === "SUSPENDED") return [action("Restore event", "restore")];
	}
	if (resource === "users" && row.role !== "ADMIN")
		return [
			action(
				row.status === "BLOCKED" ? "Unblock profile" : "Block profile",
				row.status === "BLOCKED" ? "unblock" : "block",
				row.status === "BLOCKED" ? [] : ["reason"],
			),
		];
	if (resource === "refunds") {
		if (row.status === "REQUESTED")
			return [
				action("Approve refund", "approve", [
					"ticketRefundKobo",
					"platformFeeRefundKobo",
					"reason",
				]),
				action("Reject refund", "reject", ["reason"]),
			];
		if (row.status === "APPROVED")
			return [
				action("Execute refund", "execute"),
				action("Record gateway completion", "mark-processed", [
					"gatewayRefundReference",
					"gatewayStatus",
				]),
			];
		if (row.status === "PROCESSING" && row.gatewayRefundReference)
			return [
				action("Reconcile refund", "reconcile"),
				action("Record gateway completion", "mark-processed", [
					"gatewayRefundReference",
					"gatewayStatus",
				]),
			];
	}
	if (resource === "payouts") {
		if (row.status === "REQUESTED")
			return [
				action("Approve payout", "approve", ["reason"]),
				action("Reject payout", "reject", ["reason"]),
			];
		if (row.status === "APPROVED")
			return [
				action("Record transfer", "mark-paid", [
					"transferReference",
					"transferDate",
				]),
			];
	}
	if (resource === "fee-rules")
		return [
			{
				label: "Replace active fee rule",
				method: "put",
				path: "/admin/platform-fee-rule",
				fields: ["mode", "feeValue", "effectiveAt", "reason"],
			},
		];
	return [];
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
