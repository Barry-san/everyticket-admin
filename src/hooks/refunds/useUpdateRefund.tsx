import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

type RefundActions = "REJECT" | "APPROVE" | "EXECUTE" | "RECONCILE" | "MARK";

const refundActionVerbs: Record<RefundActions, string> = {
	REJECT: "reject",
	APPROVE: "approve",
	EXECUTE: "execute",
	RECONCILE: "reconcile",
	MARK: "mark-approved",
};

export function useUpdateRefund() {
	return useMutation({
		mutationFn: ({
			action,
			refundID,
		}: {
			action: RefundActions;
			refundID: string;
		}) => api.post(`/admin/refunds/${refundID}/${refundActionVerbs[action]}`),
	});
}
