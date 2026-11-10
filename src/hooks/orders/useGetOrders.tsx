import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetOrders() {
	return useQuery({
		queryKey: ["get-orders"],
		queryFn: () => api.get("/admin/orders"),
	});
}
