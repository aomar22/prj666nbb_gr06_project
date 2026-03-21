import { useEffect } from "react";

export default function LeaveReviewModal({ open, onClose, tutor,tutorAvatarUrl, children }) {
  const tutorName =
    [tutor?.firstName, tutor?.lastName].filter(Boolean).join(" ") || "Tutor";
    const getInitials = () => {
    const first = tutor?.firstName?.[0] || "";
    const last = tutor?.lastName?.[0] || "";
    return (first + last).toUpperCase() || "T";
    };

    const profileImage =
    tutor?.profileImageUrl ||
    tutor?.profilePicture ||
    tutor?.avatar ||
    tutorAvatarUrl ||
    null;
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50 px-6
      "
      onClick={onClose}
    >
      <div
        className="
          relative
          w-full max-w-[560px]
          rounded-2xl
          bg-white
          p-8
          shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="
            absolute right-4 top-4
            flex h-9 w-9 items-center justify-center
            rounded-full
            bg-gray-100
            text-xl text-gray-700
            hover:bg-gray-200
          "
        >
          ×
        </button>

        <div
          className="
            mb-6
            flex items-center gap-4
          "
        >
          <div
            className="
              h-[70px] w-[70px]
              shrink-0 overflow-hidden rounded-full
              bg-neutral-200
            "
          >
            {profileImage ? (
           <img
                src={profileImage}
                alt={tutorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="
                  flex h-full w-full items-center justify-center
                  text-2xl font-bold text-[#7A0000]
                "
              >
                {getInitials()}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-[22px] font-bold text-black">
              {tutorName}
            </h2>

            <div className="flex items-center gap-1 text-[14px] text-black">
              <span>★</span>
              <span>{tutor?.rating != null ? Number(tutor.rating).toFixed(1) : "—"}</span>
              <span className="underline text-black/70">
                ({tutor?.reviewCount ?? 0} reviews)
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}