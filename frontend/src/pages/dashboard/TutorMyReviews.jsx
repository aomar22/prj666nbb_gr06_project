import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser } from "../../api";
import {
  fetchMergedTutorReviewsForTutor,
  tutorReviewerAvatarSrc,
  tutorReviewerDisplayName,
} from "../../utils/tutorReceivedReviewUtils";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

const PAGE_SIZE = 6;
const GOLD = "#E0B100";
const STAR_EMPTY = "#D1D1D1";

function formatDateDdMmYyyy(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function TutorMyReviews() {
  const user = getUser();
  const tutorId = user?.id;
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.lastName || user?.email || "User";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    if (tutorId != null) {
      try {
        const list = await fetchMergedTutorReviewsForTutor(tutorId);
        setReviews(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to fetch tutor reviews", error);
        setReviews([]);
      }
    } else {
      setReviews([]);
    }
    setLoading(false);
  }, [tutorId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("scholarly-tutor-reviews-changed", onChanged);
    return () =>
      window.removeEventListener("scholarly-tutor-reviews-changed", onChanged);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) => {
      const name = tutorReviewerDisplayName(r).toLowerCase();
      const text = (r.comment || "").toLowerCase();
      return name.includes(q) || text.includes(q);
    });
  }, [reviews, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const p = Math.max(0, safePage - 1);
    return filtered.slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    return [1, 2, 3, "…", totalPages];
  }, [totalPages]);

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        <div style={styles.topRow}>
          <div style={styles.topBarWrap}>
            <Topbar
              placeholder="Search Students or Courses"
              value={query}
              onSearchChange={(e) => setQuery(e.target.value)}
              onSearchSubmit={() => {}}
              avatarSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                userName
              )}&background=ddd&color=666&size=100`}
            />
          </div>
          <button
            type="button"
            style={styles.filterBtn}
            aria-label="Sort or filter"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 6h16M8 12h8M11 18h2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <h1 style={styles.pageTitle}>My Reviews</h1>

        {!tutorId ? (
          <p style={styles.empty}>
            We could not determine your tutor profile. Please sign in again or
            complete onboarding.
          </p>
        ) : loading ? (
          <p style={styles.muted}>Loading reviews…</p>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>
            {reviews.length === 0
              ? "You have not received any reviews yet. Learners can leave feedback after a completed session."
              : "No reviews match your search."}
          </p>
        ) : (
          <>
            <div style={styles.grid}>
              {pageSlice.map((r) => (
                <article key={r.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.avatarWrap}>
                      <img
                        src={tutorReviewerAvatarSrc(r)}
                        alt=""
                        style={styles.avatarImg}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div style={styles.cardHeaderText}>
                      <div style={styles.reviewerName}>{tutorReviewerDisplayName(r)}</div>
                      <div style={styles.starsRow} aria-hidden>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            style={{
                              color: s <= r.rating ? GOLD : STAR_EMPTY,
                              fontSize: "18px",
                              lineHeight: 1,
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p style={styles.comment}>
                    {r.comment?.trim() ? r.comment : "—"}
                  </p>
                  <div style={styles.cardFooter}>
                    <span style={styles.date}>
                      {formatDateDdMmYyyy(r.createdAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav style={styles.pagination} aria-label="Pagination">
                {pageNumbers.map((n, i) =>
                  n === "…" ? (
                    <span key={`e-${i}`} style={styles.pageEllipsis}>
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      style={
                        n === safePage ? styles.pageBtnActive : styles.pageBtn
                      }
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  type="button"
                  style={styles.pageBtn}
                  aria-label="Next page"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  &gt;
                </button>
              </nav>
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
    fontFamily: "Ligconsolata, Arial, sans-serif",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: "#F8E9DC",
    padding: "24px 32px 48px",
  },
  topRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "28px",
  },
  topBarWrap: {
    flex: 1,
    minWidth: 0,
  },
  filterBtn: {
    marginTop: "10px",
    flexShrink: 0,
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    boxShadow: "0px 6px 14px rgba(0,0,0,0.12)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1a1a1a",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#111",
    margin: "0 0 24px",
    letterSpacing: "-0.02em",
  },
  muted: {
    color: "#555",
    fontSize: "16px",
  },
  empty: {
    color: "#444",
    fontSize: "16px",
    maxWidth: "520px",
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  card: {
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    padding: "20px 20px 16px",
    display: "flex",
    flexDirection: "column",
    minHeight: "180px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "12px",
  },
  avatarWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#eee",
    flexShrink: 0,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  reviewerName: {
    fontWeight: 700,
    fontSize: "17px",
    color: "#111",
    marginBottom: "6px",
  },
  starsRow: {
    display: "flex",
    gap: "2px",
    letterSpacing: "-2px",
  },
  comment: {
    margin: 0,
    flex: 1,
    fontSize: "15px",
    lineHeight: 1.45,
    color: "#222",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "16px",
    paddingTop: "4px",
  },
  date: {
    fontSize: "13px",
    color: "#333",
    fontWeight: 500,
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  pageBtn: {
    border: "none",
    background: "transparent",
    fontSize: "17px",
    fontWeight: 600,
    color: "#111",
    cursor: "pointer",
    padding: "4px 8px",
  },
  pageBtnActive: {
    border: "none",
    background: "transparent",
    fontSize: "17px",
    fontWeight: 700,
    color: "#C41E3A",
    cursor: "pointer",
    padding: "4px 8px",
  },
  pageEllipsis: {
    color: "#666",
    padding: "4px",
  },
};
