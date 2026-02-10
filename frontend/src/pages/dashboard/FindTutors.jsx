import { useState } from "react";
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

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [program, setProgram] = useState("");
  const [course, setCourse] = useState("");
  const [campus, setCampus] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [teachingMode, setTeachingMode] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState(""); 

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Applied filters shown as removable tags
  const appliedFilters = [];
  if (campus) appliedFilters.push({ key: "campus", label: `Campus: ${campus}`, onRemove: () => setCampus("") });
  if (program) appliedFilters.push({ key: "program", label: `Program: ${program}`, onRemove: () => setProgram("") });
  if (course) appliedFilters.push({ key: "course", label: `Course: ${course}`, onRemove: () => setCourse("") });
  if (minRating) appliedFilters.push({ key: "rating", label: `Rating: ${minRating}+`, onRemove: () => setMinRating("") });
  if (sessionType)
    appliedFilters.push({
      key: "sessionType",
      label: `Session Type: ${SESSION_TYPE_LABELS[sessionType] || sessionType}`,
      onRemove: () => setSessionType(""),
    });
  if (teachingMode)
    appliedFilters.push({
      key: "teachingMode",
      label: `Teaching Mode: ${TEACHING_MODE_LABELS[teachingMode] || teachingMode}`,
      onRemove: () => setTeachingMode(""),
    });

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
      if (campus) params.campus = campus;
      if (program) params.program = program;
      if (course) params.courses = [course];
      if (minRating) params.minRating = parseFloat(minRating);
      if (sessionType) params.sessionType = [sessionType];
      if (teachingMode) params.teachingMode = [teachingMode];

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

  return (
    <div style={styles.container}>
      {/* Sidebar - same design as AvailabilityV2 */}
      <aside className="w-[210px] min-h-screen bg-[#7A0000] text-white px-5 pt-6 pb-[70px] flex flex-col shrink-0">
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

      {/* Main Content */}
      <main style={styles.mainContent}>
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
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Program / Major</label>
            <select
              style={styles.select}
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            >
              <option value="">Select program</option>
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Campus</label>
            <select style={styles.select} value={campus} onChange={(e) => setCampus(e.target.value)}>
              <option value="">Select campus</option>
              {CAMPUSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Course</label>
            <select style={styles.select} value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Select course</option>
              {COURSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Tutor Rating</label>
            <select
              style={styles.select}
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              {RATING_OPTIONS.map((r) => (
                <option key={r.value || "any"} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Session Type</label>
            <select
              style={styles.select}
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="">Select session type</option>
              {SESSION_TYPES.map((s) => (
                <option key={s} value={s}>
                  {SESSION_TYPE_LABELS[s] || s}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Teaching Mode</label>
            <select
              style={styles.select}
              value={teachingMode}
              onChange={(e) => setTeachingMode(e.target.value)}
            >
              <option value="">Select teaching mode</option>
              {TEACHING_MODES.map((m) => (
                <option key={m} value={m}>
                  {TEACHING_MODE_LABELS[m] || m}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Availability</label>
            <input
              type="date"
              style={styles.dateInput}
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
            />
          </div>
        </div>
        <div style={styles.searchButtonRow}>
          <button style={styles.searchButton} onClick={handleSearch} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
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
  mainContent: { flex: 1, backgroundColor: "#F5F5DC", padding: "30px" },
  pageTitle: { fontSize: "28px", fontWeight: "bold", margin: "0 0 20px 0" },
  searchRow: { position: "relative", maxWidth: "500px", marginBottom: "24px" },
  searchInput: {
    width: "100%",
    padding: "12px 40px 12px 15px",
    borderRadius: "25px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  searchIcon: { position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)" },
  filtersHeading: { fontSize: "16px", fontWeight: "600", margin: "0 0 12px 0" },
  appliedFilters: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" },
  filterTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    backgroundColor: "#8B4513",
    color: "white",
    borderRadius: "20px",
    fontSize: "14px",
  },
  filterTagRemove: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  filterGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  filterLabel: { fontSize: "14px", fontWeight: "500", color: "#333" },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    backgroundColor: "white",
  },
  dateInput: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  searchButtonRow: { marginBottom: "24px" },
  searchButton: {
    padding: "12px 32px",
    backgroundColor: "#DC143C",
    color: "white",
    border: "none",
    borderRadius: "25px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorBox: { padding: "12px 20px", backgroundColor: "#ffebee", borderRadius: "8px", marginBottom: "20px" },
  errorText: { margin: 0, color: "#c62828", fontSize: "14px" },
  resultsSection: { marginTop: "24px" },
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
