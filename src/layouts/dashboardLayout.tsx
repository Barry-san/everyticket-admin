import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const navlinks: { title: string; path: string }[] = [
    { title: "overview", path: "/overview" },
    { title: "Events", path: "/events" },
    { title: "Users", path: "/users" },
    { title: "Orders", path: "/orders" },
    { title: "Refunds", path: "/refunds" },
    { title: "payouts", path: "/payouts" },
    { title: "fee rules", path: "/fee-rules" },
    { title: "Reconciliation", path: "/reconciliation" },
    { title: "Jobs and Media", path: "/jobs" },
    { title: "audit log", path: "/audit" },
  ];
  return (
    <div className="grid grid-cols-[24rem_minmax(0,1fr)]">
      <aside className="sticky top-0 left-0 h-screen w-sm bg-purple-400 p-5 flex flex-col gap-10 justify-even overflow-y-auto">
        <article>
          <p className="font-semibold text-2xl">Everyticket Admin</p>
        </article>
        <nav className="flex flex-col gap-5">
          {navlinks.map((link, index) => (
            <Link
              to={link.path}
              key={link.path}
              className=" p-3 text-lg bg-indigo-400"
            >
              <span>{(index + 1).toString().padStart(2, 0)}</span> {link.title}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="w-full bg-neutral-300">
        <header className="p-4 w-full">
          <Link to={"/"}>EveryTicket</Link>
          <nav></nav>
        </header>
        <Outlet />
      </section>
    </div>
  );
}
