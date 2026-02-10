export const PROGRAMS = [
  "CPA (Computer Programming & Analysis)",
  "Software Engineering",
  "Computer Science",
  "Business",
  "Other",
];

export const CAMPUSES = ["Newnham", "Seneca@York", "King", "Markham", "Online"];
export const COURSES = [
  "WEB222",
  "WEB322",
  "WEB422",
  "PRJ666",
  "DBS211",
  "DBS311",
  "OOP244",
  "OOP345",
  "IPC144",
  "CPP",
  "Other",
];
export const TEACHING_MODES = ["ONLINE", "IN_PERSON"];
export const SESSION_TYPES = ["INDIVIDUAL", "GROUP"];

/** Human-readable labels for teaching mode (backend uses enum values) */
export const TEACHING_MODE_LABELS = { ONLINE: "Online", IN_PERSON: "In Person" };

/** Human-readable labels for session type (backend uses enum values) */
export const SESSION_TYPE_LABELS = { INDIVIDUAL: "One-on-one", GROUP: "Group" };

/** Min rating options for tutor search */
export const RATING_OPTIONS = [
  { value: "", label: "Any" },
  { value: 3, label: "3+" },
  { value: 3.5, label: "3.5+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
  { value: 5, label: "5" },
];