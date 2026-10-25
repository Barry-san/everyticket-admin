import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { AdminProvider } from "@/features/admin/store";
import { AppRoutes } from "@/routes";

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Suspense
          fallback={
            <div className="access-screen" role="status">
              Loading Everyticket…
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
