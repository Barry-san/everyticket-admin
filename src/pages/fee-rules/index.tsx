import RecordsPage from "@/features/admin/records";
import { useGetFeeRules } from "@/hooks/fee-rules/useGetRules";

export default function Page() {
	const { data } = useGetFeeRules();
	console.log(data);
	return <RecordsPage section="fee-rules" />;
}
