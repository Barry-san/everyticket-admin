import type { Order } from "./types";

export const total = (order: Order) => order.subtotal + order.fee;
