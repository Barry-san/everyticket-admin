import { X } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";

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
