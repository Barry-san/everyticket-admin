import { type RouteObject, useRoutes } from "react-router-dom";

export function AppRoutes() {
	const authRoute: RouteObject = {
		path: "/login",
		element: null,
	};

	const protectedRoutes: RouteObject[] = [];
	const allRoutes: RouteObject[] = [
		authRoute,
		{ path: "/", element: null, children: protectedRoutes },
	];
	const routes = useRoutes(allRoutes);
	return <>{routes}</>;
}
