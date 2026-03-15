export default function DropdownArrow() {
  return (
    <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px] rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center shadow-[0px_3px_5px_0px_#000000]">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="#111"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}