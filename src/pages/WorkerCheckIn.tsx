import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Worker, AttendanceRecord } from "@/types/models";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-500/20 text-blue-400",
    "bg-emerald-500/20 text-emerald-400",
    "bg-amber-500/20 text-amber-400",
    "bg-rose-500/20 text-rose-400",
    "bg-violet-500/20 text-violet-400",
    "bg-cyan-500/20 text-cyan-400",
  ];
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
}

export default function WorkerCheckIn() {
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: workers = [] } = useQuery<Worker[]>({ queryKey: ["workers"], queryFn: api.getWorkers });
  const { data: attendance = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["attendance-today"],
    queryFn: api.getTodayAttendance,
    refetchInterval: 5000,
  });

  const activeWorkers = workers
    .filter((w) => w.isActive)
    .filter((w) => w.fullName.toLowerCase().includes(search.toLowerCase()));

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
        toast.success(`${name} — Çıxış qeyd edildi (${now})`);
      } else if (result.includes("already")) {
        toast.info(`${name} — Çıxış artıq qeyd edilib`);
      } else {
        toast.error("Çıxış qeyd etmək üçün minimum 3 saat keçməlidir");
      }
      setLoadingId(null);
    },
    onError: () => {
      toast.error("Xəta baş verdi");
      setLoadingId(null);
    },
  });

  const now = new Date();
  const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="min-h-screen bg-background dot-pattern">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SC</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">ShiftCore</h1>
              <p className="text-xs text-muted-foreground">{dateStr}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">Giriş / Çıxış Paneli</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Adınızı axtarın..."
            className="w-full h-12 rounded-xl bg-card border border-border pl-10 pr-4 text-sm focus-ring"
          />
        </div>

        {/* Instruction */}
        <p className="text-sm text-muted-foreground">
          Adınızı tapın və <strong className="text-success">Giriş</strong> və ya <strong className="text-warning">Çıxış</strong> düyməsini basın.
        </p>

        {/* Worker Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeWorkers.map((worker) => {
            const record = attendance.find((a) => a.workerId === worker.id);
            const hasEntry = !!record?.entryTime;
            const hasExit = !!record?.exitTime;
            const isLoading = loadingId === worker.id;

            return (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                className={`rounded-xl bg-card border p-5 transition-all ${
                  hasEntry && !hasExit
                    ? "border-l-4 border-l-success border-t border-r border-b border-t-border border-r-border border-b-border"
                    : hasExit
                    ? "border-l-4 border-l-muted border-t border-r border-b border-t-border border-r-border border-b-border"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-base font-bold ${getAvatarColor(worker.fullName)}`}>
                    {getInitials(worker.fullName)}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{worker.fullName}</p>
                    <p className="text-xs text-muted-foreground">{worker.role}</p>
                  </div>
                </div>

                {hasEntry && (
                  <div className="text-xs mb-3 flex gap-3">
                    <span className="text-success">Giriş: {formatTime(record!.entryTime)}</span>
                    {hasExit && <span className="text-warning">Çıxış: {formatTime(record!.exitTime)}</span>}
                  </div>
                )}

                {hasExit ? (
                  <div className="h-14 rounded-lg bg-muted/20 flex items-center justify-center text-sm text-muted-foreground font-medium">
                    Tamamlandı ✓
                  </div>
                ) : (
                  <button
                    onClick={() => toggleMutation.mutate(worker.id)}
                    disabled={isLoading}
                    className={`w-full h-14 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-colors ${
                      hasEntry
                        ? "bg-warning text-warning-foreground hover:bg-warning/90"
                        : "bg-success text-success-foreground hover:bg-success/90"
                    }`}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : hasEntry ? "Çıxış" : "Giriş"}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {activeWorkers.length === 0 && !search && (
          <div className="text-center py-20 text-muted-foreground">İşçi tapılmadı.</div>
        )}
        {activeWorkers.length === 0 && search && (
          <div className="text-center py-20 text-muted-foreground">"{search}" ilə işçi tapılmadı.</div>
        )}
      </div>
    </div>
  );
}
