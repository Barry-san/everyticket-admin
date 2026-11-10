import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetFeeRules() {
	return useQuery({
		queryFn: () => api.get("/admin/platform-fee-rule"),
		queryKey: ["get-rules"],
	});
}
