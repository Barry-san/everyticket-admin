import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useRestoreUser() {
	return useMutation({
		mutationFn: (profileId: string) =>
			api.post(`/admin/users/${profileId}/unblock`),
		onSuccess: () => toast.success("User unblocked"),
		onError: (e) => toast.error("Action failed", { description: e.message }),
	});
}
