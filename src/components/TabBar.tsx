import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { path: "/home", label: "Home", icon: "home" },
  { path: "/arena", label: "Arena", icon: "arena" },
  { path: "/library", label: "Library", icon: "library" },
  { path: "/profile", label: "Profile", icon: "profile" },
];

const TabIcon = ({ icon, active }: { icon: string; active: boolean }) => {
  const cls = `w-5 h-5 ${active ? "opacity-100" : "opacity-40"}`;
  const props = { className: cls, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "home": return <svg {...props}><path d="M12 3l-9 5h18z"/><line x1="5" y1="8" x2="5" y2="18"/><line x1="9" y1="8" x2="9" y2="18"/><line x1="15" y1="8" x2="15" y2="18"/><line x1="19" y1="8" x2="19" y2="18"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
    case "arena": return <svg {...props}><line x1="4" y1="20" x2="15" y2="5"/><polyline points="13,3 17,3 17,7"/><line x1="20" y1="20" x2="9" y2="5"/><polyline points="7,3 11,3 7,7"/></svg>;
    case "library": return <svg {...props}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><line x1="8" y1="7" x2="15" y2="7"/><line x1="8" y1="11" x2="13" y2="11"/></svg>;
    case "profile": return <svg {...props}><path d="M6 19c1-3 2-8 1-14"/><path d="M18 19c-1-3-2-8-1-14"/><path d="M7 6c1.5 1 3 1.5 5 1.5s3.5-.5 5-1.5"/><path d="M7.5 10c1.5 1 3 1.5 4.5 1.5s3-.5 4.5-1.5"/><path d="M8.5 14c1 .5 2 1 3.5 1s2.5-.5 3.5-1"/><line x1="10" y1="20" x2="14" y2="20"/></svg>;
    default: return null;
  }
};

export const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="flex justify-around py-3 px-7 border-t border-border/40">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path || (tab.path === "/arena" && location.pathname.startsWith("/arena"));
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
