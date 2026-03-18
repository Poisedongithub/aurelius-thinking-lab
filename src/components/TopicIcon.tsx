interface TopicIconProps { icon: string; className?: string; }

export const TopicIcon = ({ icon, className = "w-9 h-9" }: TopicIconProps) => {
  const props = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "eagle": return (
      <svg {...props}>
        <path d="M12 6c0-1.5.5-3 2-4 0 1.5-.5 3-2 4z" />
        <path d="M12 6c0-1.5-.5-3-2-4 0 1.5.5 3 2 4z" />
        <path d="M12 6v4" />
        <path d="M12 10c-2 0-4 1-5 3l-4 2 3-1c1 2 3 3 6 3s5-1 6-3l3 1-4-2c-1-2-3-3-5-3z" />
        <path d="M9 16l-1 4" />
        <path d="M15 16l1 4" />
        <line x1="8" y1="20" x2="16" y2="20" />
      </svg>
    );
    case "laurel": return (
      <svg {...props}>
        <path d="M8 21c0-4 0-8 4-16" />
        <path d="M16 21c0-4 0-8-4-16" />
        <path d="M7 18c-2-1-3-3-3-5 2 0 3.5 1.5 4 4" />
        <path d="M17 18c2-1 3-3 3-5-2 0-3.5 1.5-4 4" />
        <path d="M7.5 14c-2.5-.5-4-2.5-4-4.5 2-.5 4 .5 5 3" />
        <path d="M16.5 14c2.5-.5 4-2.5 4-4.5-2-.5-4 .5-5 3" />
        <path d="M9 10c-2-1.5-2.5-4-2-6 2 .5 3 2.5 3 5" />
        <path d="M15 10c2-1.5 2.5-4 2-6-2 .5-3 2.5-3 5" />
        <circle cx="12" cy="4" r="1" />
      </svg>
    );
    case "shield": return (
      <svg {...props}>
        <path d="M12 2L4 5v6c0 5.5 3.5 10 8 12 4.5-2 8-6.5 8-12V5l-8-3z" />
        <path d="M12 2v20" />
        <path d="M4 9h16" />
        <path d="M8 13l4 4 4-4" />
      </svg>
    );
    case "skull": return (
      <svg {...props}>
        <path d="M12 3C7.5 3 4 6.5 4 10.5c0 2.5 1 4.5 3 6v2.5h10v-2.5c2-1.5 3-3.5 3-6C20 6.5 16.5 3 12 3z" />
        <circle cx="9" cy="10" r="1.5" />
        <circle cx="15" cy="10" r="1.5" />
        <path d="M10 15c.7.7 1.3 1 2 1s1.3-.3 2-1" />
        <line x1="9" y1="19" x2="9" y2="21" />
        <line x1="12" y1="19" x2="12" y2="21" />
        <line x1="15" y1="19" x2="15" y2="21" />
      </svg>
    );
    case "chain": return (
      <svg {...props}>
        <rect x="2" y="8" width="7" height="4" rx="2" />
        <rect x="15" y="12" width="7" height="4" rx="2" />
        <path d="M9 10l2-2" />
        <path d="M13 14l2-2" />
        <path d="M10.5 7l1-1.5" />
        <path d="M12.5 18.5l1-1.5" />
        <line x1="11" y1="9" x2="13" y2="13" strokeDasharray="1.5 1.5" />
      </svg>
    );
    case "scales": return (
      <svg {...props}>
        <line x1="12" y1="2" x2="12" y2="21" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <circle cx="12" cy="3" r="1.5" />
        <path d="M3 6l1.5 8c0 1.5 1.5 2.5 3.5 2.5s3.5-1 3.5-2.5L13 6" />
        <path d="M11 6l1.5 8c0 1.5 1.5 2.5 3.5 2.5s3.5-1 3.5-2.5L21 6" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </svg>
    );
    default: return null;
  }
};
