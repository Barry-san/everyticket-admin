import { lazy } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboardLayout";

const Overview = lazy(() => import("@/features/admin/overview"));
const Login = lazy(() => import("@/pages/login"));
const sections = [
	{ path: "events", Page: lazy(() => import("@/pages/events")) },
	{ path: "users", Page: lazy(() => import("@/pages/users")) },
	{ path: "orders", Page: lazy(() => import("@/pages/orders")) },
	{ path: "refunds", Page: lazy(() => import("@/pages/refunds")) },
	{ path: "payouts", Page: lazy(() => import("@/pages/payouts")) },
	{ path: "fee-rules", Page: lazy(() => import("@/pages/fee-rules")) },
	{
		path: "reconciliation",
		Page: lazy(() => import("@/pages/reconciliation")),
	},
	{ path: "jobs", Page: lazy(() => import("@/pages/jobs")) },
	{ path: "audit", Page: lazy(() => import("@/pages/audit-logs")) },
];

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/auth" element={<Navigate to="/login" replace />} />
			<Route element={<DashboardLayout />}>
				<Route index element={<Navigate to="/overview" replace />} />
				<Route path="overview" element={<Overview />} />
				{sections.map(({ path, Page }) => (
					<Route key={path} path={path} element={<Page />} />
				))}
				<Route path="audit-logs" element={<Navigate to="/audit" replace />} />
				<Route
					path="*"
					element={
						<div className="empty-state">
							<span className="eyebrow">404 · A little off track</span>
							<h1>This page isn’t here.</h1>
							<p>Let’s get you back to the platform.</p>
							<Link className="button button-primary" to="/overview">
								Back to overview
							</Link>
						</div>
					}
				/>
			</Route>
		</Routes>
	);
}
