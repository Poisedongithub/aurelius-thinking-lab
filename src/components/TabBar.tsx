import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { path: "/home", label: "Home", icon: "home" },
  { path: "/arena", label: "Arena", icon: "arena" },
  { path: "/markets", label: "Markets", icon: "markets" },
  { path: "/library", label: "Library", icon: "library" },
  { path: "/profile", label: "Profile", icon: "profile" },
];

const TabIcon = ({ icon, active }: { icon: string; active: boolean }) => {
  const cls = `w-5 h-5 ${active ? "opacity-100" : "opacity-40"}`;
  const stroke = "currentColor";
  const sw = active ? 1.8 : 1.5;
  const base = { className: cls, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (icon) {
    // Home: Clean Greek temple with pediment and pillars
    case "home":
      return (
        <svg {...base}>
          <path d="M3 10.5L12 4l9 6.5" />
          <line x1="5" y1="10.5" x2="5" y2="19" />
          <line x1="19" y1="10.5" x2="19" y2="19" />
          <line x1="8.5" y1="10.5" x2="8.5" y2="19" />
          <line x1="12" y1="10.5" x2="12" y2="19" />
          <line x1="15.5" y1="10.5" x2="15.5" y2="19" />
          <line x1="3" y1="19" x2="21" y2="19" />
          <line x1="2" y1="21" x2="22" y2="21" />
        </svg>
      );

    // Arena: Elegant crossed swords
    case "arena":
      return (
        <svg {...base}>
          <line x1="6" y1="20" x2="18" y2="4" />
          <line x1="18" y1="20" x2="6" y2="4" />
          <line x1="15" y1="4" x2="18" y2="4" />
          <line x1="18" y1="4" x2="18" y2="7" />
          <line x1="6" y1="4" x2="9" y2="4" />
          <line x1="6" y1="4" x2="6" y2="7" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      );

    // Markets: Polished candlestick chart
    case "markets":
      return (
        <svg {...base}>
          <line x1="6" y1="4" x2="6" y2="8" />
          <rect x="4" y="8" width="4" height="5" rx="0.5" />
          <line x1="6" y1="13" x2="6" y2="16" />
          <line x1="12" y1="6" x2="12" y2="9" />
          <rect x="10" y="9" width="4" height="6" rx="0.5" />
          <line x1="12" y1="15" x2="12" y2="18" />
          <line x1="18" y1="3" x2="18" y2="7" />
          <rect x="16" y="7" width="4" height="5" rx="0.5" />
          <line x1="18" y1="12" x2="18" y2="15" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      );

    // Library: Open book with pages
    case "library":
      return (
        <svg {...base}>
          <path d="M2 4c2-1 4.5-1 7 0 2.5 1 3 1 3 1v15s-.5 0-3-1c-2.5-1-5-1-7 0V4z" />
          <path d="M22 4c-2-1-4.5-1-7 0-2.5 1-3 1-3 1v15s.5 0 3-1c2.5-1 5-1 7 0V4z" />
        </svg>
      );

    // Profile: Elegant bust/person silhouette
    case "profile":
      return (
        <svg {...base}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      );

    default:
      return null;
  }
};

export const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="flex justify-around py-3 px-7 border-t border-border/40">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path || 
          (tab.path === "/arena" && location.pathname.startsWith("/arena")) ||
          (tab.path === "/markets" && location.pathname.startsWith("/markets"));
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 transition-opacity ${active ? "opacity-100" : "opacity-35 hover:opacity-60"}`}>
            <TabIcon icon={tab.icon} active={active} />
            <span className="text-[9px] uppercase tracking-[0.15em] text-foreground">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
