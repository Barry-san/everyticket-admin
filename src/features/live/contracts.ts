export type Profile = {
	id: string;
	role: string;
	roles: string[];
	status: string;
};
export type RecordItem = {
	[field: string]: unknown;
	slug?: string;
	endAt?: string;
	blockedAt?: string | null;
	blockedByProfileId?: string | null;
	blockReason?: string | null;
	processedAt?: string | null;
	transferDate?: string | null;
	paidAt?: string | null;
	appliesToFreeOrder?: boolean;
	activeUntil?: string | null;
	paymentAttempts?: {
		id: string;
		reference: string;
		status: string;
		expectedAmountKobo: number;
		[field: string]: unknown;
	}[];
	id: string;
	title?: string;
	reference?: string;
	status?: string;
	role?: string;
	featured?: boolean;
	user?: { name: string; email: string };
	organizer?: { id: string; user: { name: string; email: string } };
	event?: { id: string; title: string };
	order?: { id: string; reference: string };
	buyerName?: string;
	buyerEmail?: string;
	createdAt?: string;
	requestedAt?: string;
	startAt?: string;
	totalKobo?: number;
	totalRefundKobo?: number;
	ticketRefundKobo?: number;
	platformFeeRefundKobo?: number;
	requestedAmountKobo?: number;
	calculatedPayableKobo?: number;
	reason?: string;
	reviewReason?: string;
	transferReference?: string;
	gatewayRefundReference?: string;
	gatewayStatus?: string;
	action?: string;
	targetId?: string;
	targetType?: string;
	details?: unknown;
	version?: number;
	mode?: string;
	fixedAmountKobo?: number;
	percentageBasisPoints?: number;
	activeFrom?: string;
};
export const resources = {
	events: {
		title: "Events",
		endpoint: "events",
		statuses: ["DRAFT", "PUBLISHED", "SUSPENDED", "CANCELLED"],
	},
	users: { title: "Users", endpoint: "users", statuses: [] },
	orders: {
		title: "Orders",
		endpoint: "orders",
		statuses: [
			"PENDING_PAYMENT",
			"PAID",
			"FAILED",
			"CANCELLED",
			"EXPIRED",
			"PAID_NEEDS_RESOLUTION",
		],
	},
	refunds: {
		title: "Refunds",
		endpoint: "refund-requests",
		statuses: [
			"REQUESTED",
			"APPROVED",
			"REJECTED",
			"PROCESSING",
			"PROCESSED",
			"FAILED",
			"CANCELLED",
		],
	},
	payouts: {
		title: "Payouts",
		endpoint: "payout-requests",
		statuses: ["REQUESTED", "APPROVED", "REJECTED", "PAID", "CANCELLED"],
	},
	"fee-rules": {
		title: "Fee rules",
		endpoint: "platform-fee-rule",
		statuses: [],
	},
	audit: { title: "Audit log", endpoint: "audit-logs", statuses: [] },
} as const;
export type Resource = keyof typeof resources;
export type Page = {
	items: RecordItem[];
	page: number;
	pageSize: number;
	total: number;
};
