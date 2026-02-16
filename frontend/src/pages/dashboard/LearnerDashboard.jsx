import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { clearAuth, getUser, searchTutors } from "../../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  // Tutor search state (for "Find Tutors" / header search)
  const [tutorSearchQuery, setTutorSearchQuery] = useState("");
  const [tutorSearchResults, setTutorSearchResults] = useState(null);
  const [tutorSearchLoading, setTutorSearchLoading] = useState(false);
  const [tutorSearchError, setTutorSearchError] = useState(null);

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
            to="/dashboard/learner"
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2 transition ${location.pathname === "/dashboard/learner" ? "bg-white/15" : "hover:bg-white/10"}`}
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
        {/* Header - pill-style search same as AvailabilityV2; click goes to Find Tutors */}
        <header className="flex items-center gap-6 mb-8">
          <Link
            to="/dashboard/learner/find-tutors"
            className="relative flex-1 flex items-center no-underline text-inherit"
          >
            <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-70 text-black/70 pointer-events-none">
              <SearchIcon />
            </div>
            <span className="w-full h-[54px] rounded-full bg-white pl-14 pr-5 flex items-center text-[18px] font-mono shadow-[0px_6px_14px_rgba(0,0,0,0.18)] border-0 text-black/70">
              Search Tutor or Courses
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <button type="button" className="relative p-0 border-0 bg-transparent cursor-pointer text-black/70 hover:text-black">
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500" />
              <BellIcon />
            </button>
            <div className="h-10 w-10 rounded-full bg-black/20 overflow-hidden shrink-0">
              <img
                alt="Profile"
                src="https://ui-avatars.com/api/?name=User&background=ddd&color=666&size=100"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </header>

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
                    <div style={styles.recommendedAvatar}>
                      {tutor.firstName?.[0] || "👤"}
                    </div>
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
                    <button style={styles.bookButton}>Book session</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Content: Upcoming Sessions and Recommended Tutors stacked, full width */}
        <div style={styles.contentGrid}>
          {/* Upcoming Sessions */}
          <section style={styles.upcomingSection}>
            <h2 style={styles.upcomingSectionTitle}>Upcoming Sessions</h2>
            <div style={styles.sessionsGrid}>
                <div style={styles.sessionCard}>
                  <div style={styles.tutorInfo}>
                    <div style={styles.tutorAvatar}>
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
                        alt="Brad Pitt"
                        style={styles.avatarImage}
                      />
                    </div>
                    <div>
                      <h3 style={styles.tutorName}>Brad Pitt - DSA456</h3>
                      <p style={styles.sessionDate}>Oct 25, 2025</p>
                    </div>
                  </div>
                  <div style={styles.sessionActions}>
                    <button style={styles.onlineBadge}>
                      📍 Online
                    </button>
                    <button style={styles.joinButton}>Join</button>
                  </div>
                </div>

                <div style={styles.sessionCard}>
                  <div style={styles.tutorInfo}>
                    <div style={styles.tutorAvatar}>
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                        alt="Jennifer Aniston"
                        style={styles.avatarImage}
                      />
                    </div>
                    <div>
                      <h3 style={styles.tutorName}>Jennifer Aniston - PRJ566</h3>
                      <p style={styles.sessionDate}>Nov 2, 2025</p>
                    </div>
                  </div>
                  <div style={styles.sessionActions}>
                    <button style={styles.inPersonBadge}>
                      📍 In Person
                    </button>
                    <button style={styles.joinButton}>Join</button>
                  </div>
                </div>

                <div style={styles.sessionCard}>
                  <div style={styles.tutorInfo}>
                    <div style={styles.tutorAvatar}>
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                        alt="Tom Holland"
                        style={styles.avatarImage}
                      />
                    </div>
                    <div>
                      <h3 style={styles.tutorName}>Tom Holland - APD545</h3>
                      <p style={styles.sessionDate}>Nov 10, 2025</p>
                    </div>
                  </div>
                  <div style={styles.sessionActions}>
                    <button style={styles.onlineBadge}>
                      📍 Online
                    </button>
                    <button style={styles.joinButton}>Join</button>
                  </div>
                </div>
              </div>
          </section>

          {/* Recommended Tutors */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Recommended Tutor</h2>
            <div style={styles.recommendedGrid}>
                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                      alt="Tom Holland"
                      style={styles.avatarImage}
                    />
                  </div>
                  <h3 style={styles.recommendedName}>Tom Holland</h3>
                  <p style={styles.recommendedExpertise}>Expert in APD545</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 4.9
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                      alt="Chris Evans"
                      style={styles.avatarImage}
                    />
                  </div>
                  <h3 style={styles.recommendedName}>Chris Evans</h3>
                  <p style={styles.recommendedExpertise}>Expert in IPC144</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 5.0
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
                      alt="Margot Robbie"
                      style={styles.avatarImage}
                    />
                  </div>
                  <h3 style={styles.recommendedName}>Margot Robbie</h3>
                  <p style={styles.recommendedExpertise}>Expert in PRJ666</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 4.0
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>
                    <img
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
                      alt="James Wilson"
                      style={styles.avatarImage}
                    />
                  </div>
                  <h3 style={styles.recommendedName}>James Wilson</h3>
                  <p style={styles.recommendedExpertise}>Expert in OOP345</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 4.8
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
                      alt="Sarah Chen"
                      style={styles.avatarImage}
                    />
                  </div>
                  <h3 style={styles.recommendedName}>Sarah Chen</h3>
                  <p style={styles.recommendedExpertise}>Expert in DBS311</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 4.7
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>
                    <img
                      src="https://images.unsplash.com/photo-1507081323647-4d250478b919?w=100&h=100&fit=crop&crop=face"
                      alt="Emma Davis"
                      style={styles.avatarImage}
                    />
                  </div>
                  <h3 style={styles.recommendedName}>Emma Davis</h3>
                  <p style={styles.recommendedExpertise}>Expert in WEB222</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 4.6
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <button style={styles.arrowButton}>→</button>
            </div>
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
    display: 'flex',
    gap: '15px',
    position: 'relative',
    width: '100%',
  },
  recommendedCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '15px',
    textAlign: 'center',
    minWidth: '180px',
    backgroundColor: '#C8D1FF',
  },
  recommendedAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    overflow: 'hidden',
    margin: '0 auto 10px',
  },
  recommendedName: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  recommendedExpertise: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#666',
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
  },
  arrowButton: {
    position: 'absolute',
    right: '-30px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#374151',
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
function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 21l-4.3-4.3m1.3-5.2a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13.7 21a2 2 0 01-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
