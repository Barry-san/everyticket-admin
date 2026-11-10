import { useForm } from "react-hook-form";
import { z } from "zod";

import { InfoNote } from "../components";
import { money } from "../format";
import type { Command } from "../types";
import {
	ActionNotice,
	FieldErrorMessage,
	FinancialConfirmation,
	FormActions,
} from "./form-parts";

const schema = z
	.object({
		feeType: z.enum(["percentage", "fixed"]),
		value: z.number().finite("Enter a valid fee.").min(0, "Enter a valid fee."),
		effective: z.string().min(1, "Choose an effective date."),
		note: z.string().trim().min(5, "Enter at least 5 characters."),
		confirmed: z
			.boolean()
			.refine((value) => value, "Confirm that you reviewed the details."),
	})
	.superRefine((values, context) => {
		if (values.feeType === "percentage" && values.value > 100)
			context.addIssue({
				code: "custom",
				path: ["value"],
				message: "Percentage must be between 0 and 100.",
			});
	});

type FeeRuleValues = z.input<typeof schema>;

export function FeeRuleForm({
	onCancel,
	onSubmit,
}: {
	onCancel: () => void;
	onSubmit: (command: Command) => void;
}) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<FeeRuleValues>({
		defaultValues: { feeType: "percentage", value: 3.5, confirmed: false },
	});
	const feeType = watch("feeType");
	const feeValue = watch("value");
	return (
		<form
			onSubmit={handleSubmit((values) => {
				const result = schema.safeParse(values);
				if (!result.success) return;
				onSubmit({
					type: "fee",
					feeType: result.data.feeType,
					value:
						result.data.feeType === "percentage"
							? result.data.value
							: Math.round(result.data.value * 100),
					effective: `${result.data.effective}:00+01:00`,
					note: result.data.note,
				});
			})}
		>
			<div className="form-grid">
				<label className="form-field">
					Fee type
					<select
						{...register("feeType", {
							onChange: (event) =>
								setValue(
									"value",
									event.target.value === "percentage" ? 3.5 : 500,
								),
						})}
					>
						<option value="percentage">Percentage</option>
						<option value="fixed">Fixed amount (NGN)</option>
					</select>
				</label>
				<label className="form-field">
					{feeType === "percentage" ? "Percentage (%)" : "Amount (₦)"}
					<input
						type="number"
						min="0"
						max={feeType === "percentage" ? 100 : undefined}
						step="0.01"
						aria-invalid={!!errors.value}
						{...register("value", {
							valueAsNumber: true,
							required: "Enter a valid fee.",
						})}
					/>
				</label>
			</div>
			<FieldErrorMessage error={errors.value} />
			<label className="form-field">
				Effective from (Africa/Lagos)
				<input
					type="datetime-local"
					min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)}
					aria-invalid={!!errors.effective}
					{...register("effective", { required: "Choose an effective date." })}
				/>
				<span>
					Future orders only. Scheduled rules are not activated automatically in
					the demo.
				</span>
			</label>
			<FieldErrorMessage error={errors.effective} />
			<InfoNote>
				A ₦10,000 order would carry a{" "}
				{money(
					feeType === "percentage"
						? Math.round((1000000 * (feeValue || 0)) / 100)
						: Math.round((feeValue || 0) * 100),
				)}{" "}
				platform fee.
			</InfoNote>
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
			<FinancialConfirmation register={register} error={errors.confirmed} />
			<ActionNotice />
			<FormActions
				label="schedule"
				disabled={!watch("confirmed")}
				onCancel={onCancel}
			/>
		</form>
	);
}
