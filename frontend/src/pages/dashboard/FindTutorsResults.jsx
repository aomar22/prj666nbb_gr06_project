import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, searchTutors } from "../../api";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
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
    const queryParams = new URLSearchParams(location.search);
    const searchedDate = queryParams.get("availableFrom");

    if (searchedDate) {
      return `Available on ${searchedDate}`;
    }

    return tutor.availabilitySummary || "Check calendar for availability";
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
      <Sidebar />
      <main style={styles.mainContent}>
        <div style={{ marginBottom: "28px" }}>
          <Topbar
            placeholder="Search Tutor or Courses"
            value={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onSearchSubmit={(e) => {
              e?.preventDefault?.();
              handleSearchSubmit(e);
            }}
            avatarSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User")}&background=ddd&color=666&size=100`}
          />
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
                      <button
                        type="button"
                        style={styles.actionBtn}
                        onClick={() => navigate("/dashboard/learner/find-tutors/profile", { state: { tutor } })}
                      >
                        View Profile
                      </button>
                      <button type="button" style={styles.actionBtn}>Message</button>
                      <button type="button" style={styles.actionBtn}
                        onClick={() => {
                          const queryParams = new URLSearchParams(location.search);
                          const searchedDate = queryParams.get("availableFrom");

                          navigate("/dashboard/learner/booking", {
                            state: {
                              tutorId: tutor.id ?? tutor.userId,
                              tutor,
                              searchedDate: searchedDate
                            },
                          });
                        }}
                      >
                        Book session
                      </button>
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
  container: {
    display: "flex",
    minHeight: "100vh",
    height: "100vh",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: "#F8E9DC",
    padding: "24px 32px 48px",
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

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3 7 7 .5-5.3 4.6L18.5 21 12 17.2 5.5 21l1.8-6.9L2 9.5 9 9l3-7z" strokeLinejoin="round" />
    </svg>
  );
}
