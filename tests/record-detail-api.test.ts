import { expect, mock, test } from "bun:test";
const get = mock(
	async (_path: string, _options: unknown): Promise<{ data: unknown }> => ({
		data: { id: "exact" },
	}),
);
mock.module("../src/lib/api", () => ({ api: { get } }));
const { fetchRecord } = await import("../src/features/live/api");
const { resources } = await import("../src/features/live/contracts");

for (const resource of Object.keys(resources) as (keyof typeof resources)[]) {
	test(`${resource}: fetches one object by ID and passes cancellation`, async () => {
		get.mockClear();
		const signal = new AbortController().signal;
		expect(await fetchRecord(resource, "exact", signal)).toEqual({
			id: "exact",
		});
		expect(get).toHaveBeenCalledTimes(1);
		expect(get).toHaveBeenCalledWith(
			`/admin/${resources[resource].endpoint}/exact`,
			{ signal },
		);
	});
}
test("missing records return unavailable, other errors propagate", async () => {
	get.mockRejectedValueOnce({ response: { status: 404 } });
	expect(await fetchRecord("events", "missing")).toBeNull();
	get.mockRejectedValueOnce(new Error("offline"));
	await expect(fetchRecord("events", "exact")).rejects.toThrow("offline");
});
test("already cancelled requests never fetch", async () => {
	get.mockClear();
	const controller = new AbortController();
	controller.abort();
	await expect(
		fetchRecord("orders", "exact", controller.signal),
	).rejects.toThrow();
	expect(get).not.toHaveBeenCalled();
});
