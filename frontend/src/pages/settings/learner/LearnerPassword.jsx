import { useState } from "react";
import SettingsProfileLayout from "../../../components/layout/SettingsProfileLayout";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

export default function LearnerPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  //temp frontend until backend is implemented
  const verifyCurrentPassword = async () => {
    return new Promise((resolve) => setTimeout(resolve, 500));
};

  const changePassword = async () => {
    return new Promise((resolve) => setTimeout(resolve, 500));
};
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
        await verifyCurrentPassword({ currentPassword });
        await changePassword({ currentPassword, newPassword });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowUpdateModal(true);
    } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
        setUpdateError("Current password is incorrect.");
        } else {
        setUpdateError(
            error?.message || "Failed to update password. Please try again."
        );
        }
    } finally {
        setIsUpdating(false);
    }
    };

  return (
    <SettingsProfileLayout
      activeTab="password"
      title="Password Information"
      roleType="learner"
    >
      {/* password card */}
      <div
        className="
            mt-[34px]
            min-h-[371px]
            w-full
            rounded-[8px]
            border border-[#CFCFCF]
            bg-[#F7F7F7]
            px-6 pt-4 pb-5
            shadow-[0px_1px_4px_rgba(0,0,0,0.14)]
        "
        >
        <h3 className="text-[23px] font-bold text-black">Change Password</h3>

        <div className="mt-3 border-t border-black/70" />

        <div className="mt-5">
            <label className="block text-[16px] font-medium text-black">
            Current Password
            </label>
        <div className="relative mt-2 w-full max-w-[470px]">
            <input
                type="password"
                placeholder="Seneca Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="
                h-[53px]
                w-full
                rounded-[10px]
                border border-[#E5E5E5]
                bg-white
                px-4
                text-[18px]
                outline-none
                shadow-[0px_0px_10px_0px_#00000026]
                placeholder:text-[#A3A3A3]
                "
            />
            
        </div>
        </div>

        <div className="mt-6">
            <label className="block text-[16px] font-medium text-black">
            New Password
            </label>

            <input
            type="password"
            placeholder="Seneca Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="
                
                mt-2
                h-[53px]
                w-full max-w-[470px]
                rounded-[10px]
                border border-[#E5E5E5]
                bg-white
                px-4
                text-[18px]
                outline-none
                shadow-[0px_0px_10px_0px_#00000026]
                placeholder:text-[#A3A3A3]
            "
            />

            <p className="mt-2 text-[14px] text-[#666666]">
            * Must be at least 8 characters
            </p>
        </div>

        <div className="mt-6">
            <label className="block text-[16px] font-medium text-black">
            Confirm New Password
            </label>

            <input
            type="password"
            placeholder="Seneca Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="
                mt-2
                h-[53px]
                w-full max-w-[470px]
                rounded-[10px]
                border border-[#E5E5E5]
                bg-white
                px-4
                text-[18px]
                outline-none
                shadow-[0px_0px_10px_0px_#00000026]
                placeholder:text-[#A3A3A3]
            "
            />
            {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-2 text-[14px] text-red-600">
                    Passwords do not match.
                </p>
            )}
            {confirmPassword && newPassword.length > 0 && newPassword.length < 8 && (
                <p className="mt-2 text-[14px] text-red-600">
                    Password must be at least 8 characters.
                </p>
            )}
            {newPassword && currentPassword && newPassword === currentPassword && (
                <p className="mt-2 text-[14px] text-red-600">
                    New password cannot be the same as the current password.
                </p>
            )}
        </div>
        </div>
        
        <div className="mt-[28px] flex w-full justify-end gap-4">
        <button
            type="button"
            onClick={handleCancel}
            className="
            h-[50px] w-[120px]
            rounded-[15px]
            bg-[#4B5563]
            text-[20px]
            font-bold
            text-white
            shadow-[0px_3px_6px_rgba(0,0,0,0.2)]
            "
        >
            Cancel
        </button>

        <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdateDisabled || isUpdating}
            className={`
            h-[50px] w-[120px]
            rounded-[15px]
            bg-[#0066CC]
            text-[20px]
            font-bold
            text-white
            shadow-[0px_3px_6px_rgba(0,0,0,0.2)]
            ${
            isUpdateDisabled || isUpdating
                ? "bg-[#C7DDF5] text-white cursor-not-allowed"
                : "bg-[#0066CC] text-white"
            }`}
        >
            {isUpdating ? "Saving..." : "Update"}
        </button>
        </div>
        

      <ConfirmationModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={() => setShowUpdateModal(false)}
        title="Password Updated"
        message="Your password has been updated successfully."
        confirmText="OK"
        icon="/check-mark.svg"
      />

      {updateError && (
        <p className="mt-4 text-sm text-red-600">{updateError}</p>
      )}
    
    </SettingsProfileLayout>
  );
}