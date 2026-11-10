import type { Page, RecordItem, Resource } from "./contracts";

// The API has no record-by-ID endpoint. Keep the sequential scan cancellable.
export async function lookupRecord(
	resource: Resource,
	id: string,
	origin: URLSearchParams | undefined,
	signal: AbortSignal,
	fetchPage: (search: URLSearchParams, signal: AbortSignal) => Promise<Page>,
): Promise<RecordItem | null> {
	const read = async (search: URLSearchParams) => {
		signal.throwIfAborted();
		const page = await fetchPage(search, signal);
		signal.throwIfAborted();
		return page;
	};
	if (origin || resource === "fee-rules") {
		const page = await read(origin || new URLSearchParams());
		const found = page.items.find((row) => row.id === id);
		if (found) return found;
		if (resource === "fee-rules") return null;
	}
	for (let number = 1; ; number++) {
		const page = await read(new URLSearchParams({ page: String(number) }));
		const found = page.items.find((row) => row.id === id);
		if (found) return found;
		if (!page.items.length || number * page.pageSize >= page.total) return null;
	}
}
