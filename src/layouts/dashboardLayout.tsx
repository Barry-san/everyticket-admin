import { Spinner } from "@/components/ui/spinner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CreditCard,
	FileClock,
	Gauge,
	Layers,
	LayoutGrid,
	Settings2,
	ShieldCheck,
	Ticket,
	Users,
	Wallet,
} from "lucide-react";
import {
	Navigate,
	NavLink,
	Outlet,
	useLocation,
	useNavigate,
} from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Brand } from "@/features/admin/components";
import { initials } from "@/features/admin/format";
import type { Profile } from "@/features/live/contracts";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth";

const groups = [
	{
		label: "WORKSPACE",
		items: [
			{ title: "Overview", path: "/overview", icon: LayoutGrid },
			{ title: "Events", path: "/events", icon: Ticket },
			{ title: "Users", path: "/users", icon: Users },
			{ title: "Orders", path: "/orders", icon: CreditCard },
		],
	},
	{
		label: "FINANCE",
		items: [
			{ title: "Refunds", path: "/refunds", icon: FileClock },
			{ title: "Payouts", path: "/payouts", icon: Wallet },
			{ title: "Fee rules", path: "/fee-rules", icon: Settings2 },
			{ title: "Reconciliation", path: "/reconciliation", icon: Gauge },
		],
	},
	{
		label: "PLATFORM",
		items: [
			{ title: "Jobs & media", path: "/jobs", icon: Layers },
			{ title: "Audit log", path: "/audit", icon: ShieldCheck },
		],
	},
];

import { errorMessage } from "@/features/live/api";
export default function DashboardLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const [signingOut, setSigningOut] = useState(false);
	const session = useAuth();
	const client = useQueryClient();
	const profile = useQuery({
		queryKey: ["admin", "profile"],
		enabled: session.status === "authenticated",
		retry: false,
		queryFn: async () => (await api.get<Profile>("/account/me")).data,
	});
	async function signOut() {
		if (signingOut) return;
		setSigningOut(true);
		try {
			const result = await authClient.signOut();
			if (result.error) {
				toast.error("Unable to sign out. Please try again.");
			} else {
				client.clear();
				toast.success("Signed out successfully.");
				navigate("/login", { replace: true });
			}
		} catch {
			toast.error(
				"Unable to reach the authentication service. Please try again.",
			);
		} finally {
			setSigningOut(false);
		}
	}
	if (session.status === "unauthenticated")
		return <Navigate to="/login" replace />;
	if (session.status === "error" || profile.isError)
		return (
			<div className="access-screen">
				<Brand />
				<h1>Unable to check access</h1>
				<p>
					{profile.isError
						? errorMessage(profile.error)
						: "Please check your connection."}
				</p>
				<button
					type="button"
					onClick={() => {
						void session.refetch();
						void profile.refetch();
					}}
				>
					Try again
				</button>
			</div>
		);
	if (session.status === "loading" || !profile.data)
		return (
			<div className="access-screen" role="status">
				<Spinner aria-hidden="true" />
				Checking administrator access…
			</div>
		);
	if (profile.data.role !== "ADMIN" && !profile.data.roles.includes("ADMIN"))
		return (
			<div className="access-screen">
				<Brand />
				<h1>Administrator access required</h1>
				<p>This profile does not have administrator permissions.</p>
				<button type="button" disabled={signingOut} onClick={signOut}>
					Sign out
				</button>
			</div>
		);
	return (
		<div className="app-shell">
			<a href="#main-content" className="skip-link">
				Skip to content
			</a>
			<aside className="desktop-sidebar">
				<Brand />
				<div className="workspace-label">Platform administration</div>
				<nav className="side-navigation">
					{groups.map((group) => (
						<div className="nav-group" key={group.label}>
							<p>{group.label}</p>
							{group.items.map((item) => (
								<NavLink key={item.path} className="nav-item" to={item.path}>
									<item.icon size={18} strokeWidth={1.7} />
									<span>{item.title}</span>
								</NavLink>
							))}
						</div>
					))}
				</nav>
				<div className="sidebar-bottom" />
				<div className="sidebar-user">
					<span className="sidebar-avatar">
						{initials(session.user?.name || "")}
					</span>
					<span>
						<strong>{session.user?.name}</strong>
						<small>Platform administrator</small>
					</span>
				</div>
			</aside>
			<div className="workspace-content">
				<header className="topbar">
					<div className="breadcrumb">
						<span>Workspace</span>
						<span className="breadcrumb-slash">/</span>
						<strong>
							{groups
								.flatMap((group) => group.items)
								.find(
									(item) =>
										location.pathname === item.path ||
										location.pathname.startsWith(`${item.path}/`),
								)?.title || "Overview"}
						</strong>
						{location.pathname.split("/").filter(Boolean).length > 1 && (
							<span> / Details</span>
						)}
					</div>
					<button
						type="button"
						className="text-link"
						disabled={signingOut}
						onClick={signOut}
					>
						{signingOut && <Spinner aria-hidden="true" />}
						{signingOut ? "Signing out…" : "Sign out"}
					</button>
				</header>
				<main id="main-content" tabIndex={-1} className="main-content">
					<Outlet />
					<footer className="workspace-footer">
						<span>Made for the moments that bring us together.</span>
						<span>Everyticket © 2026</span>
					</footer>
				</main>
			</div>
		</div>
	);
}
