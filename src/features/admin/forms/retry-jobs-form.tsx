import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Command } from "../types";
import { ActionNotice, FieldErrorMessage, FormActions } from "./form-parts";

const schema = z.object({
	note: z.string().trim().min(5, "Enter at least 5 characters."),
});

export function RetryJobsForm({
	id,
	onCancel,
	onSubmit,
}: {
	id?: string;
	onCancel: () => void;
	onSubmit: (command: Command) => void;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.input<typeof schema>>({
		defaultValues: { note: "Retry requested after reviewing failed delivery." },
	});
	return (
		<form
			onSubmit={handleSubmit((values) => {
				const result = schema.safeParse(values);
				if (!result.success) return;
				onSubmit({ type: "retry", id, note: result.data.note });
			})}
		>
			<label className="form-field">
				Reason / internal note
				<textarea
					rows={3}
					placeholder="Record the context and evidence for this decision…"
					aria-invalid={!!errors.note}
					{...register("note", {
						required: "Enter at least 5 characters.",
						minLength: 5,
					})}
				/>
				<span>
					At least 5 characters. This note is included in the audit log.
				</span>
			</label>
			<FieldErrorMessage error={errors.note} />
			<ActionNotice />
			<FormActions label="retry" onCancel={onCancel} />
		</form>
	);
}
