import { total } from "./calculations";
import type { AdminState, Command } from "./types";

function requireRecord<T extends { id: string }>(items: T[], id: string): T {
	const item = items.find((row) => row.id === id);
	if (!item) throw new Error("This record is no longer available.");
	return item;
}
function ensure(condition: boolean, message: string): asserts condition {
	if (!condition) throw new Error(message);
}

// All mutations pass through this boundary; a backend can replace it without changing views.
export function applyCommand(
	current: AdminState,
	command: Command,
	now = new Date().toISOString(),
): AdminState {
	ensure(
		command.note.trim().length >= 5,
		"Add a reason with at least 5 characters.",
	);
	const state = structuredClone(current);
	let action = "";
	let target = "Platform";
	let detail = command.note.trim();
	switch (command.type) {
		case "event": {
			const event = requireRecord(state.events, command.id);
			target = event.id;
			if (command.action === "feature") {
				ensure(
					event.status === "Published",
					"Only published events can be featured.",
				);
				event.featured = !event.featured;
				action = event.featured ? "Featured event" : "Removed feature";
			} else if (command.action === "suspend") {
				ensure(
					event.status === "Published",
					"Only published events can be suspended.",
				);
				event.status = "Suspended";
				event.featured = false;
				action = "Suspended event";
			} else {
				ensure(
					event.status === "Suspended",
					"Only suspended events can be restored.",
				);
				ensure(
					requireRecord(state.users, event.organizerId).status === "Active",
					"Unblock the organizer before restoring this event.",
				);
				event.status = "Published";
				action = "Restored event";
			}
			break;
		}
		case "user": {
			const user = requireRecord(state.users, command.id);
			ensure(
				user.id !== "US-1007",
				"You cannot block your own administrator account.",
			);
			user.status = user.status === "Active" ? "Blocked" : "Active";
			if (user.status === "Blocked") {
				state.events
					.filter(
						(event) =>
							event.organizerId === user.id && event.status === "Published",
					)
					.forEach((event) => {
						event.status = "Suspended";
						event.featured = false;
					});
				detail +=
					" Sessions revoked; published events suspended. Historical records preserved.";
			}
			target = user.id;
			action = user.status === "Blocked" ? "Blocked user" : "Unblocked user";
			break;
		}
		case "provision": {
			ensure(
				command.name.trim().length > 1 &&
					/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(command.email.trim()),
				"Enter a valid name and email address.",
			);
			ensure(
				!state.users.some(
					(user) =>
						user.email.toLowerCase() === command.email.trim().toLowerCase(),
				),
				"A user with this email already exists.",
			);
			target = `US-${Math.max(...state.users.map((user) => Number(user.id.slice(3)))) + 1}`;
			state.users.push({
				id: target,
				name: command.name.trim(),
				email: command.email.trim().toLowerCase(),
				role: "Administrator",
				status: "Active",
				joined: now,
			});
			action = "Provisioned administrator";
			detail += " Demo account only; no invitation sent.";
			break;
		}
		case "refund": {
			const refund = requireRecord(state.refunds, command.id);
			ensure(
				refund.status === "Pending",
				"This refund has already been reviewed.",
			);
			refund.status = command.action === "approve" ? "Processing" : "Rejected";
			const refundOrder = requireRecord(state.orders, refund.orderId);
			if (
				command.action === "reject" &&
				refundOrder.status === "Refund requested"
			) {
				refundOrder.status = "Needs resolution";
				state.exceptions
					.filter((exception) => exception.orderId === refundOrder.id)
					.forEach((exception) => {
						exception.status = "Open";
					});
			}
			if (command.action === "approve")
				requireRecord(state.orders, refund.orderId).status =
					"Refund processing";
			target = refund.id;
			action =
				command.action === "approve" ? "Approved refund" : "Rejected refund";
			detail +=
				command.action === "approve"
					? " Awaiting gateway confirmation; no money moved in demo."
					: "";
			break;
		}
		case "payout": {
			const payout = requireRecord(state.payouts, command.id);
			ensure(
				payout.status !== "Paid",
				"This transfer has already been recorded.",
			);
			ensure(
				command.reference.trim().length >= 5,
				"Enter the external transfer reference (at least 5 characters).",
			);
			ensure(
				!state.payouts.some(
					(item) =>
						item.reference?.toLowerCase() ===
						command.reference.trim().toLowerCase(),
				),
				"This transfer reference has already been used.",
			);
			payout.status = "Paid";
			payout.reference = command.reference.trim();
			target = payout.id;
			action = "Recorded payout";
			detail += ` Reference: ${payout.reference}. Platform fees excluded; no transfer initiated.`;
			break;
		}
		case "fee": {
			ensure(
				command.feeType !== "fixed" || Number.isSafeInteger(command.value),
				"Fixed fees must use integer kobo.",
			);
			ensure(
				Number.isFinite(command.value) && command.value >= 0,
				"Enter a valid fee.",
			);
			ensure(
				command.feeType !== "percentage" || command.value <= 100,
				"Percentage must be between 0 and 100.",
			);
			ensure(
				Number.isFinite(Date.parse(command.effective)) &&
					Date.parse(command.effective) > Date.parse(now),
				"Choose a future effective date.",
			);
			ensure(
				!state.fees.some((fee) => fee.status === "Scheduled"),
				"A future rule is already scheduled. Review it before scheduling another.",
			);
			target = `v${Math.max(...state.fees.map((fee) => Number(fee.id.slice(1)))) + 1}`;
			state.fees.unshift({
				id: target,
				type: command.feeType,
				value: command.value,
				effective: command.effective,
				status: "Scheduled",
				reason: command.note.trim(),
			});
			action = "Scheduled fee rule";
			detail += " Existing order fee snapshots are unchanged.";
			break;
		}
		case "resolve": {
			const exception = requireRecord(state.exceptions, command.id);
			ensure(
				exception.status === "Open",
				"This exception is already resolved.",
			);
			const order = requireRecord(state.orders, exception.orderId);
			const event = requireRecord(state.events, order.eventId);
			if (command.action === "fulfil") {
				ensure(
					order.received === total(order),
					"The received amount must exactly match before fulfilment.",
				);
				ensure(
					command.capacityConfirmed &&
						event.capacity - event.sold >= order.tickets,
					"Confirm sufficient safe capacity before issuing tickets.",
				);
				ensure(
					event.status === "Published",
					"The event must be published before fulfilment.",
				);
				ensure(
					requireRecord(state.users, event.organizerId).status === "Active" &&
						requireRecord(state.users, order.userId).status === "Active",
					"The organizer and customer must be active before fulfilment.",
				);
				order.status = "Paid";
				event.sold += order.tickets;
				event.sales += order.subtotal;
				action = "Fulfilled payment exception";
			} else {
				ensure(
					!state.refunds.some(
						(refund) =>
							refund.orderId === order.id && refund.status !== "Rejected",
					),
					"An active refund already exists for this order.",
				);
				const id = `RF-${Math.max(2080, ...state.refunds.map((refund) => Number(refund.id.slice(3)))) + 1}`;
				const ticketAmount = Math.min(order.received, order.subtotal);
				state.refunds.unshift({
					id,
					orderId: order.id,
					ticketAmount,
					feeAmount: order.received - ticketAmount,
					status: "Pending",
					reason: command.note.trim(),
					created: now,
				});
				order.status = "Refund requested";
				action = "Requested exception refund";
			}
			exception.status = "Resolved";
			target = order.id;
			break;
		}
		case "retry": {
			const failed = state.jobs.filter(
				(job) =>
					job.status === "Failed" && (!command.id || job.id === command.id),
			);
			ensure(failed.length > 0, "There are no failed jobs to retry.");
			failed.forEach((job) => {
				job.status = "Queued";
			});
			target = command.id || `${failed.length} failed jobs`;
			action = "Queued job retry";
			detail += " Original job identity retained; no tickets reissued.";
			break;
		}
		case "reconcile":
			state.reconciledAt = now;
			action = "Ran reconciliation";
			detail +=
				" Demo check complete. Open exceptions still require an explicit decision.";
			break;
	}
	state.audit.unshift({
		id: `AL-${Date.parse(now)}-${state.audit.length}`,
		actor: "Ada Obi",
		action,
		target,
		detail,
		created: now,
	});
	return state;
}
