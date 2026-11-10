import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function useGetPayouts(page: number = 1) {
	return useQuery({
		queryKey: [`get-payouts-${page}`],
		queryFn: () => api.get(`/admin/payout-requests?page=${page}`),
	});
}
