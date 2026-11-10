import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
	type Page,
	type RecordItem,
	type Resource,
	resources,
} from "./contracts";
export function useRecords(resource: Resource, search: URLSearchParams) {
	const params = {
		page: Number(search.get("page")) || 1,
		pageSize: 20,
		...(resource === "users" || resource === "orders"
			? { q: search.get("q") || undefined }
			: {}),
		...(resource === "events"
			? { state: search.get("status") || undefined }
			: { status: search.get("status") || undefined }),
	};
	return useQuery({
		queryKey: ["admin", resource, params],
		queryFn: async (): Promise<Page> => {
			const { data } = await api.get(`/admin/${resources[resource].endpoint}`, {
				params,
			});
			if (resource === "fee-rules")
				return {
					items: data ? [data as RecordItem] : [],
					page: 1,
					pageSize: 20,
					total: data ? 1 : 0,
				};
			return data;
		},
	});
}
export function errorMessage(error: unknown) {
	if (typeof error === "object" && error && "response" in error) {
		const response = (
			error as {
				response?: { status?: number; data?: { message?: string | string[] } };
			}
		).response;
		if (response?.status === 403)
			return "You do not have permission to perform this action.";
		const message = response?.data?.message;
		if (message) return Array.isArray(message) ? message.join(". ") : message;
	}
	return error instanceof Error
		? error.message
		: "Unable to reach the service. Please try again.";
}
