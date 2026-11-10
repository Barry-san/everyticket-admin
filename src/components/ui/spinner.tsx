import { LoaderIcon } from "lucide-react";
import type { ComponentProps } from "react";

export function Spinner({ className = "", ...props }: ComponentProps<"svg">) {
	return (
		<LoaderIcon
			role="status"
			aria-label="Loading"
			className={`size-4 shrink-0 motion-safe:animate-spin ${className}`}
			{...props}
		/>
	);
}
