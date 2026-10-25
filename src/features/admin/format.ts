export const money = (kobo: number, compact = false) =>
	new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: compact ? 0 : kobo % 100 === 0 ? 0 : 2,
		maximumFractionDigits: compact ? 1 : 2,
		notation: compact ? "compact" : "standard",
	}).format(kobo / 100);
export const date = (value: string, time = false) =>
	new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "Africa/Lagos",
		...(time ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
	}).format(new Date(value));
export const initials = (name: string) =>
	name
		.split(" ")
		.slice(0, 2)
		.map((word) => word[0])
		.join("");
