import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { getUser } from "../../api";

export default function SettingsProfileLayout({
  activeTab = "edit",
  title = "Edit Profile",
  roleType = "learner",
  children,
}) {
  const navigate = useNavigate();
  const user = getUser();

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || "User";

  const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName
  )}&background=ddd&color=666&size=200`;

  const avatarSrc = user?.avatar || user?.profileImageUrl || user?.profilePicture || generatedAvatar;

  const editPath =
    roleType === "tutor"
      ? "/settings/tutor/profile/edit"
      : "/settings/learner/profile/edit";

  const passwordPath =
    roleType === "tutor"
      ? "/settings/tutor/profile/password"
      : "/settings/learner/profile/password";

  const badgeLabel =
    user?.role === "TUTOR"
      ? "Tutor"
      : user?.role === "LEARNER"
        ? "Learner"
        : roleType === "tutor"
          ? "Tutor"
          : "Learner";

  return (
    <DashboardLayout showSearch={false}>
      <div className="flex min-h-[calc(100vh-120px)] items-start justify-center px-8 pt-8 pb-8">
        <div className="mx-auto w-full max-w-[1100px] overflow-hidden rounded-[28px] border border-[#D6DEE8] bg-[#F5F5F5]">
          {/* Top row */}
          <div className="flex h-[58px] items-center border-b border-[#D6DEE8] bg-white px-4">
            <h1 className="text-[27px] font-bold text-black">My Profile</h1>
          </div>

          {/* Body */}
          <div className="grid min-h-[642px] grid-cols-[250px_minmax(0,1fr)]">
            {/* Inner tabs */}
            <div className="border-r border-[#D6DEE8] bg-[#FAFAFA]">
              <button
                type="button"
                onClick={() => navigate(editPath)}
                className={`block w-full px-4 py-3 text-left text-[18px] font-semibold text-black ${
                  activeTab === "edit" ? "bg-[#F1F3F5]" : ""
                }`}
              >
                <img
                  src="/edit.png"
                  alt="Edit Profile Icon"
                  className="mr-2 inline-block"
                />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => navigate(passwordPath)}
                className={`block w-full px-4 py-3 text-left text-[18px] font-semibold text-black ${
                  activeTab === "password" ? "bg-[#F1F3F5]" : ""
                }`}
              >
                <img
                  src="/lock.png"
                  alt="Password Icon"
                  className="mr-2 inline-block"
                />
                Password
              </button>
            </div>

            {/* Right side */}
            <div className="bg-[#F5F5F5] px-6 pt-[22px] pb-[28px]">
              <h2 className="text-[26px] font-bold text-black">{title}</h2>

              {/* Profile summary */}
              <div className="mt-[28px] flex items-center">
                <div className="h-[102px] w-[102px] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
                  <img
                    src={avatarSrc}
                    alt={userName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="ml-[42px] w-[297px] text-black">
                  <p className="text-[22px] font-bold leading-[1.15]">
                    {userName}
                  </p>

                  <p className="mt-[8px] text-[18px] font-semibold leading-[1.15]">
                    {user?.email || "user@myseneca.ca"}
                  </p>

                  <p className="mt-[10px] text-[18px] font-semibold leading-[1.15]">
                    Badge: {badgeLabel}
                  </p>
                </div>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}