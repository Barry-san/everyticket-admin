export type Section =
	| "events"
	| "users"
	| "orders"
	| "refunds"
	| "payouts"
	| "fee-rules"
	| "reconciliation"
	| "jobs"
	| "audit";
export type Event = {
	id: string;
	name: string;
	organizer: string;
	organizerId: string;
	location: string;
	date: string;
	category: string;
	status: string;
	featured: boolean;
	sold: number;
	capacity: number;
	sales: number;
	color: string;
};
export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
	joined: string;
};
export type Order = {
	id: string;
	eventId: string;
	userId: string;
	tickets: number;
	subtotal: number;
	fee: number;
	received: number;
	status: string;
	created: string;
	attempts: number;
};
export type Refund = {
	id: string;
	orderId: string;
	ticketAmount: number;
	feeAmount: number;
	status: string;
	reason: string;
	created: string;
};
export type Payout = {
	id: string;
	eventId: string;
	amount: number;
	status: string;
	bank: string;
	account: string;
	reference?: string;
	created: string;
};
export type FeeRule = {
	id: string;
	type: "percentage" | "fixed";
	value: number;
	effective: string;
	status: string;
	reason: string;
};
export type Exception = {
	id: string;
	orderId: string;
	type: string;
	status: string;
	created: string;
};
export type Job = {
	id: string;
	name: string;
	type: string;
	attempts: number;
	status: string;
	created: string;
};
export type Audit = {
	id: string;
	actor: string;
	action: string;
	target: string;
	detail: string;
	created: string;
};
export type AdminState = {
	events: Event[];
	users: User[];
	orders: Order[];
	refunds: Refund[];
	payouts: Payout[];
	fees: FeeRule[];
	exceptions: Exception[];
	jobs: Job[];
	audit: Audit[];
	reconciledAt: string;
};

export type Command =
	| {
			type: "event";
			id: string;
			action: "suspend" | "restore" | "feature";
			note: string;
	  }
	| { type: "user"; id: string; note: string }
	| { type: "provision"; name: string; email: string; note: string }
	| { type: "refund"; id: string; action: "approve" | "reject"; note: string }
	| { type: "payout"; id: string; reference: string; note: string }
	| {
			type: "fee";
			feeType: "fixed" | "percentage";
			value: number;
			effective: string;
			note: string;
	  }
	| {
			type: "resolve";
			id: string;
			action: "fulfil" | "refund";
			note: string;
			capacityConfirmed: boolean;
	  }
	| { type: "retry"; id?: string; note: string }
	| { type: "reconcile"; note: string };
