import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useSuspendEvent() {
	return useMutation({
		mutationFn: (eventId: string) =>
			api.post(`/admin/events/${eventId}/suspend`),
		onSuccess: () => toast.success("Event suspended"),
		onError: (e) => toast.error("Action failed", { description: e.message }),
	});
}
