import { useQuery } from "@tanstack/react-query";
import {
	ArrowUpRight,
	CreditCard,
	ReceiptText,
	RotateCcw,
	TicketCheck,
	Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { money } from "@/features/admin/format";
import { api } from "@/lib/api";
import { errorMessage } from "./api";
import "./overview.css";

const metrics = [
	{
		key: "paidOrderCount",
		label: "Paid orders",
		detail: "Bookings with confirmed payment",
		icon: TicketCheck,
		tone: "purple",
		to: "/orders?status=PAID",
	},
	{
		key: "totalPaidKobo",
		label: "Total paid",
		detail: "Total value of paid orders",
		icon: CreditCard,
		tone: "green",
		to: "/orders?status=PAID",
	},
	{
		key: "platformFeeRevenueKobo",
		label: "Platform fee revenue",
		detail: "Platform fees on paid orders",
		icon: ReceiptText,
		tone: "blue",
		to: "/fee-rules",
	},
	{
		key: "refundLiabilityKobo",
		label: "Refund liability",
		detail: "Requested, approved and processing refunds",
		icon: RotateCcw,
		tone: "orange",
		to: "/refunds",
	},
	{
		key: "payoutLiabilityKobo",
		label: "Payout liability",
		detail: "Requested and approved organizer payouts",
		icon: Wallet,
		tone: "purple",
		to: "/payouts",
	},
] as const;
export default function Overview() {
	const query = useQuery({
		queryKey: ["admin", "summary"],
		queryFn: async () =>
			(await api.get<Record<string, number>>("/admin/summary")).data,
	});
	return (
		<section className="live-overview" aria-labelledby="overview-title">
			<div className="page-heading overview-heading">
				<div>
					<p className="eyebrow">Platform overview</p>
					<h1 id="overview-title">Your platform, at a glance.</h1>
					<p className="page-description">
						Payments, platform revenue and outstanding commitments.
					</p>
				</div>
			</div>
			{query.isPending ? (
				<div className="overview-state" role="status">
					Loading your platform summary…
				</div>
			) : query.isError ? (
				<div className="overview-state" role="alert">
					{errorMessage(query.error)}{" "}
					<button
						className="button"
						type="button"
						disabled={query.isFetching}
						onClick={() => query.refetch()}
					>
						Try again
					</button>
				</div>
			) : (
				<div className="overview-metrics">
					{metrics.map(({ key, label, detail, icon: Icon, tone, to }) => {
						const value = query.data?.[key];
						return (
							<Link className="overview-metric" key={key} to={to}>
								<div className="overview-metric-heading">
									<span className={`overview-metric-icon icon-${tone}`}>
										<Icon
											size={18}
											strokeWidth={2}
											absoluteStrokeWidth
											aria-hidden="true"
										/>
									</span>
									<span>{label}</span>
									<ArrowUpRight
										className="overview-metric-arrow"
										size={16}
										aria-hidden="true"
									/>
								</div>
								<strong className="overview-metric-value">
									{value === undefined
										? "—"
										: key.endsWith("Kobo")
											? money(value)
											: value.toLocaleString("en-NG")}
								</strong>
								<p className="overview-metric-description">{detail}</p>
							</Link>
						);
					})}
				</div>
			)}
		</section>
	);
}
