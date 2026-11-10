import { useForm } from "react-hook-form";
import { z } from "zod";

import { Details } from "../components";
import { money } from "../format";
import type { Command, Payout } from "../types";
import {
	ActionNotice,
	FieldErrorMessage,
	FinancialConfirmation,
	FormActions,
} from "./form-parts";

const schema = z.object({
	reference: z
		.string()
		.trim()
		.min(5, "Enter a transfer reference with at least 5 characters."),
	note: z.string().trim().min(5, "Enter at least 5 characters."),
	confirmed: z
		.boolean()
		.refine((value) => value, "Confirm that you reviewed the details."),
});

export function PayoutTransferForm({
	payout,
	onCancel,
	onSubmit,
}: {
	payout?: Payout;
	onCancel: () => void;
	onSubmit: (command: Command) => void;
}) {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<z.input<typeof schema>>({
		defaultValues: { confirmed: false },
	});
	return (
		<form
			onSubmit={handleSubmit((values) => {
				const result = schema.safeParse(values);
				if (!result.success || !payout) return;
				onSubmit({
					type: "payout",
					id: payout.id,
					reference: result.data.reference,
					note: result.data.note,
				});
			})}
		>
			{payout && (
				<Details
					items={[
						["Payout", payout.id],
						["Amount", money(payout.amount)],
						["Bank account", `${payout.bank} ${payout.account}`],
					]}
				/>
			)}
			<label className="form-field">
				External transfer reference
				<input
					placeholder="Enter the bank transfer reference"
					aria-invalid={!!errors.reference}
					{...register("reference", {
						required: "Enter a transfer reference with at least 5 characters.",
						minLength: 5,
					})}
				/>
				<span>Use the unique reference from the completed transfer.</span>
			</label>
			<FieldErrorMessage error={errors.reference} />
			<label className="form-field">
				Transfer note
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
			<FinancialConfirmation register={register} error={errors.confirmed} />
			<ActionNotice />
			<FormActions
				label="record"
				disabled={!watch("confirmed")}
				onCancel={onCancel}
			/>
		</form>
	);
}
