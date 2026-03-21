import { useNavigate, useLocation } from "react-router-dom";
import { getUser } from "../../api";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
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
  // const tutor = location.state?.tutor;
  //for demo and frontend development only (hardcoded tutor data)
  const tutor = location.state?.tutor || {
  id: "T102",
  userId: "U102",
  firstName: "Indira",
  lastName: "Varma",
  rating: 4.7,
  reviewCount: 78,
  bio: "Dedicated to making object-oriented programming simple and logical. I enjoy helping students understand not just how to code, but why certain design choices matter. My tutoring focuses on practical examples and breaking down complex concepts into small, manageable parts.",
  teachingMode: ["ONLINE", "IN_PERSON"],
  campus: ["Newnham", "Seneca@York"],
  availability: "Mon-Wed",
  coursesOffered: ["OOP244", "OOP345"],
  program: ["CPA", "CPP"],
  sessionType: "ONE_ON_ONE",
};

  const handleClose = () => {
    navigate(-1);
  };
   const handleWriteReview = () => {
                //Issue 2: open modal
  };
  if (!tutor) {
    return (
      <div style={styles.container}>
        <Sidebar />
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

  const tutorAvatarUrl = getAvatarUrl(
    tutor.profileImageUrl || tutor.profilePicture,
    tutor.id,
    tutor.userId,
    tutor.firstName,
    tutor.lastName
  );
 
  // const placeholderReviews = [
  //   { reviewerName: "Tom Hanks", rating: 5, text: "Excellent tutor! Very patient and explained concepts clearly. Highly recommend for anyone struggling with the material." },
  // ];
  const reviews = [
    {
      id: "R1",
      tutorId: tutor.id,
      learnerId: "L100",
      learnerName: "Tom Hanks",
      slotId: "S200",
      rating: 5,
      comment: "Excellent tutor! Very patient and explained concepts clearly.",
      createdAt: "2026-03-20T10:30:00Z",
    },
  ];
  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        <div style={{ marginBottom: "28px" }}>
          <Topbar
            placeholder="Search Tutor or Courses"
            onSearchBarClick={() => navigate("/dashboard/learner/find-tutors")}
            avatarSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User")}&background=ddd&color=666&size=100`}
          />
        </div>

        <div style={styles.profileCard}>
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
                  <button 
                    type="button" 
                    style={styles.bookBtn}
                    onClick={() => navigate("/dashboard/learner/booking", { state: { tutorId: tutor.id ?? tutor.userId, tutor } })}
                  >
                    Book session
                  </button>
                  <button type="button" style={styles.closeBtn} onClick={handleClose} aria-label="Close">×</button>
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
          <div style={styles.divider} />
          <section style={styles.section}>
            <div style={styles.reviewSectionHeader}>
              <h2 style={styles.sectionTitle}>Reviews:</h2>
              <button
                type="button"
                style={styles.writeReviewBtn}
                onClick={handleWriteReview}
              >
                Write a review
              </button>
            </div>
            {reviews.map((review) => {
              const fullName = (review.learnerName || review.reviewerName || "").trim();
              const [firstName = "", lastName = ""] = fullName.split(" ");

              return (
                // <div key={i} style={styles.reviewCard}>
                  <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewerAvatar}>
                    <img
                      src={getAvatarUrl(null, null, null, firstName, lastName)}
                      alt=""
                      style={styles.reviewerAvatarImg}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    {/* <span style={styles.reviewerAvatarLetter}>{review.reviewerName[0]}</span> */}
                    <span style={styles.reviewerAvatarLetter}>
                      {review.learnerName?.[0] || "L"}
                    </span>
                  </div>
                  <div style={styles.reviewBody}>
                    <div style={styles.reviewHeader}>
                      {/* <span style={styles.reviewerName}>{review.reviewerName}</span> */}
                      <span style={styles.reviewerName}>{review.learnerName}</span>
                      <span style={styles.reviewStars}>
                        {Array.from({ length: 5 }, (_, j) => (
                          <span key={j} style={{ color: j < review.rating ? "#000" : "#ccc" }}>★</span>
                          ))}
                          {" "}{review.rating}
                        </span>
                      </div>
                      {/* <p style={styles.reviewText}>{review.text}</p> */}
                          <p style={styles.reviewText}>{review.comment}</p>
                    </div>
                  </div>
                );
              })}
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
    letterSpacing: 0,
    fontFamily: '"SF Mono", Monaco, Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  noTutor: { fontFamily: 'inherit', color: "#333" },
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
    fontFamily: "inherit",
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
    fontFamily: 'inherit',
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
    fontFamily: 'inherit',
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
    fontFamily: 'inherit',
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
    fontFamily: "inherit",
    color: "#000",
  },
  profileActions: { display: "flex", gap: "12px", flexShrink: 0 },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
    fontSize: "15px",
    lineHeight: "17px",
    fontWeight: 700,
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#000",
  },
  ratingNum: { fontWeight: 700, color: "#000" },
  reviewsLink: { fontSize: "14px", fontWeight: 400, fontFamily: "Arial, Helvetica, sans-serif", color: "#555", textDecoration: "underline" },
  msgBtn: {
    width: "156px",
    height: "61px",
    backgroundColor: "#FF4245",
    color: "#fff",
    border: "none",
    borderRadius: "17px",
    fontSize: "20px",
    fontWeight: 500, // Matches Tailwind's font-medium
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 6px 14px rgba(0,0,0,0.18)",
    padding: 0,
  },
  bookBtn: {
    width: "156px",
    height: "61px",
    backgroundColor: "#FF4245",
    color: "#fff",
    border: "none",
    borderRadius: "17px",
    fontSize: "20px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 6px 14px rgba(0,0,0,0.18)",
    padding: 0,
  },
  section: { marginBottom: "24px" },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "18px",
    fontWeight: 700,
    fontFamily: "inherit",
    color: "#000",
  },
  aboutText: {
    margin: 0,
    fontSize: "15px",
    lineHeight: "24px",
    fontWeight: 700,
    fontFamily: "inherit",
    color: "#333",
  },
  detailRow: {
    margin: "0 0 8px 0",
    fontSize: "15px",
    lineHeight: "20px",
    fontWeight: 700,
    fontFamily: "inherit",
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
    fontFamily: "inherit",
  },
  //divider
  divider: {
  width: "100%",
  height: "1px",
  backgroundColor: "#B1B1B1",
  margin: "16px 0",
},
  //for the review section 
  reviewSectionHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
},

writeReviewBtn: {
  minWidth: "154px",
  height: "40px",
  padding: "0 18px",
  borderRadius: "999px",
  border: "1px solid #6B6B6B",
  backgroundColor: "#FFFFFF",
  color: "#111111",
  fontSize: "14px",
  cursor: "pointer",
  fontFamily: "inherit",
},
  reviewBody: { flex: 1, minWidth: 0 },
  reviewHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" },
  reviewerName: { fontWeight: 700, fontSize: "15px", fontFamily: "inherit", color: "#000" },
  reviewStars: { fontSize: "14px", color: "#000" },
  reviewText: { margin: 0, fontSize: "15px", lineHeight: "22px", fontWeight: 400, fontFamily: "inherit", color: "#333" },
  seeMore: { margin: "16px 0 0 0", textAlign: "center" },
  seeMoreLink: { background: "none", border: "none", color: "#000", textDecoration: "underline", cursor: "pointer", fontSize: "15px", fontFamily: "inherit" },
};

function StarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7 7 .5-5.3 4.6L18.5 21 12 17.2 5.5 21l1.8-6.9L2 9.5 9 9l3-7z" strokeLinejoin="round" /></svg>;
}
