import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../api";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };
  const [currentMonth] = useState(10); 
  const [currentYear] = useState(2025);

  const generateCalendar = () => {
    const days = [];
    const daysInMonth = 31;
    const firstDay = new Date(2025, 9, 1).getDay(); 
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
        for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const calendarDays = generateCalendar();
  const highlightedDates = [20, 24, 25]; 
  const activeDate = 25; 

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={styles.graduationCap}>🎓</span>
          <div>
            <h2 style={styles.logoText}>Scholarly</h2>
            <p style={styles.tagline}>Connect. Learn. Grow.</p>
          </div>
        </div>
        
        <nav style={styles.nav}>
          <a href="#" style={{...styles.navItem, ...styles.navItemActive}}>
            <span>🏠</span> Dashboard
          </a>
          <a href="#" style={styles.navItem}>
            <span>📅</span> My Sessions
          </a>
          <a href="#" style={styles.navItem}>
            <span>👤</span> Find Tutors
          </a>
          <a href="#" style={styles.navItem}>
            <span>💬</span> Messages
          </a>
          <a href="#" style={styles.navItem}>
            <span>⭐</span> My Reviews
          </a>
        </nav>

        <div style={styles.sidebarFooter}>
          <a href="#" style={styles.navItem}>
            <span>⚙️</span> Settings
          </a>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <span>➡️</span> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search Tutor or Courses" 
              style={styles.searchInput}
            />
            <span style={styles.searchIcon}>🔍</span>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.notification}>
              <span>🔔</span>
              <span style={styles.notificationDot}></span>
            </div>
            <div style={styles.profilePic}>
              👨
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <section style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>
            Welcome Back, Bradley 👋
          </h1>
          <p style={styles.welcomeSubtitle}>
            Here's what's happening with your learning today.
          </p>
        </section>

        {/* Content Grid */}
        <div style={styles.contentGrid}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* Upcoming Sessions */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Upcoming Sessions</h2>
              <div style={styles.sessionsGrid}>
                <div style={styles.sessionCard}>
                  <div style={styles.tutorInfo}>
                    <div style={styles.tutorAvatar}>👨</div>
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
                    <div style={styles.tutorAvatar}>👩</div>
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
              </div>
            </section>

            {/* Recommended Tutors */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Recommended Tutor</h2>
              <div style={styles.recommendedGrid}>
                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>👨</div>
                  <h3 style={styles.recommendedName}>Tom Holland</h3>
                  <p style={styles.recommendedExpertise}>Expert in APD545</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 4.9
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>👨</div>
                  <h3 style={styles.recommendedName}>Chris Evans</h3>
                  <p style={styles.recommendedExpertise}>Expert in IPC144</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 5.0
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <div style={styles.recommendedCard}>
                  <div style={styles.recommendedAvatar}>👩</div>
                  <h3 style={styles.recommendedName}>Margot Robbie</h3>
                  <p style={styles.recommendedExpertise}>Expert in PRJ666</p>
                  <div style={styles.rating}>
                    <span>⭐</span> 4.0
                  </div>
                  <button style={styles.bookButton}>Book session</button>
                </div>

                <button style={styles.arrowButton}>→</button>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* Progress/Analytics */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Progress / Analytics</h2>
              <div style={styles.progressContainer}>
                <div style={styles.progressItem}>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, height: '60%'}}></div>
                  </div>
                  <p style={styles.progressLabel}>Sessions Completed</p>
                  <p style={styles.progressValue}>10</p>
                </div>

                <div style={styles.progressItem}>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, height: '70%'}}></div>
                  </div>
                  <p style={styles.progressLabel}>Hours Studied</p>
                  <p style={styles.progressValue}>12</p>
                </div>

                <div style={styles.progressItem}>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, height: '50%'}}></div>
                  </div>
                  <p style={styles.progressLabel}>Average Rating</p>
                  <p style={styles.progressValue}>04</p>
                </div>
              </div>
            </section>

            {/* Calendar */}
            <section style={styles.section}>
              <div style={styles.calendarHeader}>
                <button style={styles.calendarNav}>←</button>
                <h3 style={styles.calendarTitle}>October 2025</h3>
                <button style={styles.calendarNav}>→</button>
              </div>
              <div style={styles.calendarWeekdays}>
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>
              <div style={styles.calendarGrid}>
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={index} style={styles.calendarDay}></div>;
                  }
                  const isHighlighted = highlightedDates.includes(day);
                  const isActive = day === activeDate;
                  return (
                    <div
                      key={index}
                      style={{
                        ...styles.calendarDay,
                        ...(isHighlighted && styles.calendarDayHighlighted),
                        ...(isActive && styles.calendarDayActive)
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
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
    backgroundColor: '#F5F5DC',
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
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  welcomeSection: {
    marginBottom: '30px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  sessionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  sessionCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
  },
  tutorInfo: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  tutorAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  tutorName: {
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
    padding: '5px 10px',
    backgroundColor: '#90EE90',
    border: 'none',
    borderRadius: '5px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  inPersonBadge: {
    padding: '5px 10px',
    backgroundColor: '#90EE90',
    border: 'none',
    borderRadius: '5px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  joinButton: {
    padding: '8px 20px',
    backgroundColor: '#DC143C',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  recommendedGrid: {
    display: 'flex',
    gap: '15px',
    position: 'relative',
  },
  recommendedCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
    minWidth: '180px',
  },
  recommendedAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
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
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
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
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  progressItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  progressBar: {
    width: '100%',
    height: '100px',
    backgroundColor: '#E0E0E0',
    borderRadius: '5px',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: '5px',
  },
  progressLabel: {
    margin: '10px 0 0 0',
    fontSize: '14px',
    color: '#666',
  },
  progressValue: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
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
