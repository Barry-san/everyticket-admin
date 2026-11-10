import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function useGetEvents(page: number = 1) {
	return useQuery({
		queryKey: [`get-event-${page}`],
		queryFn: () => api.get(`/admin/events?page=${page}`),
	});
}
