import { Worker, AttendanceRecord } from "@/types/models";

const BASE_URL = "http://localhost:5119";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getWorkers: () => fetchJson<Worker[]>("/api/Worker"),

  addWorker: (fullName: string, role: string) =>
    fetchJson<Worker>(`/api/Worker?fullName=${encodeURIComponent(fullName)}&role=${encodeURIComponent(role)}`, {
      method: "POST",
    }),

  deactivateWorker: (id: string) =>
    fetch(`${BASE_URL}/api/Worker/${id}`, { method: "DELETE" }),

  exportWorkers: () => {
    window.open(`${BASE_URL}/api/Worker/export`, "_blank");
  },

  toggleAttendance: async (workerId: string): Promise<string> => {
    const res = await fetch(`${BASE_URL}/api/Attendance/${workerId}`, { method: "POST" });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.text();
  },

  getTodayAttendance: () => fetchJson<AttendanceRecord[]>("/api/Attendance/today"),

  exportAttendance: () => {
    window.open(`${BASE_URL}/api/Attendance/export`, "_blank");
  },
};
