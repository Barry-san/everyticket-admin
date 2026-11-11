import { expect, test } from "bun:test";
import type { RecordItem, Resource } from "../src/features/live/contracts";
import {
	presentRecord,
	recordCsvRow,
} from "../src/features/live/record-presentation";

const cases: {
	resource: Resource;
	row: RecordItem;
	title: string;
	status: string;
	amount: string;
	csv: string[];
}[] = [
	{
		resource: "events",
		row: { id: "event", title: "Concert", status: "PUBLISHED" },
		title: "Concert",
		status: "Published",
		amount: "—",
		csv: ["event", "Concert", "PUBLISHED", ""],
	},
	{
		resource: "users",
		row: {
			id: "profile",
			user: { name: "Ada", email: "ada@example.com" },
			role: "ADMIN",
		},
		title: "Ada",
		status: "Administrator",
		amount: "—",
		csv: ["profile", "Ada", "ADMIN", ""],
	},
	{
		resource: "orders",
		row: {
			id: "order",
			reference: "REF",
			status: "PAID",
			totalKobo: 0,
			totalRefundKobo: 900,
		},
		title: "REF",
		status: "Paid",
		amount: "₦0",
		csv: ["order", "REF", "PAID", "0"],
	},
	{
		resource: "refunds",
		row: { id: "refund", totalRefundKobo: 12550 },
		title: "refund",
		status: "Recorded",
		amount: "₦125.50",
		csv: ["refund", "", "", "12550"],
	},
	{
		resource: "payouts",
		row: { id: "payout", requestedAmountKobo: 0 },
		title: "payout",
		status: "Recorded",
		amount: "₦0",
		csv: ["payout", "", "", "0"],
	},
	{
		resource: "fee-rules",
		row: { id: "rule", version: 2, mode: "FIXED" },
		title: "Version 2",
		status: "Active",
		amount: "₦0",
		csv: ["rule", "", "", ""],
	},
	{
		resource: "audit",
		row: { id: "audit", action: "EVENT_SUSPENDED" },
		title: "EVENT_SUSPENDED",
		status: "Recorded",
		amount: "—",
		csv: ["audit", "EVENT_SUSPENDED", "", ""],
	},
];
for (const entry of cases) {
	test(`${entry.resource}: list presentation and raw CSV defaults`, () => {
		expect(presentRecord(entry.resource, entry.row)).toEqual({
			title: entry.title,
			subtitle: undefined,
			status: entry.status,
			amount: entry.amount,
			date: "—",
			...(entry.resource === "users" ? { subtitle: "ada@example.com" } : {}),
		});
		expect(recordCsvRow(entry.row)).toEqual(entry.csv);
	});
}
test("presentation preserves fallback priority and Lagos dates", () => {
	const row: RecordItem = {
		id: "id",
		title: "Title",
		user: { name: "Name", email: "primary@example.com" },
		reference: "REF",
		action: "Action",
		version: 3,
		buyerEmail: "secondary@example.com",
		status: "PAID",
		role: "ADMIN",
		totalKobo: 0,
		totalRefundKobo: 1,
		requestedAmountKobo: 2,
		createdAt: "2026-11-10T23:30:00Z",
		requestedAt: "2026-11-09T00:00:00Z",
	};
	expect(presentRecord("orders", row)).toEqual({
		title: "Title",
		subtitle: "primary@example.com",
		status: "Paid",
		amount: "₦0",
		date: "11 Nov 2026, 00:30",
	});
	expect(recordCsvRow(row)).toEqual(["id", "Title", "PAID", "0"]);
});
for (const [row, expected] of [
	[{ id: "fixed", mode: "FIXED", fixedAmountKobo: 12550 }, "₦125.50"],
	[
		{ id: "percentage", mode: "PERCENTAGE", percentageBasisPoints: 125 },
		"1.25%",
	],
	[{ id: "zero", mode: "PERCENTAGE" }, "0%"],
	[
		{
			id: "organizer",
			organizer: {
				id: "org",
				user: { name: "Organizer", email: "org@example.com" },
			},
		},
		"Organizer",
	],
] satisfies [RecordItem, string][]) {
	test(`${row.id}: amount detail`, () =>
		expect(presentRecord("fee-rules", row).amount).toBe(expected));
}

for (const [row, subtitle, dateValue] of [
	[
		{
			id: "buyer",
			buyerEmail: "buyer@example.com",
			event: { id: "event", title: "Event" },
			requestedAt: "2026-11-10T10:00:00Z",
		},
		"buyer@example.com",
		"10 Nov 2026, 11:00",
	],
	[
		{
			id: "event",
			event: { id: "event", title: "Event" },
			targetId: "target",
			startAt: "2026-11-11T10:00:00Z",
		},
		"Event",
		"11 Nov 2026, 11:00",
	],
	[
		{ id: "target", targetId: "target", activeFrom: "2026-11-12T10:00:00Z" },
		"target",
		"12 Nov 2026, 11:00",
	],
	[
		{
			id: "organizer",
			organizer: {
				id: "org",
				user: { name: "Organizer", email: "org@example.com" },
			},
		},
		"Organizer",
		undefined,
	],
] satisfies [RecordItem, string, string | undefined][]) {
	test(`${row.id}: secondary text and timestamp fallbacks`, () => {
		const view = presentRecord("audit", row);
		expect(view.subtitle).toBe(subtitle);
		expect(view.date).toBe(dateValue ?? "—");
	});
}
test("zero version uses ID in the list and stays empty in CSV", () => {
	expect(presentRecord("fee-rules", { id: "rule", version: 0 }).title).toBe(
		"rule",
	);
	expect(recordCsvRow({ id: "rule", version: 0 })).toEqual([
		"rule",
		"",
		"",
		"",
	]);
});
