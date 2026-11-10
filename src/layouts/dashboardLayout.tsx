import {
  Bell,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileClock,
  FileText,
  Gauge,
  Layers,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Badge,
  Brand,
  Empty,
  Modal,
  SearchInput,
} from "@/features/admin/components";
import { initials } from "@/features/admin/format";
import { getRows } from "@/features/admin/selectors";
import { useAdmin } from "@/features/admin/store";
import type { Section } from "@/features/admin/types";
import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/auth";
import { ENV } from "@/lib/env";

const groups = [
  {
    label: "WORKSPACE",
    items: [
      { title: "Overview", path: "/overview", icon: LayoutGrid },
      { title: "Events", path: "/events", icon: Ticket },
      { title: "Users", path: "/users", icon: Users },
      { title: "Orders", path: "/orders", icon: CreditCard },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { title: "Refunds", path: "/refunds", icon: FileClock },
      { title: "Payouts", path: "/payouts", icon: Wallet },
      { title: "Fee rules", path: "/fee-rules", icon: Settings2 },
      { title: "Reconciliation", path: "/reconciliation", icon: Gauge },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { title: "Jobs & media", path: "/jobs", icon: Layers },
      { title: "Audit log", path: "/audit", icon: ShieldCheck },
    ],
  },
];

export default function DashboardLayout() {
  if (ENV.DEMO_MODE) return <Workspace />;
  if (!ENV.VITE_AUTH_URL)
    return (
      <div className="access-screen">
        <Brand />
        <h1>Connect your administrator session</h1>
        <p>
          Configure VITE_AUTH_URL to use backend sign-in, or enable
          VITE_DEMO_MODE for the demo workspace.
        </p>
      </div>
    );
  return <AuthenticatedWorkspace />;
}

function AuthenticatedWorkspace() {
  const { status, user, refetch } = useAuth();
  if (status === "loading")
    return (
      <div className="access-screen" role="status">
        <span className="loading-spinner" />
        Checking your session…
      </div>
    );
  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  if (status === "error")
    return (
      <div className="access-screen">
        <Brand />
        <h1>We couldn’t check your session.</h1>
        <p>Please check your connection and try again.</p>
        <button
          type="button"
          className="button button-primary"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  return <Workspace name={user?.name} email={user?.email} />;
}

function Workspace({
  name = "Ada Obi",
  email = "ada@everyticket.ng",
}: {
  name?: string;
  email?: string;
}) {
  const { data, notify } = useAdmin();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [navigation, setNavigation] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [help, setHelp] = useState(false);
  const [profile, setProfile] = useState(false);
  const location = useLocation();
  const title =
    groups
      .flatMap((group) => group.items)
      .find((item) => item.path === location.pathname)?.title || "Workspace";
  const reviews =
    data.refunds.filter((refund) => refund.status === "Pending").length +
    data.exceptions.filter((exception) => exception.status === "Open").length;
  const userInitials = initials(name);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const close = () => {
      if (desktop.matches) setNavigation(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearch((current) => !current);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => {
    void location.key;
    setNavigation(false);
    setSearch(false);
    document
      .querySelector<HTMLElement>("#main-content")
      ?.focus({ preventScroll: true });
  }, [location.key]);
  const sidebar = (
    <>
      <Link
        to="/overview"
        className="brand-link"
        aria-label="Everyticket overview"
      >
        <Brand />
      </Link>
      <div className="workspace-label">
        <span className="workspace-icon">
          <ShieldCheck size={16} />
        </span>
        <span>Platform administration</span>
        <ChevronDown size={13} />
      </div>
      <nav className="side-navigation" aria-label="Main navigation">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setNavigation(false)}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <item.icon size={18} strokeWidth={1.7} />
                <span>{item.title}</span>
                {item.title === "Refunds" &&
                  data.refunds.some(
                    (refund) => refund.status === "Pending",
                  ) && (
                    <span className="nav-count">
                      {
                        data.refunds.filter(
                          (refund) => refund.status === "Pending",
                        ).length
                      }
                    </span>
                  )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-help"
          onClick={() => {
            setNavigation(false);
            setHelp(true);
          }}
        >
          <CircleHelp size={18} />
          <span>Workspace guide</span>
          <span className="help-arrow">↗</span>
        </button>
        <div className="sidebar-status">
          <span className="live-dot" />
          Demo workspace<span>v0.1</span>
        </div>
      </div>
      <button
        type="button"
        className="sidebar-user"
        onClick={() => {
          setNavigation(false);
          setProfile(true);
        }}
      >
        <span className="sidebar-avatar">{userInitials}</span>
        <span>
          <strong>{name}</strong>
          <small>Platform administrator</small>
        </span>
        <ChevronDown size={15} />
      </button>
    </>
  );
  const results = (["orders", "users", "events"] as Section[]).flatMap(
    (section) =>
      getRows(data, section)
        .filter((row) =>
          [row.id, row.title, row.subtitle, row.secondary]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        )
        .map((row) => ({ ...row, section })),
  );
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="desktop-sidebar">{sidebar}</aside>
      <div className="workspace-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setNavigation(true)}
            >
              <Menu size={22} />
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-slash">/</span>
              <strong>{title}</strong>
            </div>
          </div>
          <button
            type="button"
            className="global-search"
            onClick={() => setSearch(true)}
          >
            <Search size={17} />
            <span>Search anything…</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="topbar-right">
            <span className="demo-pill">
              <span />
              Demo mode
            </span>
            <Link
              className="notification-button"
              to="/reconciliation"
              aria-label={`${reviews} items requiring review`}
            >
              <Bell size={19} />
              {reviews > 0 && <span />}
            </Link>
            <span className="topbar-divider" />
            <button
              type="button"
              className="profile-button"
              onClick={() => setProfile(true)}
              aria-label="Open administrator profile"
            >
              <span className="topbar-avatar">{userInitials}</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          <Suspense
            fallback={
              <div className="page-loading" role="status">
                <span className="loading-spinner" />
                Loading workspace…
              </div>
            }
          >
            <Outlet />
          </Suspense>
          <footer className="workspace-footer">
            <span>Made for the moments that bring us together.</span>
            <span>
              Everyticket <span>© 2026</span>
            </span>
          </footer>
        </main>
      </div>
      <Modal
        open={navigation}
        onClose={() => setNavigation(false)}
        title="Navigation"
        side
      >
        <div className="mobile-sidebar">{sidebar}</div>
      </Modal>
      <Modal
        open={search}
        onClose={() => setSearch(false)}
        title="Find your way"
        description="Search demo orders, people, and events."
      >
        <SearchInput
          label="Search platform"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="An order ID, a name, an event…"
        />
        <div className="global-results">
          {results.length ? (
            results.slice(0, 12).map((row) => (
              <Link
                key={`${row.section}-${row.id}`}
                to={`/${row.section}?record=${row.id}`}
                onClick={() => setSearch(false)}
              >
                <span className="search-result-icon">
                  {row.section === "events" ? (
                    <Ticket size={18} />
                  ) : row.section === "users" ? (
                    <Users size={18} />
                  ) : (
                    <CreditCard size={18} />
                  )}
                </span>
                <span>
                  <strong>{row.title}</strong>
                  <small>{row.subtitle}</small>
                </span>
                <span className="search-result-type">{row.section}</span>
                <span aria-hidden="true" className="search-arrow">
                  ↗
                </span>
              </Link>
            ))
          ) : (
            <Empty />
          )}
        </div>
      </Modal>
      <Modal
        open={help}
        onClose={() => setHelp(false)}
        title="A little workspace guide"
        description="Your platform administration demo."
      >
        <div className="guide-list">
          <div>
            <Ticket size={21} />
            <p>
              <strong>Explore the whole platform</strong>
              <span>
                Open any section to search, filter, and inspect a record. Use
                ⌘/Ctrl K to search across orders, people, and events.
              </span>
            </p>
          </div>
          <div>
            <ShieldCheck size={21} />
            <p>
              <strong>Try a real workflow</strong>
              <span>
                Review a refund, suspend an event, or record an external payout.
                Confirmed actions update related records and append an audit
                entry.
              </span>
            </p>
          </div>
          <div>
            <FileText size={21} />
            <p>
              <strong>A safe place to explore</strong>
              <span>
                All records are dummy data. Nothing is sent or paid. Refreshing
                resets changes; exports download the filtered records.
              </span>
            </p>
          </div>
        </div>
      </Modal>
      <Modal
        open={profile}
        onClose={() => setProfile(false)}
        title="Administrator profile"
      >
        <div className="person-profile">
          <span className="person-avatar large">{userInitials}</span>
          <h3>{name}</h3>
          <p>{email}</p>
          <Badge status="Administrator" />
        </div>
        <div className="info-note">
          <p>
            All sections are available in this frontend demo. Backend
            permissions will be connected with the live service.
          </p>
        </div>
        {!ENV.DEMO_MODE && (
          <button
            type="button"
            className="button button-danger"
            disabled={signingOut}
            onClick={async () => {
              if (signingOut) return;
              setSigningOut(true);
              try {
                const response = await authClient.signOut();
                if (response.error) {
                  notify("Unable to sign out. Please try again.", true);
                } else {
                  notify("Signed out successfully.");
                  navigate("/login", { replace: true });
                }
              } catch {
                notify(
                  "Unable to reach the authentication service. Please try again.",
                  true,
                );
              } finally {
                setSigningOut(false);
              }
            }}
          >
            <LogOut size={16} />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        )}
      </Modal>
    </div>
  );
}
