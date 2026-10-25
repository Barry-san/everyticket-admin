import {
	ArrowRight,
	ArrowUpRight,
	CheckCheck,
	CreditCard,
	Download,
	FileClock,
	Layers,
	Plus,
	RefreshCw,
	ShieldCheck,
	Ticket,
	Users,
	Wallet,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { total } from "./calculations";
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
import { date, initials, money } from "./format";
import { getRows, type Row } from "./selectors";
import { useAdmin } from "./store";
import type { AdminState, Command, Section } from "./types";
import { useRecords } from "./use-records";

type ActionName =
	| "suspend"
	| "restore"
	| "feature"
	| "block"
	| "unblock"
	| "record"
	| "fulfil"
	| "start-refund"
	| "retry"
	| "reconcile"
	| "provision"
	| "fee";
type Action = {
	name: ActionName;
	id?: string;
	title: string;
	description: string;
};

type RecordsSection = Exclude<Section, "refunds">;

const configuration: Record<
	RecordsSection,
	{
		title: string;
		eyebrow: string;
		description: string;
		statuses: string[];
		category: string;
	}
> = {
	events: {
		title: "Good times, well managed.",
		eyebrow: "Platform catalogue",
		description:
			"Keep an eye on every experience. Organizers create; you keep the platform in good shape.",
		statuses: ["Published", "Suspended", "Ended"],
		category: "categories",
	},
	users: {
		title: "The people behind it all.",
		eyebrow: "People & access",
		description:
			"Manage customers, organizers, and the people looking after the platform.",
		statuses: ["Active", "Blocked"],
		category: "roles",
	},
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

	payouts: {
		title: "Keep the good things flowing.",
		eyebrow: "Organizer payouts",
		description:
			"Review what organizers are owed and record completed external transfers.",
		statuses: ["Pending", "Approved", "Paid"],
		category: "organizers",
	},
	"fee-rules": {
		title: "Clear fees. No surprises.",
		eyebrow: "Platform pricing",
		description:
			"A versioned fee history. New rules apply to future orders; existing orders keep their snapshots.",
		statuses: ["Active", "Scheduled", "Historical"],
		category: "fee types",
	},
	reconciliation: {
		title: "Make every payment add up.",
		eyebrow: "Payment operations",
		description:
			"Resolve verified payment exceptions with the evidence and a clear audit trail.",
		statuses: ["Open", "Resolved"],
		category: "exception types",
	},
	jobs: {
		title: "Behind the scenes, in sync.",
		eyebrow: "Jobs & media",
		description:
			"Track delivery and media processing. Retry the work, without reissuing tickets.",
		statuses: [
			"Failed",
			"Queued",
			"Retrying",
			"Sent",
			"Completed",
			"Scheduled",
		],
		category: "job types",
	},
	audit: {
		title: "Every action, accounted for.",
		eyebrow: "Platform audit log",
		description:
			"A read-only history of sensitive changes: who, what, when, and why.",
		statuses: [],
		category: "actors",
	},
};

export default function RecordsPage({ section }: { section: RecordsSection }) {
	const { data, execute, notify, dismiss } = useAdmin();
	const [action, setAction] = useState<Action | null>(null);
	const config = configuration[section];
	const rows = getRows(data, section);
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
			`everyticket-${section}.csv`,
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
		notify(
			`Exported ${filtered.length} ${section === "audit" ? "audit entries" : "records"}.`,
		);
	}
	const openAction = (name: ActionName, id?: string) => {
		dismiss();
		const titles: Record<ActionName, string> = {
			suspend: "Suspend event",
			restore: "Restore event",
			feature: "Update event feature",
			block: "Block user",
			unblock: "Unblock user",
			record: "Record external transfer",
			fulfil: "Fulfil paid order",
			"start-refund": "Start a tracked refund",
			retry: "Retry failed jobs",
			reconcile: "Run reconciliation",
			provision: "Provision administrator",
			fee: "Schedule a fee rule",
		};
		const descriptions: Record<ActionName, string> = {
			suspend:
				"Checkout will stop. Existing orders, tickets, and history are preserved.",
			restore: "Checkout can resume when the organizer is active.",
			feature:
				"Change this published event’s placement in the featured catalogue.",
			block:
				"Revoke access and pause this organizer’s published events. Keep all historical records.",
			unblock:
				"Restore account access. Suspended events must be reviewed and restored separately.",
			record:
				"Record a transfer already made outside Everyticket. This action does not initiate a bank transfer.",
			fulfil:
				"Issue tickets once, only after verifying the exact payment and available capacity.",
			"start-refund":
				"Create a refund request for the amount actually received. It will need a separate review.",
			retry:
				"Queue failed delivery jobs using their original identities. Existing tickets are not reissued.",
			reconcile:
				"Check the demo payment records again. Exceptions remain open until explicitly resolved.",
			provision:
				"Add a demo administrator with access to all sections. No email or invitation will be sent.",
			fee: "Schedule a new fee version. Historical orders and the current fee remain unchanged.",
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
			label:
				section === "events"
					? "Event"
					: section === "users"
						? "Person / organization"
						: section === "jobs"
							? "Job"
							: section === "audit"
								? "Action / target"
								: section === "fee-rules"
									? "Version / rule"
									: "Reference",
			cell: (row) => (
				<button
					type="button"
					className="record-cell"
					onClick={() => select(row.id)}
				>
					{section === "events" && (
						<span className={`event-art art-${row.color}`}>
							<Ticket size={21} />
						</span>
					)}
					{section === "users" && (
						<span className="person-avatar">{initials(row.title)}</span>
					)}
					<span className="record-name">
						<strong>
							{row.title}
							{row.featured && (
								<span className="featured-star" title="Featured">
									✦
								</span>
							)}
						</strong>
						<span>{row.subtitle}</span>
					</span>
				</button>
			),
		},
		{
			label:
				section === "events"
					? "Organizer"
					: section === "users"
						? "Role"
						: section === "orders"
							? "Customer"
							: section === "payouts"
								? "Organizer"
								: section === "fee-rules"
									? "Change reason"
									: section === "audit"
										? "Actor"
										: "Type",
			cell: (row) => (
				<span className={section === "fee-rules" ? "truncate-reason" : ""}>
					{section === "users" ? (
						<Badge status={row.category} />
					) : ["events", "orders", "payouts", "fee-rules"].includes(section) ? (
						row.secondary
					) : (
						row.category
					)}
				</span>
			),
		},
		{
			label:
				section === "events"
					? "Starts"
					: section === "fee-rules"
						? "Effective"
						: "Date",
			cell: (row) => (
				<span className="table-date">
					{date(row.created, section === "audit")}
				</span>
			),
		},
	];
	if (rows.some((row) => row.amount !== undefined))
		columns.push({
			label:
				section === "events"
					? "Ticket sales"
					: section === "reconciliation"
						? "Received"
						: "Amount",
			cell: (row) => (
				<strong className="numeric">{money(row.amount || 0)}</strong>
			),
		});
	columns.push({
		label: "Status",
		cell: (row) =>
			section === "audit" ? (
				<span className="recorded-status">
					<ShieldCheck size={14} /> Recorded
				</span>
			) : (
				<Badge status={row.status} />
			),
	});
	columns.push({
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
	});
	const primaryAction =
		section === "users" ? (
			<button
				type="button"
				className="button button-primary"
				onClick={() => openAction("provision")}
			>
				<Plus size={16} />
				Add administrator
			</button>
		) : section === "fee-rules" ? (
			<button
				type="button"
				className="button button-primary"
				onClick={() => openAction("fee")}
			>
				<Plus size={16} />
				Schedule fee rule
			</button>
		) : section === "reconciliation" ? (
			<button
				type="button"
				className="button button-primary"
				onClick={() => openAction("reconcile")}
			>
				<RefreshCw size={16} />
				Run reconciliation
			</button>
		) : section === "jobs" ? (
			<button
				type="button"
				className="button button-primary"
				disabled={!data.jobs.some((job) => job.status === "Failed")}
				onClick={() => openAction("retry")}
			>
				<RefreshCw size={16} />
				Retry failed jobs
			</button>
		) : (
			<ExportButton
				onClick={exportRecords}
				label={section === "audit" ? "Export audit" : "Export records"}
			/>
		);
	return (
		<>
			<PageHeader {...config} action={primaryAction} />
			<SectionSummary section={section} data={data} />
			<Panel className="records-panel">
				<div className="records-title">
					<h2>
						{section === "reconciliation"
							? "Resolution queue"
							: section === "fee-rules"
								? "Fee history"
								: section === "audit"
									? "Activity history"
									: `All ${section === "jobs" ? "jobs" : section}`}
					</h2>
					<span className="count-pill">{rows.length}</span>
					{!["audit", "events", "orders", "payouts"].includes(section) && (
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
				{config.statuses.length > 0 && (
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
				)}
				<div className="table-toolbar">
					<SearchInput
						value={query}
						onChange={setQuery}
						placeholder={`Search ${section === "fee-rules" ? "fee history" : section}…`}
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
					financial={["orders", "payouts", "reconciliation"].includes(section)}
				/>
			</Panel>
			<div className="section-footnote">
				<ShieldCheck size={15} />
				<span>
					{section === "audit"
						? "Audit entries are read-only. Sensitive demo actions append a new entry."
						: "Demo workspace · changes reset on refresh · sensitive actions are recorded in the audit log."}
				</span>
			</div>
			<Modal
				open={!!selected}
				onClose={() => select(null)}
				title={record?.title || "Record not found"}
				description={
					record
						? `${record.id} · ${section === "audit" ? "Audit entry" : "Record details"}`
						: "This record is not available in the demo workspace."
				}
				side
			>
				{record && (
					<RecordDetails
						section={section}
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

function SectionSummary({
	section,
	data,
}: {
	section: RecordsSection;
	data: AdminState;
}) {
	if (section === "events")
		return (
			<div className="section-summary">
				<div>
					<span className="summary-icon icon-purple">
						<Ticket size={22} />
					</span>
					<p>
						<strong>{data.events.length}</strong>
						<span>total events</span>
					</p>
				</div>
				<div>
					<span className="live-dot" />
					<p>
						<strong>
							{
								data.events.filter((event) => event.status === "Published")
									.length
							}
						</strong>
						<span>currently live</span>
					</p>
				</div>
				<div>
					<span className="featured-star">✦</span>
					<p>
						<strong>
							{data.events.filter((event) => event.featured).length}
						</strong>
						<span>featured experiences</span>
					</p>
				</div>
				<span className="summary-aside">A platform full of possibilities.</span>
			</div>
		);
	if (section === "users")
		return (
			<div className="metrics-grid three">
				<Metric
					label="People & organizations"
					value={String(data.users.length)}
					detail="Across the demo platform"
					icon={<Users size={18} />}
				/>
				<Metric
					label="Organizers"
					value={String(
						data.users.filter((user) => user.role === "Organizer").length,
					)}
					detail="Creating the experiences"
					icon={<Ticket size={18} />}
					accent="orange"
				/>
				<Metric
					label="Blocked accounts"
					value={String(
						data.users.filter((user) => user.status === "Blocked").length,
					)}
					detail="History and records preserved"
					icon={<ShieldCheck size={18} />}
					accent="blue"
				/>
			</div>
		);

	if (section === "payouts")
		return (
			<>
				<div className="metrics-grid three">
					<Metric
						label="Outstanding payouts"
						value={money(
							data.payouts
								.filter((payout) => payout.status !== "Paid")
								.reduce((sum, payout) => sum + payout.amount, 0),
							true,
						)}
						detail="Platform fees excluded"
						icon={<Wallet size={18} />}
					/>
					<Metric
						label="Awaiting transfer"
						value={String(
							data.payouts.filter((payout) => payout.status !== "Paid").length,
						)}
						detail="External transfers to be recorded"
						icon={<FileClock size={18} />}
						accent="orange"
					/>
					<Metric
						label="Recorded transfers"
						value={String(
							data.payouts.filter((payout) => payout.status === "Paid").length,
						)}
						detail="Reference captured in audit history"
						icon={<CheckCheck size={18} />}
						accent="green"
					/>
				</div>
				<InfoNote>
					Transfers happen outside Everyticket. Record the transfer reference
					after payment; this console does not send funds.
				</InfoNote>
			</>
		);
	if (section === "reconciliation")
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
	if (section === "jobs")
		return (
			<div className="metrics-grid three">
				<Metric
					label="Failed jobs"
					value={String(
						data.jobs.filter((job) => job.status === "Failed").length,
					)}
					detail="Ready for a manual retry"
					icon={<RefreshCw size={18} />}
					accent="orange"
				/>
				<Metric
					label="Delivery queue"
					value={String(
						data.jobs.filter((job) =>
							["Queued", "Retrying"].includes(job.status),
						).length,
					)}
					detail="Original ticket identities preserved"
					icon={<CheckCheck size={18} />}
				/>
				<Metric
					label="Media tasks"
					value={String(data.jobs.filter((job) => job.type === "Media").length)}
					detail="Artwork and scheduled cleanup"
					icon={<Layers size={18} />}
					accent="blue"
				/>
			</div>
		);
	if (section === "fee-rules") {
		const active = data.fees.find((fee) => fee.status === "Active");
		return (
			<div className="fee-summary">
				<div>
					<span className="eyebrow">Current platform fee</span>
					<strong>
						{active?.type === "percentage"
							? `${active.value}%`
							: money(active?.value || 0)}
						<small>per order</small>
					</strong>
					<span>
						Effective {active ? date(active.effective) : "—"} · {active?.id}
					</span>
				</div>
				<div>
					<ShieldCheck size={25} />
					<h3>History stays exactly as it was.</h3>
					<p>
						Each order keeps the fee rule applied at checkout. New versions only
						affect future orders.
					</p>
				</div>
			</div>
		);
	}
	if (section === "orders")
		return (
			<InfoNote>
				Payment attempts belong to one order. Only verified, matching payments
				can be fulfilled.{" "}
				<Link to="/reconciliation">
					Review payment exceptions <ArrowRight size={13} />
				</Link>
			</InfoNote>
		);
	return null;
}

function RecordDetails({
	section,
	row,
	data,
	onAction,
}: {
	section: RecordsSection;
	row: Row;
	data: AdminState;
	onAction: (name: ActionName, id?: string) => void;
}) {
	let content: ReactNode;
	const actions: ReactNode[] = [];
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
	if (section === "events") {
		const event = data.events.find((event) => event.id === row.id);
		if (!event) return null;
		content = (
			<>
				<div className={`event-banner art-${event.color}`}>
					<Ticket size={54} strokeWidth={1} />
					<span>{event.category.toUpperCase()}</span>
					<strong>{event.name}</strong>
				</div>
				<Details
					items={[
						[
							"Organizer",
							<Link key="organizer" to={`/users?record=${event.organizerId}`}>
								{event.organizer}
							</Link>,
						],
						["Venue", event.location],
						["Starts (WAT)", date(event.date, true)],
						["Ticket sales", money(event.sales)],
						["Tickets sold", `${event.sold} / ${event.capacity}`],
						["Available capacity", String(event.capacity - event.sold)],
						["Featured", event.featured ? "Yes" : "No"],
					]}
				/>
				<InfoNote>
					Suspending an event stops new checkouts and preserves existing
					tickets, payments, and history.
				</InfoNote>
			</>
		);
		if (event.status === "Published") {
			actions.push(
				button(event.featured ? "Remove feature" : "Feature event", "feature"),
			);
			actions.push(button("Suspend event", "suspend", true));
		}
		if (event.status === "Suspended")
			actions.push(button("Restore event", "restore"));
	} else if (section === "users") {
		const user = data.users.find((user) => user.id === row.id);
		if (!user) return null;
		content = (
			<>
				<div className="person-profile">
					<span className="person-avatar large">{initials(user.name)}</span>
					<h3>{user.name}</h3>
					<p>{user.email}</p>
				</div>
				<Details
					items={[
						["Role", user.role],
						["Joined", date(user.joined)],
						["Account ID", user.id],
						[
							"Organized events",
							String(
								data.events.filter((event) => event.organizerId === user.id)
									.length,
							),
						],
						[
							"Orders",
							String(
								data.orders.filter((order) => order.userId === user.id).length,
							),
						],
					]}
				/>
				<InfoNote>
					Blocking revokes account access and suspends published organizer
					events. Unblocking does not automatically restore events.
				</InfoNote>
			</>
		);
		if (user.id !== "US-1007")
			actions.push(
				button(
					user.status === "Active" ? "Block user" : "Unblock user",
					user.status === "Active" ? "block" : "unblock",
					user.status === "Active",
				),
			);
	} else if (section === "orders") {
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
	} else if (section === "payouts") {
		const payout = data.payouts.find((payout) => payout.id === row.id);
		if (!payout) return null;
		content = (
			<>
				<div className="detail-amount">
					<span>Organizer payout</span>
					<strong>{money(payout.amount)}</strong>
					<small>Platform fees excluded</small>
				</div>
				<Details
					items={[
						[
							"Event",
							<Link key="event" to={`/events?record=${payout.eventId}`}>
								{row.subtitle}
							</Link>,
						],
						["Organizer", row.category],
						["Bank", payout.bank],
						["Account", payout.account],
						["Requested", date(payout.created)],
						["Transfer reference", payout.reference || "Not yet recorded"],
					]}
				/>
				<InfoNote>
					Verify the external transfer before recording it. This action records
					an existing payment; it does not send money.
				</InfoNote>
			</>
		);
		if (payout.status !== "Paid")
			actions.push(button("Record transfer", "record"));
	} else if (section === "fee-rules") {
		const fee = data.fees.find((fee) => fee.id === row.id);
		if (!fee) return null;
		content = (
			<>
				<Details
					items={[
						["Version", fee.id],
						["Type", row.category],
						["Rule", row.subtitle],
						["Effective (WAT)", date(fee.effective, true)],
						["Changed by", "Ada Obi"],
						["Reason", fee.reason],
					]}
				/>
				<InfoNote>
					All historical order fees stay unchanged. Scheduled rules need backend
					activation when their effective time arrives.
				</InfoNote>
			</>
		);
	} else if (section === "reconciliation") {
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
	} else if (section === "jobs") {
		const job = data.jobs.find((job) => job.id === row.id);
		if (!job) return null;
		content = (
			<>
				<Details
					items={[
						["Job ID", job.id],
						["Type", job.type],
						["Attempts made", String(job.attempts)],
						["Created / scheduled", date(job.created, true)],
						["Task", job.name],
					]}
				/>
				<InfoNote>
					{job.status === "Queued"
						? "The retry is queued. A backend worker will perform delivery when connected; the demo leaves it queued."
						: "Retries retain the original job identity and do not create or reissue tickets."}
				</InfoNote>
			</>
		);
		if (job.status === "Failed")
			actions.push(button("Retry this job", "retry"));
	} else {
		const entry = data.audit.find((entry) => entry.id === row.id);
		if (!entry) return null;
		content = (
			<>
				<Details
					items={[
						["Actor", entry.actor],
						["Action", entry.action],
						["Target", entry.target],
						["Time (WAT)", date(entry.created, true)],
						["Entry ID", entry.id],
					]}
				/>
				<h3 className="detail-heading">Recorded details</h3>
				<p className="detail-copy">{entry.detail}</p>
				<InfoNote>
					This history is read-only. Corrections require a new action and a new
					audit entry.
				</InfoNote>
			</>
		);
	}
	const history = data.audit.filter((entry) => entry.target === row.id);
	return (
		<>
			<div className="detail-status">
				<Badge status={row.status} />
			</div>
			{content}
			{actions.length > 0 && <div className="detail-actions">{actions}</div>}
			{section !== "audit" && history.length > 0 && (
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
	const [feeType, setFeeType] = useState<"percentage" | "fixed">("percentage");
	const [feeValue, setFeeValue] = useState("3.5");
	const [confirmed, setConfirmed] = useState(false);
	const exception = data.exceptions.find(
		(exception) => exception.id === action.id,
	);
	const order = data.orders.find((order) => order.id === exception?.orderId);
	const payout = data.payouts.find((payout) => payout.id === action.id);
	const isFinancial = ["record", "fulfil", "start-refund", "fee"].includes(
		action.name,
	);
	const defaultReason =
		action.name === "retry"
			? "Retry requested after reviewing failed delivery."
			: action.name === "reconcile"
				? "Manual payment reconciliation requested."
				: "";
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const fields = new FormData(event.currentTarget);
				const note = String(fields.get("note") || "");
				const id = action.id || "";
				let command: Command;
				switch (action.name) {
					case "suspend":
					case "restore":
					case "feature":
						command = { type: "event", id, action: action.name, note };
						break;
					case "block":
					case "unblock":
						command = { type: "user", id, note };
						break;

					case "record":
						command = {
							type: "payout",
							id,
							reference: String(fields.get("reference") || ""),
							note,
						};
						break;
					case "fulfil":
					case "start-refund":
						command = {
							type: "resolve",
							id,
							action: action.name === "fulfil" ? "fulfil" : "refund",
							note,
							capacityConfirmed: confirmed,
						};
						break;
					case "retry":
						command = { type: "retry", id: action.id, note };
						break;
					case "reconcile":
						command = { type: "reconcile", note };
						break;
					case "provision":
						command = {
							type: "provision",
							name: String(fields.get("name") || ""),
							email: String(fields.get("email") || ""),
							note,
						};
						break;
					case "fee":
						command = {
							type: "fee",
							feeType,
							value:
								feeType === "percentage"
									? Number(feeValue)
									: Math.round(Number(feeValue) * 100),
							effective: `${String(fields.get("effective"))}:00+01:00`,
							note,
						};
						break;
				}
				onSubmit(command);
			}}
		>
			{payout && (
				<Details
					items={[
						["Payout", payout.id],
						["Amount", money(payout.amount)],
						["Bank account", `${payout.bank} ${payout.account}`],
					]}
				/>
			)}
			{order && (
				<Details
					items={[
						["Order", order.id],
						["Received", money(order.received)],
						["Expected", money(total(order))],
					]}
				/>
			)}
			{action.name === "provision" && (
				<>
					<label className="form-field">
						Full name
						<input
							name="name"
							required
							minLength={2}
							autoComplete="name"
							placeholder="e.g. Amaka Eze"
						/>
					</label>
					<label className="form-field">
						Email address
						<input
							name="email"
							type="email"
							required
							autoComplete="email"
							placeholder="amaka@everyticket.ng"
						/>
					</label>
				</>
			)}
			{action.name === "record" && (
				<label className="form-field">
					External transfer reference
					<input
						name="reference"
						required
						minLength={5}
						placeholder="Enter the bank transfer reference"
					/>
					<span>Use the unique reference from the completed transfer.</span>
				</label>
			)}
			{action.name === "fee" && (
				<>
					<div className="form-grid">
						<label className="form-field">
							Fee type
							<select
								value={feeType}
								onChange={(event) => {
									setFeeType(event.target.value as "fixed" | "percentage");
									setFeeValue(
										event.target.value === "percentage" ? "3.5" : "500",
									);
								}}
							>
								<option value="percentage">Percentage</option>
								<option value="fixed">Fixed amount (NGN)</option>
							</select>
						</label>
						<label className="form-field">
							{feeType === "percentage" ? "Percentage (%)" : "Amount (₦)"}
							<input
								name="value"
								type="number"
								min="0"
								max={feeType === "percentage" ? 100 : undefined}
								step="0.01"
								required
								value={feeValue}
								onChange={(event) => setFeeValue(event.target.value)}
							/>
						</label>
					</div>
					<label className="form-field">
						Effective from (Africa/Lagos)
						<input
							name="effective"
							type="datetime-local"
							required
							min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
						/>
						<span>
							Future orders only. Scheduled rules are not activated
							automatically in the demo.
						</span>
					</label>
					<InfoNote>
						A ₦10,000 order would carry a{" "}
						{money(
							feeType === "percentage"
								? Math.round((1000000 * (Number(feeValue) || 0)) / 100)
								: Math.round((Number(feeValue) || 0) * 100),
						)}{" "}
						platform fee.
					</InfoNote>
				</>
			)}
			<label className="form-field">
				{action.name === "record" ? "Transfer note" : "Reason / internal note"}
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
			{action.name === "fulfil" && (
				<label className="checkbox-field">
					<input
						type="checkbox"
						checked={confirmed}
						required
						onChange={(event) => setConfirmed(event.target.checked)}
					/>
					<span>
						I have verified safe capacity and the exact payment amount. Issue
						tickets once.
					</span>
				</label>
			)}
			{isFinancial && action.name !== "fulfil" && (
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
					className={`button ${["suspend", "block"].includes(action.name) ? "button-danger" : "button-primary"}`}
					disabled={(isFinancial || action.name === "fulfil") && !confirmed}
				>
					Confirm{" "}
					{action.name === "fee"
						? "schedule"
						: action.name === "record"
							? "record"
							: action.name === "start-refund"
								? "refund request"
								: action.name === "feature"
									? "change"
									: action.name}
					<ArrowRight size={15} />
				</button>
			</div>
			<p className="form-disclaimer">
				Demo only · no external messages, payments, or transfers.
			</p>
		</form>
	);
}
