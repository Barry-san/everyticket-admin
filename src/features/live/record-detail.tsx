import { Fragment } from "react";
import { date, money } from "@/features/admin/format";
import type { RecordItem } from "./contracts";

function display(key: string, value: unknown): string {
	if (value == null) return "—";
	if (typeof value === "number" && key.endsWith("Kobo")) return money(value);
	if (typeof value === "number" && key === "percentageBasisPoints")
		return `${value / 100}%`;
	if (typeof value === "string" && /(At|From|Until|Date)$/.test(key))
		return date(value, true);
	if (Array.isArray(value))
		return value.map((item) => display(key, item)).join("; ");
	if (typeof value === "object")
		return Object.entries(value)
			.map(
				([field, item]) =>
					`${field.replace(/([A-Z])/g, " $1")}: ${display(field, item)}`,
			)
			.join(" · ");
	return String(value).replace(/_/g, " ");
}
export function RecordDetail({ record }: { record: RecordItem }) {
	return (
		<dl className="record-detail">
			{Object.entries(record).map(([key, value]) => (
				<Fragment key={key}>
					<dt>{key.replace(/Kobo$/, "").replace(/([A-Z])/g, " $1")}</dt>
					<dd>{display(key, value)}</dd>
				</Fragment>
			))}
		</dl>
	);
}
