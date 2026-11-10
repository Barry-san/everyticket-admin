import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Toast } from "./components";
import { applyCommand } from "./commands";
import { createSeed } from "./seed";
import type { AdminState, Command } from "./types";

type Notice = { id: number; message: string; error: boolean } | null;
type AdminContextValue = {
  data: AdminState;
  execute: (command: Command) => boolean;
  notice: Notice;
  dismiss: () => void;
  notify: (message: string, error?: boolean) => void;
};
const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(createSeed);
  const [notice, setNotice] = useState<Notice>(null);
  const sequence = useRef(0);
  const dismiss = useCallback(() => setNotice(null), []);
  const notify = useCallback((message: string, error = false) => {
    setNotice({ id: ++sequence.current, message, error });
  }, []);
  function execute(command: Command) {
    try {
      const next = applyCommand(data, command);
      setData(next);
      notify(`${next.audit[0].action}. Demo data updated.`);
      return true;
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Unable to update this record.",
        true,
      );
      return false;
    }
  }
  return (
    <AdminContext.Provider
      value={{
        data,
        execute,
        notice,
        dismiss,
        notify,
      }}
    >
      {children}
      {notice && (
        <Toast
          key={notice.id}
          message={notice.message}
          error={notice.error}
          onClose={dismiss}
        />
      )}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("AdminProvider is required.");
  return context;
}
