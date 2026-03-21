import { useEffect } from "react";

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title = "Success",
  message = "Action completed successfully.",
  confirmText = "Continue",
  icon = "/check-mark.svg",
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
    >
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* modal card */}
      <div
        className="relative
        w-[400px]
        min-h-[180px]
        rounded-[20px]
        bg-white
        px-6
        py-6
        shadow-[0px_8px_20px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-start gap-5">
          {/* icon */}
          <div className="shrink-0">
            <img
              src={icon}
              alt="confirmation icon"
              className="w-[44px] h-[44px]"
            />
          </div>

          {/* content */}
          <div className="flex-1">
            {title && (
              <h3 className="text-[18px] font-semibold text-slate-900">
                {title}
              </h3>
            )}

            <p className="mt-1 text-[16px] leading-6 text-slate-700">
              {message}
            </p>
            </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={onConfirm}
                className="h-[41px] w-[114px]
              
                rounded-[17px]
                bg-[#FF4245]
                text-[14px]
                font-semibold
                text-white
                hover:brightness-95
                active:brightness-90
                transition"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
  );
}