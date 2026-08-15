import { useEffect, useRef, useState } from 'react';
import api from '@/lib/axios';
import { cacheData, getCachedData } from '@/lib/offlineQueue';

const STATUS_LABELS = {
  draft: 'Draft',
  coming_soon: 'Coming Soon',
  confirmed: 'Confirmed',
  passed: 'Passed',
  cancelled: 'Cancelled',
};

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600',
  coming_soon: 'bg-[#DDECF8] text-[#3D6BB4]',
  confirmed: 'bg-[#DDEFE7] text-[#2F765D]',
  passed: 'bg-[#E8EAED] text-[#5F6670]',
  cancelled: 'bg-[#F6E2E2] text-[#A34F4F]',
};

export default function EventPicker({ selectedEventId, onSelect }) {
  const [events, setEvents] = useState(
    getCachedData('events_admin_all') || []
  );

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    setLoading(true);

    api
      .get('/events/admin/all')
      .then(({ data }) => {
        setEvents(data.events);
        cacheData('events_admin_all', data.events);
      })
      .catch(() => {
        const cached = getCachedData('events_admin_all');

        if (cached) {
          setEvents(cached);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedEvent = events.find(
    (event) => event.id === Number(selectedEventId)
  );

  function handleSelect(event) {
    onSelect(event ? event.id : null);
    setOpen(false);
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#688BB0]">
          Event
        </label>

        {events.length > 0 && (
          <span className="text-[10px] text-slate-400">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
        )}
      </div>

      {/* Custom Dropdown */}
      <div
        ref={dropdownRef}
        className="relative w-full sm:max-w-[420px]"
      >
        {/* Trigger */}
        <button
          type="button"
          disabled={loading && events.length === 0}
          onClick={() => setOpen((prev) => !prev)}
          className="
            flex
            h-10
            w-full
            items-center
            justify-between
            gap-3
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            text-left
            text-xs
            font-medium
            text-[#1A2B48]
            shadow-sm
            outline-none
            transition-all
            duration-200
            hover:border-[#BBD5EA]
            focus:border-[#88B3D8]
            focus:ring-2
            focus:ring-[#3D6BB4]/10
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <span className="min-w-0 truncate">
            {loading && events.length === 0
              ? 'Loading events...'
              : selectedEvent
                ? selectedEvent.title
                : 'Select event...'}
          </span>

          <svg
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
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

        {/* Dropdown */}
        {open && (
          <div
            className="
              absolute
              left-0
              right-0
              top-[calc(100%+6px)]
              z-50
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              p-1
              shadow-[0_10px_30px_rgba(26,43,72,0.12)]
              sm:max-w-[420px]
            "
          >
            {/* Empty option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`
                flex
                w-full
                items-center
                rounded-lg
                px-3
                py-2.5
                text-left
                text-xs
                transition-colors
                ${
                  !selectedEventId
                    ? 'bg-[#EBF2F2] font-semibold text-[#1A2B48]'
                    : 'text-slate-500 hover:bg-slate-50'
                }
              `}
            >
              Select event...
            </button>

            {/* Events */}
            {events.map((event) => {
              const isSelected =
                Number(selectedEventId) === Number(event.id);

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleSelect(event)}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    transition-colors
                    ${
                      isSelected
                        ? 'bg-[#EBF2F2]'
                        : 'hover:bg-slate-50'
                    }
                  `}
                >
                  {/* Event name */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                        truncate
                        text-xs
                        ${
                          isSelected
                            ? 'font-semibold text-[#1A2B48]'
                            : 'font-medium text-slate-700'
                        }
                      `}
                    >
                      {event.title}
                    </p>
                  </div>

                  {/* Status */}
                  <span
                    className={`
                      shrink-0
                      rounded-full
                      px-2
                      py-1
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-wide
                      ${
                        STATUS_STYLES[event.status] ||
                        'bg-slate-100 text-slate-600'
                      }
                    `}
                  >
                    {STATUS_LABELS[event.status] || event.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Event */}
      {selectedEvent && (
        <div
          className="
            mt-2
            flex
            w-full
            max-w-[420px]
            items-center
            justify-between
            gap-3
            rounded-lg
            border
            border-slate-200/80
            bg-white
            px-3
            py-2
            shadow-sm
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3D6BB4]" />

            <div className="min-w-0">
              <p
                className="truncate text-xs font-semibold text-[#1A2B48]"
                title={selectedEvent.title}
              >
                {selectedEvent.title}
              </p>

              <p className="text-[9px] uppercase tracking-wide text-slate-400">
                Selected event
              </p>
            </div>
          </div>

          <span
            className={`
              shrink-0
              rounded-full
              px-2
              py-1
              text-[8px]
              font-semibold
              uppercase
              tracking-wide
              ${
                STATUS_STYLES[selectedEvent.status] ||
                'bg-slate-100 text-slate-600'
              }
            `}
          >
            {STATUS_LABELS[selectedEvent.status] || selectedEvent.status}
          </span>
        </div>
      )}

      {/* No events */}
      {!loading && events.length === 0 && (
        <div
          className="
            mt-2
            w-full
            max-w-[420px]
            rounded-lg
            border
            border-dashed
            border-slate-200
            bg-slate-50
            px-3
            py-3
          "
        >
          <p className="text-xs font-medium text-[#1A2B48]">
            No events available
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Create an event before selecting one.
          </p>
        </div>
      )}
    </div>
  );
}