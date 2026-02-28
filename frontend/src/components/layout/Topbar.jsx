import SearchIcon from "../icons/SearchIcon";
import BellIcon from "../icons/BellIcon";

export default function TopBar({
  avatarSrc = "/avatar.png",
  showNotificationDot = true,
  placeholder = "Search Student or Courses",
  value,
  onSearchChange,
  onSearchSubmit,
  onSearchBarClick,
  disabled = false,
}) {
  const isClickable = typeof onSearchBarClick === "function";
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchSubmit?.(e);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div
        className={`relative flex-1 ${isClickable ? "cursor-pointer" : ""}`}
        onClick={isClickable ? onSearchBarClick : undefined}
        role={isClickable ? "button" : undefined}
      >
        <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
          <SearchIcon />
        </div>

        <input
          value={value}
          onChange={onSearchChange}
          onKeyDown={handleKeyDown}
          readOnly={isClickable}
          disabled={disabled}
          className="w-full h-[54px] rounded-full bg-white px-14 text-[18px] font-mono
                     shadow-[0px_6px_14px_rgba(0,0,0,0.18)] outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative" type="button">
          {showNotificationDot && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
          )}
          <BellIcon />
        </button>

        <div className="h-10 w-10 rounded-full bg-black/20 overflow-hidden">
          <img
            alt="profile"
            src={avatarSrc}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
