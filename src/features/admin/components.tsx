import {
	ArrowDownToLine,
	ArrowUpRight,
	Check,
	ChevronLeft,
	ChevronRight,
	Search,
	X,
} from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function Brand({ compact = false }: { compact?: boolean }) {
	return (
		<span className={`brand ${compact ? "brand-compact" : ""}`}>
			<span className="">
				<img src="/everyticket-logo.svg" width={40} height={40} alt="logo" />
			</span>
			<span>
				everyticket<span className="brand-period">.</span>
			</span>
		</span>
	);
}

export function Badge({ status }: { status: string }) {
	const good = [
		"Published",
		"Active",
		"Paid",
		"Sent",
		"Completed",
		"Resolved",
		"Healthy",
	];
	const bad = ["Blocked", "Suspended", "Failed", "Rejected", "Amount mismatch"];
	const neutral = ["Historical", "Ended", "Customer", "Media"];
	const tone = good.includes(status)
		? "green"
		: bad.includes(status)
			? "red"
			: neutral.includes(status)
				? "neutral"
				: ["Featured", "Administrator", "Organizer"].includes(status)
					? "purple"
					: "amber";
	return (
		<span className={`badge badge-${tone}`}>
			<span aria-hidden="true" />
			{status}
		</span>
	);
}

export function PageHeader({
	eyebrow,
	title,
	description,
	action,
}: {
	eyebrow: string;
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className="page-heading">
			<div>
				<p className="eyebrow">{eyebrow}</p>
				<h1>{title}</h1>
				<p className="page-description">{description}</p>
			</div>
			{action && <div className="heading-actions">{action}</div>}
		</div>
	);
}

export function Metric({
	label,
	value,
	detail,
	icon,
	accent = "purple",
	trend,
}: {
	label: string;
	value: string;
	detail: string;
	icon: ReactNode;
	accent?: string;
	trend?: string;
}) {
	return (
		<article className="metric-card">
			<div className="metric-top">
				<span>{label}</span>
				<span className={`metric-icon icon-${accent}`}>{icon}</span>
			</div>
			<strong className="metric-value">{value}</strong>
			<div className="metric-bottom">
				{trend && (
					<span className="metric-trend">
						<ArrowUpRight size={12} />
						{trend}
					</span>
				)}
				<span>{detail}</span>
			</div>
		</article>
	);
}

export function Panel({
	title,
	eyebrow,
	action,
	children,
	className = "",
}: {
	title?: string;
	eyebrow?: string;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={`panel ${className}`}>
			{title && (
				<div className="panel-heading">
					<div>
						{eyebrow && <p className="eyebrow">{eyebrow}</p>}
						<h2>{title}</h2>
					</div>
					{action}
				</div>
			)}
			{children}
		</section>
	);
}

export function SearchInput({
	value,
	onChange,
	placeholder = "Search records…",
	label = "Search records",
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
}) {
	return (
		<div className="search-field">
			<Search size={17} aria-hidden="true" />
			<input
				type="search"
				aria-label={label}
				placeholder={placeholder}
				value={value}
				onChange={(event) => onChange(event.target.value)}
			/>
			{value && (
				<button
					type="button"
					className="icon-button small"
					onClick={() => onChange("")}
					aria-label={`Clear ${label.toLowerCase()}`}
				>
					<X size={14} />
				</button>
			)}
		</div>
	);
}

export function Empty({
	title = "No matching records",
	description = "Try a different search or clear your filters.",
	action,
}: {
	title?: string;
	description?: string;
	action?: ReactNode;
}) {
	return (
		<div className="empty-state">
			<span className="empty-icon">
				<Search size={25} />
			</span>
			<h3>{title}</h3>
			<p>{description}</p>
			{action}
		</div>
	);
}

export type Column<T> = {
	label: string;
	cell: (row: T) => ReactNode;
	className?: string;
};
export function DataTable<T extends { id: string }>({
	rows,
	columns,
	financial = false,
	label = "Records",
	pageSize = 6,
}: {
	rows: T[];
	columns: Column<T>[];
	financial?: boolean;
	label?: string;
	pageSize?: number;
}) {
	const [page, setPage] = useState(1);
	const count = Math.max(1, Math.ceil(rows.length / pageSize));
	const current = Math.min(page, count);
	const start = (current - 1) * pageSize;
	if (!rows.length) return <Empty />;
	return (
		<>
			<div
				className={`table-scroll ${financial ? "financial-table" : "responsive-table"}`}
			>
				<table aria-label={label}>
					<thead>
						<tr>
							{columns.map((column) => (
								<th key={column.label} scope="col" className={column.className}>
									{column.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.slice(start, start + pageSize).map((row) => (
							<tr key={row.id}>
								{columns.map((column) => (
									<td
										key={column.label}
										data-label={column.label}
										className={column.className}
									>
										{column.cell(row)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="table-footer">
				<span>
					Showing{" "}
					<strong>
						{start + 1}–{Math.min(start + pageSize, rows.length)}
					</strong>{" "}
					of {rows.length} records
				</span>
				<div className="pagination">
					<button
						type="button"
						className="icon-button small"
						aria-label="Previous page"
						disabled={current === 1}
						onClick={() => setPage(current - 1)}
					>
						<ChevronLeft size={16} />
					</button>
					<span>
						{current} / {count}
					</span>
					<button
						type="button"
						className="icon-button small"
						aria-label="Next page"
						disabled={current === count}
						onClick={() => setPage(current + 1)}
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
		</>
	);
}

let openModalCount = 0;
let previousBodyOverflow = "";

export function Modal({
	open,
	onClose,
	title,
	description,
	children,
	side = false,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: ReactNode;
	side?: boolean;
}) {
	const ref = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const descriptionId = useId();
	useEffect(() => {
		const dialog = ref.current;
		if (open && !dialog?.open) {
			dialog?.showModal();
			dialog?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
		}
		if (!open && dialog?.open) dialog.close();
	}, [open]);
	useEffect(() => {
		if (!open) return;
		if (openModalCount === 0)
			previousBodyOverflow = document.body.style.overflow;
		openModalCount += 1;
		document.body.style.overflow = "hidden";
		return () => {
			openModalCount -= 1;
			if (openModalCount === 0)
				document.body.style.overflow = previousBodyOverflow;
		};
	}, [open]);
	return (
		<dialog
			ref={ref}
			className={`modal ${side ? "side-modal" : ""}`}
			aria-labelledby={titleId}
			aria-describedby={description ? descriptionId : undefined}
			onCancel={onClose}
			onClose={onClose}
		>
			<div className="modal-head">
				<div>
					<p className="eyebrow">Everyticket administration</p>
					<h2 id={titleId}>{title}</h2>
					{description && <p id={descriptionId}>{description}</p>}
				</div>
				<button
					type="button"
					className="icon-button"
					onClick={onClose}
					aria-label="Close dialog"
				>
					<X size={20} />
				</button>
			</div>
			{open && <div className="modal-body">{children}</div>}
		</dialog>
	);
}

export function Details({ items }: { items: [string, ReactNode][] }) {
	return (
		<dl className="detail-list">
			{items.map(([label, value]) => (
				<div key={label}>
					<dt>{label}</dt>
					<dd>{value}</dd>
				</div>
			))}
		</dl>
	);
}

export function InfoNote({
	children,
	warning = false,
}: {
	children: ReactNode;
	warning?: boolean;
}) {
	return (
		<div className={`info-note ${warning ? "warning-note" : ""}`}>
			<span className="note-dot" aria-hidden="true" />
			<p>{children}</p>
		</div>
	);
}

export function Toast({
	message,
	error,
	onClose,
}: {
	message: string;
	error: boolean;
	onClose: () => void;
}) {
	const [container, setContainer] = useState<Element>(document.body);
	const [paused, setPaused] = useState(false);
	useEffect(() => {
		// Modal dialogs occupy the browser's top layer, above any z-index.
		const updateContainer = () => {
			const dialogs = document.querySelectorAll("dialog[open]");
			setContainer(dialogs[dialogs.length - 1] || document.body);
		};
		updateContainer();
		const observer = new MutationObserver(updateContainer);
		observer.observe(document.body, {
			subtree: true,
			attributes: true,
			attributeFilter: ["open"],
			childList: true,
		});
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		if (error || paused) return;
		const timeout = window.setTimeout(onClose, 6500);
		return () => window.clearTimeout(timeout);
	}, [error, paused, onClose]);
	return createPortal(
		// biome-ignore lint/a11y/noStaticElementInteractions: Hover and focus only pause dismissal; the notification is not an interactive control.
		<div
			className={`toast ${error ? "toast-error" : ""}`}
			role={error ? "alert" : "status"}
			aria-atomic="true"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
		>
			<span className="toast-symbol">
				{error ? (
					<X size={18} aria-hidden="true" />
				) : (
					<Check size={18} aria-hidden="true" />
				)}
			</span>
			<span>{message}</span>
			<button
				type="button"
				className="icon-button small"
				onClick={onClose}
				aria-label="Dismiss notification"
			>
				<X size={16} />
			</button>
		</div>,
		container,
	);
}

export function downloadCsv(
	filename: string,
	headers: string[],
	rows: string[][],
) {
	const escapeCell = (value: string) =>
		`"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
	const csv = [headers, ...rows]
		.map((row) => row.map(escapeCell).join(","))
		.join("\r\n");
	const url = URL.createObjectURL(
		new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

export function ExportButton({
	onClick,
	label = "Export",
}: {
	onClick: () => void;
	label?: string;
}) {
	return (
		<button className="button button-secondary" type="button" onClick={onClick}>
			<ArrowDownToLine size={16} />
			{label}
		</button>
	);
}
