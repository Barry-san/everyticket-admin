import type { AdminState, Command } from "../types";
import type { RecordAction } from "./actions";
import { EventActionForm } from "./event-action-form";
import { FeeRuleForm } from "./fee-rule-form";
import { PayoutTransferForm } from "./payout-transfer-form";
import { ProvisionAdministratorForm } from "./provision-administrator-form";
import { RetryJobsForm } from "./retry-jobs-form";
import { UserStatusForm } from "./user-status-form";

export function ActionModalContent({
	action,
	data,
	onCancel,
	onSubmit,
}: {
	action: RecordAction;
	data: AdminState;
	onCancel: () => void;
	onSubmit: (command: Command) => void;
}) {
	switch (action.name) {
		case "suspend":
		case "restore":
		case "feature":
			return (
				<EventActionForm
					action={action}
					onCancel={onCancel}
					onSubmit={onSubmit}
				/>
			);
		case "block":
		case "unblock":
			return (
				<UserStatusForm
					action={action}
					onCancel={onCancel}
					onSubmit={onSubmit}
				/>
			);
		case "record":
			return (
				<PayoutTransferForm
					payout={data.payouts.find((payout) => payout.id === action.id)}
					onCancel={onCancel}
					onSubmit={onSubmit}
				/>
			);
		case "retry":
			return (
				<RetryJobsForm id={action.id} onCancel={onCancel} onSubmit={onSubmit} />
			);
		case "provision":
			return (
				<ProvisionAdministratorForm onCancel={onCancel} onSubmit={onSubmit} />
			);
		case "fee":
			return <FeeRuleForm onCancel={onCancel} onSubmit={onSubmit} />;
	}
}
