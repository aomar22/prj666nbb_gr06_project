import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { clearAuth, getUser, searchTutors } from "../../api";
import { TEACHING_MODE_LABELS } from "../../constants/options";

export default function FindTutorsResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const { searchParams: initialSearchParams, initialResults } = location.state || {};

  const [searchQuery, setSearchQuery] = useState(initialSearchParams?.q ?? "");
  const [results, setResults] = useState(initialResults ?? null);
  const [loading, setLoading] = useState(!initialResults && !!initialSearchParams);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialSearchParams?.page ?? 0);
  const [searchParams, setSearchParams] = useState(initialSearchParams || {});

  const totalPages = results?.totalPages ?? 0;
  const totalElements = results?.totalElements ?? 0;
  const tutors = results?.content ?? [];

  // Run search when we have params but no initial results (e.g. direct nav) or when page changes
  useEffect(() => {
    if (!initialSearchParams && !location.state) {
      navigate("/dashboard/learner/find-tutors", { replace: true });
      return;
    }
    const params = { ...searchParams, page: currentPage, size: 8 };
    if (!initialResults && initialSearchParams && currentPage === 0) {
      fetchResults(params);
      return;
    }
    if (initialResults && currentPage === (initialSearchParams?.page ?? 0)) {
      setResults(initialResults);
      return;
    }
    fetchResults(params);
  }, [currentPage]);

  function fetchResults(params) {
    setLoading(true);
    setError(null);
    searchTutors(params)
      .then((page) => {
        setResults(page);
        setSearchParams(params);
      })
      .catch((err) => {
        const msg = err?.message || "Search failed. Please try again.";
        setError(msg === "Failed to fetch" || msg.includes("NetworkError")
          ? "Cannot reach the server. Is the backend running on http://localhost:8080?"
          : msg);
      })
      .finally(() => setLoading(false));
  }

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = { ...searchParams, q: searchQuery?.trim() || undefined, page: 0 };
    setCurrentPage(0);
    setSearchParams(params);
    setLoading(true);
    setError(null);
    searchTutors({ ...params, page: 0, size: 8 })
      .then((page) => {
        setResults(page);
      })
      .catch((err) => {
        setError(err?.message || "Search failed.");
      })
      .finally(() => setLoading(false));
  };

  const goToPage = (page) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  const formatTeachingMode = (tutor) => {
    const modes = tutor.teachingMode;
    if (Array.isArray(modes) && modes.length) {
      return modes.map((m) => TEACHING_MODE_LABELS[m] || m).join(" / ");
    }
    return "Online / In-person";
  };

  const formatAvailability = (tutor) => {
    if (tutor.availability) return tutor.availability;
    const examples = ["Evenings (Mon-Fri)", "Weekends (Sat-Sun)", "Afternoons (Tue-Thu)", "Mon-Wed"];
    const idx = (tutor.id || tutor.userId || 0) % examples.length;
    return examples[idx];
  };

  const formatCampus = (tutor) => {
    if (Array.isArray(tutor.campus) && tutor.campus.length) return tutor.campus.join(", ");
    if (tutor.campus) return tutor.campus;
    return "Newnham";
  };

  const tutorQuote = (tutor) => {
    if (tutor.bio) return tutor.bio;
    const courses = Array.isArray(tutor.coursesOffered) && tutor.coursesOffered.length
      ? tutor.coursesOffered.join(", ")
      : tutor.program || "subjects";
    return `Passionate about helping students master ${courses}.`;
  };

  const TUTOR_PLACEHOLDER_PHOTOS = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=100&h=100&fit=crop&crop=face",
  ];

  const getTutorAvatarUrl = (tutor) => {
    if (tutor.profileImageUrl) return tutor.profileImageUrl;
    const seed = (tutor.id ?? tutor.userId ?? [tutor.firstName, tutor.lastName].filter(Boolean).join(" ")) || "tutor";
    const str = String(seed);
    let index = 0;
    for (let i = 0; i < str.length; i++) index = (index + str.charCodeAt(i)) % TUTOR_PLACEHOLDER_PHOTOS.length;
    return TUTOR_PLACEHOLDER_PHOTOS[Math.abs(index)];
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
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
            className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline hover:bg-white/10"
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
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname.includes("find-tutors") ? "bg-white/15" : "hover:bg-white/10"}`}
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
        <div className="mt-auto pt-6 border-t border-white/20 space-y-2 text-[15px] font-semibold">
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

      {/* Main content */}
      <main style={styles.mainContent}>
        {/* Top bar: search + filter icon + bell + profile */}
        <div style={styles.topBar}>
          <form style={styles.searchForm} onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search Tutor or Courses"
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" style={styles.searchIconBtn} aria-label="Search">
              <SearchMagnifyIcon />
            </button>
          </form>
          <div style={styles.topBarIcons}>
            <button type="button" style={styles.iconBtn} aria-label="Filter or sort">
              <FilterSortIcon />
            </button>
            <button type="button" style={styles.iconBtn} aria-label="Notifications">
              <span style={styles.bellWrap}>
                <BellIcon />
                <span style={styles.badge}>3</span>
              </span>
            </button>
            <button type="button" style={styles.avatarBtn} aria-label="Profile">
              <div style={styles.avatar}>
                {user?.firstName?.[0] || "U"}
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {loading && !results && (
          <p style={styles.loadingText}>Loading results…</p>
        )}

        {!loading && results && (
          <>
            <div style={styles.resultsGrid}>
              {tutors.length === 0 ? (
                <p style={styles.noResults}>No tutors found. Try adjusting your search or filters.</p>
              ) : (
                tutors.map((tutor) => (
                  <div key={tutor.id ?? tutor.userId ?? Math.random()} style={styles.tutorCard}>
                    <div style={styles.tutorCardTop}>
                      <div style={styles.tutorCardLeft}>
                        <div style={styles.tutorAvatar}>
                          <img
                            src={getTutorAvatarUrl(tutor)}
                            alt=""
                            style={styles.tutorAvatarImg}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <span style={styles.tutorAvatarLetter} aria-hidden="true">
                            {tutor.firstName?.[0] || "T"}
                          </span>
                        </div>
                        <div style={styles.tutorCardHead}>
                          <h3 style={styles.tutorName}>
                            {[tutor.firstName, tutor.lastName].filter(Boolean).join(" ") || "Tutor"}
                          </h3>
                          <p style={styles.tutorSubtitle}>Certified Peer Tutor</p>
                        </div>
                      </div>
                      <div style={styles.tutorRatingTopRight}>
                        <div style={styles.tutorRatingRow}>
                          <StarIcon />
                          <span>{tutor.rating != null ? Number(tutor.rating).toFixed(1) : "—"}</span>
                        </div>
                        <div style={styles.reviewCountLine}>
                          ({tutor.reviewCount ?? 0} reviews)
                        </div>
                      </div>
                    </div>
                    <div style={styles.tutorDetails}>
                      <p style={styles.detailRow}>
                        <strong>Courses:</strong>{" "}
                        {Array.isArray(tutor.coursesOffered) && tutor.coursesOffered.length
                          ? tutor.coursesOffered.join(", ")
                          : tutor.program || "—"}
                      </p>
                      <p style={styles.detailRow}>
                        <strong>Availability:</strong> {formatAvailability(tutor)}
                      </p>
                      <p style={styles.detailRow}>
                        <strong>Teaching Mode:</strong> {formatTeachingMode(tutor)}
                      </p>
                      <p style={styles.detailRow}>
                        <strong>Campus:</strong> {formatCampus(tutor)}
                      </p>
                    </div>
                    <p style={styles.tutorQuote}>"{tutorQuote(tutor)}"</p>
                    <div style={styles.tutorActions}>
                      <button type="button" style={styles.actionBtn}>View Profile</button>
                      <button type="button" style={styles.actionBtn}>Message</button>
                      <button type="button" style={styles.actionBtn}>Book session</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i).map((i) => (
                  <button
                    key={i}
                    type="button"
                    style={{
                      ...styles.pageNum,
                      ...(i === currentPage ? styles.pageNumActive : {}),
                    }}
                    onClick={() => goToPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  style={styles.pageNext}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh" },
  mainContent: {
    flex: 1,
    marginLeft: "210px",
    backgroundColor: "#F8E9DC",
    padding: "24px 32px 48px",
    minHeight: "100vh",
    fontFamily: '"SF Mono", Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  searchForm: {
    flex: "1 1 400px",
    minWidth: 0,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    height: "52px",
    padding: "0 52px 0 24px",
    borderRadius: "9999px",
    border: "none",
    fontSize: "16px",
    color: "#333",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
    outline: "none",
    fontFamily: 'inherit',
  },
  searchIconBtn: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    background: "transparent",
    color: "#555",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarIcons: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#333",
  },
  bellWrap: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    minWidth: "18px",
    height: "18px",
    borderRadius: "9px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  avatarBtn: {
    padding: 0,
    border: "none",
    background: "none",
    cursor: "pointer",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "#7A0000",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    padding: "12px 20px",
    backgroundColor: "#ffebee",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  errorText: { margin: 0, color: "#c62828", fontSize: "14px" },
  loadingText: { margin: 0, color: "#666", fontSize: "16px" },
  noResults: { margin: 0, color: "#666", fontSize: "16px", gridColumn: "1 / -1" },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "24px",
    maxWidth: "100%",
  },
  tutorCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    letterSpacing: 0,
  },
  tutorCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  tutorCardLeft: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    minWidth: 0,
    flex: 1,
  },
  tutorRatingTopRight: {
    flexShrink: 0,
    textAlign: "right",
  },
  tutorRatingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "4px",
    fontSize: "15px",
    lineHeight: "17px",
    fontWeight: 700,
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#000",
  },
  reviewCountLine: {
    fontSize: "14px",
    lineHeight: "17px",
    fontWeight: 400,
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#555",
    marginTop: "2px",
  },
  tutorAvatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#E8E0D8",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
  },
  tutorAvatarImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 1,
  },
  tutorAvatarLetter: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "bold",
    color: "#7A0000",
    zIndex: 0,
  },
  tutorCardHead: { flex: 1, minWidth: 0 },
  tutorName: {
    margin: "0 0 2px 0",
    fontSize: "15px",
    lineHeight: "17px",
    fontWeight: 700,
    color: "#000",
  },
  tutorSubtitle: {
    margin: "0 0 8px 0",
    fontSize: "15px",
    lineHeight: "17px",
    fontWeight: 700,
    color: "#555",
  },
  tutorDetails: { display: "flex", flexDirection: "column", gap: "4px" },
  detailRow: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "20px",
    fontStyle: "bold",
    fontWeight: 700,
    color: "#333",
  },
  tutorQuote: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "17px",
    fontWeight: 700,
    fontStyle: "italic",
    color: "#555",
  },
  tutorActions: {
    display: "flex",
    gap: "30px",
    marginTop: "16px",
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    padding: "12px 16px",
    backgroundColor: "#FF4245",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    lineHeight: "17px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "none",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "32px",
  },
  pageNum: {
    minWidth: "40px",
    height: "40px",
    padding: "0 12px",
    border: "none",
    borderRadius: "8px",
    background: "#fff",
    color: "#000",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  pageNumActive: {
    backgroundColor: "#7A0000",
    color: "#fff",
    textDecoration: "underline",
  },
  pageNext: {
    minWidth: "40px",
    height: "40px",
    border: "none",
    borderRadius: "8px",
    background: "#fff",
    color: "#000",
    fontSize: "18px",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
};

function IconBase({ children, width = 18, height = 18 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}
function SearchMagnifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FilterSortIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      <path d="M8 4v4M8 16v4M16 8v8" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3 7 7 .5-5.3 4.6L18.5 21 12 17.2 5.5 21l1.8-6.9L2 9.5 9 9l3-7z" strokeLinejoin="round" />
    </svg>
  );
}
function SettingsIcon() {
  return <IconBase><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a7.8 7.8 0 000-6l2-1.1-2-3.5-2.3.7a8 8 0 00-5.2-3L11.5 0h-3L8 2a8 8 0 00-5.2 3l-2.3-.7-2 3.5L.5 9a7.8 7.8 0 000 6l-2 1.1 2 3.5 2.3-.7a8 8 0 005.2 3l.5 2h3l.4-2a8 8 0 005.2-3l2.3.7 2-3.5-2-1.1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}
function LogoutIcon() {
  return <IconBase><path d="M10 17l1 4H5a2 2 0 01-2-2V5a2 2 0 012-2h6l-1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M15 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18 9l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}
