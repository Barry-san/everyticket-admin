import { expect, test } from "bun:test";
import { lookupRecord } from "../src/features/live/lookup";
import type { Page } from "../src/features/live/contracts";

const page = (number: number, ids: string[], total = 3): Page => ({
	page: number,
	pageSize: 1,
	total,
	items: ids.map((id) => ({ id })),
});
test("checks originating filters first then scans unfiltered pages sequentially", async () => {
	const calls: string[] = [];
	const found = await lookupRecord(
		"orders",
		"wanted",
		new URLSearchParams("q=buyer&page=7"),
		new AbortController().signal,
		async (params) => {
			calls.push(params.toString());
			return params.has("q")
				? page(7, [])
				: page(Number(params.get("page")), [
						params.get("page") === "3" ? "wanted" : "other",
					]);
		},
	);
	expect(found?.id).toBe("wanted");
	expect(calls).toEqual(["q=buyer&page=7", "page=1", "page=2", "page=3"]);
});
test("exhausted pagination returns unavailable", async () => {
	let calls = 0;
	expect(
		await lookupRecord(
			"users",
			"missing",
			undefined,
			new AbortController().signal,
			async () => page(++calls, ["other"], 2),
		),
	).toBeNull();
	expect(calls).toBe(2);
});
test("API failures propagate for retry instead of becoming unavailable", async () => {
	await expect(
		lookupRecord(
			"events",
			"id",
			undefined,
			new AbortController().signal,
			async () => {
				throw new Error("offline");
			},
		),
	).rejects.toThrow("offline");
});
test("cancellation stops scanning and is passed to the request", async () => {
	const controller = new AbortController();
	let calls = 0;
	await expect(
		lookupRecord(
			"events",
			"id",
			undefined,
			controller.signal,
			async (_, signal) => {
				expect(signal).toBe(controller.signal);
				calls++;
				controller.abort();
				return page(1, ["other"]);
			},
		),
	).rejects.toThrow();
	expect(calls).toBe(1);
});
test("already cancelled lookup makes no requests", async () => {
	const controller = new AbortController();
	controller.abort();
	await expect(
		lookupRecord("events", "id", undefined, controller.signal, async () => {
			throw new Error("must not fetch");
		}),
	).rejects.toThrow("aborted");
});
test("fee rule mismatches never scan history", async () => {
	let calls = 0;
	expect(
		await lookupRecord(
			"fee-rules",
			"old",
			undefined,
			new AbortController().signal,
			async () => {
				calls++;
				return page(1, ["active"]);
			},
		),
	).toBeNull();
	expect(calls).toBe(1);
});
