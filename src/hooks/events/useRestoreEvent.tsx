import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useRestoreEvent() {
	return useMutation({
		mutationFn: (eventId: string) =>
			api.post(`/admin/events/${eventId}/restore`),
		onSuccess: () => toast.success("Event restored"),
		onError: (e) => toast.error("Action failed", { description: e.message }),
	});
}
