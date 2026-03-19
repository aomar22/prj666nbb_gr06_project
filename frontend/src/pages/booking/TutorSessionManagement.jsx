import DashboardLayout from "../../components/layout/DashboardLayout";
import PageCard from "../../components/ui/PageCard";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getUser, getTutorSessions, cancelLearnerBooking } from "../../api";

export default function TutorSessionManagement() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    
    const [page, setPage] = useState(0);
    const [selectedUpcomingSessionId, setSelectedUpcomingSessionId] = useState(null);  
    const [pastPage, setPastPage] = useState(0);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const user = getUser();

    useEffect(() => {
        async function loadSessions() {
            try {
                setLoading(true);
                
                if (!user?.id) {
                    setSlots([]);
                    return;
                }

                const data = await getTutorSessions(user.id);
                const now = new Date();
                const slotsArray = Array.isArray(data) ? data : (data?.data || []);

                const mapped = slotsArray.map((slot) => {
                    const slotEndDate = new Date(`${slot.date}T${slot.endTime}`);
                    
                    let computedStatus = slot.status;
                    if (slot.status === "BOOKED" && slotEndDate < now) {
                        computedStatus = "COMPLETED";
                    }

                    const extractedStudentName = slot.message ? slot.message.replace("Session with ", "") : "Student";

                    return {
                        id: slot.id || slot.slotId,
                        status: computedStatus,
                        studentName: extractedStudentName,
                        rating: "—",
                        reviews: "0 reviews",
                        date: slot.date,
                        time: `${slot.startTime} - ${slot.endTime}`,
                        mode: "Online",
                        learnerId: slot.learnerId,
                        avatar: "/avatar.png", 
                    };
                });

                const sessionSlots = mapped.filter(
                    (s) => s.status === "BOOKED" || s.status === "COMPLETED"
                );

                setSlots(sessionSlots);
            } catch (e) {
                console.error("Failed to load tutor sessions", e);
                setLoadError("Failed to load sessions.");
            } finally {
                setLoading(false);
            }
        }
        loadSessions();
    }, [user?.id]);

    const [placeholderUpcoming, setPlaceholderUpcoming] = useState([
        { id: "ph-u1", status: "BOOKED", studentName: "Bradley Cooper", rating: "4.8", reviews: "12 reviews", date: "2025-10-25", time: "10:00 - 11:00", mode: "Online", learnerId: null, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
        { id: "ph-u2", status: "BOOKED", studentName: "Megan Fox", rating: "4.5", reviews: "8 reviews", date: "2025-11-13", time: "14:00 - 15:00", mode: "In Person", learnerId: null, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
        { id: "ph-u3", status: "BOOKED", studentName: "Ryan Reynolds", rating: "4.2", reviews: "5 reviews", date: "2025-11-20", time: "09:00 - 10:00", mode: "Online", learnerId: null, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    ]);

    const PLACEHOLDER_PAST = [
        { id: "ph-p1", status: "COMPLETED", studentName: "Anne Hathaway", rating: "5.0", reviews: "15 reviews", date: "2025-09-10", time: "11:00 - 12:00", mode: "Online", learnerId: null, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
        { id: "ph-p2", status: "COMPLETED", studentName: "Chris Evans", rating: "4.7", reviews: "10 reviews", date: "2025-08-22", time: "15:00 - 16:00", mode: "In Person", learnerId: null, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
        { id: "ph-p3", status: "COMPLETED", studentName: "Scarlett Johansson", rating: "4.9", reviews: "20 reviews", date: "2025-07-15", time: "13:00 - 14:00", mode: "Online", learnerId: null, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
    ];

    const realUpcoming = slots.filter((slot) => slot.status === "BOOKED");
    const realPast = slots.filter((slot) => slot.status === "COMPLETED");

    const upcomingSessions = realUpcoming.length > 0 ? realUpcoming : placeholderUpcoming;
    const pastSessions = realPast.length > 0 ? realPast : PLACEHOLDER_PAST;
    
    const sessionsPrepPage = 3;
    const totalPages = Math.ceil(upcomingSessions.length / sessionsPrepPage); 
    const pastTotalPages = Math.ceil(pastSessions.length / sessionsPrepPage);

    const visibleUpcomingSessions = upcomingSessions.slice(
        page * sessionsPrepPage,
        page * sessionsPrepPage + sessionsPrepPage
    );

    const visiblePastSessions = pastSessions.slice(
        pastPage * sessionsPrepPage,
        pastPage * sessionsPrepPage + sessionsPrepPage
    );

    const hasSelectedUpcomingSession = selectedUpcomingSessionId !== null;

    const selectedUpcomingSession = upcomingSessions.find(
        (session) => session.id === selectedUpcomingSessionId
    );
    
    async function handleConfirmCancel() {
        if (!selectedUpcomingSession) return;
        setShowCancelModal(false);

        const isPlaceholder = String(selectedUpcomingSession.id).startsWith("ph-");

        if (isPlaceholder) {
            setPlaceholderUpcoming((prev) =>
                prev.filter((s) => s.id !== selectedUpcomingSession.id)
            );
            setSelectedUpcomingSessionId(null);
            setPage(0);
            return;
        }

        try {
            await cancelLearnerBooking(selectedUpcomingSession.id, selectedUpcomingSession.learnerId);
            setSlots((prevSlots) =>
                prevSlots.filter((slot) => slot.id !== selectedUpcomingSession.id)
            );

            setSelectedUpcomingSessionId(null);
            setPage(0);
        } catch (err) {
            alert("Could not cancel session. Please try again.");
            console.error("Cancel Session Error:", err);
        }
    }

    return (
        <DashboardLayout>
            {/*Page Title*/}
            <div className="mb-[30px] px-8 py-7 font-mono">
                <h1 className="m-0 mb-1 text-[44px] font-extrabold leading-[1.2] tracking-[-0.025em] text-black">
                    Session Management
                </h1>
                <p className="m-0 text-[18px] font-bold leading-[1.4] text-black/70">
                    View and manage your upcoming and past tutoring sessions.
                </p>
            </div>

            {loadError && (
                <div className="px-8 text-red-600 font-bold mb-4">{loadError}</div>
            )}

            <PageCard className="mt-4 p-4">
                <section className="mt-4">
                    <div className="flex items-center justify-between border-b-2 border-black/30 pb-3">
                        <h2 className="text-[24px] font-bold font-mono text-black">
                            Upcoming Sessions
                        </h2>
                        <button
                            type="button"
                            disabled={!hasSelectedUpcomingSession}
                            onClick={() => setShowCancelModal(true)}
                            className={`px-4 py-2 rounded-lg text-white font-semibold shadow transition ${
                            hasSelectedUpcomingSession
                            ? "bg-red-700 hover:bg-red-800"
                            : "bg-red-300 cursor-not-allowed shadow-none"
                            }`}
                        >
                            Cancel Session
                        </button>
                    </div>
                    
                    <div className="mt-6 flex items-center gap-3">
                        {loading ? (
                            <div className="flex rounded-[22px] bg-[#EFEFEF] px-6 py-10 text-center text-[18px] font-mono font-semibold text-black/60 w-full justify-center">
                                Loading your sessions...
                            </div>
                        ) : upcomingSessions.length === 0 ? (
                            <div className="flex rounded-[22px] bg-[#EFEFEF] px-6 py-10 text-center text-[18px] font-mono font-semibold text-black/60 w-full justify-center">
                                No upcoming sessions yet.
                            </div>
                        ) : (
                            <>
                                <div className="grid flex-1 gap-6 grid-cols-3">
                                    {visibleUpcomingSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => setSelectedUpcomingSessionId(
                                                selectedUpcomingSessionId === session.id ? null : session.id
                                            )}
                                            className={[
                                                "w-full cursor-pointer rounded-[22px] px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition",
                                                selectedUpcomingSessionId === session.id
                                                ? "bg-[#CFCFCF] ring-4 ring-[#7C8DB5] scale-[1.01]"
                                                : "bg-[#D9D9D9] hover:bg-[#D3D3D3]",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={session.avatar}
                                                    alt={session.studentName}
                                                    className="h-[58px] w-[58px] rounded-full object-cover"
                                                />

                                                <div className="font-mono">
                                                    <div className="text-[20px] font-extrabold leading-none text-black">
                                                        {session.studentName}
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2 text-[15px] font-bold text-black">
                                                        <span>★ {session.rating}</span>
                                                        <span className="text-black/70 underline">({session.reviews})</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 space-y-3 font-mono text-[15px] font-bold text-black">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-black" />
                                                    <span>{session.date}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-black" />
                                                    <span>{session.time}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between">
                                                <div className="inline-flex min-w-[105px] items-center justify-center rounded-full bg-[#5C8354] px-5 py-2 text-[14px] font-medium text-white">
                                                    <img
                                                        src="/location_on.png"
                                                        alt="location"
                                                        className="h-[14px] w-[14px]"
                                                    />
                                                    {session.mode}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="rounded-full bg-[#FF4B4B] px-5 py-2 text-[14px] font-medium text-white shadow hover:bg-[#D93636]"
                                                >
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPage((prev) =>
                                                prev + 1 < totalPages ? prev + 1 : 0
                                            )
                                        }
                                        className="ml-1 shrink-0 text-[32px] font-semibold leading-none text-black/60 hover:text-black"
                                        aria-label="Next sessions"
                                    >
                                        →
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </PageCard>
            
            <br/>
            
            <PageCard className="mt-4 p-4 mb-8">
                <section className="mt-4">
                    <div className="border-b-2 border-black/30 pb-3">
                        <h2 className="text-[24px] font-bold font-mono text-black">
                            Past Sessions
                        </h2>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        {loading ? (
                            <div className="flex rounded-[22px] bg-[#EFEFEF] px-6 py-10 text-center text-[18px] font-mono font-semibold text-black/60 w-full justify-center">
                                Loading your sessions...
                            </div>
                        ) : pastSessions.length === 0 ? (
                            <div className="flex rounded-[22px] bg-[#EFEFEF] px-6 py-10 text-center text-[18px] font-mono font-semibold text-black/60 w-full justify-center">
                                No past sessions yet.
                            </div>
                        ) : (
                            <>
                                <div className="grid flex-1 gap-6 grid-cols-3">
                                    {visiblePastSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="w-full rounded-[22px] bg-[#D9D9D9] px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={session.avatar}
                                                    alt={session.studentName}
                                                    className="h-[58px] w-[58px] rounded-full object-cover"
                                                />

                                                <div className="font-mono">
                                                    <div className="text-[20px] font-extrabold leading-none text-black">
                                                        {session.studentName}
                                                    </div>

                                                    <div className="mt-2 flex items-center gap-2 text-[15px] font-bold text-black">
                                                        <span>★ {session.rating}</span>
                                                        <span className="text-black/70 underline">
                                                            ({session.reviews})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 space-y-3 font-mono text-[15px] font-bold text-black">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    <span>{session.date}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} />
                                                    <span>{session.time}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center gap-3">
                                                <div className="inline-flex min-w-[105px] items-center justify-center rounded-full bg-[#5C8354] px-5 py-2 text-[14px] font-medium text-white">
                                                    <img
                                                        src="/location_on.png"
                                                        alt="location"
                                                        className="h-[14px] w-[14px]"
                                                    />
                                                    {session.mode}
                                                </div>

                                                <div className="inline-flex min-w-[105px] items-center justify-center rounded-full bg-[#3F5368] px-5 py-2 text-[14px] font-medium text-white">
                                                    {session.status === "COMPLETED" ? "Completed" : session.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {pastTotalPages > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPastPage((prev) =>
                                                prev + 1 < pastTotalPages ? prev + 1 : 0
                                            )
                                        }
                                        className="shrink-0 text-[32px] font-semibold leading-none text-black/60 hover:text-black"
                                        aria-label="Next past sessions"
                                    >
                                        →
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </PageCard>
            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowCancelModal(false)}
                        aria-label="Close modal"
                    />
                    <div className="relative w-[420px] rounded-[20px] bg-white px-8 py-7 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="mt-4 text-[20px] font-bold text-black">
                                Cancel Session?
                            </h3>
                            <p className="mt-2 text-[15px] text-gray-600">
                                Are you sure you want to cancel the session with{" "}
                                <span className="font-semibold text-black">
                                    {selectedUpcomingSession?.studentName}
                                </span>
                                ? This action cannot be undone.
                            </p>
                            <div className="mt-6 flex w-full gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(false)}
                                    autoFocus
                                    className="flex-1 rounded-[12px] border border-gray-300 bg-white py-3 text-[16px] font-semibold text-black shadow-sm hover:bg-gray-50 transition"
                                >
                                    No, Keep It
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCancel}
                                    className="flex-1 rounded-[12px] bg-red-600 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-red-700 transition"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}