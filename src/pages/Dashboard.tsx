import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Worker, AttendanceRecord } from "@/types/models";
import { StatsCard } from "@/components/StatsCard";
import { Users, UserCheck, LogIn, LogOut, Download, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function formatTime(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
}

export default function Dashboard() {
  const { data: workers = [] } = useQuery<Worker[]>({ queryKey: ["workers"], queryFn: api.getWorkers });
  const { data: attendance = [] } = useQuery<AttendanceRecord[]>({ queryKey: ["attendance-today"], queryFn: api.getTodayAttendance });

  const activeWorkers = workers.filter((w) => w.isActive);
  const checkedIn = attendance.filter((a) => a.entryTime);
  const checkedOut = attendance.filter((a) => a.exitTime);

  const recentEvents = attendance
    .flatMap((a) => {
      const worker = workers.find((w) => w.id === a.workerId);
      const name = worker?.fullName || "Naməlum";
      const events = [];
      if (a.entryTime) events.push({ name, type: "Giriş" as const, time: a.entryTime });
      if (a.exitTime) events.push({ name, type: "Çıxış" as const, time: a.exitTime });
      return events;
    })
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Ümumi İşçilər" value={workers.length} glowClass="stat-glow-blue" icon={<Users className="h-8 w-8 text-primary" />} />
        <StatsCard label="Aktiv İşçilər" value={activeWorkers.length} glowClass="stat-glow-green" icon={<UserCheck className="h-8 w-8 text-success" />} />
        <StatsCard label="Bu gün giriş edən" value={checkedIn.length} glowClass="stat-glow-green" icon={<LogIn className="h-8 w-8 text-success" />} />
        <StatsCard label="Bu gün çıxış edən" value={checkedOut.length} glowClass="stat-glow-amber" icon={<LogOut className="h-8 w-8 text-warning" />} />
      </div>

      {/* Today's Attendance Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Bugünkü Davamiyyət</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-left">
                <th className="px-5 py-3 font-medium">S/s</th>
                <th className="px-5 py-3 font-medium">Ad, Soyad</th>
                <th className="px-5 py-3 font-medium">Vəzifə</th>
                <th className="px-5 py-3 font-medium">Giriş vaxtı</th>
                <th className="px-5 py-3 font-medium">Çıxış vaxtı</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">Bugün hələ heç bir davamiyyət qeydə alınmayıb.</td>
                </tr>
              ) : (
                attendance.map((a, i) => {
                  const worker = workers.find((w) => w.id === a.workerId);
                  const onSite = a.entryTime && !a.exitTime;
                  return (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 tabular-nums">{i + 1}</td>
                      <td className="px-5 py-3 font-medium">{worker?.fullName || "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{worker?.role || "—"}</td>
                      <td className="px-5 py-3 text-success tabular-nums">{formatTime(a.entryTime)}</td>
                      <td className="px-5 py-3 text-warning tabular-nums">{formatTime(a.exitTime)}</td>
                      <td className="px-5 py-3">
                        {onSite ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">Sahədə</span>
                        ) : a.exitTime ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-border">Çıxıb</span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Events */}
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-semibold mb-4">Son Girişlər</h3>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Hələ heç bir hadisə yoxdur.</p>
            ) : (
              recentEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`h-2 w-2 rounded-full ${e.type === "Giriş" ? "bg-success" : "bg-warning"}`} />
                  <span className="font-medium">{e.name}</span>
                  <span className="text-muted-foreground">— {e.type} {formatTime(e.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="font-semibold mb-4">Sürətli Əməliyyat</h3>
          <div className="space-y-3">
            <button onClick={() => api.exportAttendance()} className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              <Download className="h-4 w-4" />
              Excel-ə Yüklə
            </button>
            <Link to="/workers" className="w-full h-12 rounded-lg border border-success text-success font-semibold flex items-center justify-center gap-2 hover:bg-success/10 transition-colors">
              <UserPlus className="h-4 w-4" />
              İşçi Əlavə Et
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
