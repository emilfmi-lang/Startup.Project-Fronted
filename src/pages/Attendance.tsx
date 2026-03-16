import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Worker, AttendanceRecord } from "@/types/models";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = ["bg-primary/20 text-primary", "bg-success/20 text-success", "bg-warning/20 text-warning", "bg-destructive/20 text-destructive"];
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
}

export default function Attendance() {
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: workers = [] } = useQuery<Worker[]>({ queryKey: ["workers"], queryFn: api.getWorkers });
  const { data: attendance = [] } = useQuery<AttendanceRecord[]>({ queryKey: ["attendance-today"], queryFn: api.getTodayAttendance, refetchInterval: 5000 });

  const activeWorkers = workers.filter((w) => w.isActive);
  const checkedIn = attendance.filter((a) => a.entryTime);
  const checkedOut = attendance.filter((a) => a.exitTime);
  const onSite = checkedIn.length - checkedOut.length;

  const toggleMutation = useMutation({
    mutationFn: (workerId: string) => {
      setLoadingId(workerId);
      return api.toggleAttendance(workerId);
    },
    onSuccess: (result, workerId) => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      const worker = workers.find((w) => w.id === workerId);
      const name = worker?.fullName || "";
      const now = new Date().toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });

      if (result.includes("Entry")) {
        toast.success(`${name} — Giriş qeyd edildi (${now})`);
      } else if (result.includes("Exit recorded")) {
        toast.success(`${name} — Çıxış qeyd edildi (${now})`, { className: "!bg-warning/10 !border-warning/20" });
      } else if (result.includes("already")) {
        toast.info(`${name} — Çıxış artıq qeyd edilib`);
      } else if (result.includes("minimum") || result.includes("hour") || result.includes("saniyə")) {
        toast.error("Çıxış qeyd etmək üçün minimum 3 saat keçməlidir");
      }
      setLoadingId(null);
    },
    onError: (error) => {
      toast.error("Xəta baş verdi: " + (error as Error).message);
      setLoadingId(null);
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>Giriş edən: <strong>{checkedIn.length}/{activeWorkers.length}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-warning" />
          <span>Çıxış edən: <strong>{checkedOut.length}/{activeWorkers.length}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span>Sahədə olan: <strong>{onSite}</strong></span>
        </div>
      </div>

      {/* Worker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeWorkers.map((worker) => {
          const record = attendance.find((a) => a.workerId === worker.id);
          const hasEntry = !!record?.entryTime;
          const hasExit = !!record?.exitTime;
          const isLoading = loadingId === worker.id;

          let borderClass = "border-border";
          if (hasEntry && !hasExit) borderClass = "border-l-4 border-l-success border-t border-r border-b border-border";
          else if (hasExit) borderClass = "border-l-4 border-l-muted border-t border-r border-b border-border";

          return (
            <motion.div
              key={worker.id}
              whileTap={{ scale: 0.97 }}
              className={`rounded-xl bg-card p-5 ${borderClass} transition-all`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(worker.fullName)}`}>
                  {getInitials(worker.fullName)}
                </div>
                <div>
                  <p className="font-semibold">{worker.fullName}</p>
                  <p className="text-xs text-muted-foreground">{worker.role}</p>
                </div>
              </div>

              {hasEntry && (
                <div className="text-xs mb-3 space-x-3">
                  <span className="text-success">Giriş: {formatTime(record!.entryTime)}</span>
                  {hasExit && <span className="text-warning">Çıxış: {formatTime(record!.exitTime)}</span>}
                </div>
              )}

              {hasExit ? (
                <div className="h-12 rounded-lg bg-muted/30 flex items-center justify-center text-sm text-muted-foreground font-medium">
                  Tamamlandı ✓
                </div>
              ) : (
                <button
                  onClick={() => toggleMutation.mutate(worker.id)}
                  disabled={isLoading}
                  className={`w-full h-12 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    hasEntry
                      ? "bg-warning text-warning-foreground hover:bg-warning/90"
                      : "bg-success text-success-foreground hover:bg-success/90"
                  }`}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : hasEntry ? "Çıxış" : "Giriş"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {activeWorkers.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>Aktiv işçi tapılmadı.</p>
        </div>
      )}
    </motion.div>
  );
}
