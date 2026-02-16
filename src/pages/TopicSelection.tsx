import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { topics, philosophers } from "@/lib/philosophers";
import { TopicIcon } from "@/components/TopicIcon";
import { TabBar } from "@/components/TabBar";
import { ArrowLeft } from "lucide-react";

const TopicSelection = () => {
  const navigate = useNavigate();
  const { philosopherId } = useParams();
  const philosopher = philosophers.find((p) => p.id === philosopherId);

  return (
    <div className="phone-container min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-[400px] h-[400px] bg-radial-[at_center] from-foreground/3 to-transparent pointer-events-none" />
      <button onClick={() => navigate("/arena")} className="p-7 pb-0 text-foreground/50 relative z-10"><ArrowLeft className="w-5 h-5" /></button>
      <div className="px-7 pt-3 pb-6 relative z-10">
        <h2 className="font-serif text-[28px] text-foreground">Choose Your Arena</h2>
        <p className="text-xs text-foreground/35 font-light">{philosopher ? `Debating ${philosopher.name}` : "What will you defend today"}</p>
      </div>
      <div className="flex-1 px-7 grid grid-cols-2 gap-3 content-start relative z-10 pb-4">
        {topics.map((topic, i) => (
          <motion.button key={topic.id} onClick={() => navigate(`/arena/arenas/${philosopherId}/${topic.id}`)}
            className="aspect-square glass-card rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all hover:bg-card/60 hover:border-border text-foreground/55"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.06 }}>
            <TopicIcon icon={topic.icon} />
            <h4 className="font-serif text-[17px] text-foreground">{topic.name}</h4>
            <span className="text-[10px] text-foreground/30 uppercase tracking-[0.1em]">{topic.subtitle}</span>
          </motion.button>
        ))}
      </div>
      <TabBar />
    </div>
  );
};

export default TopicSelection;
