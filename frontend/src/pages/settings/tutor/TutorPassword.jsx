import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import BellIcon from "../../../components/icons/BellIcon";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import { changePassword, getUser } from "../../../api";

export default function TutorPassword() {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "Tutor";
  const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=ddd&color=666&size=100`;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  const isUpdateDisabled =
   !currentPassword.trim() ||
   !newPassword.trim() ||
   !confirmPassword.trim() ||
   newPassword.length < 8 ||
   newPassword !== confirmPassword ||
   newPassword === currentPassword;
  
  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setUpdateError("");
  };

  const handleUpdate = async () => {
    if (isUpdateDisabled || isUpdating) return;

    setUpdateError("");
    setIsUpdating(true);

    try {
        await changePassword({ currentPassword, newPassword });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowUpdateModal(true);
    } catch (error) {
        if (error?.status === 401 || error?.status === 403 || error?.message?.includes("incorrect")) {
            setUpdateError("Current password is incorrect.");
        } else {
            setUpdateError(error?.message || "Failed to update password. Please try again.");
        }
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F4E4D7]">
      <div className="flex h-screen bg-[#F4E4D7]">
        <Sidebar />
        
        <ConfirmationModal
          open={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onConfirm={() => setShowUpdateModal(false)}
          title="Password Updated"
          message="Your password has been updated successfully."
          confirmText="OK"
          icon="/check-mark.svg"
        />

        <main className="flex-1 overflow-y-auto bg-[#F5F5F5]">
          <div className="flex items-center justify-between border-b border-[#D6DEE8] bg-[#FAFAFA] px-10 py-6">
            <h1 className="text-[27px] font-bold leading-none text-black">My Profile (Tutor)</h1>
            <div className="flex items-center gap-6">
              <button className="relative" type="button">
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
                <BellIcon />
              </button>
              <div className="h-10 w-10 overflow-hidden rounded-full bg-black/20">
                <img alt="profile" src={avatarSrc} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="grid min-h-[calc(100vh-89px)] grid-cols-[250px_minmax(0,1fr)]">
            <div className="border-r border-[#D6DEE8] bg-[#FAFAFA]">
              <button
                type="button"
                onClick={() => navigate("/settings/tutor/profile/edit")}
                className="flex w-full items-center gap-3 px-7 py-6 text-left text-[18px] font-semibold text-black hover:bg-[#F1F3F5]"
              >
                <img src="/edit.png" alt="Edit Profile Icon" className="h-[22px] w-[22px]" />
                Edit Profile
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 bg-[#F1F3F5] px-7 py-4 text-left text-[18px] font-semibold text-black"
              >
                <img src="/lock.png" alt="Password Icon" className="h-[22px] w-[22px]" />
                Password
              </button>
            </div>

            <div className="bg-[#F5F5F5] px-[54px] pt-[28px] pb-[28px]">
              <div className="mt-[34px] min-h-[371px] w-full max-w-[980px] rounded-[8px] border border-[#CFCFCF] bg-[#F7F7F7] px-6 pt-4 pb-5 shadow-[0px_1px_4px_rgba(0,0,0,0.14)]">
                <h3 className="text-[23px] font-bold text-black">Change Password</h3>
                <div className="mt-3 border-t border-black/70" />

                <div className="mt-5">
                    <label className="block text-[16px] font-bold text-black">Current Password</label>
                    <div className="relative mt-2 w-full max-w-[470px]">
                        <input
                            type="password"
                            placeholder="Scholarly Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="h-[53px] w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026] placeholder:text-[#A3A3A3]"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-[16px] font-bold text-black">New Password</label>
                    <input
                        type="password"
                        placeholder="Scholarly Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-2 h-[53px] w-full max-w-[470px] rounded-[10px] border border-[#E5E5E5] bg-white px-4 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026] placeholder:text-[#A3A3A3]"
                    />
                    <p className="mt-2 text-[14px] text-[#666666]">* Must be at least 8 characters</p>
                </div>

                <div className="mt-6">
                    <label className="block text-[16px] font-bold text-black">Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Scholarly Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-2 h-[53px] w-full max-w-[470px] rounded-[10px] border border-[#E5E5E5] bg-white px-4 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026] placeholder:text-[#A3A3A3]"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                        <p className="mt-2 text-[14px] text-red-600 font-medium">Passwords do not match.</p>
                    )}
                    {confirmPassword && newPassword.length > 0 && newPassword.length < 8 && (
                        <p className="mt-2 text-[14px] text-red-600 font-medium">Password must be at least 8 characters.</p>
                    )}
                    {newPassword && currentPassword && newPassword === currentPassword && (
                        <p className="mt-2 text-[14px] text-red-600 font-medium">New password cannot be the same as the current password.</p>
                    )}
                </div>
              </div>
                
              {updateError && (
                <p className="mt-4 text-sm text-red-600 font-medium">{updateError}</p>
              )}

              <div className="mt-[28px] flex w-full max-w-[980px] justify-end gap-5">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="h-[50px] w-[120px] rounded-[15px] bg-[#4B5563] text-[20px] font-bold text-white shadow-[0px_3px_6px_rgba(0,0,0,0.2)]"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isUpdateDisabled || isUpdating}
                    className={`h-[50px] w-[120px] rounded-[15px] text-[20px] font-bold text-white shadow-[0px_3px_6px_rgba(0,0,0,0.2)] ${
                        isUpdateDisabled || isUpdating
                            ? "bg-[#8CBFEF] cursor-not-allowed"
                            : "bg-[#118BFF]"
                    }`}
                >
                    {isUpdating ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}