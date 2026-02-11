import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[217px] h-full bg-[#7A0000] text-white px-5 pt-6 pb-6 flex flex-col">
      {/* Brand */}
      <div className="flex flex-col items-center shrink-0">
        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
          <img src="/hat.png" alt="logo" className="h-7 w-7" />
        </div>

        <div className="mt-3 text-center">
          <div className="text-[20px] font-extrabold leading-none">
            Scholarly
          </div>
          <div className="mt-1 text-[12px] font-semibold opacity-90">
            Connect. Learn. Grow.
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-11 space-y-2 text-[16px] font-semibold">
        <SideLink
          to="/dashboard/tutor"
          active={location.pathname === "/dashboard/tutor"}
          icon={<HomeIcon />}
        >
          Dashboard
        </SideLink>

        <SideLink
          to="/dashboard/sessions"
          active={location.pathname.includes("/sessions")}
          icon={<CalendarIcon />}
        >
          My Sessions
        </SideLink>

        <SideLink
          to="/dashboard/availability-v2"
          active={location.pathname.includes("/availability")}
          icon={<ClockIcon />}
        >
          Availability
        </SideLink>

        <SideLink
          to="/dashboard/find-students"
          active={location.pathname.includes("/find")}
          icon={<UsersIcon />}
        >
          Find Students
        </SideLink>

        <SideLink
          to="/dashboard/messages"
          active={location.pathname.includes("/messages")}
          icon={<ChatIcon />}
        >
          Messages
        </SideLink>

        <SideLink
          to="/dashboard/reviews"
          active={location.pathname.includes("/reviews")}
          icon={<StarIcon />}
        >
          My Reviews
        </SideLink>
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto pt-6 space-y-2 text-[16px] font-semibold shrink-0">
        <SideLink
          to="/dashboard/settings"
          active={location.pathname.includes("/settings")}
          icon={<SettingsIcon />}
        >
          Settings
        </SideLink>

        <SideLink to="/logout" active={false} icon={<LogoutIcon />}>
          Log Out
        </SideLink>
      </div>
    </aside>
  );
}

function SideLink({ to, active, icon, children }) {
  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-3 rounded-[10px] px-3 py-2 transition",
        active ? "bg-white/15" : "hover:bg-white/10",
      ].join(" ")}
    >
      <span className="opacity-95">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

/* ========== Icons (unchanged) ========== */

function IconBase({ children }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <IconBase>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function CalendarIcon() {
  return (
    <IconBase>
      <path
        d="M7 3v3M17 3v3M4 8h16M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function ClockIcon() {
  return (
    <IconBase>
      <path
        d="M12 22a10 10 0 110-20 10 10 0 010 20z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function UsersIcon() {
  return (
    <IconBase>
      <path
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 11a4 4 0 100-8 4 4 0 000 8z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M22 21v-2a4 4 0 00-3-3.87"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function ChatIcon() {
  return (
    <IconBase>
      <path
        d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function StarIcon() {
  return (
    <IconBase>
      <path
        d="M12 2l3 7 7 .5-5.3 4.6L18.5 21 12 17.2 5.5 21l1.8-6.9L2 9.5 9 9l3-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function SettingsIcon() {
  return (
    <IconBase>
      <path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a7.8 7.8 0 000-6l2-1.1-2-3.5-2.3.7a8 8 0 00-5.2-3L11.5 0h-3L8 2a8 8 0 00-5.2 3l-2.3-.7-2 3.5L.5 9a7.8 7.8 0 000 6l-2 1.1 2 3.5 2.3-.7a8 8 0 005.2 3l.5 2h3l.4-2a8 8 0 005.2-3l2.3.7 2-3.5-2-1.1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function LogoutIcon() {
  return (
    <IconBase>
      <path
        d="M10 17l1 4H5a2 2 0 01-2-2V5a2 2 0 012-2h6l-1 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 12H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 9l3 3-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
// 