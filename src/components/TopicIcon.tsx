interface TopicIconProps { icon: string; className?: string; }

export const TopicIcon = ({ icon, className = "w-9 h-9" }: TopicIconProps) => {
  const props = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "eagle": return <svg {...props}><path d="M12 3l-3 3h2v3h2V6h2z"/><path d="M7 9c-3 2-4 4-4 6h4"/><path d="M17 9c3 2 4 4 4 6h-4"/><path d="M7 15l-1 4h3l1-2"/><path d="M17 15l1 4h-3l-1-2"/><line x1="10" y1="19" x2="14" y2="19"/><line x1="12" y1="12" x2="12" y2="16"/></svg>;
    case "laurel": return <svg {...props}><path d="M12 21V5"/><path d="M12 8c-2-2-5-2-7 0 2 0 5 1 7 3"/><path d="M12 8c2-2 5-2 7 0-2 0-5 1-7 3"/><path d="M12 14c-1.5-1.5-4-1.5-5.5 0 1.5 0 3.5.5 5.5 2"/><path d="M12 14c1.5-1.5 4-1.5 5.5 0-1.5 0-3.5.5-5.5 2"/></svg>;
    case "shield": return <svg {...props}><path d="M12 2C8 2 5 3 5 3v10c0 4 7 9 7 9s7-5 7-9V3s-3-1-7-1z"/><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="8" x2="19" y2="8"/><line x1="5" y1="13" x2="19" y2="13"/></svg>;
    case "skull": return <svg {...props}><circle cx="12" cy="10" r="7"/><circle cx="9.5" cy="9" r="1.5"/><circle cx="14.5" cy="9" r="1.5"/><path d="M9 14c1.5 1.5 4.5 1.5 6 0"/><line x1="8" y1="17" x2="9" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="16" y1="17" x2="15" y2="21"/></svg>;
    case "chain": return <svg {...props}><ellipse cx="7" cy="12" rx="3.5" ry="5"/><ellipse cx="17" cy="12" rx="3.5" ry="5"/><line x1="10" y1="9" x2="11.5" y2="6"/><line x1="14" y1="9" x2="12.5" y2="6"/><line x1="10" y1="15" x2="11.5" y2="18"/><line x1="14" y1="15" x2="12.5" y2="18"/></svg>;
    case "scales": return <svg {...props}><line x1="12" y1="3" x2="12" y2="21"/><line x1="4" y1="7" x2="20" y2="7"/><circle cx="12" cy="4" r="1.5"/><path d="M4 7l-1 7c0 1.5 1 2.5 3 2.5s3-1 3-2.5l-1-7"/><path d="M16 7l-1 7c0 1.5 1 2.5 3 2.5s3-1 3-2.5l-1-7"/><line x1="9" y1="21" x2="15" y2="21"/></svg>;
    default: return null;
  }
};
