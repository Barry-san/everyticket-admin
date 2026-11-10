import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Badge, downloadCsv, Modal } from "@/features/admin/components";
import { ActionForm } from "./action-form";
import { addFeeRuleAction } from "./actions";
import { date, money } from "@/features/admin/format";
import { errorMessage, useRecords } from "./api";
import { type Resource, resources } from "./contracts";
import { statusLabel } from "./status";
export default function LiveRecords({ resource }: { resource: Resource }) {
	const [addingRule, setAddingRule] = useState(false);
	const [createdRuleId, setCreatedRuleId] = useState<string | null>(null);
	const [search, setSearch] = useSearchParams();
	const query = useRecords(resource, search);
	const config = resources[resource];
	const items = query.data?.items || [];
	const legacyId = search.get("record");
	const origin = new URLSearchParams(search);
	origin.delete("record");
	const detailUrl = (id: string) =>
		`/${resource}/${encodeURIComponent(id)}?${new URLSearchParams({ from: origin.toString() })}`;
	const update = (key: string, value: string) =>
		setSearch((previous) => {
			const next = new URLSearchParams(previous);
			value ? next.set(key, value) : next.delete(key);
			if (key !== "page" && key !== "record") next.delete("page");
			return next;
		});
	if (legacyId) return <Navigate replace to={detailUrl(legacyId)} />;
	return (
		<>
			<div className="page-heading">
				<div>
					<p className="eyebrow">Platform administration</p>
					<h1>{config.title}</h1>
				</div>
				<div className="detail-actions">
					{resource === "fee-rules" && (
						<button
							type="button"
							className="button button-primary"
							onClick={() => setAddingRule(true)}
						>
							Add fee rule
						</button>
					)}
					<button
						type="button"
						className="button"
						disabled={!items.length || query.isError}
						onClick={() =>
							downloadCsv(
								`${resource}-current-page.csv`,
								["ID", "Record", "Status", "Amount (kobo)"],
								items.map((row) => [
									row.id,
									row.title ||
										row.user?.name ||
										row.reference ||
										row.action ||
										"",
									row.status || row.role || "",
									String(
										row.totalKobo ??
											row.totalRefundKobo ??
											row.requestedAmountKobo ??
											"",
									),
								]),
							)
						}
					>
						Export current page
					</button>
				</div>
			</div>
			{resource === "fee-rules" && createdRuleId && (
				<p role="status">
					Fee rule added.{" "}
					<Link className="text-link" to={detailUrl(createdRuleId)}>
						View added fee rule
					</Link>
				</p>
			)}
			<section className="panel records-panel">
				<div className="table-toolbar">
					{(resource === "users" || resource === "orders") && (
						<input
							aria-label="Search records"
							placeholder="Search records…"
							value={search.get("q") || ""}
							onChange={(event) => update("q", event.target.value)}
						/>
					)}
					{config.statuses.length > 0 && (
						<select
							aria-label="Status"
							value={search.get("status") || ""}
							onChange={(event) => update("status", event.target.value)}
						>
							<option value="">All statuses</option>
							{config.statuses.map((status) => (
								<option key={status}>{status}</option>
							))}
						</select>
					)}
				</div>
				{query.isPending ? (
					<div className="records-state" role="status">
						<Spinner aria-hidden="true" />
						<span>Loading records…</span>
					</div>
				) : query.isError ? (
					<div className="records-state records-state-error" role="alert">
						<p>{errorMessage(query.error)}</p>
						<button
							type="button"
							className="button"
							onClick={() => query.refetch()}
						>
							Try again
						</button>
					</div>
				) : (
					<>
						<table>
							<thead>
								<tr>
									<th>Record</th>
									<th>Status</th>
									<th>Amount / detail</th>
									<th>Date (WAT)</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{items.map((row) => (
									<tr key={row.id}>
										<td>
											<strong>
												{row.title ||
													row.user?.name ||
													row.reference ||
													row.action ||
													(row.version ? `Version ${row.version}` : row.id)}
											</strong>
											<p>
												{row.user?.email ||
													row.buyerEmail ||
													row.event?.title ||
													row.targetId ||
													row.organizer?.user.name}
											</p>
										</td>
										<td>
											<Badge
												status={statusLabel(
													row.status ||
														row.role ||
														(resource === "fee-rules" ? "Active" : "Recorded"),
												)}
											/>
										</td>
										<td>
											{row.totalKobo !== undefined
												? money(row.totalKobo)
												: row.totalRefundKobo !== undefined
													? money(row.totalRefundKobo)
													: row.requestedAmountKobo !== undefined
														? money(row.requestedAmountKobo)
														: row.mode === "FIXED"
															? money(row.fixedAmountKobo || 0)
															: row.mode === "PERCENTAGE"
																? `${(row.percentageBasisPoints || 0) / 100}%`
																: row.organizer?.user.name || "—"}
										</td>
										<td>
											{row.createdAt ||
											row.requestedAt ||
											row.startAt ||
											row.activeFrom
												? date(
														(row.createdAt ||
															row.requestedAt ||
															row.startAt ||
															row.activeFrom) as string,
														true,
													)
												: "—"}
										</td>
										<td>
											<Link className="text-link" to={detailUrl(row.id)}>
												View details
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{!items.length && <p className="empty-state">No records found.</p>}
						<div className="table-toolbar">
							<span>{query.data?.total || 0} records</span>
							<button
								type="button"
								className="button"
								disabled={(query.data?.page || 1) <= 1}
								onClick={() =>
									update("page", String((query.data?.page || 1) - 1))
								}
							>
								Previous
							</button>
							<button
								type="button"
								className="button"
								disabled={
									!query.data ||
									query.data.page * query.data.pageSize >= query.data.total
								}
								onClick={() =>
									update("page", String((query.data?.page || 1) + 1))
								}
							>
								Next
							</button>
						</div>
					</>
				)}
			</section>
			{resource === "fee-rules" && addingRule && (
				<Modal open title="Add fee rule" onClose={() => setAddingRule(false)}>
					<p>
						Applies to future orders from the effective time. Existing orders
						keep their original fee.
					</p>
					<ActionForm
						action={addFeeRuleAction}
						close={() => setAddingRule(false)}
						onSuccess={(data) => {
							if (
								data &&
								typeof data === "object" &&
								"id" in data &&
								typeof data.id === "string"
							)
								setCreatedRuleId(data.id);
						}}
					/>
				</Modal>
			)}
		</>
	);
}
