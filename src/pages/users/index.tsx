import RecordsPage from "@/features/admin/records";
import { useGetUser } from "@/hooks/users/useGetUsers";

export default function Page() {
	const { data: users } = useGetUser();

	console.log(users);
	return <RecordsPage section="users" />;
}
