import { useEffect } from "react";

export default function CancelConfirmationModal({
  open,
  onClose,
  onConfirm,
  session,
}) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* modal card */}
      <div className="relative w-[420px] rounded-[12px] bg-white shadow-lg px-8 pt-16 pb-8 text-center">

        {/* red icon circle */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#FF4245] shadow-md">
          <span className="text-white text-[40px] font-bold">×</span>
        </div>

        <h3 className="text-[22px] font-bold text-gray-700">
          Cancel Session?
        </h3>

        <p className="mt-3 text-[16px] text-gray-600">
          Are you sure you want to cancel this tutoring session?
        </p>

        {/* session summary */}
        <div className="mt-6 rounded-lg bg-gray-100 px-4 py-3 text-left text-[15px] text-gray-700">
          <div><strong>Tutor:</strong> {session.tutorName}</div>
          <div><strong>Date:</strong> {session.date}</div>
          <div><strong>Time:</strong> {session.time}</div>
        </div>

        {/* buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] w-[130px] rounded-md bg-gray-400 text-white font-semibold hover:brightness-95"
          >
            Keep Session
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="h-[42px] w-[130px] rounded-md bg-[#FF4245] text-white font-semibold hover:brightness-95"
          >
            Cancel Session
          </button>
        </div>
      </div>
    </div>
  );
}