import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, searchTutors } from "../../api";
import Sidebar from "../../components/layout/Sidebar";
import {
  CAMPUSES,
  PROGRAMS,
  COURSES_BY_PROGRAM,
  ALL_COURSES,
  TEACHING_MODES,
  SESSION_TYPES,
  TEACHING_MODE_LABELS,
  SESSION_TYPE_LABELS,
  RATING_OPTIONS,
} from "../../constants/options";

export default function FindTutors() {
  const navigate = useNavigate();
  const user = getUser();

  // Search state - all filters support multiple selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCampuses, setSelectedCampuses] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedSessionTypes, setSelectedSessionTypes] = useState("");
  const [selectedTeachingModes, setSelectedTeachingModes] = useState([]);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Courses available for selection: when no program selected, show all; otherwise only courses for selected program(s)
  const availableCourses =
    selectedPrograms.length === 0
      ? ALL_COURSES
      : [...new Set(selectedPrograms.flatMap((p) => COURSES_BY_PROGRAM[p] ?? []))].sort();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Applied filters shown as removable tags
  const appliedFilters = [];
  selectedCampuses.forEach((c) =>
    appliedFilters.push({ key: `campus-${c}`, label: `Campus: ${c}`, onRemove: () => setSelectedCampuses((prev) => prev.filter((x) => x !== c)) })
  );
  selectedPrograms.forEach((p) =>
    appliedFilters.push({ key: `program-${p}`, label: `Program: ${p}`, onRemove: () => setSelectedPrograms((prev) => prev.filter((x) => x !== p)) })
  );
  selectedCourses.forEach((c) =>
    appliedFilters.push({ key: `course-${c}`, label: `Course: ${c}`, onRemove: () => setSelectedCourses((prev) => prev.filter((x) => x !== c)) })
  );
  selectedRatings.forEach((r) => {
    const opt = RATING_OPTIONS.find((o) => o.value === r);
    appliedFilters.push({
      key: `rating-${r}`,
      label: `Rating: ${opt?.label ?? r}+`,
      onRemove: () => setSelectedRatings((prev) => prev.filter((x) => x !== r)),
    });
  });
  if (selectedSessionTypes) {
    appliedFilters.push({
      key: `sessionType-${selectedSessionTypes}`,
      label: `Session: ${SESSION_TYPE_LABELS[selectedSessionTypes] || selectedSessionTypes}`,
      onRemove: () => setSelectedSessionTypes(""),
    });
  }
  selectedTeachingModes.forEach((m) =>
    appliedFilters.push({
      key: `teachingMode-${m}`,
      label: `Mode: ${TEACHING_MODE_LABELS[m] || m}`,
      onRemove: () => setSelectedTeachingModes((prev) => prev.filter((x) => x !== m)),
    })
  );
  if (availableFrom) {
    appliedFilters.push({
      key: "availableFrom",
      label: `From: ${availableFrom}`,
      onRemove: () => setAvailableFrom(""),
    });
  }
  if (availableTo) {
    appliedFilters.push({
      key: "availableTo",
      label: `To: ${availableTo}`,
      onRemove: () => setAvailableTo(""),
    });
  }

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      const params = {
        page: 0,
        size: 8,
        sortBy: "rating",
        sortDirection: "desc",
      };
      if (searchQuery?.trim()) params.q = searchQuery.trim();
      if (selectedCampuses.length) params.campus = selectedCampuses;
      if (selectedPrograms.length) params.program = selectedPrograms;
      if (selectedCourses.length) params.courses = selectedCourses;
      if (selectedRatings.length) params.minRating = Math.min(...selectedRatings);
      if (selectedSessionTypes) params.sessionType = selectedSessionTypes;
      if (selectedTeachingModes.length) params.teachingMode = selectedTeachingModes;
      if (availableFrom) params.availableFrom = availableFrom;
      if (availableTo) params.availableTo = availableTo;

      const page = await searchTutors(params);
      navigate("/dashboard/learner/find-tutors/results", {
        state: { searchParams: params, initialResults: page },
      });
    } catch (err) {
      const msg = err?.message || "Search failed. Please try again.";
      const isNetwork = msg === "Failed to fetch" || msg.includes("NetworkError");
      setError(
        isNetwork ? "Cannot reach the server. Is the backend running on http://localhost:8080?" : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.lastName) return user.lastName;
    return "User";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdown]);

  // When program selection changes, keep only course selections that are still in availableCourses
  useEffect(() => {
    if (selectedCourses.length === 0) return;
    const allowed = new Set(availableCourses);
    const valid = selectedCourses.filter((c) => allowed.has(c));
    if (valid.length !== selectedCourses.length) {
      setSelectedCourses(valid);
    }
  }, [selectedPrograms]);

  const toggleMulti = (setter, value) => {
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const ratingOptionsWithValues = RATING_OPTIONS.filter((r) => r.value !== "");

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        <div style={styles.contentCard}>
          <h1 style={styles.pageTitle}>Search Tutor or Courses</h1>

          {/* Search Bar - pill-shaped with left search icon */}
          <div style={styles.searchRow}>
            <span style={styles.searchIconLeft} aria-hidden="true">
              <SearchMagnifyIcon />
            </span>
            <input
              type="text"
              placeholder="Search Tutor or Courses"
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Filters */}
          <h3 style={styles.filtersHeading}>Filters:</h3>
          {appliedFilters.length > 0 && (
            <div style={styles.appliedFilters}>
              {appliedFilters.map((f) => (
                <span key={f.key} style={styles.filterTag}>
                  {f.label}
                  <button
                    type="button"
                    style={styles.filterTagRemove}
                    onClick={f.onRemove}
                    aria-label={`Remove ${f.label}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <div style={styles.filtersGrid} ref={dropdownRef}>
            {/* Program - multi-select */}
            <div style={styles.filterGroupCourse}>
              <label style={styles.filterLabel}>Program / major</label>
              <div style={styles.selectWrapper} onClick={() => setOpenDropdown((o) => (o === "program" ? null : "program"))}>
                <div style={styles.courseSelectDisplay}>
                  {selectedPrograms.length === 0 ? "Select program(s)" : selectedPrograms.join(", ")}
                </div>
                <div style={styles.selectChevronBtn}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={styles.chevronSvg}>
                    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {openDropdown === "program" && (
                <div style={styles.courseDropdownPanel}>
                  {PROGRAMS.map((p) => (
                    <div
                      key={p}
                      role="option"
                      aria-selected={selectedPrograms.includes(p)}
                      style={{
                        ...styles.courseDropdownOption,
                        ...(selectedPrograms.includes(p) ? styles.courseDropdownOptionSelected : {}),
                      }}
                      onClick={() => toggleMulti(setSelectedPrograms, p)}
                    >
                      {p}
                      {selectedPrograms.includes(p) && <span style={styles.courseDropdownCheck}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Campus - multi-select */}
            <div style={styles.filterGroupCourse}>
              <label style={styles.filterLabel}>Campus</label>
              <div style={styles.selectWrapper} onClick={() => setOpenDropdown((o) => (o === "campus" ? null : "campus"))}>
                <div style={styles.courseSelectDisplay}>
                  {selectedCampuses.length === 0 ? "Select campus(es)" : selectedCampuses.join(", ")}
                </div>
                <div style={styles.selectChevronBtn}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={styles.chevronSvg}>
                    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {openDropdown === "campus" && (
                <div style={styles.courseDropdownPanel}>
                  {CAMPUSES.map((c) => (
                    <div
                      key={c}
                      role="option"
                      aria-selected={selectedCampuses.includes(c)}
                      style={{
                        ...styles.courseDropdownOption,
                        ...(selectedCampuses.includes(c) ? styles.courseDropdownOptionSelected : {}),
                      }}
                      onClick={() => toggleMulti(setSelectedCampuses, c)}
                    >
                      {c}
                      {selectedCampuses.includes(c) && <span style={styles.courseDropdownCheck}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Course - multi-select */}
            <div style={styles.filterGroupCourse}>
              <label style={styles.filterLabel}>Course</label>
              <div style={styles.selectWrapper} onClick={() => setOpenDropdown((o) => (o === "course" ? null : "course"))}>
                <div style={styles.courseSelectDisplay}>
                  {selectedCourses.length === 0 ? "Select course(s)" : selectedCourses.join(", ")}
                </div>
                <div style={styles.selectChevronBtn}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={styles.chevronSvg}>
                    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {openDropdown === "course" && (
                <div style={styles.courseDropdownPanel}>
                  {availableCourses.map((c) => (
                    <div
                      key={c}
                      role="option"
                      aria-selected={selectedCourses.includes(c)}
                      style={{
                        ...styles.courseDropdownOption,
                        ...(selectedCourses.includes(c) ? styles.courseDropdownOptionSelected : {}),
                      }}
                      onClick={() => toggleMulti(setSelectedCourses, c)}
                    >
                      {c}
                      {selectedCourses.includes(c) && <span style={styles.courseDropdownCheck}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Tutor Rating - multi-select */}
            <div style={styles.filterGroupCourse}>
              <label style={styles.filterLabel}>Tutor Rating</label>
              <div style={styles.selectWrapper} onClick={() => setOpenDropdown((o) => (o === "rating" ? null : "rating"))}>
                <div style={styles.courseSelectDisplay}>
                  {selectedRatings.length === 0
                    ? "Select rating(s)"
                    : selectedRatings.map((r) => RATING_OPTIONS.find((o) => o.value === r)?.label ?? r).join(", ")}
                </div>
                <div style={styles.selectChevronBtn}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={styles.chevronSvg}>
                    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {openDropdown === "rating" && (
                <div style={styles.courseDropdownPanel}>
                  {ratingOptionsWithValues.map((r) => (
                    <div
                      key={r.value}
                      role="option"
                      aria-selected={selectedRatings.includes(r.value)}
                      style={{
                        ...styles.courseDropdownOption,
                        ...(selectedRatings.includes(r.value) ? styles.courseDropdownOptionSelected : {}),
                      }}
                      onClick={() => toggleMulti(setSelectedRatings, r.value)}
                    >
                      {r.label}
                      {selectedRatings.includes(r.value) && <span style={styles.courseDropdownCheck}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Session Type - single-select */}
            <div style={styles.filterGroupCourse}>
              <label style={styles.filterLabel}>Session Type</label>
              <div style={styles.selectWrapper} onClick={() => setOpenDropdown((o) => (o === "sessionType" ? null : "sessionType"))}>
                <div style={styles.courseSelectDisplay}>
                  {!selectedSessionTypes
                    ? "Select session type"
                    : SESSION_TYPE_LABELS[selectedSessionTypes] || selectedSessionTypes}
                </div>
                <div style={styles.selectChevronBtn}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={styles.chevronSvg}>
                    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {openDropdown === "sessionType" && (
                <div style={styles.courseDropdownPanel}>
                  {SESSION_TYPES.map((s) => (
                    <div
                      key={s}
                      role="option"
                      aria-selected={selectedSessionTypes === s}
                      style={{
                        ...styles.courseDropdownOption,
                        ...(selectedSessionTypes === s ? styles.courseDropdownOptionSelected : {}),
                      }}
                      onClick={() => { setSelectedSessionTypes(s); setOpenDropdown(null); }}
                    >
                      {SESSION_TYPE_LABELS[s] || s}
                      {selectedSessionTypes === s && <span style={styles.courseDropdownCheck}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Teaching Mode - multi-select */}
            <div style={styles.filterGroupCourse}>
              <label style={styles.filterLabel}>Teaching Mode</label>
              <div style={styles.selectWrapper} onClick={() => setOpenDropdown((o) => (o === "teachingMode" ? null : "teachingMode"))}>
                <div style={styles.courseSelectDisplay}>
                  {selectedTeachingModes.length === 0
                    ? "Select teaching mode(s)"
                    : selectedTeachingModes.map((m) => TEACHING_MODE_LABELS[m] || m).join(", ")}
                </div>
                <div style={styles.selectChevronBtn}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={styles.chevronSvg}>
                    <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              {openDropdown === "teachingMode" && (
                <div style={styles.courseDropdownPanel}>
                  {TEACHING_MODES.map((m) => (
                    <div
                      key={m}
                      role="option"
                      aria-selected={selectedTeachingModes.includes(m)}
                      style={{
                        ...styles.courseDropdownOption,
                        ...(selectedTeachingModes.includes(m) ? styles.courseDropdownOptionSelected : {}),
                      }}
                      onClick={() => toggleMulti(setSelectedTeachingModes, m)}
                    >
                      {TEACHING_MODE_LABELS[m] || m}
                      {selectedTeachingModes.includes(m) && <span style={styles.courseDropdownCheck}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={styles.filterGroupAvailability}>
              <label style={styles.filterLabel}>Availability</label>
              <div style={styles.dateRangeRow}>
                <div style={styles.dateInputWrap}>
                  <span style={styles.dateIconLeft} aria-hidden="true">
                    <CalendarIcon />
                  </span>
                  <input
                    type="date"
                    style={styles.dateInput}
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    placeholder="From"
                  />
                </div>
                <div style={styles.dateInputWrap}>
                  <span style={styles.dateIconLeft} aria-hidden="true">
                    <CalendarIcon />
                  </span>
                  <input
                    type="date"
                    style={styles.dateInput}
                    value={availableTo}
                    onChange={(e) => setAvailableTo(e.target.value)}
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          </div>
          <div style={styles.searchButtonRow}>
            <button style={styles.searchButton} onClick={handleSearch} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: "#F8E9DC",
    padding: "32px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  contentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: "12px",
    padding: "40px 48px 48px",
    maxWidth: "900px",
    margin: "0 auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 0 24px 0",
    color: "#000000",
    textAlign: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  searchRow: {
    position: "relative",
    width: "100%",
    marginBottom: "28px",
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    height: "52px",
    padding: "0 24px 0 48px",
    borderRadius: "9999px",
    border: "none",
    fontSize: "16px",
    color: "#333",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
    outline: "none",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  searchIconLeft: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "20px",
    height: "20px",
    color: "#555",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  filtersHeading: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 14px 0",
    color: "#000000",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  appliedFilters: { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" },
  filterTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    backgroundColor: "#7A0000",
    color: "white",
    borderRadius: "24px",
    fontSize: "14px",
    fontWeight: "500",
  },
  filterTagRemove: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
    padding: "0 0 0 4px",
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px 24px",
    marginBottom: "32px",
  },
  filterGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  filterGroupCourse: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    position: "relative",
  },
  courseDropdownPanel: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "4px",
    maxHeight: "220px",
    overflowY: "auto",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1)",
    border: "1px solid #e0e0e0",
    zIndex: 10,
  },
  courseDropdownOption: {
    padding: "10px 18px",
    fontSize: "15px",
    fontFamily: "Arial, Helvetica, sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  courseDropdownOptionSelected: {
    backgroundColor: "rgba(122, 0, 0, 0.1)",
    fontWeight: "600",
  },
  courseDropdownCheck: {
    color: "#7A0000",
    fontWeight: "bold",
  },
  courseSelectDisplay: {
    flex: 1,
    minWidth: 0,
    height: "48px",
    padding: "0 52px 0 18px",
    border: "none",
    borderRadius: "24px",
    fontSize: "15px",
    backgroundColor: "transparent",
    outline: "none",
    cursor: "pointer",
    fontFamily: "Arial, Helvetica, sans-serif",
    display: "flex",
    alignItems: "center",
  },
  filterGroupAvailability: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    gridColumn: "1 / -1",
  },
  filterLabel: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#000000",
    fontFamily: "Arial, Helvetica, sans-serif",
    marginBottom: "2px",
  },
  selectWrapper: {
    display: "flex",
    alignItems: "stretch",
    position: "relative",
    minHeight: "48px",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
    overflow: "hidden",
    cursor: "pointer",
  },
  select: {
    flex: 1,
    minWidth: 0,
    height: "48px",
    padding: "0 52px 0 18px",
    border: "none",
    borderRadius: "24px",
    fontSize: "15px",
    backgroundColor: "transparent",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  selectChevronBtn: {
    position: "absolute",
    right: "6px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  chevronSvg: { display: "block" },
  dateRangeRow: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  dateInputWrap: {
    position: "relative",
    flex: 1,
    minHeight: "48px",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  },
  dateIconLeft: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "20px",
    height: "20px",
    color: "#555",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dateInput: {
    width: "100%",
    height: "48px",
    padding: "0 18px 0 48px",
    border: "none",
    borderRadius: "24px",
    fontSize: "15px",
    backgroundColor: "transparent",
    outline: "none",
    cursor: "pointer",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  searchButtonRow: { display: "flex", justifyContent: "center", marginBottom: "0" },
  searchButton: {
    padding: "16px 56px",
    backgroundColor: "#C00000",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(192,0,0,0.35)",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  errorBox: {
    padding: "12px 20px",
    backgroundColor: "#ffebee",
    borderRadius: "8px",
    marginTop: "24px",
    marginBottom: "20px",
    maxWidth: "900px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  errorText: { margin: 0, color: "#c62828", fontSize: "14px" },
  resultsSection: { marginTop: "28px", maxWidth: "900px", marginLeft: "auto", marginRight: "auto" },
  resultsTitle: { fontSize: "20px", fontWeight: "bold", marginBottom: "16px" },
  resultCount: { fontWeight: "normal", color: "#666", fontSize: "16px" },
  noResults: { margin: 0, color: "#666", fontSize: "14px" },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
  tutorCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  tutorAvatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#E0E0E0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    margin: "0 auto 12px",
  },
  tutorName: { margin: "0 0 6px 0", fontSize: "16px", fontWeight: "bold" },
  tutorCourses: { margin: "0 0 8px 0", fontSize: "14px", color: "#666" },
  tutorRating: { marginBottom: "12px", fontSize: "14px" },
  bookButton: {
    padding: "8px 20px",
    backgroundColor: "#DC143C",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
  },
};

function SearchMagnifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block" }}>
      <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: "block" }}>
      <path d="M7 3v3M17 3v3M4 8h16M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
