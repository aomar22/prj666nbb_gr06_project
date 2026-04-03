import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, searchTutors } from "../../api";
import { fetchLearnerUpcomingSessionsForDashboard } from "../../utils/dashboardUpcomingSessions";
import { mapLearnerSessionToCard } from "../../utils/learnerSessionNormalizer";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import PaginationArrowButton from "../../components/ui/PaginationArrowButton";
import LearnerUpcomingSessionCard from "../../components/sessions/LearnerUpcomingSessionCard";
import Avatar from "../../components/ui/Avatar";
function formatTime(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function addOneHour(dateInput) {
  const d = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(d.getHours() + 1);
  return d;
}

function formatDate(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapSessionToCard(session) {
  const tutorName =
    session.courseLabel && String(session.courseLabel).trim()
      ? `${session.tutorName} - ${session.courseLabel}`
      : session.tutorName || "Tutor";

  if (session.start) {
    const end = addOneHour(session.start);

    return {
      id: session.slotId ?? session.id,
      tutorName,
      tutor: session.tutor || {
        name: session.tutorName,
      },
      rating: "—",
      reviews: "0 reviews",
      date: formatDate(session.start),
      time: end ? `${formatTime(session.start)} - ${formatTime(end)}` : "—",
      mode: session.mode ?? "Online",
      sessionType: session.sessionType ?? "INDIVIDUAL",
      currentCount: session.currentCount ?? 1,
      maxCapacity: session.maxCapacity ?? 1,
    };
  }

  return {
    id: session.slotId ?? session.id,
    tutorName,
    tutor: session.tutor || { name: session.tutorName},
    rating: "—",
    reviews: "0 reviews",
    date: session.date ? formatDate(`${session.date}T00:00:00`) : "—",
    time:
      session.startTime && session.endTime
        ? `${session.startTime} - ${session.endTime}`
        : "—",
    mode: session.mode ?? "Online",
    sessionType: session.sessionType ?? "INDIVIDUAL",
    currentCount: session.currentCount ?? 1,
    maxCapacity: session.maxCapacity ?? 1,
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  
useEffect(() => {
  if (!user?.id) {
    setUpcomingSessions([]);
    setSessionsLoading(false);
    return;
  }

  let cancelled = false;

  const load = async () => {
    setSessionsLoading(true);

    try {
    const rows = await fetchLearnerUpcomingSessionsForDashboard(user.id, 12);
    
    if (!cancelled) setUpcomingSessions(rows);  
    } catch {
      if (!cancelled) setUpcomingSessions([]);
    } finally {
      if (!cancelled) setSessionsLoading(false);
    }
  };

  load();
    const onBookingsChanged = () => load();
    window.addEventListener("scholarly-learner-bookings-changed", onBookingsChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("scholarly-learner-bookings-changed", onBookingsChanged);
    };
  }, [user?.id]);

  
  // Tutor search state (for "Find Tutors" / header search)
  const [tutorSearchQuery, setTutorSearchQuery] = useState("");
  const [tutorSearchResults, setTutorSearchResults] = useState(null);
  const [tutorSearchLoading, setTutorSearchLoading] = useState(false);
  const [tutorSearchError, setTutorSearchError] = useState(null);
  const [recommendedTutors, setRecommendedTutors] = useState([]);
  const [recommendedTutorsLoading, setRecommendedTutorsLoading] = useState(true);
  const [recommendedPage, setRecommendedPage] = useState(0);
  const RECOMMENDED_PAGE_SIZE = 3;

  //For upcoming sessions
  const [upcomingPage, setUpcomingPage] = useState(0);
  const UPCOMING_PAGE_SIZE = 3;

  const handleTutorSearch = async () => {
    setTutorSearchError(null);
    setTutorSearchResults(null);
    const trimmed = (tutorSearchQuery || "").trim();
    if (!trimmed) return;
    setTutorSearchLoading(true);
    try {
      const page = await searchTutors({
        q: trimmed,
        page: 0,
        size: 20,
        sortBy: "rating",
        sortDirection: "desc",
      });
      setTutorSearchResults(page);
    } catch (err) {
      const msg = err?.message || "Search failed. Please try again.";
      const isNetwork = msg === "Failed to fetch" || msg.includes("NetworkError");
      setTutorSearchError(
        isNetwork
          ? "Cannot reach the server. Is the backend running on http://localhost:8080?"
          : msg
      );
    } finally {
      setTutorSearchLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadRecommendedTutors = async () => {
      setRecommendedTutorsLoading(true);
      try {
        const page = await searchTutors({
          q: "",
          page: 0,
          size: 6,
          sortBy: "rating",
          sortDirection: "desc",
        });
        const rows = Array.isArray(page?.content) ? page.content : [];
        if (!cancelled) setRecommendedTutors(rows);
      } catch {
        if (!cancelled) setRecommendedTutors([]);
      } finally {
        if (!cancelled) setRecommendedTutorsLoading(false);
      }
    };
    loadRecommendedTutors();
    return () => {
      cancelled = true;
    };
  }, []);
  
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

  const recommendedTotalPages = Math.ceil(
    recommendedTutors.length / RECOMMENDED_PAGE_SIZE
  );

  const recommendedSlice = recommendedTutors.slice(
    recommendedPage * RECOMMENDED_PAGE_SIZE,
    recommendedPage * RECOMMENDED_PAGE_SIZE + RECOMMENDED_PAGE_SIZE
  );

  //for upcoming sessions pagination
  const upcomingTotalPages = Math.ceil(
  upcomingSessions.length / UPCOMING_PAGE_SIZE
);

const visibleUpcomingSessions = upcomingSessions.slice(
  upcomingPage * UPCOMING_PAGE_SIZE,
  upcomingPage * UPCOMING_PAGE_SIZE + UPCOMING_PAGE_SIZE
);
useEffect(() => {
  setUpcomingPage(0);
}, [upcomingSessions]);

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        <div className="mb-8">
          <Topbar
            placeholder="Search Tutor or Courses"
            onSearchBarClick={() => navigate("/dashboard/learner/find-tutors")}
            onAvatarClick={() => navigate("/settings/learner/profile/edit")}
          />
        </div>

        {/* Welcome Section */}
        <section style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>
            Welcome Back, {userName} 👋
          </h1>
          <p style={styles.welcomeSubtitle}>
            Here's what's happening with your learning today.
          </p>
        </section>

        {/* Tutor Search Results */}
        {tutorSearchError && (
          <section style={styles.searchErrorSection}>
            <p style={styles.searchErrorText}>{tutorSearchError}</p>
          </section>
        )}
        {tutorSearchLoading && (
          <section style={styles.searchLoadingSection}>
            <p style={styles.searchLoadingText}>Searching tutors…</p>
          </section>
        )}
        {tutorSearchResults && !tutorSearchLoading && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Tutor search results
              {tutorSearchResults.totalElements != null && (
                <span style={styles.resultCount}> ({tutorSearchResults.totalElements})</span>
              )}
            </h2>
            {(!tutorSearchResults.content || tutorSearchResults.content.length === 0) ? (
              <p style={styles.noResultsText}>No tutors found. Try a different search.</p>
            ) : (
              <div style={styles.tutorSearchGrid}>
                {tutorSearchResults.content.map((tutor) => (
                  <div key={tutor.id || tutor.userId} style={styles.recommendedCard}>
                    {/* <div style={styles.recommendedAvatar}>
                      {tutor.firstName?.[0] || "👤"}
                    </div> */}
                    <Avatar
                      person={{
                        firstName: tutor.firstName,
                        lastName: tutor.lastName,
                        profilePictureUrl: tutor.profilePictureUrl,
                        avatar: tutor.profilePictureUrl,
                      }}
                      size={56}
                      fallbackName={[tutor.firstName, tutor.lastName].filter(Boolean).join(" ") || "Tutor"}
                    />
                 
                    <h3 style={styles.recommendedName}>
                      {[tutor.firstName, tutor.lastName].filter(Boolean).join(" ") || "Tutor"}
                    </h3>
                    <p style={styles.recommendedExpertise}>
                      {Array.isArray(tutor.coursesOffered) && tutor.coursesOffered.length
                        ? tutor.coursesOffered.join(", ")
                        : tutor.program || "—"}
                    </p>
                    {(tutor.rating != null || tutor.reviewCount != null) && (
                      <div style={styles.rating}>
                        ⭐ {tutor.rating != null ? Number(tutor.rating).toFixed(1) : "—"}
                        {tutor.reviewCount != null && ` (${tutor.reviewCount} reviews)`}
                      </div>
                    )}
                    <button
                      style={styles.bookButton}
                      onClick={() =>
                        navigate("/dashboard/learner/booking", {
                          state: {
                            tutorId: tutor.id ?? tutor.userId,
                            tutor: {
                              id: tutor.id ?? tutor.userId,
                              firstName: tutor.firstName,
                              lastName: tutor.lastName,
                              rating: tutor.rating,
                              reviewCount: tutor.reviewCount,
                              profilePictureUrl: tutor.profilePictureUrl,
                              avatar: tutor.profilePictureUrl,
                            },
                          },
                        })
                      }
                    >
                      Book session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Content: Upcoming Sessions and Recommended Tutors stacked, full width */}
        <div style={styles.contentGrid}>
          {/* Upcoming Sessions — GET /api/availability/learner/{id}/bookings */}
            <section style={styles.upcomingSection}>
              <h2 style={styles.upcomingSectionTitle}>Upcoming Sessions</h2>

              {sessionsLoading ? (
                <p style={styles.sessionsLoadingHint}>Loading sessions…</p>
              ) : upcomingSessions.length === 0 ? (
                <p style={styles.sessionsEmptyHint}>
                  No upcoming sessions. Book a tutor from Find Tutors and your sessions will show here.
                </p>
              ) : (
                <div style={styles.upcomingRow}>
                  <div style={styles.upcomingGrid}>
                    {visibleUpcomingSessions.map((session) => (
                      <LearnerUpcomingSessionCard
                        key={session.id || session.slotId}
                        session={mapLearnerSessionToCard(session,
                           { appendCourseLabel: true }
                          )}
                        // session={{
                        //   id: session.id || session.slotId,
                        //   tutorName:
                        //     session.courseLabel && String(session.courseLabel).trim()
                        //       ? `${session.tutorName} - ${session.courseLabel}`
                        //       : session.tutorName,
                        //   rating: session.rating ?? "—",
                        //   reviews: session.reviews ?? "0 reviews",
                        //   date:
                        //     session.start instanceof Date
                        //       ? session.start.toLocaleDateString("en-US", {
                        //           month: "short",
                        //           day: "numeric",
                        //           year: "numeric",
                        //         })
                        //       : new Date(session.start).toLocaleDateString("en-US", {
                        //           month: "short",
                        //           day: "numeric",
                        //           year: "numeric",
                        //         }),
                        //   // time: session.time ?? "—",
                        //   time:
                        //     session.startTime && session.endTime
                        //       ? `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`
                        //       : "—",
                        //   mode: session.mode ?? "Online",
                        //   sessionType: session.sessionType ?? "INDIVIDUAL",
                        //   currentCount: session.currentCount ?? 1,
                        //   maxCapacity: session.maxCapacity ?? 1,
                        // }}
                        
                        showCancel={false}
                      />
                    ))}
                  </div>

                  {upcomingTotalPages > 1 && (
                    <div style={styles.upcomingArrowWrap}>
                      <PaginationArrowButton
                        ariaLabel="Next upcoming sessions"
                        onClick={() =>
                          setUpcomingPage((prev) =>
                            prev + 1 < upcomingTotalPages ? prev + 1 : 0
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

          {/* Recommended Tutors Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Recommended Tutors</h2>
            {recommendedTutorsLoading ? (
              <p style={styles.searchLoadingText}>Loading tutors…</p>
            ) : recommendedTutors.length === 0 ? (
              <p style={styles.noResultsText}>No tutors available.</p>
            ) : (
              <div style={styles.recommendedRow}>
                <div style={styles.recommendedGrid}>
                  {recommendedSlice.map((tutor) => (
                    <div key={tutor.id || tutor.userId} style={styles.recommendedCard}>
                      {/* <div style={styles.recommendedAvatar}>
                        {tutor.firstName?.[0] || "👤"}
                      </div> */}
                      <Avatar
                        person={{
                          firstName: tutor.firstName,
                          lastName: tutor.lastName,
                          profilePictureUrl: tutor.profilePictureUrl,
                          avatar: tutor.profilePictureUrl,
                        }}
                        size={56}
                        fallbackName={[tutor.firstName, tutor.lastName].filter(Boolean).join(" ") || "Tutor"}
                      />
                      <h3 style={styles.recommendedName}>
                        {[tutor.firstName, tutor.lastName].filter(Boolean).join(" ") || "Tutor"}
                      </h3>
                      <p style={styles.recommendedExpertise}>
                        {Array.isArray(tutor.coursesOffered) && tutor.coursesOffered.length
                          ? tutor.coursesOffered.join(", ")
                          : tutor.program || "—"}
                      </p>
                      {(tutor.rating != null || tutor.reviewCount != null) && (
                        <div style={styles.rating}>
                          ⭐ {tutor.rating != null ? Number(tutor.rating).toFixed(1) : "—"}
                          {tutor.reviewCount != null && ` (${tutor.reviewCount} reviews)`}
                        </div>
                      )}
                      <button
                        style={styles.bookButton}
                        onClick={() =>
                          navigate("/dashboard/learner/booking", {
                            state: {
                              tutorId: tutor.id ?? tutor.userId,
                              tutor: {
                                id: tutor.id ?? tutor.userId,
                                firstName: tutor.firstName,
                                lastName: tutor.lastName,
                                rating: tutor.rating,
                                reviewCount: tutor.reviewCount,
                                profilePictureUrl: tutor.profilePictureUrl,
                                avatar: tutor.profilePictureUrl,
                              },
                            },
                          })
                        }
                      >
                        Book session
                      </button>
                    </div>
                  ))}
                </div>
                {recommendedTotalPages > 1 && (
                  <div style={styles.recommendedArrowWrap}>
                    <PaginationArrowButton
                      ariaLabel="Next recommended tutors"
                      onClick={() =>
                        setRecommendedPage((prev) =>
                          prev + 1 < recommendedTotalPages ? prev + 1 : 0
                        )
                      }
                    />
                  </div>
                )}
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
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
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
    padding: '12px 44px 12px 16px',
    borderRadius: '25px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
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
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #e5e7eb',
    backgroundColor: 'white',
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
  tutorSearchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '15px',
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
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    width: '100%',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#111827',
  },
  upcomingSection: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    width: '100%',
  },
  upcomingSectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#000',
  },
  sessionsLoadingHint: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  sessionsEmptyHint: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    maxWidth: '520px',
    lineHeight: 1.5,
  },
  sessionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '15px',
    width: '100%',
  },
  sessionCard: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    backgroundColor: '#D9D9D9',
    minWidth: 0,
  },
  tutorInfo: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  tutorAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  tutorName: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 'normal',
    color: '#000',
  },
  sessionDate: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#000',
  },
  sessionActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  onlineBadge: {
    padding: '6px 14px',
    backgroundColor: '#59855C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  inPersonBadge: {
    padding: '6px 14px',
    backgroundColor: '#59855C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  joinButton: {
    padding: '6px 16px',
    backgroundColor: '#F4685A',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
  },
  recommendedGrid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(3, 1fr)',
    flex: 1,
  },
  recommendedCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center',
    alignItems: 'center',
    minWidth: '180px',
    backgroundColor: '#C8D1FF',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '245px',
  },
  recommendedAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    overflow: 'hidden',
    margin: '0 auto 10px',
  },
  recommendedName: {
    margin: '10px 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  recommendedExpertise: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#666',
    minHeight: '40px',
  },
  rating: {
    marginBottom: '10px',
    fontSize: '14px',
  },
  bookButton: {
    padding: '8px 20px',
    backgroundColor: '#DC143C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: 'auto',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    gap: '16px',
    height: '200px',
    paddingBottom: '8px',
  },
  progressItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: '6px',
  },
  progressBarWrap: {
    width: '100%',
    maxWidth: '60px',
    height: '140px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  progressBarVertical: {
    width: '100%',
    minHeight: '20px',
    borderRadius: '4px',
  },
  progressBar1: {
    height: '83%',
    backgroundColor: '#A66B6C',
  },
  progressBar2: {
    height: '100%',
    backgroundColor: '#8C2727',
  },
  progressBar3: {
    height: '33%',
    backgroundColor: '#CDB3AD',
  },
  progressLabel: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  progressValue: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#000',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  calendarNav: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
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
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '5px',
  },
  calendarDay: {
    padding: '10px',
    textAlign: 'center',
    borderRadius: '5px',
    fontSize: '14px',
    minHeight: '35px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayHighlighted: {
    backgroundColor: '#ADD8E6',
    color: '#0066CC',
  },
  calendarDayActive: {
    backgroundColor: '#0066CC',
    color: 'white',
    borderRadius: '50%',
  },
  recommendedRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
  },
  recommendedArrowWrap: {
    width: "32px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  //for upcoming sessions pagination
  upcomingRow: {
  display: "flex",
  alignItems: "center",
  width: "100%",
},

upcomingGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "15px",
  flex: 1, 
},

upcomingArrowWrap: {
  width: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0, 
},
};

