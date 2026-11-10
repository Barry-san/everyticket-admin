import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useBlockUser() {
	return useMutation({
		mutationFn: (profileId: string) =>
			api.post(`/admin/users/${profileId}/suspend`),
		onSuccess: () => toast.success("User blocked"),
		onError: (e) => toast.error("Action failed", { description: e.message }),
	});
}
