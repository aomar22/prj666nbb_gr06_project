import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../../api";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  
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
  const highlightedDates = [20, 25]; 
  const activeDate = 25; 

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoCircle}>
            <span style={styles.graduationCap}>🎓</span>
          </div>
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
            <span>📋</span> Availability
          </a>
          <a href="#" style={styles.navItem}>
            <span>👤</span> Find Students
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
              placeholder="Search Student or Courses" 
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
              <img 
                src="https://ui-avatars.com/api/?name=User&background=ddd&color=666&size=100" 
                alt="Profile" 
                style={styles.profileImage}
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
            Here's what's happening with your tutoring today.
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
                  <div style={styles.studentInfo}>
                    <div style={styles.studentAvatar}>
                      <img 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" 
                        alt="Bradley Cooper" 
                        style={styles.avatarImage}
                      />
                    </div>
                    <div>
                      <h3 style={styles.studentName}>Bradley Cooper - DSA456</h3>
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
                  <div style={styles.studentInfo}>
                    <div style={styles.studentAvatar}>
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
                        alt="Megan Fox" 
                        style={styles.avatarImage}
                      />
                    </div>
                    <div>
                      <h3 style={styles.studentName}>Megan Fox - DSA456</h3>
                      <p style={styles.sessionDate}>Nov 13, 2025</p>
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

            {/* My Reviews */}
            <section style={styles.reviewsSection}>
              <h2 style={styles.sectionTitle}>My Reviews</h2>
              <div style={styles.reviewsList}>
                <div style={styles.reviewCard}>
                  <div style={styles.reviewerInfo}>
                    <div style={styles.reviewerAvatar}>
                      <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" 
                        alt="Anne Hathaway" 
                        style={styles.avatarImage}
                      />
                    </div>
                    <div style={styles.reviewContent}>
                      <h3 style={styles.reviewerName}>Anne Hathaway</h3>
                      <div style={styles.reviewRating}>
                        <span style={styles.starIcon}>⭐</span> 5.0
                      </div>
                      <p style={styles.reviewText}>
                        Amazing tutor, good know... <span style={styles.readMore}>readmore</span>
                      </p>
                    </div>
                  </div>
                  <button style={styles.readReviewButton}>Read Review</button>
                </div>

                <div style={styles.reviewCard}>
                  <div style={styles.reviewerInfo}>
                    <div style={styles.reviewerAvatar}>
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                        alt="Ryan Reynolds" 
                        style={styles.avatarImage}
                      />
                    </div>
                    <div style={styles.reviewContent}>
                      <h3 style={styles.reviewerName}>Ryan Reynolds</h3>
                      <div style={styles.reviewRating}>
                        <span style={styles.starIcon}>⭐</span> 3.4
                      </div>
                      <p style={styles.reviewText}>
                        moderate tutor, need improve... <span style={styles.readMore}>readmore</span>
                      </p>
                    </div>
                  </div>
                  <button style={styles.readReviewButton}>Read Review</button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* Performance per week */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Performance per week</h2>
              <div style={styles.performanceContainer}>
                <div style={styles.performanceItem}>
                  <div style={styles.performanceBar}>
                    <div style={{...styles.performanceFill, height: '60%'}}>
                      <span style={styles.performanceNumber}>10</span>
                    </div>
                  </div>
                  <p style={styles.performanceLabel}>Sessions<br/>Completed</p>
                </div>

                <div style={styles.performanceItem}>
                  <div style={styles.performanceBar}>
                    <div style={{...styles.performanceFill, height: '75%'}}>
                      <span style={styles.performanceNumber}>12</span>
                    </div>
                  </div>
                  <p style={styles.performanceLabel}>Hours<br/>Tutored</p>
                </div>

                <div style={styles.performanceItem}>
                  <div style={styles.performanceBar}>
                    <div style={{...styles.performanceFillLight, height: '45%'}}>
                      <span style={styles.performanceNumber}>04</span>
                    </div>
                  </div>
                  <p style={styles.performanceLabel}>Average<br/>Rating</p>
                </div>
              </div>
            </section>

            {/* Calendar */}
            <section style={styles.section}>
              <div style={styles.calendarHeader}>
                <h3 style={styles.calendarTitle}>October 2025</h3>
                <div style={styles.calendarNavButtons}>
                  <button style={styles.calendarNavBtn}>‹</button>
                  <button style={styles.calendarNavBtn}>›</button>
                </div>
              </div>
              <div style={styles.calendarWeekdays}>
                <span>SUN</span>
                <span>MON</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
                <span>SUN</span>
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
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    fontFamily: 'monospace',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
    fontFamily: 'monospace',
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
  reviewsSection: {
    backgroundColor: '#B8D4E8',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    fontFamily: 'monospace',
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
    backgroundColor: 'white',
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
    backgroundColor: '#E0E0E0',
    border: 'none',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  inPersonBadge: {
    padding: '8px 15px',
    backgroundColor: '#E0E0E0',
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
  },
  reviewCard: {
    backgroundColor: '#F5F0E6',
    borderRadius: '10px',
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
  },
  reviewRating: {
    fontSize: '14px',
    color: '#666',
  },
  starIcon: {
    color: '#FFD700',
  },
  reviewText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    fontFamily: 'monospace',
  },
  readMore: {
    color: '#0066CC',
    cursor: 'pointer',
  },
  readReviewButton: {
    padding: '10px 20px',
    backgroundColor: '#DC143C',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
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
