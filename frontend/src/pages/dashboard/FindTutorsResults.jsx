import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, searchTutors, getTutorReviews } from "../../api";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { TEACHING_MODE_LABELS } from "../../constants/options";
import Avatar from "../../components/ui/Avatar";

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

  /** tutorId -> reviews list (newest first), from GET /api/reviews/tutor/{tutorId} */
  const [reviewsByTutorId, setReviewsByTutorId] = useState({});
  /** True once reviews have been fetched for the current result page (so we can show "no reviews" vs about text). */
  const [tutorReviewsFetchedForKey, setTutorReviewsFetchedForKey] = useState("");
  const tutorIdsForReviewsKey = useMemo(
    () => (results?.content ?? []).map((t) => t.id ?? t.userId).filter(Boolean).join(","),
    [results],
  );

  useEffect(() => {
    if (!tutorIdsForReviewsKey) {
      setReviewsByTutorId({});
      setTutorReviewsFetchedForKey("");
      return;
    }
    const ids = tutorIdsForReviewsKey.split(",");
    let cancelled = false;
    setTutorReviewsFetchedForKey("");
    Promise.all(
      ids.map((id) =>
        getTutorReviews(id)
          .then((data) => [id, Array.isArray(data) ? data : []])
          .catch(() => [id, []]),
      ),
    ).then((entries) => {
      if (cancelled) return;
      setReviewsByTutorId(Object.fromEntries(entries));
      setTutorReviewsFetchedForKey(tutorIdsForReviewsKey);
    });
    return () => {
      cancelled = true;
    };
  }, [tutorIdsForReviewsKey]);

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
    const about = tutor.about ?? tutor.bio;
    if (about) return about;
    const courses = Array.isArray(tutor.coursesOffered) && tutor.coursesOffered.length
      ? tutor.coursesOffered.join(", ")
      : tutor.program || "subjects";
    return `Passionate about helping students master ${courses}.`;
  };

  const cardReviewSnippet = (reviewsList) => {
    const latest = reviewsList?.[0];
    if (!latest) return null;
    const name = (latest.learnerName && String(latest.learnerName).trim()) || "Learner";
    const maxLen = 160;
    if (latest.comment && String(latest.comment).trim()) {
      const c = String(latest.comment).trim();
      const shortened = c.length > maxLen ? `${c.slice(0, maxLen).trimEnd()}…` : c;
      return { text: `"${shortened}"`, attribution: `— ${name}` };
    }
    return {
      text: `Rated ${latest.rating} out of 5`,
      attribution: `— ${name}`,
    };
  };

  const NO_REVIEWS_FOR_TUTOR_HINT =
    "This tutor has not received any reviews yet. Learners can leave feedback after a completed session.";

  const renderTutorQuoteBlock = (tutor) => {
    const tid = tutor.id ?? tutor.userId;
    const list = tid ? reviewsByTutorId[tid] : undefined;
    const reviewsLoadedForPage =
      tutorIdsForReviewsKey !== "" && tutorReviewsFetchedForKey === tutorIdsForReviewsKey;
    const snippet = cardReviewSnippet(list);

    if (snippet) {
      return (
        <>
          <p style={styles.reviewLatestLabel}>Latest review</p>
          <p style={styles.tutorQuote}>{snippet.text}</p>
          <p style={styles.reviewAttribution}>{snippet.attribution}</p>
        </>
      );
    }
    if (reviewsLoadedForPage && tid && Array.isArray(list) && list.length === 0) {
      return <p style={styles.noReviewsHint}>{NO_REVIEWS_FOR_TUTOR_HINT}</p>;
    }
    return <p style={styles.tutorQuote}>"{tutorQuote(tutor)}"</p>;
  };


  const handleOpenChat = (tutor) => {
    if (!tutor?.id && !tutor?.userId) return;

    navigate("/dashboard/learner/messages", {
      state: {
        selectedTutor: {
          id: tutor.id ?? tutor.userId,
          name:
            [tutor.firstName, tutor.lastName].filter(Boolean).join(" ") ||
            "Tutor",
          avatar:
            tutor.profileImageUrl ||
            tutor.profilePicture ||
            tutor.avatar ||
            null,
          roleLabel: "Certified Peer Tutor",
          rating: tutor.rating,
          reviews: tutor.reviewCount,
        },
        slotId: null,
      },
    });
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
                  <div key={tutor.id ?? tutor.userId} style={styles.tutorCard}>
                    <div style={styles.tutorCardTop}>
                      <div style={styles.tutorCardLeft}>
                        <Avatar person={tutor} size={56} />
                        {/* <div style={styles.tutorAvatar}>
                          <img
                            src={getTutorAvatarUrl(tutor)}
                            alt=""
                            style={styles.tutorAvatarImg}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                          <span style={styles.tutorAvatarLetter} aria-hidden="true">
                            {tutor.firstName?.[0] || "T"}
                          </span>
                        </div> */}
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
                    <div style={styles.quoteBlock}>{renderTutorQuoteBlock(tutor)}</div>
                    <div style={styles.tutorActions}>
                      <button
                        type="button"
                        style={styles.actionBtn}
                        onClick={() => navigate("/dashboard/learner/find-tutors/profile", { state: { tutor } })}
                      >
                        View Profile
                      </button>
                      <button 
                      type="button"
                      style={styles.actionBtn}
                      onClick={() => handleOpenChat(tutor)}
                      >
                        Message
                        </button>
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
  quoteBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  reviewLatestLabel: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "14px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#888",
  },
  tutorQuote: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "17px",
    fontWeight: 700,
    fontStyle: "italic",
    color: "#555",
  },
  reviewAttribution: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "16px",
    fontWeight: 600,
    fontStyle: "normal",
    color: "#666",
  },
  noReviewsHint: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: 600,
    fontStyle: "normal",
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
