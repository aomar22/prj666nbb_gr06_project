import { useNavigate, useLocation, Link } from "react-router-dom";
import { clearAuth, getUser } from "../../api";
import { TEACHING_MODE_LABELS, SESSION_TYPE_LABELS } from "../../constants/options";

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

function getAvatarUrl(profileImageUrl, id, userId, firstName, lastName) {
  if (profileImageUrl) return profileImageUrl;
  const seed = (id ?? userId ?? [firstName, lastName].filter(Boolean).join(" ")) || "user";
  const str = String(seed);
  let index = 0;
  for (let i = 0; i < str.length; i++) index = (index + str.charCodeAt(i)) % TUTOR_PLACEHOLDER_PHOTOS.length;
  return TUTOR_PLACEHOLDER_PHOTOS[Math.abs(index)];
}

export default function ViewTutorProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const tutor = location.state?.tutor;

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (!tutor) {
    return (
      <div style={styles.container}>
        <main style={styles.mainContent}>
          <p style={styles.noTutor}>No tutor selected. <button type="button" style={styles.backLink} onClick={() => navigate("/dashboard/learner/find-tutors/results")}>Go back to results</button></p>
        </main>
      </div>
    );
  }

  const tutorName = [tutor.firstName, tutor.lastName].filter(Boolean).join(" ") || "Tutor";
  const teachingMode = Array.isArray(tutor.teachingMode) && tutor.teachingMode.length
    ? tutor.teachingMode.map((m) => TEACHING_MODE_LABELS[m] || m).join(" / ")
    : "Online / In-person";
  const campus = Array.isArray(tutor.campus) && tutor.campus.length ? tutor.campus.join(", ") : (tutor.campus || "Newnham");
  const availability = tutor.availability || "Mon-Wed";
  const courses = Array.isArray(tutor.coursesOffered) && tutor.coursesOffered.length ? tutor.coursesOffered.join(", ") : (tutor.program || "—");
  const programLabel = Array.isArray(tutor.program) ? tutor.program.join(", ") : (tutor.program || "—");
  const sessionType = tutor.sessionType ? (SESSION_TYPE_LABELS[tutor.sessionType] || tutor.sessionType) : "One-on-One";
  const aboutText = tutor.bio || `Dedicated to making learning accessible and effective. ${tutorName} brings a structured yet supportive approach to tutoring, helping students build strong foundations and confidence in their coursework.`;

  const tutorAvatarUrl = getAvatarUrl(tutor.profileImageUrl, tutor.id, tutor.userId, tutor.firstName, tutor.lastName);

  const placeholderReviews = [
    { reviewerName: "Tom Hanks", rating: 5, text: "Excellent tutor! Very patient and explained concepts clearly. Highly recommend for anyone struggling with the material." },
  ];

  return (
    <div style={styles.container}>
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
          <Link to="/dashboard/learner" className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition text-white no-underline hover:bg-white/10">
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
          <button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-[10px] px-3 py-2 transition hover:bg-white/10 text-white border-0 bg-transparent cursor-pointer text-[15px] font-semibold w-full text-left">
            <span className="opacity-95"><LogoutIcon /></span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main style={styles.mainContent}>
        <div style={styles.topBar}>
          <form style={styles.searchForm} onSubmit={(e) => { e.preventDefault(); navigate("/dashboard/learner/find-tutors"); }}>
            <input type="text" placeholder="Search Tutor or Courses" style={styles.searchInput} readOnly />
            <button type="button" style={styles.searchIconBtn} aria-label="Search" onClick={() => navigate("/dashboard/learner/find-tutors")}>
              <SearchMagnifyIcon />
            </button>
          </form>
          <div style={styles.topBarIcons}>
            <button type="button" style={styles.iconBtn} aria-label="Notifications">
              <span style={styles.bellWrap}>
                <BellIcon />
                <span style={styles.badge}>3</span>
              </span>
            </button>
            <button type="button" style={styles.avatarBtn} aria-label="Profile">
              <div style={styles.avatar}>{user?.firstName?.[0] || "U"}</div>
            </button>
          </div>
        </div>

        <div style={styles.profileCard}>
          <button type="button" style={styles.closeBtn} onClick={handleClose} aria-label="Close">×</button>

          <div style={styles.profileHeader}>
            <div style={styles.profileAvatarWrap}>
              <img src={tutorAvatarUrl} alt="" style={styles.profileAvatarImg} onError={(e) => { e.target.style.display = "none"; }} />
              <span style={styles.profileAvatarLetter}>{tutor.firstName?.[0] || "T"}</span>
            </div>
            <div style={styles.profileHeaderRight}>
              <div style={styles.profileNameRow}>
                <h1 style={styles.profileName}>{tutorName}</h1>
                <div style={styles.profileActions}>
                  <button type="button" style={styles.msgBtn}>Message</button>
                  <button type="button" style={styles.bookBtn}>Book session</button>
                </div>
              </div>
              <div style={styles.ratingRow}>
                <StarIcon />
                <span style={styles.ratingNum}>{tutor.rating != null ? Number(tutor.rating).toFixed(1) : "—"}</span>
                <span style={styles.reviewsLink}>({tutor.reviewCount ?? 0} reviews)</span>
              </div>
            </div>
          </div>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>About:</h2>
            <p style={styles.aboutText}>{aboutText}</p>
          </section>

          <section style={styles.section}>
            <p style={styles.detailRow}><strong>Courses:</strong> {courses}</p>
            <p style={styles.detailRow}><strong>Availability:</strong> {availability}</p>
            <p style={styles.detailRow}><strong>Program:</strong> {programLabel}</p>
            <p style={styles.detailRow}><strong>Teaching Mode:</strong> {teachingMode}</p>
            <p style={styles.detailRow}><strong>Campus:</strong> {campus}</p>
            <p style={styles.detailRow}><strong>Session Type:</strong> {sessionType}</p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Reviews:</h2>
            {placeholderReviews.map((review, i) => (
              <div key={i} style={styles.reviewCard}>
                <div style={styles.reviewerAvatar}>
                  <img
                    src={getAvatarUrl(null, null, null, review.reviewerName.split(" ")[0], review.reviewerName.split(" ")[1])}
                    alt=""
                    style={styles.reviewerAvatarImg}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span style={styles.reviewerAvatarLetter}>{review.reviewerName[0]}</span>
                </div>
                <div style={styles.reviewBody}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.reviewerName}>{review.reviewerName}</span>
                    <span style={styles.reviewStars}>
                      {Array.from({ length: 5 }, (_, j) => (
                        <span key={j} style={{ color: j < review.rating ? "#000" : "#ccc" }}>★</span>
                      ))}
                      {" "}{review.rating}
                    </span>
                  </div>
                  <p style={styles.reviewText}>{review.text}</p>
                </div>
              </div>
            ))}
            <p style={styles.seeMore}>
              <button type="button" style={styles.seeMoreLink}>see more</button>
            </p>
          </section>
        </div>
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
    letterSpacing: 0,
    fontFamily: "Ligconsolata",
  },
  noTutor: { fontFamily: "Ligconsolata", color: "#333" },
  backLink: { background: "none", border: "none", color: "#7A0000", textDecoration: "underline", cursor: "pointer", fontSize: "inherit" },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  searchForm: { flex: "1 1 400px", minWidth: 0, position: "relative", display: "flex", alignItems: "center" },
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
    fontFamily: "Ligconsolata",
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
  topBarIcons: { display: "flex", alignItems: "center", gap: "12px" },
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
  avatarBtn: { padding: 0, border: "none", background: "none", cursor: "pointer" },
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
    fontFamily: "Ligconsolata",
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: "12px",
    padding: "32px 40px 40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.06)",
    position: "relative",
    maxWidth: "1190px",
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "24px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    background: "#f0f0f0",
    color: "#333",
    fontSize: "24px",
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Ligconsolata",
  },
  profileHeader: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  profileAvatarWrap: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "#E8E0D8",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
  },
  profileAvatarImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 1,
  },
  profileAvatarLetter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "bold",
    color: "#7A0000",
    zIndex: 0,
    fontFamily: "Ligconsolata",
  },
  profileHeaderRight: { flex: 1, minWidth: 0, paddingRight: "52px" },
  profileNameRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  profileName: {
    margin: 0,
    fontSize: "24px",
    lineHeight: "28px",
    fontWeight: 700,
    fontFamily: "Ligconsolata",
    color: "#000",
  },
  profileActions: { display: "flex", gap: "12px", flexShrink: 0 },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
    fontFamily: "Ligconsolata",
    fontSize: "15px",
  },
  ratingNum: { fontWeight: 700, color: "#000" },
  reviewsLink: { color: "#000", textDecoration: "underline", fontWeight: 400 },
  msgBtn: {
    padding: "12px 24px",
    backgroundColor: "#FF4245",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Ligconsolata",
  },
  bookBtn: {
    padding: "12px 20px",
    backgroundColor: "#FF4245",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "Ligconsolata",
  },
  section: { marginBottom: "24px" },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "18px",
    fontWeight: 700,
    fontFamily: "Ligconsolata",
    color: "#000",
  },
  aboutText: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "24px",
    fontWeight: 700,
    fontFamily: "Ligconsolata",
    color: "#000000"

  },
  detailRow: {
    margin: "0 0 8px 0",
    fontSize: "15px",
    lineHeight: "17px",
    fontWeight: 400,
    fontFamily: "Ligconsolata",
    color: "#333",
  },
  reviewCard: {
    display: "flex",
    gap: "16px",
    padding: "20px",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  reviewerAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#E8E0D8",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
  },
  reviewerAvatarImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 1,
  },
  reviewerAvatarLetter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#7A0000",
    zIndex: 0,
    fontFamily: "Ligconsolata",
  },
  reviewBody: { flex: 1, minWidth: 0 },
  reviewHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" },
  reviewerName: { fontWeight: 700, fontSize: "15px", fontFamily: "Ligconsolata", color: "#000" },
  reviewStars: { fontSize: "14px", color: "#000" },
  reviewText: { margin: 0, fontSize: "15px", lineHeight: "22px", fontWeight: 400, fontFamily: "Ligconsolata", color: "#333" },
  seeMore: { margin: "16px 0 0 0", textAlign: "center" },
  seeMoreLink: { background: "none", border: "none", color: "#000", textDecoration: "underline", cursor: "pointer", fontSize: "15px", fontFamily: "Ligconsolata" },
};

function IconBase({ children }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">{children}</svg>;
}
function SearchMagnifyIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BellIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" /></svg>;
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
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7 7 .5-5.3 4.6L18.5 21 12 17.2 5.5 21l1.8-6.9L2 9.5 9 9l3-7z" strokeLinejoin="round" /></svg>;
}
function SettingsIcon() {
  return <IconBase><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a7.8 7.8 0 000-6l2-1.1-2-3.5-2.3.7a8 8 0 00-5.2-3L11.5 0h-3L8 2a8 8 0 00-5.2 3l-2.3-.7-2 3.5L.5 9a7.8 7.8 0 000 6l-2 1.1 2 3.5 2.3-.7a8 8 0 005.2 3l.5 2h3l.4-2a8 8 0 005.2-3l2.3.7 2-3.5-2-1.1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></IconBase>;
}
function LogoutIcon() {
  return <IconBase><path d="M10 17l1 4H5a2 2 0 01-2-2V5a2 2 0 012-2h6l-1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M15 12H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18 9l3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}
