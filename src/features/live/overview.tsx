import { useQuery } from "@tanstack/react-query";
import { money } from "@/features/admin/format";
import { api } from "@/lib/api";
import { errorMessage } from "./api";
export default function Overview() {
	const query = useQuery({
		queryKey: ["admin", "summary"],
		queryFn: async () =>
			(await api.get<Record<string, number>>("/admin/summary")).data,
	});
	const labels: Record<string, string> = {
		paidOrderCount: "Paid orders",
		totalPaidKobo: "Total paid",
		platformFeeRevenueKobo: "Platform fee revenue",
		refundLiabilityKobo: "Refund liability",
		payoutLiabilityKobo: "Payout liability",
	};
	return (
		<>
			<div className="page-heading">
				<div>
					<p className="eyebrow">Platform overview</p>
					<h1>Your platform, at a glance.</h1>
				</div>
			</div>
			{query.isPending ? (
				<p role="status">Loading overview…</p>
			) : query.isError ? (
				<p role="alert">
					{errorMessage(query.error)}{" "}
					<button type="button" onClick={() => query.refetch()}>
						Try again
					</button>
				</p>
			) : (
				<div className="metrics-grid">
					{Object.entries(query.data || {}).map(([key, value]) => (
						<section className="panel" key={key}>
							<p>{labels[key] || key}</p>
							<h2>{key.endsWith("Kobo") ? money(value) : value}</h2>
						</section>
					))}
				</div>
			)}
		</>
	);
}
