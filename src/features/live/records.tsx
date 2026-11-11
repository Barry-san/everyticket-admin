import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { downloadCsv, Modal } from "@/features/admin/components";
import { ActionForm } from "./action-form";
import { addFeeRuleAction } from "./actions";
import { errorMessage, useRecords } from "./api";
import { type Resource, resources } from "./contracts";
import { recordCsvRow } from "./record-presentation";
import {
	RecordFilters,
	RecordPagination,
	RecordsTable,
} from "./records-components";
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
								items.map(recordCsvRow),
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
				<RecordFilters resource={resource} search={search} update={update} />
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
						<RecordsTable
							items={items}
							resource={resource}
							detailUrl={detailUrl}
						/>
						{!items.length && <p className="empty-state">No records found.</p>}
						<RecordPagination
							data={query.data}
							onPage={(page) => update("page", String(page))}
						/>
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
