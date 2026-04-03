import { Calendar, Clock } from "lucide-react";
import Avatar from "../ui/Avatar";

export default function LearnerUpcomingSessionCard({
  session,
  isSelected = false,
  onClick,
  showCancel = false,
  onCancel,
  isCancelling = false,
}) {
  if (!session) return null;

  const isClickable = typeof onClick === "function";
  const tutorObject = session.tutor || {};
  const tutorObjectName = String(tutorObject.name || "").trim();
  const fallbackTutorName = String(session.tutorName || "")
    .split(" - ")[0]
    .trim();
  const avatarPerson = {
    ...tutorObject,
    name:
      tutorObjectName && tutorObjectName.toLowerCase() !== "tutor"
        ? tutorObjectName
        : fallbackTutorName || "Tutor",
  };

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={[
        "w-full rounded-[22px] px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition",
        isClickable ? "cursor-pointer" : "",
        isSelected
          ? "bg-[#CFCFCF] border-[6px] border-[#355C9B] scale-[1.02] shadow-xl"
          : "bg-[#D9D9D9] border border-transparent hover:bg-[#D3D3D3]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* <img
          src={session.avatarSrc || "/avatar.png"}
          alt="Tutor"
          className="h-[58px] w-[58px] rounded-full object-cover"
        /> 
         */}
        <Avatar person={avatarPerson} size={50} />

        <div className="font-mono">
          
          {/* Tutor name */}
          <div className="text-[18px] font-extrabold text-black">
            {session.tutorName?.split(" - ")[0]}
          
          {/* Courses */}
          <div className="text-[14px] font-semibold text-black/70 mt-1">
            {session.tutorName?.split(" - ")[1]}
          </div>
        
        </div>

          <div className="mt-2 flex items-center gap-2 text-[15px] font-bold text-black">
            <span>★ {session.rating ?? "—"}</span>
            <span className="text-black/70 underline">
              ({session.reviews ?? "0 reviews"})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 font-mono text-[15px] font-bold text-black">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-black" />
          <span>{session.date || "—"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} className="text-black" />
          <span>{session.time || "—"}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center justify-center rounded-full bg-[#5C8354] px-4 py-2 text-[13px] font-medium text-white">
          <img
            src="/location_on.png"
            alt="location"
            className="h-[14px] w-[14px]"
          />
          {session.mode || "Online"}
        </div>

        <div className="inline-flex items-center justify-center rounded-full bg-[#3F5368] px-4 py-2 text-[13px] font-medium text-white">
          {session.sessionType === "GROUP"
            ? `Group · ${session.currentCount ?? 1}/${session.maxCapacity ?? 1}`
            : "One-on-one"}
        </div>

        {showCancel && (
          <div className="ml-auto flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isCancelling}
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.(session);
              }}
              className={[
                "rounded-full px-5 py-2 text-[14px] font-medium text-white shadow transition",
                isCancelling
                  ? "bg-red-300 cursor-not-allowed shadow-none"
                  : "bg-red-700 hover:bg-red-800",
              ].join(" ")}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
