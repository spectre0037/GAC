import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function EventPicker({ selectedEventId, onSelect }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events/admin/all").then(({ data }) => setEvents(data.events));
  }, []);

  const selectedEvent = events.find(
    (event) => event.id === Number(selectedEventId),
  );

  return (
    <div className="w-full">
      {/* Label */}
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Event
      </label>

      {/* Picker */}
      <div className="relative">
        <select
          className="w-full appearance-none border-0 bg-transparent px-3 py-2 text-xs font-medium text-[#1A2B48] outline-none"
          value={selectedEventId || ""}
          onChange={(e) => onSelect(Number(e.target.value))}
        >
          <option value="">Select an event...</option>

          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} ({event.status})
            </option>
          ))}
        </select>

        {/* Custom arrow */}
        <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Selected event information */}
      {selectedEvent && (
        <div className="mt-3 flex items-center justify-between rounded-[20px] border border-slate-200/70 bg-slate-50/70 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[#0B1F3A]">
              {selectedEvent.title}
            </p>

            <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-400">
              Selected event
            </p>
          </div>

          <span
            className={`ml-3 shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
              selectedEvent.status === "confirmed"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {selectedEvent.status?.replace("_", " ")}
          </span>
        </div>
      )}
    </div>
  );
}
