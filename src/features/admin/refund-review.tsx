import {
	ArrowDownLeft,
	ArrowRight,
	ArrowUpRight,
	FileClock,
	Layers,
	RefreshCw,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
	Badge,
	type Column,
	DataTable,
	Details,
	downloadCsv,
	ExportButton,
	InfoNote,
	Metric,
	Modal,
	PageHeader,
	Panel,
	SearchInput,
} from "./components";
import { date, money } from "./format";
import type { Row } from "./selectors";
import { useAdmin } from "./store";
import type { AdminState, Command, Refund } from "./types";
import { useRecords } from "./use-records";

type ReviewAction = "approve" | "reject";

type RefundAction = {
	name: ReviewAction;
	id: string;
	title: string;
	description: string;
};

const statuses = ["Pending", "Processing", "Rejected"];

function getRefundRows(data: AdminState): Row[] {
	const eventName = (id: string) =>
		data.events.find((event) => event.id === id)?.name || id;
	const userName = (id: string) =>
		data.users.find((user) => user.id === id)?.name || id;

	return data.refunds.map((refund) => {
		const order = data.orders.find((order) => order.id === refund.orderId);
		return {
			id: refund.id,
			title: refund.id,
			subtitle: refund.orderId,
			status: refund.status,
			category: order ? eventName(order.eventId) : "Unknown",
			created: refund.created,
			amount: refund.ticketAmount + refund.feeAmount,
			secondary: order ? userName(order.userId) : "Unknown",
		};
	});
}

export default function RefundReviewPage() {
	const { data, execute, notify, dismiss } = useAdmin();
	const [action, setAction] = useState<RefundAction | null>(null);
	const rows = getRefundRows(data);
	const records = useRecords(rows);

	const openAction = (name: ReviewAction, id: string) => {
		dismiss();
		setAction({
			name,
			id,
			title: name === "approve" ? "Approve refund" : "Reject refund",
			description:
				name === "approve"
					? "Move the request to Processing. Completion requires gateway confirmation; no money moves in demo."
					: "Record why this request cannot proceed. The decision will appear in the audit log.",
		});
	};

	const columns: Column<Row>[] = [
		{
			label: "Reference",
			cell: (row) => (
				<button
					type="button"
					className="record-cell"
					onClick={() => records.select(row.id)}
				>
					<span className="record-name">
						<strong>{row.title}</strong>
						<span>{row.subtitle}</span>
					</span>
				</button>
			),
		},
		{
			label: "Customer",
			cell: (row) => <span>{row.secondary}</span>,
		},
		{
			label: "Date",
			cell: (row) => <span className="table-date">{date(row.created)}</span>,
		},
		{
			label: "Amount",
			cell: (row) => (
				<strong className="numeric">{money(row.amount || 0)}</strong>
			),
		},
		{
			label: "Status",
			cell: (row) => <Badge status={row.status} />,
		},
		{
			label: "Details",
			cell: (row) => (
				<button
					className="icon-button small"
					type="button"
					onClick={() => records.select(row.id)}
					aria-label={`View ${row.title}`}
				>
					<ArrowUpRight size={17} />
				</button>
			),
			className: "action-column",
		},
	];

	function exportRecords() {
		try {
			downloadCsv(
				"everyticket-refunds.csv",
				[
					"ID",
					"Name",
					"Details",
					"Status",
					"Category",
					"Date (WAT)",
					"Amount (NGN)",
				],
				records.filtered.map((row) => [
					row.id,
					row.title,
					row.secondary || row.subtitle,
					row.status,
					row.category,
					date(row.created, true),
					((row.amount || 0) / 100).toFixed(2),
				]),
			);
			notify(`Exported ${records.filtered.length} records.`);
		} catch {
			notify("Unable to export records. Please try again.", true);
		}
	}

	return (
		<>
			<PageHeader
				title="A fair outcome, every time."
				eyebrow="Refund management"
				description="Review requests with the full picture. Approval and payment completion are separate steps."
				action={<ExportButton onClick={exportRecords} label="Export records" />}
			/>
			<RefundSummary data={data} />
			<Panel className="records-panel">
				<div className="records-title">
					<h2>All refunds</h2>
					<span className="count-pill">{rows.length}</span>
				</div>
				<nav className="filter-tabs" aria-label="Filter by status">
					{["All", ...statuses].map((tab) => (
						<button
							type="button"
							key={tab}
							className={tab === records.status ? "active" : ""}
							aria-pressed={tab === records.status}
							onClick={() => records.setStatus(tab)}
						>
							{tab}
							<span>
								{tab === "All"
									? rows.length
									: rows.filter((row) => row.status === tab).length}
							</span>
						</button>
					))}
				</nav>
				<div className="table-toolbar">
					<SearchInput
						value={records.query}
						onChange={records.setQuery}
						placeholder="Search refunds…"
					/>
					<label className="select-field">
						<Layers size={15} aria-hidden="true" />
						<select
							aria-label="Filter by events"
							value={records.category}
							onChange={(event) => records.setCategory(event.target.value)}
						>
							<option value="All">All events</option>
							{records.categories.map((value) => (
								<option key={value}>{value}</option>
							))}
						</select>
					</label>
					{(records.query ||
						records.status !== "All" ||
						records.category !== "All") && (
						<button
							type="button"
							className="text-link"
							onClick={() => {
								records.setQuery("");
								records.setStatus("All");
								records.setCategory("All");
							}}
						>
							Clear filters
						</button>
					)}
				</div>
				<DataTable
					key={`${records.query}-${records.status}-${records.category}`}
					rows={records.filtered}
					columns={columns}
					label="A fair outcome, every time."
					financial
				/>
			</Panel>
			<div className="section-footnote">
				<ShieldCheck size={15} />
				<span>
					Demo workspace · changes reset on refresh · sensitive actions are
					recorded in the audit log.
				</span>
			</div>
			<Modal
				open={!!records.selected}
				onClose={() => records.select(null)}
				title={records.record?.title || "Record not found"}
				description={
					records.record
						? `${records.record.id} · Record details`
						: "This record is not available in the demo workspace."
				}
				side
			>
				{records.record && (
					<RefundDetails
						row={records.record}
						data={data}
						onAction={openAction}
					/>
				)}
			</Modal>
			<Modal
				open={!!action}
				onClose={() => setAction(null)}
				title={action?.title || "Confirm action"}
				description={action?.description}
			>
				{action && (
					<RefundReviewForm
						key={`${action.name}-${action.id}`}
						action={action}
						refund={data.refunds.find((refund) => refund.id === action.id)}
						onCancel={() => setAction(null)}
						onSubmit={(command) => {
							if (execute(command)) setAction(null);
						}}
					/>
				)}
			</Modal>
		</>
	);
}

function RefundSummary({ data }: { data: AdminState }) {
	return (
		<div className="metrics-grid three">
			<Metric
				label="Awaiting review"
				value={String(
					data.refunds.filter((refund) => refund.status === "Pending").length,
				)}
				detail="Ready for an administrator’s decision"
				icon={<FileClock size={18} />}
				accent="orange"
			/>
			<Metric
				label="In processing"
				value={String(
					data.refunds.filter((refund) => refund.status === "Processing")
						.length,
				)}
				detail="Awaiting gateway confirmation"
				icon={<RefreshCw size={18} />}
			/>
			<Metric
				label="Outstanding liability"
				value={money(
					data.refunds
						.filter((refund) => refund.status !== "Rejected")
						.reduce(
							(sum, refund) => sum + refund.ticketAmount + refund.feeAmount,
							0,
						),
				)}
				detail="Exact ticket and fee components"
				icon={<ArrowDownLeft size={18} />}
				accent="blue"
			/>
		</div>
	);
}

function RefundDetails({
	row,
	data,
	onAction,
}: {
	row: Row;
	data: AdminState;
	onAction: (name: ReviewAction, id: string) => void;
}) {
	const refund = data.refunds.find((refund) => refund.id === row.id);
	if (!refund) return null;
	const history = data.audit.filter((entry) => entry.target === row.id);

	return (
		<>
			<div className="detail-status">
				<Badge status={row.status} />
			</div>
			<Details
				items={[
					[
						"Order",
						<Link key="order" to={`/orders?record=${refund.orderId}`}>
							{refund.orderId}
						</Link>,
					],
					["Customer", row.secondary],
					["Event", row.category],
					["Ticket component", money(refund.ticketAmount)],
					["Platform fee component", money(refund.feeAmount)],
					["Total to refund", money(refund.ticketAmount + refund.feeAmount)],
					["Requested", date(refund.created, true)],
				]}
			/>
			<h3 className="detail-heading">Request reason</h3>
			<p className="detail-copy">{refund.reason}</p>
			<InfoNote>
				Approval starts processing. A refund is complete only after gateway
				confirmation; the demo does not move funds.
			</InfoNote>
			{refund.status === "Pending" && (
				<div className="detail-actions">
					<button
						type="button"
						className="button button-primary"
						onClick={() => onAction("approve", row.id)}
					>
						Approve refund <ArrowUpRight size={15} />
					</button>
					<button
						type="button"
						className="button button-danger"
						onClick={() => onAction("reject", row.id)}
					>
						Reject request <ArrowUpRight size={15} />
					</button>
				</div>
			)}
			{history.length > 0 && (
				<>
					<h3 className="detail-heading">Related activity</h3>
					<div className="mini-history">
						{history.map((entry) => (
							<Link key={entry.id} to={`/audit?record=${entry.id}`}>
								<strong>{entry.action}</strong>
								<span>
									{date(entry.created, true)} <ArrowUpRight size={13} />
								</span>
							</Link>
						))}
					</div>
				</>
			)}
		</>
	);
}

function RefundReviewForm({
	action,
	refund,
	onSubmit,
	onCancel,
}: {
	action: RefundAction;
	refund?: Refund;
	onSubmit: (command: Command) => void;
	onCancel: () => void;
}) {
	const { notice } = useAdmin();
	const [confirmed, setConfirmed] = useState(false);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const fields = new FormData(event.currentTarget);
				onSubmit({
					type: "refund",
					id: action.id,
					action: action.name,
					note: String(fields.get("note") || ""),
				});
			}}
		>
			{refund && (
				<Details
					items={[
						["Refund", refund.id],
						["Ticket amount", money(refund.ticketAmount)],
						["Platform fee", money(refund.feeAmount)],
						["Total", money(refund.ticketAmount + refund.feeAmount)],
					]}
				/>
			)}
			<label className="form-field">
				Reason / internal note
				<textarea
					name="note"
					required
					minLength={5}
					rows={3}
					placeholder="Record the context and evidence for this decision…"
				/>
				<span>
					At least 5 characters. This note is included in the audit log.
				</span>
			</label>
			<label className="checkbox-field">
				<input
					type="checkbox"
					required
					checked={confirmed}
					onChange={(event) => setConfirmed(event.target.checked)}
				/>
				<span>
					I have reviewed the details and want to record this decision in the
					demo.
				</span>
			</label>
			{notice?.error && (
				<p className="form-error" role="alert">
					{notice.message}
				</p>
			)}
			<div className="form-actions">
				<button
					type="button"
					className="button button-secondary"
					onClick={onCancel}
				>
					Cancel
				</button>
				<button
					type="submit"
					className={`button ${action.name === "reject" ? "button-danger" : "button-primary"}`}
					disabled={!confirmed}
				>
					Confirm {action.name} <ArrowRight size={15} />
				</button>
			</div>
			<p className="form-disclaimer">
				Demo only · no external messages, payments, or transfers.
			</p>
		</form>
	);
}
