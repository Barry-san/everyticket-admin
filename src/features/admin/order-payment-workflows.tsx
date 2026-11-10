import {
	ArrowRight,
	ArrowUpRight,
	CreditCard,
	Download,
	FileClock,
	Layers,
	RefreshCw,
	ShieldCheck,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { useGetOrders } from "@/hooks/orders/useGetOrders";
import { total } from "./calculations";
import {
	Badge,
	type Column,
	DataTable,
	Details,
	downloadCsv,
	ExportButton,
	InfoNote,
	Modal,
	PageHeader,
	Panel,
	SearchInput,
} from "./components";
import { date, money } from "./format";
import { getRows, type Row } from "./selectors";
import { useAdmin } from "./store";
import type { AdminState, Command } from "./types";
import { useRecords } from "./use-records";

type Workflow = "orders" | "reconciliation";
type ActionName = "fulfil" | "start-refund" | "reconcile";
type Action = {
	name: ActionName;
	id?: string;
	title: string;
	description: string;
};

const configuration = {
	orders: {
		title: "Every ticket starts here.",
		eyebrow: "Orders & payments",
		description:
			"Follow each order from checkout to confirmation, with every payment attempt in view.",
		statuses: [
			"Paid",
			"Pending",
			"Needs resolution",
			"Refund processing",
			"Refund requested",
			"Failed",
		],
		category: "events",
	},
	reconciliation: {
		title: "Make every payment add up.",
		eyebrow: "Payment operations",
		description:
			"Resolve verified payment exceptions with the evidence and a clear audit trail.",
		statuses: ["Open", "Resolved"],
		category: "exception types",
	},
} satisfies Record<
	Workflow,
	{
		title: string;
		eyebrow: string;
		description: string;
		statuses: string[];
		category: string;
	}
>;

export function OrdersPage() {
	const { data: orders } = useGetOrders();
	console.log(orders);
	return <OrderPaymentWorkflow workflow="orders" />;
}

export function ReconciliationPage() {
	return <OrderPaymentWorkflow workflow="reconciliation" />;
}

function OrderPaymentWorkflow({ workflow }: { workflow: Workflow }) {
	const { data, execute, notify, dismiss } = useAdmin();
	const [action, setAction] = useState<Action | null>(null);
	const config = configuration[workflow];
	const rows = getRows(data, workflow);
	const {
		categories,
		category,
		filtered,
		query,
		record,
		select,
		selected,
		setCategory,
		setQuery,
		setStatus,
		status,
	} = useRecords(rows);

	function exportRecords() {
		downloadCsv(
			`everyticket-${workflow}.csv`,
			[
				"ID",
				"Name",
				"Details",
				"Status",
				"Category",
				"Date (WAT)",
				"Amount (NGN)",
			],
			filtered.map((row) => [
				row.id,
				row.title,
				row.secondary || row.subtitle,
				row.status,
				row.category,
				date(row.created, true),
				row.amount === undefined ? "" : (row.amount / 100).toFixed(2),
			]),
		);
		notify(`Exported ${filtered.length} records.`);
	}

	const openAction = (name: ActionName, id?: string) => {
		dismiss();
		const titles: Record<ActionName, string> = {
			fulfil: "Fulfil paid order",
			"start-refund": "Start a tracked refund",
			reconcile: "Run reconciliation",
		};
		const descriptions: Record<ActionName, string> = {
			fulfil:
				"Issue tickets once, only after verifying the exact payment and available capacity.",
			"start-refund":
				"Create a refund request for the amount actually received. It will need a separate review.",
			reconcile:
				"Check the demo payment records again. Exceptions remain open until explicitly resolved.",
		};
		setAction({
			name,
			id,
			title: titles[name],
			description: descriptions[name],
		});
	};

	const columns: Column<Row>[] = [
		{
			label: "Reference",
			cell: (row) => (
				<button
					type="button"
					className="record-cell"
					onClick={() => select(row.id)}
				>
					<span className="record-name">
						<strong>{row.title}</strong>
						<span>{row.subtitle}</span>
					</span>
				</button>
			),
		},
		{
			label: workflow === "orders" ? "Customer" : "Type",
			cell: (row) => (
				<span>{workflow === "orders" ? row.secondary : row.category}</span>
			),
		},
		{
			label: "Date",
			cell: (row) => (
				<span className="table-date">{date(row.created, false)}</span>
			),
		},
		{
			label: workflow === "reconciliation" ? "Received" : "Amount",
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
					onClick={() => select(row.id)}
					aria-label={`View ${row.title}`}
				>
					<ArrowUpRight size={17} />
				</button>
			),
			className: "action-column",
		},
	];

	const primaryAction =
		workflow === "reconciliation" ? (
			<button
				type="button"
				className="button button-primary"
				onClick={() => openAction("reconcile")}
			>
				<RefreshCw size={16} />
				Run reconciliation
			</button>
		) : (
			<ExportButton onClick={exportRecords} label="Export records" />
		);

	return (
		<>
			<PageHeader {...config} action={primaryAction} />
			<WorkflowSummary workflow={workflow} data={data} />
			<Panel className="records-panel">
				<div className="records-title">
					<h2>
						{workflow === "reconciliation" ? "Resolution queue" : "All orders"}
					</h2>
					<span className="count-pill">{rows.length}</span>
					{workflow === "reconciliation" && (
						<button
							type="button"
							className="text-link records-export"
							onClick={exportRecords}
						>
							<Download size={14} />
							Export
						</button>
					)}
				</div>
				<nav className="filter-tabs" aria-label="Filter by status">
					{["All", ...config.statuses].map((tab) => (
						<button
							type="button"
							key={tab}
							className={tab === status ? "active" : ""}
							aria-pressed={tab === status}
							onClick={() => setStatus(tab)}
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
						value={query}
						onChange={setQuery}
						placeholder={`Search ${workflow}…`}
					/>
					<label className="select-field">
						<Layers size={15} aria-hidden="true" />
						<select
							aria-label={`Filter by ${config.category}`}
							value={category}
							onChange={(event) => setCategory(event.target.value)}
						>
							<option value="All">All {config.category}</option>
							{categories.map((value) => (
								<option key={value}>{value}</option>
							))}
						</select>
					</label>
					{(query || status !== "All" || category !== "All") && (
						<button
							type="button"
							className="text-link"
							onClick={() => {
								setQuery("");
								setStatus("All");
								setCategory("All");
							}}
						>
							Clear filters
						</button>
					)}
				</div>
				<DataTable
					key={`${query}-${status}-${category}`}
					rows={filtered}
					columns={columns}
					label={config.title}
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
				open={!!selected}
				onClose={() => select(null)}
				title={record?.title || "Record not found"}
				description={
					record
						? `${record.id} · Record details`
						: "This record is not available in the demo workspace."
				}
				side
			>
				{record && (
					<WorkflowDetails
						workflow={workflow}
						row={record}
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
					<ActionForm
						key={`${action.name}-${action.id}`}
						action={action}
						data={data}
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

function WorkflowSummary({
	workflow,
	data,
}: {
	workflow: Workflow;
	data: AdminState;
}) {
	if (workflow === "orders")
		return (
			<InfoNote>
				Payment attempts belong to one order. Only verified, matching payments
				can be fulfilled.{" "}
				<Link to="/reconciliation">
					Review payment exceptions <ArrowRight size={13} />
				</Link>
			</InfoNote>
		);
	return (
		<div className="health-grid">
			<Panel>
				<span className="health-icon icon-green">
					<CreditCard size={20} />
				</span>
				<h3>Payment verification</h3>
				<p>Sample gateway records are available.</p>
				<Badge status="Healthy" />
			</Panel>
			<Panel>
				<span className="health-icon icon-purple">
					<RefreshCw size={20} />
				</span>
				<h3>Last reconciliation</h3>
				<p>{date(data.reconciledAt, true)} WAT</p>
				<span className="muted-small">
					Checks are simulated in this workspace
				</span>
			</Panel>
			<Panel>
				<span className="health-icon icon-orange">
					<FileClock size={20} />
				</span>
				<h3>Resolution queue</h3>
				<p>
					{
						data.exceptions.filter((exception) => exception.status === "Open")
							.length
					}{" "}
					exceptions need a decision.
				</p>
				<Badge
					status={
						data.exceptions.some((exception) => exception.status === "Open")
							? "Needs resolution"
							: "Resolved"
					}
				/>
			</Panel>
		</div>
	);
}

function WorkflowDetails({
	workflow,
	row,
	data,
	onAction,
}: {
	workflow: Workflow;
	row: Row;
	data: AdminState;
	onAction: (name: ActionName, id?: string) => void;
}) {
	const history = data.audit.filter((entry) => entry.target === row.id);
	let content: ReactNode;
	const actions = [];
	const button = (
		label: string,
		name: ActionName,
		danger = false,
		disabled = false,
	) => (
		<button
			key={name}
			type="button"
			className={`button ${danger ? "button-danger" : "button-primary"}`}
			disabled={disabled}
			onClick={() => onAction(name, row.id)}
		>
			{label}
			<ArrowUpRight size={15} />
		</button>
	);
	if (workflow === "orders") {
		const order = data.orders.find((order) => order.id === row.id);
		if (!order) return null;
		const user = data.users.find((user) => user.id === order.userId);
		content = (
			<>
				<Details
					items={[
						[
							"Event",
							<Link key="event" to={`/events?record=${order.eventId}`}>
								{row.subtitle}
							</Link>,
						],
						[
							"Customer",
							<Link key="customer" to={`/users?record=${order.userId}`}>
								{user?.name}
							</Link>,
						],
						["Tickets", String(order.tickets)],
						["Ticket subtotal", money(order.subtotal)],
						["Fee snapshot", money(order.fee)],
						["Order total", money(total(order))],
						["Received", money(order.received)],
						["Created (WAT)", date(order.created, true)],
					]}
				/>
				<h3 className="detail-heading">Payment history</h3>
				<div className="payment-attempt">
					<CreditCard size={20} />
					<div>
						<strong>
							{order.attempts} payment{" "}
							{order.attempts === 1 ? "attempt" : "attempts"}
						</strong>
						<p>
							{order.received
								? `${money(order.received)} verified as received`
								: "No verified payment received"}
						</p>
					</div>
				</div>
				<InfoNote warning={order.status === "Needs resolution"}>
					{order.status === "Needs resolution"
						? "Payment requires review. Tickets have not been issued for this exception."
						: "One order retains all its payment attempts. Its historical fee snapshot never changes."}
				</InfoNote>
				{order.status === "Needs resolution" && (
					<Link
						className="button button-primary"
						to={`/reconciliation?record=${data.exceptions.find((exception) => exception.orderId === order.id)?.id}`}
					>
						Review exception <ArrowRight size={15} />
					</Link>
				)}
			</>
		);
	} else {
		const exception = data.exceptions.find(
			(exception) => exception.id === row.id,
		);
		const order = data.orders.find((order) => order.id === exception?.orderId);
		const event = data.events.find((event) => event.id === order?.eventId);
		if (!exception || !order || !event) return null;
		content = (
			<>
				<InfoNote warning>
					{exception.type === "Late payment"
						? "Payment arrived after the checkout hold expired. Capacity must be checked again."
						: "The received amount does not match the order total. Do not issue tickets."}
				</InfoNote>
				<Details
					items={[
						[
							"Order",
							<Link key="order" to={`/orders?record=${order.id}`}>
								{order.id}
							</Link>,
						],
						["Event", event.name],
						["Expected", money(total(order))],
						["Received", money(order.received)],
						["Currency", "NGN"],
						["Tickets requested", String(order.tickets)],
						["Available capacity", String(event.capacity - event.sold)],
						[
							"Payment match",
							order.received === total(order)
								? "Exact match"
								: "Amount mismatch",
						],
					]}
				/>
			</>
		);
		if (exception.status === "Open") {
			actions.push(
				button(
					"Fulfil manually",
					"fulfil",
					false,
					order.received !== total(order) ||
						event.status !== "Published" ||
						event.capacity - event.sold < order.tickets,
				),
			);
			actions.push(button("Start tracked refund", "start-refund", true));
		}
	}
	return (
		<>
			<div className="detail-status">
				<Badge status={row.status} />
			</div>
			{content}
			{actions.length > 0 && <div className="detail-actions">{actions}</div>}
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

function ActionForm({
	action,
	data,
	onSubmit,
	onCancel,
}: {
	action: Action;
	data: AdminState;
	onSubmit: (command: Command) => void;
	onCancel: () => void;
}) {
	const { notice } = useAdmin();
	const [confirmed, setConfirmed] = useState(false);
	const exception = data.exceptions.find(
		(exception) => exception.id === action.id,
	);
	const order = data.orders.find((order) => order.id === exception?.orderId);
	const defaultReason =
		action.name === "reconcile"
			? "Manual payment reconciliation requested."
			: "";
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const fields = new FormData(event.currentTarget);
				const note = String(fields.get("note") || "");
				let command: Command;
				if (action.name === "reconcile") command = { type: "reconcile", note };
				else
					command = {
						type: "resolve",
						id: action.id || "",
						action: action.name === "fulfil" ? "fulfil" : "refund",
						note,
						capacityConfirmed: confirmed,
					};
				onSubmit(command);
			}}
		>
			{order && (
				<Details
					items={[
						["Order", order.id],
						["Received", money(order.received)],
						["Expected", money(total(order))],
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
					defaultValue={defaultReason}
					placeholder="Record the context and evidence for this decision…"
				/>
				<span>
					At least 5 characters. This note is included in the audit log.
				</span>
			</label>
			{action.name !== "reconcile" && (
				<label className="checkbox-field">
					<input
						type="checkbox"
						checked={confirmed}
						required
						onChange={(event) => setConfirmed(event.target.checked)}
					/>
					<span>
						{action.name === "fulfil"
							? "I have verified safe capacity and the exact payment amount. Issue tickets once."
							: "I have reviewed the details and want to record this decision in the demo."}
					</span>
				</label>
			)}
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
					className="button button-primary"
					disabled={action.name !== "reconcile" && !confirmed}
				>
					Confirm{" "}
					{action.name === "start-refund" ? "refund request" : action.name}
					<ArrowRight size={15} />
				</button>
			</div>
			<p className="form-disclaimer">
				Demo only · no external messages, payments, or transfers.
			</p>
		</form>
	);
}
