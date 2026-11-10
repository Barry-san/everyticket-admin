import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Command } from "../types";
import { ActionNotice, FieldErrorMessage, FormActions } from "./form-parts";

const schema = z.object({
	name: z.string().trim().min(2, "Enter a name with at least 2 characters."),
	email: z.string().trim().email("Enter a valid email address."),
	note: z.string().trim().min(5, "Enter at least 5 characters."),
});

export function ProvisionAdministratorForm({
	onCancel,
	onSubmit,
}: {
	onCancel: () => void;
	onSubmit: (command: Command) => void;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<z.input<typeof schema>>();
	return (
		<form
			onSubmit={handleSubmit((values) => {
				const result = schema.safeParse(values);
				if (!result.success) return;
				onSubmit({ type: "provision", ...result.data });
			})}
		>
			<label className="form-field">
				Full name
				<input
					autoComplete="name"
					placeholder="E.g. Amaka Eze"
					aria-invalid={!!errors.name}
					{...register("name", {
						required: "Enter a name with at least 2 characters.",
						minLength: 2,
					})}
				/>
			</label>
			<FieldErrorMessage error={errors.name} />
			<label className="form-field">
				Email address
				<input
					type="email"
					autoComplete="email"
					placeholder="amaka@everyticket.ng"
					aria-invalid={!!errors.email}
					{...register("email", { required: "Enter a valid email address." })}
				/>
			</label>
			<FieldErrorMessage error={errors.email} />
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
			<FormActions label="provision" onCancel={onCancel} />
		</form>
	);
}
