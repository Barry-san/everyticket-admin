import { createContext, type ReactNode, useContext, useState } from "react";
import { applyCommand } from "./commands";
import { createSeed } from "./seed";
import type { AdminState, Command } from "./types";

type Notice = { message: string; error: boolean } | null;
type AdminContextValue = {
	data: AdminState;
	execute: (command: Command) => boolean;
	notice: Notice;
	dismiss: () => void;
	notify: (message: string) => void;
};
const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
	const [data, setData] = useState(createSeed);
	const [notice, setNotice] = useState<Notice>(null);
	function execute(command: Command) {
		try {
			const next = applyCommand(data, command);
			setData(next);
			setNotice({
				message: `${next.audit[0].action}. Demo data updated.`,
				error: false,
			});
			return true;
		} catch (error) {
			setNotice({
				message:
					error instanceof Error
						? error.message
						: "Unable to update this record.",
				error: true,
			});
			return false;
		}
	}
	return (
		<AdminContext.Provider
			value={{
				data,
				execute,
				notice,
				dismiss: () => setNotice(null),
				notify: (message) => setNotice({ message, error: false }),
			}}
		>
			{children}
		</AdminContext.Provider>
	);
}

export function useAdmin() {
	const context = useContext(AdminContext);
	if (!context) throw new Error("AdminProvider is required.");
	return context;
}
