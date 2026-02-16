// Program codes must match backend (DataSeeder)
export const PROGRAMS = ["CPA", "CPP", "CNS", "CTY", "BSD", "IFS"];

/** Courses per program — must match backend DataSeeder. */
export const COURSES_BY_PROGRAM = {
  CPA: ["OOP345", "DBS311", "WEB322", "PRJ566", "PRJ666", "SYD366"],
  CPP: ["CPR101", "IPC144", "OOP244", "DSA456", "WEB222", "UNX511"],
  CNS: ["NDD100", "NSY101", "NFS200", "SEC320", "VRT401", "OPS445"],
  CTY: ["CYB100", "SEC110", "FOR200", "PEN300", "INC400", "MAL500"],
  BSD: ["BCD110", "BCD210", "BCD310", "BCD410", "BCD510", "APS145"],
  IFS: ["IFS100", "IFS200", "IFS300", "NET201", "SYS366", "DBA625"],
};

/** All unique course codes (for when no program is selected). */
export const ALL_COURSES = [...new Set(Object.values(COURSES_BY_PROGRAM).flat())].sort();

/** @deprecated Prefer ALL_COURSES or COURSES_BY_PROGRAM[program]. Kept for TutorOnboarding. */
export const COURSES = ALL_COURSES;

export const CAMPUSES = ["Newnham", "Seneca@York", "King", "Markham", "Online"];
export const TEACHING_MODES = ["ONLINE", "IN_PERSON"];
export const SESSION_TYPES = ["INDIVIDUAL", "GROUP"];

export const TEACHING_MODE_LABELS = { ONLINE: "Online", IN_PERSON: "In Person" };

export const SESSION_TYPE_LABELS = { INDIVIDUAL: "One-on-one", GROUP: "Group" };

export const RATING_OPTIONS = [
  { value: "", label: "Any" },
  { value: 3, label: "3+" },
  { value: 3.5, label: "3.5+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
  { value: 5, label: "5" },
];
