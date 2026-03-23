/** Pad number to 2 digits */
function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * Combine Java LocalDate + LocalTime shapes from Spring JSON into a JS Date.
 * Supports string "2025-10-25", array [y,m,d], time "10:00:00" or [h,m,s].
 */
export function combineLocalDateAndTime(dateVal, timeVal) {
  const ds = normalizeLocalDateString(dateVal);
  const ts = normalizeLocalTimeString(timeVal);
  if (!ds || !ts) return null;
  const d = new Date(`${ds}T${ts}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeLocalDateString(d) {
  if (d == null) return null;
  if (typeof d === "string") {
    const base = d.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(base)) return base;
  }
  if (Array.isArray(d) && d.length >= 3) {
    return `${d[0]}-${pad2(d[1])}-${pad2(d[2])}`;
  }
  return null;
}

function normalizeLocalTimeString(t) {
  if (t == null) return null;
  if (typeof t === "string") {
    if (t.includes("T")) {
      const d = new Date(t);
      return Number.isNaN(d.getTime()) ? null : t;
    }
    if (t.includes(":")) {
      const parts = t.split(":");
      if (parts.length === 2) return `${pad2(parts[0])}:${pad2(parts[1])}:00`;
      if (parts.length >= 3) return `${pad2(parts[0])}:${pad2(parts[1])}:${pad2(parts[2].slice(0, 2))}`;
    }
  }
  if (Array.isArray(t) && t.length >= 2) {
    const h = t[0];
    const m = t[1];
    const s = t[2] ?? 0;
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }
  return null;
}

/**
 * AvailabilitySlot from GET /api/availability/tutor/{id}/all — date + startTime fields.
 */
export function getSlotStartInstant(slot) {
  if (!slot) return null;
  if (
    slot.startTime &&
    typeof slot.startTime === "string" &&
    (slot.startTime.includes("T") || slot.startTime.length > 12)
  ) {
    const d = new Date(slot.startTime);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return combineLocalDateAndTime(slot.date, slot.startTime);
}

/**
 * BookingResponseDTO from GET /api/availability/learner/{id}/bookings
 */
export function getBookingStartInstant(booking) {
  if (!booking) return null;
  return combineLocalDateAndTime(booking.date, booking.startTime);
}

