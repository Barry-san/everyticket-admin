import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function useGetRefundss(page: number = 1) {
	return useQuery({
		queryKey: [`get-refunds-${page}`],
		queryFn: () => api.get(`/admin/refund-requests?page=${page}`),
	});
}
