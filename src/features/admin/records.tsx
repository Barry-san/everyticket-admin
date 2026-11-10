import {
	ArrowUpRight,
	CheckCheck,
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
import { ActionModalContent } from "./forms/action-modal-content";
import {
	createRecordAction,
	type RecordAction,
	type RecordActionName,
} from "./forms/actions";
import { getRows, type Row } from "./selectors";
import { useAdmin } from "./store";
import type { AdminState, Section } from "./types";
import { useRecords } from "./use-records";

type RecordsSection = Exclude<Section, "refunds" | "orders" | "reconciliation">;

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
	const [action, setAction] = useState<RecordAction | null>(null);
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
		try {
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
		} catch {
			notify("Unable to export records. Please try again.", true);
		}
	}
	const openAction = (name: RecordActionName, id?: string) => {
		dismiss();
		setAction(createRecordAction(name, id));
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
          ) : ["events", "payouts", "fee-rules"].includes(section) ? (
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
      label: section === "events" ? "Ticket sales" : "Amount",
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
            {section === "fee-rules"
              ? "Fee history"
              : section === "audit"
                ? "Activity history"
                : `All ${section === "jobs" ? "jobs" : section}`}
					</h2>
					<span className="count-pill">{rows.length}</span>
          {!["audit", "events", "payouts"].includes(section) && (
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
          financial={section === "payouts"}
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
					<ActionModalContent
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
	onAction: (name: RecordActionName, id?: string) => void;
}) {
	let content: ReactNode;
	const actions: ReactNode[] = [];
	const button = (
		label: string,
		name: RecordActionName,
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
