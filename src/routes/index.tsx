import { lazy } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { type Resource, resources } from "@/features/live/contracts";
import RecordPage from "@/features/live/record-page";
import LiveRecords from "@/features/live/records";
import DashboardLayout from "@/layouts/dashboardLayout";

const Overview = lazy(() => import("@/features/live/overview"));
const Login = lazy(() => import("@/pages/login"));

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/auth" element={<Navigate to="/login" replace />} />
			<Route element={<DashboardLayout />}>
				<Route index element={<Navigate to="/overview" replace />} />
				<Route path="overview" element={<Overview />} />
				{Object.keys(resources).map((path) => (
					<Route
						key={path}
						path={path}
						element={<LiveRecords key={path} resource={path as Resource} />}
					/>
				))}
				{(Object.keys(resources) as Resource[]).map((resource) => (
					<Route
						key={`${resource}-detail`}
						path={`${resource}/:id`}
						element={<RecordPage key={resource} resource={resource} />}
					/>
				))}
				{["jobs", "reconciliation"].map((path) => (
					<Route
						key={path}
						path={path}
						element={
							<div className="empty-state">
								<h1>Not yet available</h1>
								<p>This workflow is currently unavailable.</p>
							</div>
						}
					/>
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
