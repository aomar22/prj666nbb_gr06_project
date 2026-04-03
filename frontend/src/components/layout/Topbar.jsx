import SearchIcon from "../icons/SearchIcon";
import BellIcon from "../icons/BellIcon";
import { getUser} from "../../api";
import { useLocation } from "react-router-dom";
import Avatar from "../ui/Avatar";

export default function TopBar({
  
  showNotificationDot = true,
  placeholder,
  value,
  onSearchChange,
  onSearchSubmit,
  onSearchBarClick,
  onAvatarClick,
  disabled = false,
  showSearch = true,
}) {
  const isClickable = typeof onSearchBarClick === "function";
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchSubmit?.(e);
    }
  };
  const user = getUser();
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || "User";
  const avatarPerson = {
    firstName: user?.firstName,
    lastName: user?.lastName,
    name: userName,
    
    // profileImageUrl:
    //   avatarSrc || user?.avatar || user?.profileImageUrl || user?.profilePicture || null,
  };
  // const rolePlaceholder =
  //     user?.role === "TUTOR"
  //         ? "Search Students or Courses"
  //         : "Search Tutors or Courses";
  
  const location = useLocation();
  const pathname = location.pathname;
  const isTutorRoute =
    pathname.startsWith("/dashboard/tutor") ||
    pathname.startsWith("/dashboard/availability") ||
    pathname.startsWith("/dashboard/find-students");
  const rolePlaceholder = isTutorRoute
    ? "Search Students or Courses"
    : "Search Tutors or Courses";
  return (
    <div className="flex items-center gap-6">
      {showSearch && (
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
          placeholder={placeholder || rolePlaceholder}
        />
      </div>
      ) }
        
      <div className="ml-auto flex items-center gap-6">
        <button className="relative" type="button">
          {showNotificationDot && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
          )}
          <BellIcon />
        </button>

        <button
          type="button"
          onClick={onAvatarClick}
          className="h-10 w-10 rounded-full bg-black/20 overflow-hidden border-0 p-0 cursor-pointer"
          aria-label="Open profile settings"
        >
          <Avatar person={avatarPerson} size={40} fallbackName="User" />
        </button>
      </div>
    </div>
  );
}
