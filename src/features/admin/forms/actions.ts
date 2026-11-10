export type RecordActionName =
	| "suspend"
	| "restore"
	| "feature"
	| "block"
	| "unblock"
	| "record"
	| "retry"
	| "provision"
	| "fee";

export type RecordAction = {
	name: RecordActionName;
	id?: string;
	title: string;
	description: string;
};

const actionDetails: Record<
	RecordActionName,
	Pick<RecordAction, "title" | "description">
> = {
	suspend: {
		title: "Suspend event",
		description:
			"Checkout will stop. Existing orders, tickets, and history are preserved.",
	},
	restore: {
		title: "Restore event",
		description: "Checkout can resume when the organizer is active.",
	},
	feature: {
		title: "Update event feature",
		description:
			"Change this published event’s placement in the featured catalogue.",
	},
	block: {
		title: "Block user",
		description:
			"Revoke access and pause this organizer’s published events. Keep all historical records.",
	},
	unblock: {
		title: "Unblock user",
		description:
			"Restore account access. Suspended events must be reviewed and restored separately.",
	},
	record: {
		title: "Record external transfer",
		description:
			"Record a transfer already made outside Everyticket. This action does not initiate a bank transfer.",
	},
	retry: {
		title: "Retry failed jobs",
		description:
			"Queue failed delivery jobs using their original identities. Existing tickets are not reissued.",
	},
	provision: {
		title: "Provision administrator",
		description:
			"Add a demo administrator with access to all sections. No email or invitation will be sent.",
	},
	fee: {
		title: "Schedule a fee rule",
		description:
			"Schedule a new fee version. Historical orders and the current fee remain unchanged.",
	},
};

export function createRecordAction(
	name: RecordActionName,
	id?: string,
): RecordAction {
	return { name, id, ...actionDetails[name] };
}
