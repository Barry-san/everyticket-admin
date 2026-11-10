import RecordsPage from "@/features/admin/records";
import useGetEvents from "@/hooks/events/useGetEvents";

export default function Page() {
	const { data: events } = useGetEvents();
	console.log(events);
	return <RecordsPage section="events" />;
}
