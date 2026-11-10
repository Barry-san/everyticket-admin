import { date, money } from "@/features/admin/format";
import type { RecordItem, Resource } from "./contracts";
import { statusLabel } from "./status";

function recordTitle(row: RecordItem) {
	return (
		row.title ||
		row.user?.name ||
		row.reference ||
		row.action ||
		(row.version ? `Version ${row.version}` : row.id)
	);
}
function recordSubtitle(row: RecordItem) {
	return (
		row.user?.email ||
		row.buyerEmail ||
		row.event?.title ||
		row.targetId ||
		row.organizer?.user.name
	);
}
function recordAmount(row: RecordItem) {
	if (row.totalKobo !== undefined) return money(row.totalKobo);
	if (row.totalRefundKobo !== undefined) return money(row.totalRefundKobo);
	if (row.requestedAmountKobo !== undefined)
		return money(row.requestedAmountKobo);
	if (row.mode === "FIXED") return money(row.fixedAmountKobo || 0);
	if (row.mode === "PERCENTAGE")
		return `${(row.percentageBasisPoints || 0) / 100}%`;
	return row.organizer?.user.name || "—";
}
function recordDate(row: RecordItem) {
	const value =
		row.createdAt || row.requestedAt || row.startAt || row.activeFrom;
	return value ? date(value, true) : "—";
}
export function presentRecord(resource: Resource, row: RecordItem) {
	return {
		title: recordTitle(row),
		subtitle: recordSubtitle(row),
		status: statusLabel(
			row.status ||
				row.role ||
				(resource === "fee-rules" ? "Active" : "Recorded"),
		),
		amount: recordAmount(row),
		date: recordDate(row),
	};
}
// CSV retains raw status and kobo values, with its own empty-field defaults.
export function recordCsvRow(row: RecordItem): string[] {
	return [
		row.id,
		row.title || row.user?.name || row.reference || row.action || "",
		row.status || row.role || "",
		String(
			row.totalKobo ?? row.totalRefundKobo ?? row.requestedAmountKobo ?? "",
		),
	];
}
