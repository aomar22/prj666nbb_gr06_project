import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { clearAuth, getUser, searchLearnersByCourse, getTutorSessions } from "../../api";
import {
  fetchRecentTutorReviewsForDashboard,
  tutorReviewerAvatarSrc,
  tutorReviewerDisplayName,
} from "../../utils/tutorReceivedReviewUtils";
import Topbar from "../../components/layout/Topbar";

const DASHBOARD_REVIEW_PREVIEW_LEN = 90;

function truncateReviewText(text, maxLen = DASHBOARD_REVIEW_PREVIEW_LEN) {
  const t = (text || "").trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

export default function TutorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // Learner (student) search state - search by course
  const [learnerSearchQuery, setLearnerSearchQuery] = useState("");
  const [learnerSearchResults, setLearnerSearchResults] = useState(null);
  const [learnerSearchLoading, setLearnerSearchLoading] = useState(false);
  const [learnerSearchError, setLearnerSearchError] = useState(null);

  // Real session data from backend
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [dashboardReviews, setDashboardReviews] = useState([]);
  const [dashboardReviewsLoading, setDashboardReviewsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        const allSlots = await getTutorSessions(user.id);
        if (cancelled) return;
        const now = new Date();
        const upcoming = (Array.isArray(allSlots) ? allSlots : [])
          .filter((s) => s.status === "BOOKED" && new Date(s.startTime) > now)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        setUpcomingSessions(upcoming);
      } catch {
        setUpcomingSessions([]);
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setDashboardReviews([]);
      setDashboardReviewsLoading(false);
      return;
    }
    let cancelled = false;

    const loadDashboardReviews = async () => {
      setDashboardReviewsLoading(true);
      try {
        const rows = await fetchRecentTutorReviewsForDashboard(user.id, 3);
        if (!cancelled) setDashboardReviews(rows);
      } catch {
        if (!cancelled) setDashboardReviews([]);
      } finally {
        if (!cancelled) setDashboardReviewsLoading(false);
      }
    };

    loadDashboardReviews();
    const onTutorReviewsChanged = () => {
      loadDashboardReviews();
    };
    window.addEventListener("scholarly-tutor-reviews-changed", onTutorReviewsChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("scholarly-tutor-reviews-changed", onTutorReviewsChanged);
    };
  }, [user?.id]);

  const handleLearnerSearch = async () => {
    setLearnerSearchError(null);
    setLearnerSearchResults(null);
    const trimmed = (learnerSearchQuery || "").trim();
    if (!trimmed) return;
    setLearnerSearchLoading(true);
    try {
      const list = await searchLearnersByCourse(trimmed);
      setLearnerSearchResults(Array.isArray(list) ? list : []);
    } catch (err) {
      const msg = err?.message || "Search failed. Please try again.";
      const isNetwork = msg === "Failed to fetch" || msg.includes("NetworkError");
      setLearnerSearchError(
        isNetwork
          ? "Cannot reach the server. Is the backend running on http://localhost:8080?"
          : msg
      );
    } finally {
      setLearnerSearchLoading(false);
    }
  };
  
  // Get user's full name
  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    }
    return "User";
  };
  
  const userName = getUserName();

  const PLACEHOLDER_SESSIONS = [
    { id: "ph-1", learnerName: "Bradley Cooper", course: "DSA456", startTime: "2025-10-25T10:00:00", teachingMode: "ONLINE", learnerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
    { id: "ph-2", learnerName: "Megan Fox", course: "DSA456", startTime: "2025-11-13T14:00:00", teachingMode: "IN_PERSON", learnerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
    { id: "ph-3", learnerName: "Ryan Reynolds", course: "DSA456", startTime: "2025-11-20T09:00:00", teachingMode: "ONLINE", learnerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

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
            to="/dashboard/tutor"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname === "/dashboard/tutor" ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <span className="opacity-95"><HomeIcon /></span>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/dashboard/tutor/sessions"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname.includes("/sessions") ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <span className="opacity-95"><CalendarIcon /></span>
            <span>My Sessions</span>
          </Link>
          <Link
            to="/dashboard/availability-v2"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname.includes("/availability") ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <span className="opacity-95"><ClockIcon /></span>
            <span>Availability</span>
          </Link>
          <Link
            to="/dashboard/find-students"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname.includes("/find-students") ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <span className="opacity-95"><UsersIcon /></span>
            <span>Find Students</span>
          </Link>
          <Link
            to="/dashboard/messages"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname.includes("/messages") ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <span className="opacity-95"><ChatIcon /></span>
            <span>Messages</span>
          </Link>
          <Link
            to="/dashboard/tutor/reviews"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline ${location.pathname.includes("/dashboard/tutor/reviews") ? "bg-white/15" : "hover:bg-white/10"}`}
          >
            <span className="opacity-95"><StarIcon /></span>
            <span>My Reviews</span>
          </Link>
        </nav>
        <div className="mt-auto pt-6 space-y-2 text-[15px] font-semibold">
          <Link
            to="/settings/tutor/profile/edit"
            className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition hover:bg-white/10 text-white no-underline"
          >
            <span className="opacity-95"><SettingsIcon /></span>
            <span>Settings</span>
          </Link>
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
        <div className="mb-8">
          <Topbar
            placeholder="Search Students or Courses"
            value={learnerSearchQuery}
            onSearchChange={(e) => setLearnerSearchQuery(e.target.value)}
            onSearchSubmit={() => handleLearnerSearch()}
            disabled={learnerSearchLoading}
            avatarSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=ddd&color=666&size=100`}
          />
        </div>

        {/* Welcome Section */}
        <section style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>
            Welcome Back, {userName} 👋
          </h1>
          <p style={styles.welcomeSubtitle}>
            Here's what's happening with your tutoring today.
          </p>
        </section>
        {learnerSearchError && (
          <section style={styles.searchErrorSection}>
            <p style={styles.searchErrorText}>{learnerSearchError}</p>
          </section>
        )}
        {learnerSearchLoading && (
          <section style={styles.searchLoadingSection}>
            <p style={styles.searchLoadingText}>Searching students…</p>
          </section>
        )}
        {learnerSearchResults && !learnerSearchLoading && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Students in course
              {learnerSearchResults.length >= 0 && (
                <span style={styles.resultCount}> ({learnerSearchResults.length})</span>
              )}
            </h2>
            {learnerSearchResults.length === 0 ? (
              <p style={styles.noResultsText}>No students found for this course. Try a different course code.</p>
            ) : (
              <div style={styles.learnerSearchGrid}>
                {learnerSearchResults.map((learner) => (
                  <div key={learner.id || learner.userId} style={styles.learnerCard}>
                    <div style={styles.learnerCardAvatar}>
                      {learner.firstName?.[0] || "👤"}
                    </div>
                    <h3 style={styles.learnerCardName}>
                      {[learner.firstName, learner.lastName].filter(Boolean).join(" ") || "Student"}
                    </h3>
                    {(learner.program || learner.campus) && (
                      <p style={styles.learnerCardMeta}>
                        {[learner.program, learner.campus].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <button style={styles.contactButton}>Contact</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Content: Upcoming Sessions and My Reviews stacked, full width */}
        <div style={styles.contentGrid}>
          {/* Upcoming Sessions */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Upcoming Sessions</h2>
            {sessionsLoading ? (
              <p style={{ color: '#666', fontSize: '14px' }}>Loading sessions…</p>
            ) : (
              <div style={styles.sessionsGrid}>
                {(upcomingSessions.length > 0 ? upcomingSessions.slice(0, 6) : PLACEHOLDER_SESSIONS).map((session) => {
                  const learnerName = session.learnerName
                    || [session.learnerFirstName, session.learnerLastName].filter(Boolean).join(" ")
                    || "Student";
                  const course = session.course || session.subject || "";
                  const dateStr = new Date(session.startTime).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  });
                  const mode = session.mode || session.teachingMode || "Online";
                  const isOnline = typeof mode === "string" && mode.toUpperCase().includes("ONLINE");
                  const avatarUrl = session.learnerAvatar
                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(learnerName)}&background=ddd&color=666&size=100`;

                  return (
                    <div key={session.id || session.slotId} style={styles.sessionCard}>
                      <div style={styles.studentInfo}>
                        <div style={styles.studentAvatar}>
                          <img src={avatarUrl} alt={learnerName} style={styles.avatarImage} />
                        </div>
                        <div>
                          <h3 style={styles.studentName}>
                            {learnerName}{course ? ` - ${course}` : ""}
                          </h3>
                          <p style={styles.sessionDate}>{dateStr}</p>
                        </div>
                      </div>
                      <div style={styles.sessionActions}>
                        <button style={isOnline ? styles.onlineBadge : styles.inPersonBadge}>
                          📍 {isOnline ? "Online" : "In Person"}
                        </button>
                        <button style={styles.joinButton}>Join</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* My Reviews — newest first (same source as My Reviews page) */}
          <section style={styles.reviewsSection}>
            <h2 style={styles.sectionTitle}>My Reviews</h2>
            {dashboardReviewsLoading ? (
              <p style={styles.reviewsLoadingHint}>Loading reviews…</p>
            ) : (
              <div style={styles.reviewsList}>
                {dashboardReviews.map((review) => {
                  const name = tutorReviewerDisplayName(review);
                  const preview = truncateReviewText(review.comment);
                  return (
                    <div key={review.id} style={styles.reviewCard}>
                      <div style={styles.reviewerInfo}>
                        <div style={styles.reviewerAvatar}>
                          <img
                            src={tutorReviewerAvatarSrc(review)}
                            alt=""
                            style={styles.avatarImage}
                          />
                        </div>
                        <div style={styles.reviewContent}>
                          <h3 style={styles.reviewerName}>{name}</h3>
                          <div style={styles.reviewRating}>
                            <span style={styles.starIcon}>⭐</span>{" "}
                            {Number(review.rating).toFixed(1)}
                          </div>
                          <p style={styles.reviewText}>
                            {preview}
                            {review.comment && review.comment.trim().length > DASHBOARD_REVIEW_PREVIEW_LEN ? (
                              <span style={styles.readMore}> read more</span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        style={styles.readReviewButton}
                        onClick={() => navigate("/dashboard/tutor/reviews")}
                      >
                        Read Review
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#8B1A1A',
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '40px',
  },
  logoCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  graduationCap: {
    fontSize: '24px',
  },
  logoText: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  tagline: {
    margin: 0,
    fontSize: '12px',
    opacity: 0.9,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'white',
    textDecoration: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sidebarFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    paddingTop: '15px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'white',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  mainContent: {
    flex: 1,
    marginLeft: '210px',
    backgroundColor: '#F8E9DC',
    padding: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  searchBar: {
    flex: 1,
    maxWidth: '600px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 15px',
    borderRadius: '25px',
    border: '1px solid #ddd',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  searchIcon: {
    position: 'absolute',
    right: '15px',
    cursor: 'pointer',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  notification: {
    position: 'relative',
    fontSize: '20px',
    cursor: 'pointer',
  },
  notificationDot: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '8px',
    height: '8px',
    backgroundColor: '#0066CC',
    borderRadius: '50%',
  },
  profilePic: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #ddd',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  welcomeSection: {
    marginBottom: '30px',
    padding: '28px 32px',
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  welcomeTitle: {
    fontSize: '44px',
    fontWeight: 800,
    margin: '0 0 4px 0',
    color: '#000000',
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    letterSpacing: '-0.025em',
    lineHeight: 1.2,
  },
  welcomeSubtitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'rgba(0,0,0,0.7)',
    margin: 0,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    lineHeight: 1.4,
  },
  searchErrorSection: {
    marginBottom: '15px',
    padding: '12px 20px',
    backgroundColor: '#ffebee',
    borderRadius: '8px',
    border: '1px solid #ef9a9a',
  },
  searchErrorText: {
    margin: 0,
    color: '#c62828',
    fontSize: '14px',
  },
  searchLoadingSection: {
    marginBottom: '15px',
    padding: '12px 20px',
  },
  searchLoadingText: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  resultCount: {
    fontWeight: 'normal',
    color: '#666',
    fontSize: '16px',
  },
  noResultsText: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  learnerSearchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  learnerCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: 'white',
    textAlign: 'center',
  },
  learnerCardAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#E0E0E0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    margin: '0 auto 10px',
  },
  learnerCardName: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  learnerCardMeta: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#666',
  },
  contactButton: {
    padding: '8px 20px',
    backgroundColor: '#8B1A1A',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  contentGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    width: '100%',
  },
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '100%',
  },
  reviewsSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    width: '100%',
  },
  reviewsLoadingHint: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#000',
  },
  sessionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '15px',
    width: '100%',
  },
  sessionCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    minWidth: 0,
    padding: '12px',
    backgroundColor: '#D9D9D9',
  },
  studentInfo: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  studentAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  studentName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  sessionDate: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: '#666',
  },
  sessionActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  onlineBadge: {
    padding: '8px 15px',
    backgroundColor: '#59855C',
    border: 'none',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  inPersonBadge: {
    padding: '8px 15px',
    backgroundColor: '#59855C',
    border: 'none',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  joinButton: {
    padding: '8px 25px',
    backgroundColor: '#DC143C',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
  },
  reviewCard: {
    backgroundColor: '#C8D1FF',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
  },
  reviewerAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    overflow: 'hidden',
  },
  reviewContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  reviewerName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000',
  },
  reviewRating: {
    fontSize: '14px',
    color: '#000',
  },
  starIcon: {
    color: '#FFD700',
  },
  reviewText: {
    margin: 0,
    fontSize: '14px',
    color: '#000',
  },
  readMore: {
    color: '#0066CC',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  readReviewButton: {
    padding: '10px 24px',
    backgroundColor: '#DC143C',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  performanceContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '200px',
    paddingBottom: '20px',
  },
  performanceItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  performanceBar: {
    width: '60px',
    height: '150px',
    backgroundColor: '#F5F5F5',
    borderRadius: '5px',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
  },
  performanceFill: {
    width: '100%',
    backgroundColor: '#8B1A1A',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '5px',
  },
  performanceFillLight: {
    width: '100%',
    backgroundColor: '#D4A5A5',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '5px',
  },
  performanceNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  performanceLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  calendarNavButtons: {
    display: 'flex',
    gap: '5px',
  },
  calendarNavBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '5px',
    padding: '5px 10px',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#0066CC',
  },
  calendarTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  calendarWeekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '5px',
    marginBottom: '10px',
    fontSize: '10px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#666',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '5px',
  },
  calendarDay: {
    padding: '8px',
    textAlign: 'center',
    borderRadius: '5px',
    fontSize: '14px',
    minHeight: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayHighlighted: {
    color: '#0066CC',
    fontWeight: 'bold',
  },
  calendarDayActive: {
    backgroundColor: '#ADD8E6',
    color: '#0066CC',
    borderRadius: '5px',
    fontWeight: 'bold',
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
