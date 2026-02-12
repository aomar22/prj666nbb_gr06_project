import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { clearAuth, getUser, searchTutors } from "../../api";
import {
  CAMPUSES,
  COURSES,
  PROGRAMS,
  TEACHING_MODES,
  SESSION_TYPES,
  TEACHING_MODE_LABELS,
  SESSION_TYPE_LABELS,
  RATING_OPTIONS,
} from "../../constants/options";

export default function FindTutors() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // Search state - all filters support multiple selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCampuses, setSelectedCampuses] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedSessionTypes, setSelectedSessionTypes] = useState([]);
  const [selectedTeachingModes, setSelectedTeachingModes] = useState([]);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const [results, setResults] = useState(null);
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
  selectedSessionTypes.forEach((s) =>
    appliedFilters.push({
      key: `sessionType-${s}`,
      label: `Session: ${SESSION_TYPE_LABELS[s] || s}`,
      onRemove: () => setSelectedSessionTypes((prev) => prev.filter((x) => x !== s)),
    })
  );
  selectedTeachingModes.forEach((m) =>
    appliedFilters.push({
      key: `teachingMode-${m}`,
      label: `Mode: ${TEACHING_MODE_LABELS[m] || m}`,
      onRemove: () => setSelectedTeachingModes((prev) => prev.filter((x) => x !== m)),
    })
  );

  const handleSearch = async () => {
    setError(null);
    setResults(null);
    setLoading(true);
    try {
      const params = {
        page: 0,
        size: 20,
        sortBy: "rating",
        sortDirection: "desc",
      };
      if (searchQuery?.trim()) params.q = searchQuery.trim();
      if (selectedCampuses.length) params.campus = selectedCampuses;
      if (selectedPrograms.length) params.program = selectedPrograms;
      if (selectedCourses.length) params.courses = selectedCourses;
      if (selectedRatings.length) params.minRating = Math.min(...selectedRatings);
      if (selectedSessionTypes.length) params.sessionType = selectedSessionTypes;
      if (selectedTeachingModes.length) params.teachingMode = selectedTeachingModes;

      const page = await searchTutors(params);
      setResults(page);
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

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
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

  const toggleMulti = (setter, value) => {
    setter((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const ratingOptionsWithValues = RATING_OPTIONS.filter((r) => r.value !== "");

  return (
    <div style={styles.container}>
      {/* Sidebar - same design as AvailabilityV2 */}
      <aside className="fixed left-0 top-0 z-10 w-[210px] h-screen bg-[#7A0000] text-white px-5 pt-6 pb-[70px] flex flex-col shrink-0">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <img src="/hat.png" alt="logo" className="h-7 w-7" />
          </div>
          <div className="mt-3 text-center">
            <div className="text-[22px] font-extrabold leading-none">Scholarly</div>
            <div className="mt-1 text-[11px] font-semibold opacity-90">Connect. Learn. Grow.</div>
          </div>
        </div>
        <nav className="mt-11 space-y-2 text-[15px] font-semibold">
          <Link
            to="/dashboard/learner"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname === "/dashboard/learner" ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <span className="opacity-95"><HomeIcon /></span>
            <span>Dashboard</span>
          </Link>
          <a href="#" className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition hover:bg-white/10 text-white no-underline">
            <span className="opacity-95"><CalendarIcon /></span>
            <span>My Sessions</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition hover:bg-white/10 text-white no-underline">
            <span className="opacity-95"><ClockIcon /></span>
            <span>Availability</span>
          </a>
          <Link
            to="/dashboard/learner/find-tutors"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname.includes("/find-tutors") ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <span className="opacity-95"><UsersIcon /></span>
            <span>Find Tutors</span>
          </Link>
          <a href="#" className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition hover:bg-white/10 text-white no-underline">
            <span className="opacity-95"><ChatIcon /></span>
            <span>Messages</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition hover:bg-white/10 text-white no-underline">
            <span className="opacity-95"><StarIcon /></span>
            <span>My Reviews</span>
          </a>
        </nav>
        <div className="mt-auto pt-6 space-y-2 text-[15px] font-semibold">
          <a href="#" className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition hover:bg-white/10 text-white no-underline">
            <span className="opacity-95"><SettingsIcon /></span>
            <span>Settings</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition hover:bg-white/10 text-white border-0 bg-transparent cursor-pointer text-[15px] font-semibold w-full text-left"
          >
            <span className="opacity-95"><LogoutIcon /></span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content - white area matching design */}
      <main style={styles.mainContent}>
        <div style={styles.contentCard}>
          <h1 style={styles.pageTitle}>Search Tutor or Courses</h1>

          {/* Search Bar */}
          <div style={styles.searchRow}>
            <input
              type="text"
              placeholder="Search"
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <span style={styles.searchIcon}>🔍</span>
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
                  {COURSES.map((c) => (
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
            {/* Session Type - multi-select */}
            <div style={styles.filterGroupCourse}>
              <label style={styles.filterLabel}>Session Type</label>
              <div style={styles.selectWrapper} onClick={() => setOpenDropdown((o) => (o === "sessionType" ? null : "sessionType"))}>
                <div style={styles.courseSelectDisplay}>
                  {selectedSessionTypes.length === 0
                    ? "Select session type(s)"
                    : selectedSessionTypes.map((s) => SESSION_TYPE_LABELS[s] || s).join(", ")}
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
                      aria-selected={selectedSessionTypes.includes(s)}
                      style={{
                        ...styles.courseDropdownOption,
                        ...(selectedSessionTypes.includes(s) ? styles.courseDropdownOptionSelected : {}),
                      }}
                      onClick={() => toggleMulti(setSelectedSessionTypes, s)}
                    >
                      {SESSION_TYPE_LABELS[s] || s}
                      {selectedSessionTypes.includes(s) && <span style={styles.courseDropdownCheck}>✓</span>}
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
              <div style={styles.dateInputWrap}>
                <input
                  type="date"
                  style={styles.dateInput}
                  value={availabilityDate}
                  onChange={(e) => setAvailabilityDate(e.target.value)}
                />
                <div style={styles.dateCalendarBtn}>
                  <span style={styles.calendarIcon}>📅</span>
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

        {/* Results */}
        {results && !loading && (
          <section style={styles.resultsSection}>
            <h2 style={styles.resultsTitle}>
              Results
              {results.totalElements != null && (
                <span style={styles.resultCount}> ({results.totalElements})</span>
              )}
            </h2>
            {(!results.content || results.content.length === 0) ? (
              <p style={styles.noResults}>No tutors found. Try adjusting your filters.</p>
            ) : (
              <div style={styles.resultsGrid}>
                {results.content.map((tutor) => (
                  <div key={tutor.id || tutor.userId} style={styles.tutorCard}>
                    <div style={styles.tutorAvatar}>
                      {tutor.firstName?.[0] || "👤"}
                    </div>
                    <h3 style={styles.tutorName}>
                      {[tutor.firstName, tutor.lastName].filter(Boolean).join(" ") || "Tutor"}
                    </h3>
                    <p style={styles.tutorCourses}>
                      {Array.isArray(tutor.coursesOffered) && tutor.coursesOffered.length
                        ? tutor.coursesOffered.join(", ")
                        : tutor.program || "—"}
                    </p>
                    {(tutor.rating != null || tutor.reviewCount != null) && (
                      <div style={styles.tutorRating}>
                        ⭐ {tutor.rating != null ? Number(tutor.rating).toFixed(1) : "—"}
                        {tutor.reviewCount != null && ` (${tutor.reviewCount} reviews)`}
                      </div>
                    )}
                    <button style={styles.bookButton}>Book session</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  sidebar: {
    width: "250px",
    backgroundColor: "#8B1A1A",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
  },
  sidebarHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" },
  logoCircle: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  graduationCap: { fontSize: "24px" },
  logoText: { margin: 0, fontSize: "20px", fontWeight: "bold" },
  tagline: { margin: 0, fontSize: "12px", opacity: 0.9 },
  nav: { display: "flex", flexDirection: "column", gap: "15px", flex: 1 },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "white",
    textDecoration: "none",
    padding: "10px",
    borderRadius: "5px",
  },
  navItemActive: { backgroundColor: "rgba(255, 255, 255, 0.2)" },
  sidebarFooter: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "auto",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    paddingTop: "15px",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "white",
    backgroundColor: "transparent",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "inherit",
    fontFamily: "inherit",
    textAlign: "left",
  },
  mainContent: {
    flex: 1,
    marginLeft: "210px",
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
  },
  searchInput: {
    width: "100%",
    height: "48px",
    padding: "0 48px 0 18px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
    outline: "none",
  },
  searchIcon: {
    position: "absolute",
    right: "18px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    pointerEvents: "none",
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
  dateInputWrap: {
    position: "relative",
    width: "100%",
    minHeight: "48px",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  dateInput: {
    width: "100%",
    height: "48px",
    padding: "0 52px 0 18px",
    border: "none",
    borderRadius: "24px",
    fontSize: "15px",
    backgroundColor: "transparent",
    outline: "none",
    cursor: "pointer",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  dateCalendarBtn: {
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
  calendarIcon: {
    fontSize: "16px",
    lineHeight: 1,
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

function IconBase({ children }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">{children}</svg>;
}
function HomeIcon() {
  return <IconBase><path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}
function CalendarIcon() {
  return <IconBase><path d="M7 3v3M17 3v3M4 8h16M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>;
}
function ClockIcon() {
  return <IconBase><path d="M12 22a10 10 0 110-20 10 10 0 010 20z" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}
function UsersIcon() {
  return <IconBase><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" /><path d="M22 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></IconBase>;
}
function ChatIcon() {
  return <IconBase><path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}
function StarIcon() {
  return <IconBase><path d="M12 2l3 7 7 .5-5.3 4.6L18.5 21 12 17.2 5.5 21l1.8-6.9L2 9.5 9 9l3-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}
function SettingsIcon() {
  return <IconBase><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a7.8 7.8 0 000-6l2-1.1-2-3.5-2.3.7a8 8 0 00-5.2-3L11.5 0h-3L8 2a8 8 0 00-5.2 3l-2.3-.7-2 3.5L.5 9a7.8 7.8 0 000 6l-2 1.1 2 3.5 2.3-.7a8 8 0 005.2 3l.5 2h3l.4-2a8 8 0 005.2-3l2.3.7 2-3.5-2-1.1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}
function LogoutIcon() {
  return <IconBase><path d="M10 17l1 4H5a2 2 0 01-2-2V5a2 2 0 012-2h6l-1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M15 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18 9l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}
