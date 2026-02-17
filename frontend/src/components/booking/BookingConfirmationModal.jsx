import { useEffect } from "react";

export default function BookingConfirmationModal({
  open,
  onClose,
  onContinue,
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Booking confirmation"
    >
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* card */}
      <div className="relative
                      w-[400px]
                      h-[180px]
                      rounded-[20px]
                      bg-white
                      px-6
                      py-5
                      shadow-[0px_8px_20px_rgba(0,0,0,0.18)]">
        <div className="flex items-start gap-5">
          {/* checkmark icon */}
          <div className="shrink-0">
            <div className="relative w-[44px] h-[44px]">
              <div className="shrink-0">
                <img
                  src="/check-mark.svg"
                  alt="Success"
                  className="w-[44px] h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* message */}
          <div className="pt-1">
            <p className="text-[16px] font-medium leading-6 text-slate-900">
              You&apos;re all set! You can view your
              <br />
              booking anytime in your Dashboard
            </p>

            {/* button row */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={onContinue}
                className="h-[41px] w-[114px]
                           rounded-[17px] bg-[#FF4245]
                           text-[14px] font-semibold
                           text-white hover:brightness-95
                           active:brightness-90
                           flex items-center justify-center
                           transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
