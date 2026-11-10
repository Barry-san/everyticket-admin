import { QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { AppRoutes } from "@/routes";

function App() {
	return (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<Toaster richColors={true} position="bottom-right" />
				<Suspense
					fallback={
						<div className="access-screen" role="status">
							Loading Everyticket…
						</div>
					}
				>
					<AppRoutes />
				</Suspense>
			</QueryClientProvider>
		</BrowserRouter>
	);
}

export default App;
