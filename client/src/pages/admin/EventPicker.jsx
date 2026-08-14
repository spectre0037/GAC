import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";

export default function EventPicker({ selectedEventId, onSelect }) {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const pickerRef = useRef(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data } = await api.get("/events/admin/all");
        setEvents(data.events || []);
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* Close dropdown with Escape */
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedEvent = events.find(
    (event) => event.id === Number(selectedEventId)
  );

  function handleSelect(event) {
    onSelect(Number(event.id));
    setOpen(false);
  }

  function getStatusStyle(status) {
    switch (status) {
      case "confirmed":
        return {
          wrapper:
            "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
          dot: "bg-emerald-500",
        };

      case "coming_soon":
        return {
          wrapper:
            "bg-amber-50 text-amber-700 ring-amber-200/70",
          dot: "bg-amber-500",
        };

      case "cancelled":
        return {
          wrapper: "bg-red-50 text-red-700 ring-red-200/70",
          dot: "bg-red-500",
        };

      default:
        return {
          wrapper:
            "bg-slate-50 text-slate-600 ring-slate-200/70",
          dot: "bg-slate-400",
        };
    }
  }

  return (
    <div ref={pickerRef} className="w-full">
      {/* =====================================================
          LABEL
      ====================================================== */}

      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Event
      </label>

      {/* =====================================================
          DROPDOWN
      ====================================================== */}

      <div className="relative">
        <button
          type="button"
          onClick={() => !loading && setOpen((prev) => !prev)}
          disabled={loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="
            flex
            h-12
            w-full
            items-center
            justify-between
            gap-3
            rounded-xl
            border
            border-slate-200/70
            bg-[#F4F7F7]
            px-4
            text-left
            text-sm
            text-[#1A2B48]
            shadow-none
            outline-none
            transition-all
            duration-200
            hover:border-slate-300
            hover:bg-white
            focus:ring-4
            focus:ring-[#3D6BB4]/10
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <span
            className={`min-w-0 truncate ${
              selectedEvent
                ? "font-medium text-[#1A2B48]"
                : "text-slate-400"
            }`}
          >
            {loading
              ? "Loading events..."
              : selectedEvent
                ? selectedEvent.title
                : "Select an event..."}
          </span>

          {/* Arrow */}
          <svg
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* =================================================
            CUSTOM MENU
        ================================================== */}

        {open && (
          <div
            role="listbox"
            className="
              absolute
              left-0
              right-0
              z-50
              mt-2
              max-h-64
              overflow-y-auto
              overscroll-contain
              rounded-xl
              border
              border-slate-200/80
              bg-white
              p-1.5
              shadow-xl
              ring-1
              ring-black/5
            "
          >
            {/* Empty state */}
            {events.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No events available
              </div>
            ) : (
              events.map((event) => {
                const isSelected =
                  Number(selectedEventId) === Number(event.id);

                const statusStyle = getStatusStyle(event.status);

                return (
                  <button
                    key={event.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(event)}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-3
                      rounded-lg
                      px-3
                      py-3
                      text-left
                      transition-colors
                      duration-150
                      ${
                        isSelected
                          ? "bg-[#EBF2F2]"
                          : "hover:bg-[#F4F7F7]"
                      }
                    `}
                  >
                    {/* Event name */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`
                          truncate
                          text-sm
                          ${
                            isSelected
                              ? "font-semibold text-[#1A2B48]"
                              : "font-medium text-slate-700"
                          }
                        `}
                      >
                        {event.title}
                      </p>

                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-slate-400">
                        Adventure
                      </p>
                    </div>

                    {/* Status */}
                    <span
                      className={`
                        flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        px-2.5
                        py-1
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        ring-1
                        ${statusStyle.wrapper}
                      `}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                      />

                      {event.status?.replaceAll("_", " ")}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          SELECTED EVENT
      ====================================================== */}

      {selectedEvent && (
        <div className="mt-3 flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#1A2B48]">
              {selectedEvent.title}
            </p>

            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Selected adventure
            </p>
          </div>

          {(() => {
            const statusStyle = getStatusStyle(
              selectedEvent.status
            );

            return (
              <span
                className={`
                  flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  px-2.5
                  py-1.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  ring-1
                  ${statusStyle.wrapper}
                `}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                />

                {selectedEvent.status?.replaceAll("_", " ")}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}