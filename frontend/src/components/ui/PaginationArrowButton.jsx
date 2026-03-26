export default function PaginationArrowButton({
  onClick,
  ariaLabel = "Next",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="ml-3 w-[28px] shrink-0 text-[32px] font-semibold leading-none text-black/60 hover:text-black"
    >
      →
    </button>
  );
}