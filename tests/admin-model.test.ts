import { describe, expect, test } from "bun:test";
import { applyCommand } from "../src/features/admin/commands";
import { money } from "../src/features/admin/format";
import { createSeed } from "../src/features/admin/seed";

const now = "2026-10-24T10:00:00Z";
const note = "Verified the supporting evidence.";

describe("administrator demo workflows", () => {
  test("refund approval is processing, not completion, and preserves its components", () => {
    const seed = createSeed();
    const next = applyCommand(
      seed,
      { type: "refund", id: "RF-2081", action: "approve", note },
      now,
    );
    expect(next.refunds[0].status).toBe("Processing");
    expect(next.refunds[0].feeAmount).toBe(0);
    expect(next.orders.find((order) => order.id === "ET-10465")?.status).toBe(
      "Refund processing",
    );
    expect(next.audit[0].target).toBe("RF-2081");
    expect(seed.refunds[0].status).toBe("Pending");
    expect(() =>
      applyCommand(
        next,
        { type: "refund", id: "RF-2081", action: "approve", note },
        now,
      ),
    ).toThrow("already been reviewed");
  });

  test("a payout requires a unique external reference and cannot be recorded twice", () => {
    const seed = createSeed();
    expect(() =>
      applyCommand(
        seed,
        { type: "payout", id: "PO-4008", reference: "", note },
        now,
      ),
    ).toThrow("transfer reference");
    const next = applyCommand(
      seed,
      { type: "payout", id: "PO-4008", reference: "GTB-90015", note },
      now,
    );
    expect(next.payouts[0].status).toBe("Paid");
    expect(next.payouts[0].amount).toBe(seed.payouts[0].amount);
    expect(() =>
      applyCommand(
        next,
        { type: "payout", id: "PO-4007", reference: "GTB-90015", note },
        now,
      ),
    ).toThrow("already been used");
    expect(() =>
      applyCommand(
        next,
        { type: "payout", id: "PO-4008", reference: "GTB-90016", note },
        now,
      ),
    ).toThrow("already been recorded");
  });

  test("blocking an organizer pauses published events and unblocking does not restore them", () => {
    const seed = createSeed();
    const blocked = applyCommand(
      seed,
      { type: "user", id: "US-1001", note },
      now,
    );
    expect(blocked.events.find((event) => event.id === "EV-1001")?.status).toBe(
      "Suspended",
    );
    expect(
      blocked.events.find((event) => event.id === "EV-1001")?.featured,
    ).toBe(false);
    expect(blocked.orders).toEqual(seed.orders);
    expect(() =>
      applyCommand(
        blocked,
        { type: "event", id: "EV-1001", action: "restore", note },
        now,
      ),
    ).toThrow("Unblock");
    const unblocked = applyCommand(
      blocked,
      { type: "user", id: "US-1001", note },
      now,
    );
    expect(
      unblocked.events.find((event) => event.id === "EV-1001")?.status,
    ).toBe("Suspended");
    expect(() =>
      applyCommand(seed, { type: "user", id: "US-1007", note }, now),
    ).toThrow("own administrator");
  });

  test("manual fulfilment requires capacity confirmation and is applied only once", () => {
    const seed = createSeed();
    expect(() =>
      applyCommand(
        seed,
        {
          type: "resolve",
          id: "RC-901",
          action: "fulfil",
          capacityConfirmed: false,
          note,
        },
        now,
      ),
    ).toThrow("capacity");
    const next = applyCommand(
      seed,
      {
        type: "resolve",
        id: "RC-901",
        action: "fulfil",
        capacityConfirmed: true,
        note,
      },
      now,
    );
    expect(next.orders.find((order) => order.id === "ET-10472")?.status).toBe(
      "Paid",
    );
    expect(next.events[0].sold).toBe(seed.events[0].sold + 1);
    expect(next.events[0].sales).toBe(seed.events[0].sales + 2500000);
    expect(() =>
      applyCommand(
        next,
        {
          type: "resolve",
          id: "RC-901",
          action: "fulfil",
          capacityConfirmed: true,
          note,
        },
        now,
      ),
    ).toThrow("already resolved");
  });

  test("mismatched or oversold payments cannot be fulfilled", () => {
    const seed = createSeed();
    expect(() =>
      applyCommand(
        seed,
        {
          type: "resolve",
          id: "RC-902",
          action: "fulfil",
          capacityConfirmed: true,
          note,
        },
        now,
      ),
    ).toThrow("exactly match");
    seed.events[0].sold = seed.events[0].capacity;
    expect(() =>
      applyCommand(
        seed,
        {
          type: "resolve",
          id: "RC-901",
          action: "fulfil",
          capacityConfirmed: true,
          note,
        },
        now,
      ),
    ).toThrow("capacity");
  });

  test("exception refunds use only received money and rejection reopens resolution", () => {
    const next = applyCommand(
      createSeed(),
      {
        type: "resolve",
        id: "RC-902",
        action: "refund",
        capacityConfirmed: false,
        note,
      },
      now,
    );
    const refund = next.refunds[0];
    expect(refund.ticketAmount + refund.feeAmount).toBe(1050000);
    expect(next.exceptions[1].status).toBe("Resolved");
    const rejected = applyCommand(
      next,
      { type: "refund", id: refund.id, action: "reject", note },
      now,
    );
    expect(rejected.exceptions[1].status).toBe("Open");
    expect(
      rejected.orders.find((order) => order.id === "ET-10431")?.status,
    ).toBe("Needs resolution");
  });

  test("scheduling a fee preserves active rules and historical order snapshots", () => {
    const seed = createSeed();
    const next = applyCommand(
      seed,
      {
        type: "fee",
        feeType: "fixed",
        value: 50000,
        effective: "2026-11-01T00:00:00+01:00",
        note,
      },
      now,
    );
    expect(next.fees[0].status).toBe("Scheduled");
    expect(next.fees[0].value).toBe(50000);
    expect(next.fees[1]).toEqual(seed.fees[0]);
    expect(next.orders).toEqual(seed.orders);
    expect(() =>
      applyCommand(
        seed,
        {
          type: "fee",
          feeType: "percentage",
          value: 101,
          effective: "2026-11-01T00:00:00+01:00",
          note,
        },
        now,
      ),
    ).toThrow("between 0 and 100");
    expect(() =>
      applyCommand(
        seed,
        {
          type: "fee",
          feeType: "fixed",
          value: 0.5,
          effective: "2026-11-01T00:00:00+01:00",
          note,
        },
        now,
      ),
    ).toThrow("integer kobo");
    expect(() =>
      applyCommand(
        seed,
        {
          type: "fee",
          feeType: "percentage",
          value: 3,
          effective: "2026-01-01T00:00:00Z",
          note,
        },
        now,
      ),
    ).toThrow("future");
  });

  test("retries queue original jobs without changing orders", () => {
    const seed = createSeed();
    const next = applyCommand(seed, { type: "retry", note }, now);
    expect(next.jobs.find((job) => job.id === "JOB-9804")?.status).toBe(
      "Queued",
    );
    expect(next.jobs.length).toBe(seed.jobs.length);
    expect(next.orders).toEqual(seed.orders);
    expect(() => applyCommand(next, { type: "retry", note }, now)).toThrow(
      "no failed jobs",
    );
  });

  test("provisioning rejects duplicate emails and all mutations require context", () => {
    const seed = createSeed();
    expect(() =>
      applyCommand(
        seed,
        {
          type: "provision",
          name: "Ada Obi",
          email: "ADA@everyticket.ng",
          note,
        },
        now,
      ),
    ).toThrow("already exists");
    expect(() =>
      applyCommand(seed, { type: "reconcile", note: "" }, now),
    ).toThrow("reason");
    const next = applyCommand(
      seed,
      {
        type: "provision",
        name: "Amaka Eze",
        email: "amaka@everyticket.ng",
        note,
      },
      now,
    );
    expect(next.users.at(-1)?.role).toBe("Administrator");
    expect(next.audit[0].action).toBe("Provisioned administrator");
  });
});

test("currency display preserves kobo for exact amounts", () => {
  expect(money(50015)).toBe("₦500.15");
  expect(money(50000)).toBe("₦500");
});
