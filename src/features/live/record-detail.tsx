import { Fragment } from "react";
import { date, money } from "@/features/admin/format";
import type { RecordItem, Resource } from "./contracts";

const sections: Record<Resource, Record<string, string[]>> = {
	events: {
		Identity: ["id", "title", "slug"],
		Publication: ["status", "featured"],
		Schedule: ["startAt", "endAt"],
		Organizer: ["organizer"],
	},
	users: {
		Identity: ["id", "user"],
		Profile: ["role", "status", "createdAt"],
		Blocking: ["blockedAt", "blockedByProfileId", "blockReason"],
	},
	orders: {
		Booking: ["id", "reference", "status", "createdAt"],
		Buyer: ["buyerName", "buyerEmail"],
		Event: ["event"],
		Amounts: ["totalKobo"],
		"Payment attempts": ["paymentAttempts"],
	},
	refunds: {
		Request: ["id", "status", "reason", "requestedAt"],
		Amounts: ["ticketRefundKobo", "platformFeeRefundKobo", "totalRefundKobo"],
		Review: ["reviewReason"],
		"Gateway processing": [
			"gatewayRefundReference",
			"gatewayStatus",
			"processedAt",
		],
		"Related identities": ["organizer", "event", "order"],
	},
	payouts: {
		Request: ["id", "status", "requestedAt"],
		"Organizer and event": ["organizer", "event"],
		"Payable amounts": ["requestedAmountKobo", "calculatedPayableKobo"],
		Review: ["reviewReason"],
		Transfer: ["transferReference", "transferDate", "paidAt"],
	},
	"fee-rules": {
		Version: ["id", "version"],
		Calculation: ["mode", "percentageBasisPoints", "fixedAmountKobo"],
		Applicability: ["appliesToFreeOrder"],
		"Effective dates": ["activeFrom", "activeUntil"],
	},
	audit: {
		Action: ["id", "action"],
		Target: ["targetType", "targetId"],
		Timestamp: ["createdAt"],
		"Structured details": ["details"],
	},
};
const label = (key: string) =>
	key.replace(/Kobo$/, " (NGN)").replace(/([a-z])([A-Z])/g, "$1 $2");
function Value({ field, value }: { field: string; value: unknown }) {
	if (value == null) return <span>—</span>;
	if (Array.isArray(value)) {
		if (!value.length) return <span>None</span>;
		if (field === "paymentAttempts") {
			const columns = [...new Set(value.flatMap((item) => Object.keys(item)))];
			return (
				<div className="detail-table">
					<table>
						<thead>
							<tr>
								{columns.map((key) => (
									<th key={key}>{label(key)}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{value.map((item, index) => (
								<tr key={item.id ?? index}>
									{columns.map((key) => (
										<td key={key}>
											<Value field={key} value={item[key]} />
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
		return (
			<ol>
				{value.map((item, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Read-only API arrays may contain duplicate primitives without IDs.
					<li key={index}>
						<Value field={field} value={item} />
					</li>
				))}
			</ol>
		);
	}
	if (typeof value === "object")
		return <Fields values={value as Record<string, unknown>} />;
	if (typeof value === "number" && field.endsWith("Kobo"))
		return <>{money(value)}</>;
	if (typeof value === "number" && field === "percentageBasisPoints")
		return (
			<>
				{value} ({value / 100}%)
			</>
		);
	if (
		typeof value === "string" &&
		/(At|From|Until|Date)$/.test(field) &&
		!Number.isNaN(Date.parse(value))
	)
		return <>{date(value, true)} WAT</>;
	return <>{String(value)}</>;
}
function Fields({ values }: { values: Record<string, unknown> }) {
	return (
		<dl className="record-detail">
			{Object.entries(values).map(([key, value]) => (
				<Fragment key={key}>
					<dt>{label(key)}</dt>
					<dd>
						<Value field={key} value={value} />
					</dd>
				</Fragment>
			))}
		</dl>
	);
}
export function RecordDetail({
	record,
	resource,
}: {
	record: RecordItem;
	resource: Resource;
}) {
	const groups = sections[resource];
	const known = new Set(Object.values(groups).flat());
	const extra = Object.fromEntries(
		Object.entries(record).filter(([key]) => !known.has(key)),
	);
	return (
		<div className="detail-sections">
			{Object.entries({
				...groups,
				...(Object.keys(extra).length
					? { "Additional details": Object.keys(extra) }
					: {}),
			}).map(([title, fields]) => (
				<section className="panel detail-section" key={title}>
					<h2>{title}</h2>
					<Fields
						values={Object.fromEntries(fields.map((key) => [key, record[key]]))}
					/>
				</section>
			))}
		</div>
	);
}
