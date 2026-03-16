import { motion } from "framer-motion";
import { Download, FileSpreadsheet } from "lucide-react";
import { api } from "@/services/api";

export default function Reports() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Export */}
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Bugünkü Davamiyyət</h3>
              <p className="text-sm text-muted-foreground">Bugünkü davamiyyət məlumatlarını Excel formatında yükləyin</p>
            </div>
          </div>
          <button
            onClick={() => api.exportAttendance()}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Excel-ə Yüklə
          </button>
        </div>

        {/* Workers Export */}
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">İşçi Siyahısı</h3>
              <p className="text-sm text-muted-foreground">Bütün işçilərin siyahısını Excel formatında yükləyin</p>
            </div>
          </div>
          <button
            onClick={() => api.exportWorkers()}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Excel-ə Yüklə
          </button>
        </div>
      </div>
    </motion.div>
  );
}
