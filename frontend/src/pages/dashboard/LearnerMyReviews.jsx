import { useCallback, useEffect, useMemo, useState } from "react";
import { getUser, getLearnerMyReviews } from "../../api";
import { getCachedLearnerReviews } from "../../utils/learnerReviewsCache";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

const PAGE_SIZE = 6;
const GOLD = "#E0B100";
const STAR_EMPTY = "#D1D1D1";

/** Shown when API + cache return nothing so the page still demonstrates the layout. */
const LEARNER_PLACEHOLDER_REVIEWS_RAW = [
  {
    id: "placeholder-learner-1",
    tutorFirstName: "Brad",
    tutorLastName: "Pitt",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Very patient and explains everything clearly!",
    createdAt: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "placeholder-learner-2",
    tutorFirstName: "Emma",
    tutorLastName: "Stone",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    comment:
      "Helpful with IPC144 — I finally understand loops and arrays after our session.",
    createdAt: "2026-03-14T16:20:00.000Z",
  },
  {
    id: "placeholder-learner-3",
    tutorFirstName: "James",
    tutorLastName: "Wilson",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Structured notes and great examples. Would book again.",
    createdAt: "2026-03-10T09:15:00.000Z",
  },
  {
    id: "placeholder-learner-4",
    tutorFirstName: "Sarah",
    tutorLastName: "Chen",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    rating: 4,
    comment: "Good pace for DBS311 — answers questions without rushing.",
    createdAt: "2026-03-08T11:45:00.000Z",
  },
  {
    id: "placeholder-learner-5",
    tutorFirstName: "Marcus",
    tutorLastName: "Nguyen",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 3,
    comment: "Solid session; a bit fast on joins but we covered what I needed.",
    createdAt: "2026-03-05T13:00:00.000Z",
  },
  {
    id: "placeholder-learner-6",
    tutorFirstName: "Priya",
    tutorLastName: "Sharma",
    tutorProfileImageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    rating: 5,
    comment: "Encouraging and clear — my confidence for the midterm is way up.",
    createdAt: "2026-03-01T08:30:00.000Z",
  },
];

function formatDateDdMmYyyy(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function normalizeReview(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id =
    raw.id != null
      ? String(raw.id)
      : `row-${raw.tutorId}-${raw.createdAt}-${raw.rating}`;
  const tutorFirstName =
    raw.tutorFirstName ?? raw.tutor?.firstName ?? raw.firstName ?? "";
  const tutorLastName =
    raw.tutorLastName ?? raw.tutor?.lastName ?? raw.lastName ?? "";
  const tutorProfileImageUrl =
    raw.tutorProfileImageUrl ??
    raw.tutorProfilePicture ??
    raw.tutor?.profileImageUrl ??
    raw.tutor?.profilePicture ??
    raw.tutor?.avatar ??
    null;
  return {
    id,
    tutorId: raw.tutorId ?? raw.tutor?.id ?? null,
    tutorFirstName,
    tutorLastName,
    tutorProfileImageUrl,
    rating: Math.min(5, Math.max(0, Number(raw.rating) || 0)),
    comment: raw.comment ?? raw.text ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
  };
}

function mergeReviews(apiList, cachedList) {
  const map = new Map();
  for (const c of cachedList) {
    const n = normalizeReview(c);
    if (n) map.set(n.id, n);
  }
  for (const a of apiList) {
    const n = normalizeReview(a);
    if (n) map.set(n.id, { ...map.get(n.id), ...n });
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

function tutorDisplayName(r) {
  const n = [r.tutorFirstName, r.tutorLastName].filter(Boolean).join(" ").trim();
  return n || "Tutor";
}

function tutorAvatarSrc(r) {
  if (r.tutorProfileImageUrl) return r.tutorProfileImageUrl;
  const name = tutorDisplayName(r);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=f5e6dc&color=7A0000&size=128`;
}

export default function LearnerMyReviews() {
  const user = getUser();
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
    let apiRows = [];
    try {
      const data = await getLearnerMyReviews();
      apiRows = Array.isArray(data) ? data : data?.content ?? [];
    } catch {
      apiRows = [];
    }
    const cached = getCachedLearnerReviews();
    const merged = mergeReviews(apiRows, cached);
    if (merged.length === 0) {
      setReviews(
        LEARNER_PLACEHOLDER_REVIEWS_RAW.map((r) => normalizeReview(r)).filter(
          Boolean
        )
      );
    } else {
      setReviews(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onStorage = () => load();
    window.addEventListener("scholarly-learner-reviews-changed", onStorage);
    return () =>
      window.removeEventListener("scholarly-learner-reviews-changed", onStorage);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((r) => {
      const name = tutorDisplayName(r).toLowerCase();
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
              placeholder="Search Tutor or Courses"
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

        {loading ? (
          <p style={styles.muted}>Loading reviews…</p>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>
            {reviews.length === 0
              ? "You have not submitted any reviews yet. After a session, leave a review from a tutor’s profile."
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
                        src={tutorAvatarSrc(r)}
                        alt=""
                        style={styles.avatarImg}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <div style={styles.cardHeaderText}>
                      <div style={styles.tutorName}>{tutorDisplayName(r)}</div>
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
                    {r.comment?.trim()
                      ? r.comment
                      : "—"}
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
  tutorName: {
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
