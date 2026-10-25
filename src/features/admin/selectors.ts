import { total } from "./calculations";
import { money } from "./format";
import type { AdminState, Section } from "./types";

export type Row = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  category: string;
  created: string;
  amount?: number;
  secondary?: string;
  color?: string;
  featured?: boolean;
};

export function getRows(data: AdminState, section: Section): Row[] {
  const eventName = (id: string) =>
    data.events.find((event) => event.id === id)?.name || id;
  const userName = (id: string) =>
    data.users.find((user) => user.id === id)?.name || id;
  switch (section) {
    case "events":
      return data.events.map((event) => ({
        id: event.id,
        title: event.name,
        subtitle: event.location,
        status: event.status,
        category: event.category,
        created: event.date,
        amount: event.sales,
        secondary: event.organizer,
        color: event.color,
        featured: event.featured,
      }));
    case "users":
      return data.users.map((user) => ({
        id: user.id,
        title: user.name,
        subtitle: user.email,
        status: user.status,
        category: user.role,
        created: user.joined,
      }));
    case "orders":
      return data.orders.map((order) => ({
        id: order.id,
        title: order.id,
        subtitle: eventName(order.eventId),
        status: order.status,
        category: eventName(order.eventId),
        created: order.created,
        amount: total(order),
        secondary: userName(order.userId),
      }));
    case "refunds":
      return data.refunds.map((refund) => {
        const order = data.orders.find((order) => order.id === refund.orderId);
        return {
          id: refund.id,
          title: refund.id,
          subtitle: refund.orderId,
          status: refund.status,
          category: order ? eventName(order.eventId) : "Unknown",
          created: refund.created,
          amount: refund.ticketAmount + refund.feeAmount,
          secondary: order ? userName(order.userId) : "Unknown",
        };
      });
    case "payouts":
      return data.payouts.map((payout) => ({
        id: payout.id,
        title: payout.id,
        subtitle: eventName(payout.eventId),
        status: payout.status,
        category:
          data.events.find((event) => event.id === payout.eventId)?.organizer ||
          "Unknown",
        created: payout.created,
        amount: payout.amount,
        secondary: data.events.find((event) => event.id === payout.eventId)
          ?.organizer,
      }));
    case "fee-rules":
      return data.fees.map((fee) => ({
        id: fee.id,
        title: `Version ${fee.id.slice(1)}`,
        subtitle:
          fee.type === "percentage"
            ? `${fee.value}% per order`
            : `${money(fee.value)} per order`,
        status: fee.status,
        category: fee.type === "percentage" ? "Percentage" : "Fixed",
        created: fee.effective,
        secondary: fee.reason,
      }));
    case "reconciliation":
      return data.exceptions.map((exception) => {
        const order = data.orders.find(
          (order) => order.id === exception.orderId,
        );
        return {
          id: exception.id,
          title: exception.orderId,
          subtitle: order ? eventName(order.eventId) : "Unknown",
          status: exception.status,
          category: exception.type,
          created: exception.created,
          amount: order?.received,
          secondary: exception.type,
        };
      });
    case "jobs":
      return data.jobs.map((job) => ({
        id: job.id,
        title: job.name,
        subtitle: job.id,
        status: job.status,
        category: job.type,
        created: job.created,
        secondary: `${job.attempts} ${job.attempts === 1 ? "attempt" : "attempts"}`,
      }));
    case "audit":
      return data.audit.map((entry) => ({
        id: entry.id,
        title: entry.action,
        subtitle: entry.target,
        status: "Recorded",
        category: entry.actor,
        created: entry.created,
        secondary: entry.detail,
      }));
  }
}
