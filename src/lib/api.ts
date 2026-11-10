import { create } from "axios";
import { ENV } from "./env";
import { queryClient } from "./query-client";

export const api = create({
	baseURL: ENV.VITE_BACKEND_URL,
	withCredentials: true,
	timeout: 60000,
});
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			queryClient.clear();
			if (window.location.pathname !== "/login")
				window.location.assign("/login");
		}
		return Promise.reject(error);
	},
);
