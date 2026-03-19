import { useState } from "react";
import SettingsProfileLayout from "../../../components/layout/SettingsProfileLayout";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import DropdownArrow from "../../../components/ui/DropdownArrow";
import {
  CAMPUSES,
  PROGRAMS,
  COURSES_BY_PROGRAM,
  SESSION_TYPES,
  TEACHING_MODES,
  SESSION_TYPE_LABELS,
  TEACHING_MODE_LABELS,
} from "../../../constants/options";
import { getUser, setUser } from "../../../api";

export default function TutorEditProfile() {
  const user = getUser();

  const initialProgram = user?.program || "";
  const initialCampus = user?.campus || "";
  const initialCourses = user?.coursesOffered || [];
  const initialSessionType = user?.sessionType || "";
  const initialTeachingMode = user?.teachingMode || "";
  const initialAbout = user?.about || "";

  const [program, setProgram] = useState(initialProgram);
  const [campus, setCampus] = useState(initialCampus);
  const [coursesOffered, setCoursesOffered] = useState(initialCourses);
  const [sessionType, setSessionType] = useState(initialSessionType);
  const [teachingMode, setTeachingMode] = useState(initialTeachingMode);
  const [about, setAbout] = useState(initialAbout);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const availableCourses = program
    ? (COURSES_BY_PROGRAM[program] || []).filter(
        (c) => !coursesOffered.includes(c)
      )
    : [];

  const hasChanges =
    program !== initialProgram ||
    campus !== initialCampus ||
    JSON.stringify(coursesOffered) !== JSON.stringify(initialCourses) ||
    sessionType !== initialSessionType ||
    teachingMode !== initialTeachingMode ||
    about !== initialAbout;

  const isUpdateDisabled =
    !program.trim() ||
    !campus.trim() ||
    coursesOffered.length === 0 ||
    !sessionType.trim() ||
    !teachingMode.trim() ||
    !hasChanges;

  const handleAddCourse = (course) => {
    if (course && !coursesOffered.includes(course)) {
      setCoursesOffered([...coursesOffered, course]);
    }
  };

  const handleRemoveCourse = (course) => {
    setCoursesOffered(coursesOffered.filter((c) => c !== course));
  };

  const handleProgramChange = (newProgram) => {
    setProgram(newProgram);
    setCoursesOffered([]);
  };

  const handleCancel = () => {
    setProgram(initialProgram);
    setCampus(initialCampus);
    setCoursesOffered([...initialCourses]);
    setSessionType(initialSessionType);
    setTeachingMode(initialTeachingMode);
    setAbout(initialAbout);
    setUpdateError("");
  };

  const handleUpdate = () => {
    setUpdateError("");

    try {
      const updatedUser = {
        ...user,
        program,
        campus,
        coursesOffered,
        sessionType,
        teachingMode,
        about,
      };

      setUser(updatedUser);
      setShowUpdateModal(true);
    } catch {
      setUpdateError(
        "Failed to update profile. Please fill in all fields and try again."
      );
    }
  };

  const selectClass = `
    w-full h-[53px]
    appearance-none
    rounded-[10px]
    border border-[#E5E5E5]
    bg-white
    px-4 pr-14
    text-[18px]
    outline-none
    shadow-[0px_0px_10px_0px_#00000026]
  `;

  return (
    <SettingsProfileLayout activeTab="edit" title="Edit Profile" roleType="tutor">
      {/* Academic Information */}
      <div
        className="
          mt-[34px]
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

        {/* Program / Major */}
        <div className="mt-3">
          <label className="block text-[16px] font-medium text-black">
            Program / Major <span className="text-red-500">*</span>
          </label>

          <div className="relative mt-2 w-full">
            <select
              value={program}
              onChange={(e) => handleProgramChange(e.target.value)}
              className={selectClass}
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

        {/* Campus + Courses side by side */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[16px] font-medium text-black">
              Campus <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-2 w-full">
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className={selectClass}
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

          <div>
            <label className="block text-[16px] font-medium text-black">
              Courses like to offer <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-2 w-full">
              <select
                value=""
                onChange={(e) => handleAddCourse(e.target.value)}
                disabled={!program}
                className={`${selectClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {!program ? "Select a program first" : "Select course"}
                </option>
                {availableCourses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <DropdownArrow />
            </div>

            {coursesOffered.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {coursesOffered.map((course) => (
                  <span
                    key={course}
                    className="inline-flex items-center gap-1 rounded-full bg-[#E8F0FE] px-3 py-1 text-[14px] font-medium text-[#1A73E8]"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(course)}
                      className="ml-1 text-[#1A73E8] hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tutoring Preferences */}
      <div
        className="
          mt-6
          w-full
          rounded-[8px]
          border border-[#CFCFCF]
          bg-[#F7F7F7]
          px-6 pt-4 pb-5
          shadow-[0px_1px_4px_rgba(0,0,0,0.14)]
        "
      >
        <h3 className="text-[23px] font-bold text-black">
          Tutoring Preferences
        </h3>

        <div className="mt-3 border-t border-black/70" />

        {/* Session Type + Teaching Mode side by side */}
        <div className="mt-3 grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[16px] font-medium text-black">
              Session Type <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-2 w-full">
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className={selectClass}
              >
                <option value="">Select type</option>
                {SESSION_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {SESSION_TYPE_LABELS[item]}
                  </option>
                ))}
              </select>
              <DropdownArrow />
            </div>
          </div>

          <div>
            <label className="block text-[16px] font-medium text-black">
              Teaching Mode <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-2 w-full">
              <select
                value={teachingMode}
                onChange={(e) => setTeachingMode(e.target.value)}
                className={selectClass}
              >
                <option value="">Select mode</option>
                {TEACHING_MODES.map((item) => (
                  <option key={item} value={item}>
                    {TEACHING_MODE_LABELS[item]}
                  </option>
                ))}
              </select>
              <DropdownArrow />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="mt-6">
          <label className="block text-[16px] font-medium text-black">
            About <span className="text-[#999]">(optional)</span>
          </label>

          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell learners about yourself..."
            className="
              mt-2
              h-[100px]
              w-full
              resize-none
              rounded-[10px]
              border border-[#E5E5E5]
              bg-white
              px-4 py-3
              text-[18px]
              outline-none
              shadow-[0px_0px_10px_0px_#00000026]
              placeholder:text-[#A3A3A3]
            "
          />
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

      {/* Action buttons */}
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
