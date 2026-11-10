import { Spinner } from "@/components/ui/spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { type Action, actionBody, actionFieldLabels } from "./actions";
import { errorMessage } from "./api";
export function ActionForm({
	action,
	close,
	onSuccess,
}: {
	action: Action;
	close: () => void;
	onSuccess?: (data: unknown) => void;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Record<string, string>>();
	const client = useQueryClient();
	const mutation = useMutation({
		mutationFn: (values: Record<string, string>) =>
			api.request({
				url: action.path,
				method: action.method,
				data: actionBody(action, values),
			}),
		onSuccess: async (response) => {
			toast.success(action.successMessage);
			onSuccess?.(response.data);
			close();
			await client.invalidateQueries({ queryKey: ["admin"] });
		},
		onError: (error) => toast.error(errorMessage(error)),
	});
	return (
		<form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
			<h3>{action.label}</h3>
			{action.fields.map((field) => (
				<div className="form-field" key={field}>
					<label htmlFor={`action-${field}`}>{actionFieldLabels[field]}</label>
					{field === "mode" ? (
						<select
							id={`action-${field}`}
							{...register(field, { required: true })}
						>
							<option value="FIXED">Fixed</option>
							<option value="PERCENTAGE">Percentage</option>
						</select>
					) : (
						<input
							id={`action-${field}`}
							type={
								field.endsWith("Kobo") || field === "feeValue"
									? "number"
									: field === "effectiveAt" || field === "transferDate"
										? "datetime-local"
										: "text"
							}
							min={0}
							step={
								field.endsWith("Kobo") || field === "feeValue" ? 1 : undefined
							}
							{...register(field, {
								required: true,
								validate: (value) => value.trim().length > 0,
							})}
						/>
					)}
					{errors[field] && <span role="alert">Enter a valid value.</span>}
				</div>
			))}
			{mutation.isError && (
				<p className="form-error" role="alert">
					{errorMessage(mutation.error)}
				</p>
			)}
			<div className="form-actions">
				<button
					type="button"
					className="button"
					disabled={mutation.isPending}
					onClick={close}
				>
					Cancel
				</button>
				<button
					type="submit"
					className="button button-primary"
					disabled={mutation.isPending}
				>
					{mutation.isPending && <Spinner aria-hidden="true" />}
					{mutation.isPending ? "Saving…" : "Confirm"}
				</button>
			</div>
		</form>
	);
}
