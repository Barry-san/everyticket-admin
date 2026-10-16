import { type RouteObject, useRoutes } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboardLayout";

export function AppRoutes() {
	const authRoute: RouteObject = {
		path: "/login",
		element: null,
	};

	const protectedRoutes: RouteObject[] = [];
	const allRoutes: RouteObject[] = [
		authRoute,
		{ path: "/", element: <DashboardLayout />, children: protectedRoutes },
	];
	const routes = useRoutes(allRoutes);
	return <>{routes}</>;
}
