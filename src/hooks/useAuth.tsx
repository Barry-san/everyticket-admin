import { authClient } from "@/lib/auth";

type AuthStatus = "loading" | "error" | "authenticated" | "unauthenticated";
export function useAuth() {
	const { data, refetch, isPending, error } = authClient.useSession();
	const status: AuthStatus = isPending
		? "loading"
		: error
			? "error"
			: data?.user
				? "authenticated"
				: "unauthenticated";

	return {
		user: data?.user ?? null,
		session: data?.session ?? null,
		status,
		refetch,
	};
}
