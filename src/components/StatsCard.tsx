import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  glowClass?: string;
}

export function StatsCard({ label, value, icon, glowClass }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl bg-card border border-border p-5 flex items-center gap-4",
        glowClass
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
      </div>
    </motion.div>
  );
}
