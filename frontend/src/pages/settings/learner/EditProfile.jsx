import { useState } from "react";
import SettingsProfileLayout from "../../../components/layout/SettingsProfileLayout";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import DropdownArrow from "../../../components/ui/DropdownArrow";
import { CAMPUSES, PROGRAMS } from "../../../constants/options";
import { getUser, setUser } from "../../../api";

export default function EditProfile() {
  const user = getUser();

  const initialProgram = user?.program || "";
  const initialCampus = user?.campus || "";

  const [program, setProgram] = useState(initialProgram);
  const [campus, setCampus] = useState(initialCampus);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const isUpdateDisabled = !program.trim() || !campus.trim();

  const handleCancel = () => {
    setProgram(initialProgram);
    setCampus(initialCampus);
  };

  const handleUpdate = () => {
    setUpdateError("");

    try {
      const updatedUser = {
        ...user,
        campus,
        program,
      };

      setUser(updatedUser);
      setShowUpdateModal(true);
    } catch (error) {
      setUpdateError(
        "Failed to update profile. Please fill in all fields and try again."
      );
    }
  };

  return (
    <SettingsProfileLayout
      activeTab="edit"
      title="Edit Profile"
      roleType="learner"
    >
      <div
        className="
          mt-[34px]
          min-h-[331px]
          w-full
          rounded-[8px]
          border border-[#CFCFCF]
          bg-[#F7F7F7]
          px-6 pt-4 pb-5
          shadow-[0px_1px_4px_rgba(0,0,0,0.14)]
        "
      >
        <h3 className="text-[23px] font-bold text-black">
          Academic Information
        </h3>

        <div className="mt-3 border-t border-black/70" />

        <div className="mt-3">
          <label className="block text-[16px] font-medium text-black">
            Program / Major
          </label>

          <div className="relative mt-2 w-full">
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="
                w-full h-[53px]
                appearance-none
                rounded-[10px]
                border border-[#E5E5E5]
                bg-white
                px-4 pr-14
                text-[18px]
                outline-none
                shadow-[0px_0px_10px_0px_#00000026]
              "
            >
              <option value="">Select program</option>
              {PROGRAMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <DropdownArrow />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-[16px] font-medium text-black">
            Campus
          </label>

          <div className="relative mt-2 w-full">
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="
                w-full h-[53px]
                appearance-none
                rounded-[10px]
                border border-[#E5E5E5]
                bg-white
                px-4 pr-14
                text-[18px]
                outline-none
                shadow-[0px_0px_10px_0px_#00000026]
              "
            >
              <option value="">Select campus</option>
              {CAMPUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <DropdownArrow />
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={() => setShowUpdateModal(false)}
        title="Profile Updated"
        message="Your profile has been updated successfully."
        confirmText="OK"
        icon="/check-mark.svg"
      />

      {updateError && (
        <p className="mt-4 text-sm text-red-600">{updateError}</p>
      )}

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
          disabled={isUpdateDisabled}
          className={`h-[50px] w-[120px] rounded-[15px] text-[20px] font-bold shadow-[0px_3px_6px_rgba(0,0,0,0.2)] ${
            isUpdateDisabled
              ? "bg-[#C7DDF5] text-[#1F2937] cursor-not-allowed"
              : "bg-[#0066CC] text-white"
          }`}
        >
          Update
        </button>
      </div>
    </SettingsProfileLayout>
  );
}
//Same Figma design and background layout
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../../../components/layout/Sidebar";
// import BellIcon from "../../../components/icons/BellIcon";
// import DropdownArrow from "../../../components/ui/DropdownArrow";
// import { CAMPUSES, PROGRAMS } from "../../../constants/options";
// import { getUser, setUser } from "../../../api";
// import ConfirmationModal from "../../../components/ui/ConfirmationModal";

// export default function EditProfile() {
//   const navigate = useNavigate();
//   const user = getUser();
//   const initialProgram = user?.program || "";
//   const initialCampus = user?.campus || "";

//   const [program, setProgram] = useState(initialProgram);
//   const [campus, setCampus] = useState(initialCampus);

//   const [showUpdateModal, setShowUpdateModal] = useState(false);

//   const userName =
//     user?.firstName && user?.lastName
//       ? `${user.firstName} ${user.lastName}`
//       : user?.email || "User";

//   const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
//     userName
//   )}&background=ddd&color=666&size=100`;
  
//   const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
//   userName
// )}&background=ddd&color=666&size=200`;
//   const handleCancel = () => {
//     setProgram(initialProgram);
//     setCampus(initialCampus);
//   };

//   const isUpdateDisabled = !program.trim() || !campus.trim();

//   const handleUpdate = () => {
//     const updatedUser = {
//       ...user,
//       campus,
//       program
//     };
//     setUser(updatedUser);
//     setShowUpdateModal(true);
//   };

//   return (
//   <div className="h-screen overflow-hidden bg-[#F4E4D7]">
//     <div className="flex h-screen bg-[#F4E4D7]">
//       <Sidebar />
//       <ConfirmationModal
//         open={showUpdateModal}
//         onClose={() => setShowUpdateModal(false)}
//         onConfirm={() => setShowUpdateModal(false)}
//         title="Profile Updated"
//         message="Your profile has been updated successfully."
//         confirmText="OK"
//         icon="/check-mark.svg"
//       />
//       <main className="flex-1 overflow-y-auto bg-[#F5F5F5]">
//         {/* Top page header */}
//         <div className="flex items-center justify-between border-b border-[#D6DEE8] bg-[#F4E4D7] px-10 py-6">
//           <h1 className="text-[27px] font-bold leading-none text-black">
//             My Profile
//           </h1>

//           <div className="flex items-center gap-6">
//             <button className="relative" type="button">
//               <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
//               <BellIcon />
//             </button>

//             <div className="h-10 w-10 overflow-hidden rounded-full bg-black/20">
//               <img
//                 alt="profile"
//                 src={avatarSrc}
//                 className="h-full w-full object-cover"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Whole page body */}
//         <div className="grid min-h-[calc(100vh-89px)] grid-cols-[250px_minmax(0,1fr)]">
//           {/* Left settings tabs */}
//           <div className="border-r  border-[#D6DEE8] bg-[#FAFAFA]">
//             <button
//               type="button"
//               className="flex w-full items-center gap-3 bg-[#F1F3F5] [#F4E4D7] px-7 py-6 text-left text-[18px] font-semibold text-black"
//             >
//               <img
//                 src="/edit.png"
//                 alt="Edit Profile Icon"
//                 className="h-[22px] w-[22px]"
//               />
//               Edit Profile
//             </button>

//             <button
//               type="button"
//               onClick={() => navigate("/settings/learner/profile/password")}
//               className="flex w-full items-center gap-3 px-7 py-4 text-left text-[18px] font-semibold text-black"
//             >
//               <img
//                 src="/lock.png"
//                 alt="Password Icon"
//                 className="h-[22px] w-[22px]"
//               />
//               Password
//             </button>
//           </div>

//           {/* Right side content */}
//           <div className="bg-[#F5F5F5] px-[54px] pt-[28px] pb-[28px]">
//             <h2 className="text-[26px] font-bold leading-none text-black">
//               Edit Profile
//             </h2>

//             <div className="mt-[28px] flex items-center">
//               <div className="h-[102px] w-[102px] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
//                 <img
//                   src={user?.profile?.avatar || generatedAvatar}
//                   alt={userName}
//                   className="h-full w-full object-cover"
//                 />
//               </div>

//               <div className="ml-[38px] text-black">
//                 <p className="text-[22px] font-bold leading-[1.15]">
//                   {userName}
//                 </p>
//                 <p className="mt-[8px] text-[18px] font-semibold leading-[1.15]">
//                   {user?.profile?.email || "learner1@myseneca.ca"}
//                 </p>
//                 <p className="mt-[10px] text-[18px] font-semibold leading-[1.15]">
//                   Badge: {user?.profile?.badge || "Learner"}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-[34px] w-full max-w-[980px] rounded-[8px] border border-[#CFCFCF] bg-[#F7F7F7] px-6 pt-4 pb-5 shadow-[0px_1px_4px_rgba(0,0,0,0.14)]">
//               <h3 className="text-[23px] font-bold text-black">
//                 Academic Information
//               </h3>

//               <div className="mt-3 border-t border-black/70" />

//               <div className="mt-3">
//                 <label className="block text-[16px] font-bold text-black">
//                   Program / Major
//                 </label>

//                 <div className="relative mt-2 w-full">
//                   <select
//                     value={program}
//                     onChange={(e) => setProgram(e.target.value)}
//                     className="w-full h-[53px] appearance-none rounded-[10px] border border-[#E5E5E5] bg-white px-4 pr-14 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026]"
//                   >
//                     <option value="">Select program</option>
//                     {PROGRAMS.map((item) => (
//                       <option key={item} value={item}>
//                         {item}
//                       </option>
//                     ))}
//                   </select>
//                   <DropdownArrow />
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <label className="block text-[16px] font-bold text-black">
//                   Campus
//                 </label>

//                 <div className="relative mt-2 w-full">
//                   <select
//                     value={campus}
//                     onChange={(e) => setCampus(e.target.value)}
//                     className="w-full h-[53px] appearance-none rounded-[10px] border border-[#E5E5E5] bg-white px-4 pr-14 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026]"
//                   >
//                     <option value="">Select campus</option>
//                     {CAMPUSES.map((item) => (
//                       <option key={item} value={item}>
//                         {item}
//                       </option>
//                     ))}
//                   </select>
//                   <DropdownArrow />
//                 </div>
//               </div>
//             </div>
          

//             <div className="mt-[28px] flex justify-end gap-5 max-w-[980px]">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="h-[50px] w-[120px] rounded-[15px] bg-[#4B5563] text-[20px] font-bold text-white shadow-[0px_3px_6px_rgba(0,0,0,0.2)]"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handleUpdate}
//                    disabled={isUpdateDisabled}
//                    className={`h-[50px] w-[120px] rounded-[15px] text-[20px] font-bold text-white shadow-[0px_3px_6px_rgba(0,0,0,0.2)] ${
//                       isUpdateDisabled ? "bg-[#8CBFEF] cursor-not-allowed" : "bg-[#118BFF]"
//                     }`}>
//                 Update
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//     {/* <ConfirmationModal
//       open={showUpdateModal}
//       onClose={() => setShowUpdateModal(false)}
//       onConfirm={() => setShowUpdateModal(false)}
//       title="Profile Updated"
//       message="Your profile information has been updated successfully."
//       confirmText="Continue"
//     /> */}
//   </div>
// );
// }