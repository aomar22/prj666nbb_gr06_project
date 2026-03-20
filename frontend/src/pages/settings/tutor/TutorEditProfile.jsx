import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import BellIcon from "../../../components/icons/BellIcon";
import DropdownArrow from "../../../components/ui/DropdownArrow";
import { CAMPUSES, PROGRAMS, ALL_COURSES } from "../../../constants/options";
import { getUser, setUser, getUserSettings, updateUserSettings } from "../../../api";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

export default function TutorEditProfile() {
  const navigate = useNavigate();
  const user = getUser();
  
  const [program, setProgram] = useState(user?.program || "");
  const [campus, setCampus] = useState(user?.campus || "");
  const [about, setAbout] = useState("");
  const [teachingMode, setTeachingMode] = useState("");
  const [sessionType, setSessionType] = useState("");
  
  // Courses offered state (now an array) and UI states
  const [coursesOffered, setCoursesOffered] = useState([]); 
  const [coursesOpen, setCoursesOpen] = useState(false);
  const coursesDropdownRef = useRef(null);
  
  // Track unmodified state to check for changes
  const [initialData, setInitialData] = useState({ 
    program: user?.program || "", 
    campus: user?.campus || "",
    about: "",
    teachingMode: "",
    sessionType: "",
    coursesOffered: []
  });

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || "Tutor";

  const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userName
  )}&background=ddd&color=666&size=100`;

  useEffect(() => {
    getUserSettings()
      .then((data) => {
        if (data) {
          setProgram(data.program || "");
          setCampus(data.campus || "");
          setAbout(data.about || "");
          setSessionType(data.sessionType || "");
          
          const modeStr = data.teachingMode && data.teachingMode.length > 0 ? data.teachingMode[0] : "";
          setTeachingMode(modeStr);

          const coursesArr = data.coursesOffered || [];
          setCoursesOffered(coursesArr);

          setInitialData({ 
            program: data.program || "", 
            campus: data.campus || "",
            about: data.about || "",
            teachingMode: modeStr,
            sessionType: data.sessionType || "",
            coursesOffered: coursesArr
          });
        }
      })
      .catch((err) => console.error("Failed to fetch settings:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setCoursesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCourse = (course) => {
    setCoursesOffered((prev) => {
      if (prev.includes(course)) return prev.filter((c) => c !== course);
      return [...prev, course];
    });
  };

  const removeCourse = (course) => {
    setCoursesOffered((prev) => prev.filter((c) => c !== course));
  };

  const hasChanges = 
    program !== initialData.program || 
    campus !== initialData.campus ||
    about !== initialData.about ||
    teachingMode !== initialData.teachingMode ||
    sessionType !== initialData.sessionType ||
    JSON.stringify(coursesOffered) !== JSON.stringify(initialData.coursesOffered);

  const isUpdateDisabled = !program.trim() || !campus.trim() || !hasChanges || isUpdating;

  const handleCancel = () => {
    setProgram(initialData.program);
    setCampus(initialData.campus);
    setAbout(initialData.about);
    setTeachingMode(initialData.teachingMode);
    setSessionType(initialData.sessionType);
    setCoursesOffered(initialData.coursesOffered);
    setUpdateError("");
  };

  const handleUpdate = async () => {
    if (isUpdateDisabled) return;

    setUpdateError("");
    setIsUpdating(true);

    try {
      const updatedData = await updateUserSettings({ 
        campus, 
        program,
        about,
        teachingMode: teachingMode ? [teachingMode] : [], 
        sessionType,
        coursesOffered
      });

      const updatedUser = {
        ...user,
        campus: updatedData.campus,
        program: updatedData.program,
      };
      setUser(updatedUser);
      
      setInitialData({ 
        program: updatedData.program, 
        campus: updatedData.campus,
        about: updatedData.about,
        teachingMode: updatedData.teachingMode,
        sessionType: updatedData.sessionType,
        coursesOffered: updatedData.coursesOffered || []
      });

      setShowUpdateModal(true);
    } catch (error) {
      setUpdateError(error?.message || "Failed to update profile. Please try again.");
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
          title="Profile Updated"
          message="Your tutor profile has been updated successfully."
          confirmText="OK"
          icon="/check-mark.svg"
        />

        <main className="flex-1 overflow-y-auto bg-[#F5F5F5]">
          {/* Top page header */}
          <div className="flex items-center justify-between border-b border-[#D6DEE8] bg-[#FAFAFA] px-10 py-6">
            <h1 className="text-[27px] font-bold leading-none text-black">
              My Profile (Tutor)
            </h1>

            <div className="flex items-center gap-6">
              <button className="relative" type="button">
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
                <BellIcon />
              </button>

              <div className="h-10 w-10 overflow-hidden rounded-full bg-black/20">
                <img
                  alt="profile"
                  src={avatarSrc}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Whole page body */}
          <div className="grid min-h-[calc(100vh-89px)] grid-cols-[250px_minmax(0,1fr)]">
            {/* Left settings tabs */}
            <div className="border-r border-[#D6DEE8] bg-[#FAFAFA]">
              <button
                type="button"
                className="flex w-full items-center gap-3 bg-[#F1F3F5] px-7 py-6 text-left text-[18px] font-semibold text-black"
              >
                <img src="/edit.png" alt="Edit Profile Icon" className="h-[22px] w-[22px]" />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => navigate("/settings/tutor/profile/password")}
                className="flex w-full items-center gap-3 px-7 py-4 text-left text-[18px] font-semibold text-black hover:bg-[#F1F3F5]"
              >
                <img src="/lock.png" alt="Password Icon" className="h-[22px] w-[22px]" />
                Password
              </button>
            </div>

            {/* Right side content */}
            <div className="bg-[#F5F5F5] px-[54px] pt-[28px] pb-[28px]">
              <h2 className="text-[26px] font-bold leading-none text-black">
                Edit Profile
              </h2>

              <div className="mt-[28px] flex items-center">
                <div className="h-[102px] w-[102px] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]">
                  <img src={avatarSrc} alt={userName} className="h-full w-full object-cover" />
                </div>
                <div className="ml-[38px] text-black">
                  <p className="text-[22px] font-bold leading-[1.15]">{userName}</p>
                  <p className="mt-[8px] text-[18px] font-semibold leading-[1.15]">{user?.email}</p>
                </div>
              </div>

              <div className="mt-[34px] w-full max-w-[980px] rounded-[8px] border border-[#CFCFCF] bg-[#F7F7F7] px-6 pt-4 pb-5 shadow-[0px_1px_4px_rgba(0,0,0,0.14)]">
                <h3 className="text-[23px] font-bold text-black">Tutor Information</h3>
                <div className="mt-3 border-t border-black/70" />

                <div className="grid grid-cols-2 gap-6 mt-3">
                  <div>
                    <label className="block text-[16px] font-bold text-black">Program / Major</label>
                    <div className="relative mt-2 w-full">
                      <select
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        className="w-full h-[53px] appearance-none rounded-[10px] border border-[#E5E5E5] bg-white px-4 pr-14 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026]"
                      >
                        <option value="">Select program</option>
                        {PROGRAMS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                      <DropdownArrow />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[16px] font-bold text-black">Campus</label>
                    <div className="relative mt-2 w-full">
                      <select
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        className="w-full h-[53px] appearance-none rounded-[10px] border border-[#E5E5E5] bg-white px-4 pr-14 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026]"
                      >
                        <option value="">Select campus</option>
                        {CAMPUSES.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                      <DropdownArrow />
                    </div>
                  </div>
                </div>

                <div className="mt-6" ref={coursesDropdownRef}>
                    <label className="block text-[16px] font-bold text-black">Courses Offered <span className="text-red-600">*</span></label>
                    <div className="relative mt-2 w-full">
                        <button
                            type="button"
                            onClick={() => setCoursesOpen((v) => !v)}
                            className="w-full h-[53px] rounded-[10px] border border-[#E5E5E5] px-4 pr-14 text-[18px] outline-none bg-white text-left shadow-[0px_0px_10px_0px_#00000026]"
                        >
                            <span className="text-[18px] text-black">
                                {coursesOffered.length === 0
                                    ? "Select courses..."
                                    : coursesOffered.length <= 3
                                    ? coursesOffered.join(", ")
                                    : `${coursesOffered.slice(0, 3).join(", ")} +${coursesOffered.length - 3}`}
                            </span>
                        </button>
                        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 h-[34px] w-[44px] rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center shadow-[0px_3px_5px_0px_#00000026]">
                            <DropdownArrow />
                        </div>

                        {coursesOpen && (
                            <div className="absolute z-30 mt-2 w-full rounded-[10px] border border-[#E5E5E5] bg-white shadow-[0px_10px_25px_rgba(0,0,0,0.18)]">
                                <div className="max-h-[180px] overflow-auto py-2">
                                    {ALL_COURSES.map((c) => {
                                        const checked = coursesOffered.includes(c);
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => toggleCourse(c)}
                                                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-black/5 text-left"
                                            >
                                                <span className={[
                                                    "h-5 w-5 rounded-[6px] border border-black/20 flex items-center justify-center",
                                                    checked ? "bg-[#0066CC] border-[#0066CC]" : "bg-white"
                                                ].join(" ")}>
                                                    {checked && (
                                                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                                                            <path d="M16.5 5.5L8.5 13.5L4 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className="text-[16px] text-black">{c}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="px-4 py-3 border-t border-black/10 flex items-center justify-between">
                                    <p className="text-[14px] text-black/60">Selected: {coursesOffered.length}</p>
                                    <button type="button" onClick={() => setCoursesOpen(false)} className="text-[14px] text-[#0066CC] font-bold">
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chips for Selected Courses */}
                    <div className="w-full flex flex-wrap gap-2 pt-3">
                        {coursesOffered.map((c) => (
                            <span key={c} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[14px]">
                                {c}
                                <button
                                    type="button"
                                    onClick={() => removeCourse(c)}
                                    className="h-5 w-5 rounded-full bg-white border border-black/10 flex items-center justify-center leading-none text-red-600 hover:bg-red-50"
                                    aria-label={`Remove ${c}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block text-[16px] font-bold text-black">Teaching Mode</label>
                        <div className="relative mt-2 w-full">
                            <select
                                value={teachingMode}
                                onChange={(e) => setTeachingMode(e.target.value)}
                                className="w-full h-[53px] appearance-none rounded-[10px] border border-[#E5E5E5] bg-white px-4 pr-14 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026]"
                            >
                                <option value="">Select Mode</option>
                                <option value="ONLINE">Online</option>
                                <option value="IN_PERSON">In Person</option>
                                <option value="HYBRID">Hybrid</option>
                            </select>
                            <DropdownArrow />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[16px] font-bold text-black">Session Type</label>
                        <div className="relative mt-2 w-full">
                            <select
                                value={sessionType}
                                onChange={(e) => setSessionType(e.target.value)}
                                className="w-full h-[53px] appearance-none rounded-[10px] border border-[#E5E5E5] bg-white px-4 pr-14 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026]"
                            >
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="GROUP">Group</option>
                            </select>
                            <DropdownArrow />
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-[16px] font-bold text-black">About Me</label>
                    <textarea
                        rows="4"
                        placeholder="Tell students about your teaching style..."
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="mt-2 w-full rounded-[10px] border border-[#E5E5E5] bg-white p-4 text-[18px] outline-none shadow-[0px_0px_10px_0px_#00000026] resize-none"
                    />
                </div>
              </div>
              
              {updateError && (
                <p className="mt-4 text-sm text-red-600 font-medium">{updateError}</p>
              )}

              <div className="mt-[28px] flex justify-end gap-5 max-w-[980px]">
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
                  disabled={isUpdateDisabled}
                  className={`h-[50px] w-[120px] rounded-[15px] text-[20px] font-bold text-white shadow-[0px_3px_6px_rgba(0,0,0,0.2)] ${
                    isUpdateDisabled ? "bg-[#8CBFEF] cursor-not-allowed" : "bg-[#118BFF]"
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