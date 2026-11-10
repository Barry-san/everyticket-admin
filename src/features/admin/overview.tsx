import {
	ArrowDownLeft,
	ArrowRight,
	ArrowUpRight,
	CalendarDays,
	CheckCheck,
	ChevronRight,
	CircleDollarSign,
	CreditCard,
	Sparkles,
	Ticket,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { total } from "./calculations";
import { Badge, DataTable, Metric, PageHeader, Panel } from "./components";
import { date, money } from "./format";
import { DEMO_DATE } from "./seed";
import { useAdmin } from "./store";

export default function Overview() {
	const { data } = useAdmin();
	const [period, setPeriod] = useState("7");
	const anchor = new Date(DEMO_DATE).getTime();
	const verified = data.orders.filter((order) => {
		const age = anchor - new Date(order.created).getTime();
		return age >= 0 && age < Number(period) * 86400000 && order.received > 0;
	});
	const gross = verified.reduce((sum, order) => sum + order.received, 0);
	const fees = verified
		.filter(
			(order) =>
				order.received === total(order) &&
				["Paid", "Refund processing"].includes(order.status),
		)
		.reduce((sum, order) => {
			const refundedFee = data.refunds
				.filter(
					(refund) =>
						refund.orderId === order.id && refund.status !== "Rejected",
				)
				.reduce((amount, refund) => amount + refund.feeAmount, 0);
			return sum + Math.max(0, order.fee - refundedFee);
		}, 0);
	const refunds = data.refunds.filter((refund) =>
		["Pending", "Processing"].includes(refund.status),
	);
	const payouts = data.payouts.filter((payout) => payout.status !== "Paid");
	const exceptions = data.exceptions.filter(
		(exception) => exception.status === "Open",
	);
	const pendingRefunds = data.refunds.filter(
		(refund) => refund.status === "Pending",
	);
	const failedJobs = data.jobs.filter((job) => job.status === "Failed");
	const attention =
		exceptions.length + pendingRefunds.length + failedJobs.length;
	const daily = Array.from({ length: 7 }, (_, index) => {
		const bucketMs = (Number(period) * 86400000) / 7;
		const from = anchor - (7 - index) * bucketMs;
		const to = from + bucketMs;
		return {
			label: new Intl.DateTimeFormat("en-GB", {
				day: "numeric",
				month: "short",
				timeZone: "Africa/Lagos",
			}).format(to),
			value: verified
				.filter(
					(order) =>
						new Date(order.created).getTime() > from &&
						new Date(order.created).getTime() <= to,
				)
				.reduce((sum, order) => sum + order.received, 0),
		};
	});
	const max = Math.max(1000000, ...daily.map((point) => point.value));
	const points = daily.map(
		(point, index) => `${index * 100},${180 - (point.value / max) * 145}`,
	);
	const path = `M${points.join(" L")}`;
	return (
		<>
			<PageHeader
				eyebrow="Your platform, at a glance"
				title="Everything in view."
				description="A little clarity for every moving part. Here’s your platform pulse."
				action={
					<div className="period-control">
						<CalendarDays size={16} />
						<select
							aria-label="Dashboard date range"
							value={period}
							onChange={(event) => setPeriod(event.target.value)}
						>
							<option value="7">Last 7 days</option>
							<option value="30">Last 30 days</option>
						</select>
					</div>
				}
			/>
			<div className="overview-welcome">
				<div>
					<span className="welcome-spark">
						<Sparkles size={18} />
					</span>
					<p>
						<strong>Good things are happening.</strong>
						<span>
							{" "}
							{
								data.events.filter((event) => event.status === "Published")
									.length
							}{" "}
							live events bringing people together.
						</span>
					</p>
				</div>
				<Link to="/events">
					Explore events <ArrowUpRight size={16} />
				</Link>
			</div>
			<div className="metrics-grid">
				<Metric
					label="Gross payments"
					value={money(gross, true)}
					detail={`${verified.length} orders with received funds`}
					icon={<CreditCard size={18} />}
				/>
				<Metric
					label="Platform revenue"
					value={money(fees, true)}
					detail="Platform fees, separate from payouts"
					icon={<CircleDollarSign size={18} />}
					accent="green"
				/>
				<Metric
					label="Refund liability"
					value={money(
						refunds.reduce(
							(sum, refund) => sum + refund.ticketAmount + refund.feeAmount,
							0,
						),
						true,
					)}
					detail={`${refunds.length} pending or processing · all dates`}
					icon={<ArrowDownLeft size={18} />}
					accent="orange"
				/>
				<Metric
					label="Payout liability"
					value={money(
						payouts.reduce((sum, payout) => sum + payout.amount, 0),
						true,
					)}
					detail={`${payouts.length} outstanding transfers · all dates`}
					icon={<Wallet size={18} />}
					accent="blue"
				/>
			</div>
			<div className="overview-main-grid">
				<Panel
					title="Payment activity"
					eyebrow="The bigger picture"
					action={
						<span className="chart-legend">
							<i /> Verified payments
						</span>
					}
					className="chart-panel"
				>
					<div className="chart-summary">
						<strong>{money(gross)}</strong>
						<span>received in this period</span>
					</div>
					<div className="line-chart">
						<div className="chart-y-labels">
							{[1, 0.75, 0.5, 0.25, 0].map((fraction) => (
								<span key={fraction}>{money(max * fraction, true)}</span>
							))}
						</div>
						<div className="chart-canvas">
							<svg
								viewBox="0 0 600 200"
								role="img"
								aria-label={`Verified payment volume over the last ${period} days. Total ${money(gross)}.`}
								preserveAspectRatio="none"
							>
								<title>Verified payments</title>
								<defs>
									<linearGradient id="payment-fill" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#8456bb" stopOpacity=".2" />
										<stop offset="100%" stopColor="#8456bb" stopOpacity="0" />
									</linearGradient>
								</defs>
								{[35, 71, 107, 143, 180].map((y) => (
									<line
										key={y}
										x1="0"
										x2="600"
										y1={y}
										y2={y}
										stroke="#ede9f0"
										strokeDasharray="4 5"
									/>
								))}
								<path
									d={`${path} L600,180 L0,180 Z`}
									fill="url(#payment-fill)"
								/>
								<path
									d={path}
									fill="none"
									stroke="#8456bb"
									strokeWidth="3"
									strokeLinejoin="round"
									vectorEffect="non-scaling-stroke"
								/>
								{daily.map((point, index) => (
									<circle
										key={point.label}
										cx={index * 100}
										cy={180 - (point.value / max) * 145}
										r="4"
										fill="#fff"
										stroke="#8456bb"
										strokeWidth="2"
									>
										<title>
											{point.label}: {money(point.value)}
										</title>
									</circle>
								))}
							</svg>
							<div className="chart-x-labels">
								{daily.map((point) => (
									<span key={point.label}>{point.label}</span>
								))}
							</div>
						</div>
					</div>
					<div className="chart-foot">
						<span>
							<span className="live-dot" />
							Verified demo payments only
						</span>
						<span>October 2026 · WAT</span>
					</div>
				</Panel>
				<Panel
					title="Needs attention"
					action={<span className="count-pill">{attention}</span>}
					className="attention-panel"
				>
					<p className="panel-description">
						A few things could use a closer look.
					</p>
					<Link to="/reconciliation" className="attention-item">
						<span className="attention-icon icon-orange">
							<CreditCard size={19} />
						</span>
						<div>
							<strong>{exceptions.length} payment exceptions</strong>
							<p>Verified payments needing resolution</p>
							<span>
								Review payments <ArrowRight size={13} />
							</span>
						</div>
						<ChevronRight size={16} />
					</Link>
					<Link to="/refunds" className="attention-item">
						<span className="attention-icon icon-purple">
							<ArrowDownLeft size={19} />
						</span>
						<div>
							<strong>{pendingRefunds.length} refunds to review</strong>
							<p>Check details before approving</p>
							<span>
								Review requests <ArrowRight size={13} />
							</span>
						</div>
						<ChevronRight size={16} />
					</Link>
					<Link to="/jobs" className="attention-item">
						<span className="attention-icon icon-red">
							<CheckCheck size={19} />
						</span>
						<div>
							<strong>
								{failedJobs.length} failed{" "}
								{failedJobs.length === 1 ? "job" : "jobs"}
							</strong>
							<p>Retry delivery without duplicate tickets</p>
							<span>
								View job health <ArrowRight size={13} />
							</span>
						</div>
						<ChevronRight size={16} />
					</Link>
					<div className="attention-note">
						<span className="live-dot" />
						Review queues update as you work.
					</div>
				</Panel>
			</div>
			<div className="overview-bottom-grid">
				<Panel
					title="Recent orders"
					eyebrow="Across the platform"
					action={
						<Link className="text-link" to="/orders">
							View all <ArrowRight size={14} />
						</Link>
					}
				>
					<DataTable
						label="Recent orders"
						rows={data.orders.slice(0, 4)}
						pageSize={4}
						columns={[
							{
								label: "Order / event",
								cell: (order) => (
									<Link
										className="record-name"
										to={`/orders?record=${order.id}`}
									>
										<strong>{order.id}</strong>
										<span>
											{
												data.events.find((event) => event.id === order.eventId)
													?.name
											}
										</span>
									</Link>
								),
							},
							{
								label: "Amount",
								cell: (order) => (
									<strong className="numeric">{money(total(order))}</strong>
								),
							},
							{
								label: "Status",
								cell: (order) => <Badge status={order.status} />,
							},
						]}
					/>
				</Panel>
				<Panel
					title="Latest activity"
					action={
						<Link className="text-link" to="/audit">
							Audit log <ArrowUpRight size={14} />
						</Link>
					}
				>
					<div className="activity-list">
						{data.audit.slice(0, 3).map((entry, index) => (
							<div className="activity-item" key={entry.id}>
								<span className={`activity-dot dot-${index}`} />
								<div>
									<strong>{entry.action}</strong>
									<p>
										{entry.actor} · {entry.target}
									</p>
									<time dateTime={entry.created}>
										{date(entry.created, true)}
									</time>
								</div>
							</div>
						))}
					</div>
					<div className="activity-foot">
						<Ticket size={16} />
						<span>Every action, accounted for.</span>
					</div>
				</Panel>
			</div>
		</>
	);
}
