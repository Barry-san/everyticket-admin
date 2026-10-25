import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Row } from "./selectors";

export function useRecords(rows: Row[]) {
	const [params, setParams] = useSearchParams();
	const [status, setStatus] = useState("All");
	const [category, setCategory] = useState("All");
	const query = params.get("q") || "";
	const selected = params.get("record");
	const categories = [...new Set(rows.map((row) => row.category))];
	const filtered = rows.filter(
		(row) =>
			(status === "All" || row.status === status) &&
			(category === "All" || row.category === category) &&
			[row.id, row.title, row.subtitle, row.secondary, row.category, row.status]
				.join(" ")
				.toLowerCase()
				.includes(query.toLowerCase()),
	);
	const record = rows.find((row) => row.id === selected);
	const select = (id: string | null) =>
		setParams((current) => {
			const next = new URLSearchParams(current);
			if (id) next.set("record", id);
			else next.delete("record");
			return next;
		});
	const setQuery = (value: string) =>
		setParams(
			(current) => {
				const next = new URLSearchParams(current);
				if (value) next.set("q", value);
				else next.delete("q");
				return next;
			},
			{ replace: true },
		);

	return {
		categories,
		category,
		filtered,
		query,
		record,
		select,
		selected,
		setCategory,
		setQuery,
		setStatus,
		status,
	};
}
