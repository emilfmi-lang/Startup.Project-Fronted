import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Worker } from "@/types/models";
import { Plus, Trash2, Search, UserPlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Workers() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: workers = [], isLoading } = useQuery<Worker[]>({ queryKey: ["workers"], queryFn: api.getWorkers });

  const addMutation = useMutation({
    mutationFn: () => api.addWorker(fullName, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      setShowModal(false);
      setFullName("");
      setRole("");
      toast.success("İşçi uğurla əlavə edildi");
    },
    onError: () => toast.error("İşçi əlavə edilə bilmədi"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.deactivateWorker(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      setConfirmId(null);
      toast.success("İşçi deaktiv edildi");
    },
  });

  const filtered = workers.filter((w) => w.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Top */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İşçi axtar..."
            className="h-10 w-64 rounded-lg bg-card border border-border pl-9 pr-3 text-sm focus-ring"
          />
        </div>
        <button onClick={() => setShowModal(true)} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Yeni İşçi
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-left">
                <th className="px-5 py-3 font-medium">S/s</th>
                <th className="px-5 py-3 font-medium">Ad, Soyad</th>
                <th className="px-5 py-3 font-medium">Vəzifə</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Yaradılma tarixi</th>
                <th className="px-5 py-3 font-medium">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 w-20 bg-muted rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Hələ işçi əlavə edilməyib</p>
                    <button onClick={() => setShowModal(true)} className="mt-3 text-primary text-sm font-medium hover:underline">İlk işçini əlavə et</button>
                  </td>
                </tr>
              ) : (
                filtered.map((w, i) => (
                  <tr key={w.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3 tabular-nums">{i + 1}</td>
                    <td className="px-5 py-3 font-medium">{w.fullName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{w.role}</td>
                    <td className="px-5 py-3">
                      {w.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">Aktiv</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">Deaktiv</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground tabular-nums">{new Date(w.createdAt).toLocaleDateString("az-AZ")}</td>
                    <td className="px-5 py-3">
                      {w.isActive && (
                        confirmId === w.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => deactivateMutation.mutate(w.id)} className="text-xs px-3 py-1 rounded bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90">Bəli</button>
                            <button onClick={() => setConfirmId(null)} className="text-xs px-3 py-1 rounded bg-muted text-muted-foreground font-medium">Xeyr</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(w.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Deaktiv etmək istəyirsiniz?">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Yeni İşçi Əlavə Et</h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ad, Soyad</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Məsələn: Emil Mirzəyev" className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Vəzifə</label>
                  <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Məsələn: Usta, Fəhlə, Mühəndis" className="w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus-ring" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-border text-muted-foreground font-medium hover:bg-muted transition-colors">Ləğv et</button>
                <button onClick={() => addMutation.mutate()} disabled={!fullName || !role} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">Əlavə et</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
