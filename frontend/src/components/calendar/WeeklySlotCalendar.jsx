import { useMemo, useState } from "react";

/**
 * WeeklySlotCalendar (extracted from AvailabilityV2 "Generated Session Slots")
 *
 * Props:
 * - slotsByDayKey: { SUNDAY: [{id,label,...}], MONDAY: [...], ... }  (same shape as previewSlots)
 * - selectedDayKey: string (e.g., "MONDAY")
 * - onSelectDayKey: (dayKey: string) => void
 * - selectedSlotId: string | null
 * - onSelectSlotId: (slotId: string | null) => void
 * - minBodyHeight: number (default 220)
 * - onSlotClick: optional (slot, columnMeta) => void  // useful for Booking later
 */
export default function WeeklySlotCalendar({
  slotsByDayKey = {},
  selectedDayKey,
  onSelectDayKey,
  selectedSlotId,
  onSelectSlotId,
  minBodyHeight = 220,
  onSlotClick,
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  const baseWeekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay(); // 0=Sun ... 6=Sat
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const WeekColumns = useMemo(() => {
    const start = new Date(baseWeekStart);
    start.setDate(start.getDate() + weekOffset * 7);

    const labels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const keys = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    return keys.map((key, i) => {
      const dt = new Date(start);
      dt.setDate(start.getDate() + i);
      return {
        key,
        label: labels[i],
        date: dt,
        dayNum: dt.getDate(),
        month: dt.getMonth(),
        year: dt.getFullYear(),
      };
    });
  }, [baseWeekStart, weekOffset]);

  const monthLabel = useMemo(() => {
    const dt = WeekColumns[0]?.date;
    if (!dt) return "";
    return dt.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [WeekColumns]);

  const weekRangeLabel = useMemo(() => {
    if (!WeekColumns.length) return "";
    const a = WeekColumns[0].date;
    const b = WeekColumns[6].date;
    const opts = { month: "short", day: "numeric" };
    return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString(
      "en-US",
      opts
    )}`;
  }, [WeekColumns]);

  const goPrevWeek = () => setWeekOffset((w) => w - 1);
  const goNextWeek = () => setWeekOffset((w) => w + 1);

  const handleSelectDay = (dayKey) => {
    onSelectDayKey?.(dayKey);
  };

  return (
    <div>
      {/* Week Navigation (same as AvailabilityV2) */}
      <div className="flex items-center justify-between mb-3 mt-4">
        <button type="button" onClick={goPrevWeek} className="text-[16px] font-bold">
          &lt; Previous Week
        </button>

        <div className="flex flex-col items-center">
          <div className="text-[20px] font-bold text-center font-mono text-black/70">
            {monthLabel}
          </div>
          <div className="text-[16px] text-black/50 font-semibold font-mono text-center">
            {weekRangeLabel}
          </div>
        </div>

        <button type="button" onClick={goNextWeek} className="text-[16px] font-bold">
          Next Week &gt;
        </button>
      </div>

      {/* 7-day grid (same as AvailabilityV2) */}
      <div className="mt-6 rounded-[14px] bg-white border border-black/10 overflow-hidden">
        <div className="grid grid-cols-7">
          {WeekColumns.map((c) => (
            <div key={c.key} className="border-r border-black/10 last:border-r-0">
              <div className="px-4 pt-4 pb-3 text-center">
                <button
                  type="button"
                  onClick={() => handleSelectDay(c.key)}
                  className={[
                    "mx-auto text-[16px] font-bold transition-colors",
                    selectedDayKey === c.key
                      ? "text-[#C00000]"
                      : "text-black/40 hover:text-black/70",
                  ].join(" ")}
                >
                  {c.label}
                </button>

                <div
                  className={[
                    "mx-auto mt-2 h-9 w-9 rounded-full flex items-center justify-center text-[24px] font-bold",
                    selectedDayKey === c.key
                      ? "bg-[#0B2F86] text-white"
                      : "text-black/70",
                  ].join(" ")}
                >
                  {c.dayNum}
                </div>
              </div>

              <div
                className="px-3 pb-4 space-y-3"
                style={{ minHeight: `${minBodyHeight}px` }}
              >
                {(slotsByDayKey[c.key] || [])
                  .filter((s) => {

                    if (s.raw && s.raw.date) {
                      const colDateStr = `${c.year}-${String(c.month + 1).padStart(2, '0')}-${String(c.dayNum).padStart(2, '0')}`;
                      return s.raw.date === colDateStr;
                    }
                    return true; 
                  })
                  .map((s) => {
                    const active = s.id === selectedSlotId;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          handleSelectDay(c.key);
                          onSelectSlotId?.(active ? null : s.id);
                          onSlotClick?.(s, c);
                        }}
                        className={[
                          "w-full rounded-full px-3 py-2 text-center text-[12px] font-extrabold shadow-sm",
                          active
                            ? "bg-black/20 text-black"
                            : "bg-black/10 text-black/70 hover:bg-black/15",
                        ].join(" ")}
                      >
                        {s.label}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
