import { ArrowRight } from "lucide-react";
import type {
	FieldError,
	FieldValues,
	Path,
	UseFormRegister,
} from "react-hook-form";

import { useAdmin } from "../store";

export function FieldErrorMessage({ error }: { error?: FieldError }) {
	return error ? (
		<p className="form-error" role="alert">
			{error.message}
		</p>
	) : null;
}

export function ActionNotice() {
	const { notice } = useAdmin();
	return notice?.error ? (
		<p className="form-error" role="alert">
			{notice.message}
		</p>
	) : null;
}

export function FinancialConfirmation<T extends FieldValues>({
	register,
	error,
}: {
	register: UseFormRegister<T>;
	error?: FieldError;
}) {
	return (
		<>
			<label className="checkbox-field">
				<input type="checkbox" {...register("confirmed" as Path<T>)} />
				<span>
					I have reviewed the details and want to record this decision in the
					demo.
				</span>
			</label>
			<FieldErrorMessage error={error} />
		</>
	);
}

export function FormActions({
	label,
	onCancel,
	danger = false,
	disabled = false,
}: {
	label: string;
	onCancel: () => void;
	danger?: boolean;
	disabled?: boolean;
}) {
	return (
		<>
			<div className="form-actions">
				<button
					type="button"
					className="button button-secondary"
					onClick={onCancel}
				>
					Cancel
				</button>
				<button
					type="submit"
					className={`button ${danger ? "button-danger" : "button-primary"}`}
					disabled={disabled}
				>
					Confirm {label}
					<ArrowRight size={15} />
				</button>
			</div>
			<p className="form-disclaimer">
				Demo only · no external messages, payments, or transfers.
			</p>
		</>
	);
}
