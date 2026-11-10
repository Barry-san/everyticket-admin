import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useGetUser() {
	return useQuery({
		queryKey: ["get-users"],
		queryFn: () => api.get("/admin/users"),
	});
}
