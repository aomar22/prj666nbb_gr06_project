import DashboardLayout from "../../components/layout/DashboardLayout";
import CancelConfirmationModal from "../../components/ui/CancelConfirmationModal";
import PageCard from "../../components/ui/PageCard";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getLearnerSessions, cancelLearnerBooking } from "../../api";

export default function LearnerSessionManagement() {

    const navigate = useNavigate();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [page, setPage] = useState(0);
    const [selectedUpcomingSessionId, setSelectedUpcomingSessionId] = useState(null);  
    const [pastPage, setPastPage] = useState(0);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [sessionToCancel, setSessionToCancel] = useState(null);

    const user = getUser(); 

    useEffect(() => {
    async function loadSessions() {
        try {
            setLoading(true);
                
            if (!user?.id) {
                setSlots([]);
                return;
            }

            const data = await getLearnerSessions(user.id);
            const now = new Date();
            const mapped = (Array.isArray(data) ? data : []).map((slot) => {
            const slotEndDate = new Date(`${slot.date}T${slot.endTime}`);
            const computedStatus = slot.status || (slotEndDate < now ? "COMPLETED" : "BOOKED");
            const extractedTutorName = slot.message ? slot.message.replace("Session with ", "") : "Tutor";

                return {
                    id: slot.slotId,
                    tutorId: slot.tutorId,
                    learnerId: slot.learnerId,
                    status: computedStatus,
                    date: slot.date,
                    time: `${slot.startTime} - ${slot.endTime}`,
                    tutorName: extractedTutorName,
                    rating: "—",
                    reviews: "0 reviews",
                    mode: "Online",
                    sessionType: slot.sessionType ?? "INDIVIDUAL",
                    currentCount: slot.currentCount ?? 1,
                    maxCapacity: slot.maxCapacity ?? 1,
                };
            });
            setSlots(mapped);
            setLoadError("");
            } catch (e) {
                console.error("Failed to load learner sessions", e);
                setLoadError("Failed to load sessions.");
            } finally {
                setLoading(false);
            }
        }
        loadSessions();
    }, [user?.id]);
    const upcomingSessions = slots.filter((slot) => slot.status === "BOOKED");
    const pastSessions = slots.filter((slot) => slot.status === "COMPLETED");
    
    const sessionsPrepPage = 3;
    const totalPages = Math.ceil(upcomingSessions.length / sessionsPrepPage); //pagination
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
    
    async function handleCancel(session) {
        const targetSession = session || selectedUpcomingSession;
        if (!targetSession || !user?.id || isCancelling) return;

        try {
            setIsCancelling(true);
            await cancelLearnerBooking(targetSession.id, user.id);
            window.dispatchEvent(new CustomEvent("scholarly-learner-bookings-changed"));

            setSlots((prevSlots) =>
                prevSlots.filter((slot) => slot.id !== targetSession.id)
            );
            setShowCancelConfirmation(false);
            setSessionToCancel(null);
            setSelectedUpcomingSessionId(null);
            setPage(0);
        } catch (err) {
            alert("Could not cancel session. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    }

    function handleReschedule() {
        if (!selectedUpcomingSession) return;

        navigate("/dashboard/learner/sessions/reschedule", {
            state: {
                session: selectedUpcomingSession,
                upcomingSessions,
            },
        });
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

            {loading && (
                <PageCard className="mt-4 p-4">
                    <div className="font-mono text-[18px] font-semibold text-black/70">
                        Loading sessions...
                    </div>
                </PageCard>
            )}

            {!!loadError && (
                <PageCard className="mt-4 p-4">
                    <div className="font-mono text-[18px] font-semibold text-red-700">
                        {loadError}
                    </div>
                </PageCard>
            )}
            
            <PageCard className="mt-4 p-4">
                <section className="mt-4">
                    <div className="flex items-center justify-between border-b-2 border-black/30 pb-3">
                        <h2 className="text-[24px] font-bold font-mono text-black">
                            Upcoming Sessions
                        </h2>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                disabled={!hasSelectedUpcomingSession}
                                onClick={handleReschedule}
                                className={[
                                    "px-4 py-2 rounded-lg text-white font-semibold shadow transition",
                                    hasSelectedUpcomingSession
                                        ? "bg-blue-800 hover:bg-blue-900"
                                        : "bg-blue-400 cursor-not-allowed shadow-none",
                                ].join(" ")}
                            >
                                Reschedule
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        {upcomingSessions.length === 0 ? (
                            <div className="flex rounded-[22px] bg-[#EFEFEF] px-6 py-10 text-center text-[18px] font-mono font-semibold text-black/60">
                                No upcoming sessions yet.
                            </div>
                        ) : (
                            <>
                                <div className="grid flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {visibleUpcomingSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => setSelectedUpcomingSessionId(
                                                selectedUpcomingSessionId === session.id ? null : session.id
                                            )}
                                            className={[
                                                "w-full cursor-pointer rounded-[22px] px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition",
                                                selectedUpcomingSessionId === session.id
                                                ? "bg-[#CFCFCF] border-[6px] border-[#355C9B] scale-[1.02] shadow-xl"
                                                : "bg-[#D9D9D9] border border-transparent hover:bg-[#D3D3D3]"
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src="/avatar.png"
                                                    alt="Tutor"
                                                    className="h-[58px] w-[58px] rounded-full object-cover"
                                                />

                                                <div className="font-mono">
                                                    <div className="text-[20px] font-extrabold leading-none text-black">
                                                        {session.tutorName}
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

                                            <div className="mt-6 flex flex-wrap items-center gap-2">
                                                <div className="inline-flex items-center justify-center rounded-full bg-[#5C8354] px-4 py-2 text-[13px] font-medium text-white">
                                                    <img
                                                        src="/location_on.png"
                                                        alt="location"
                                                        className="h-[14px] w-[14px]"
                                                    />
                                                    {session.mode}
                                                </div>
                                                <div className="inline-flex items-center justify-center rounded-full bg-[#3F5368] px-4 py-2 text-[13px] font-medium text-white">
                                                    {session.sessionType === "GROUP"
                                                        ? `Group · ${session.currentCount}/${session.maxCapacity}`
                                                        : "One-on-one"}
                                                </div>
                                                <div className="ml-auto flex shrink-0 gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={isCancelling}
                                                        onClick={(e)=>{
                                                            e.stopPropagation();
                                                            setSessionToCancel(session);
                                                            setShowCancelConfirmation(true);
                                                        }}
                                                        className={[
                                                            "rounded-full px-5 py-2 text-[14px] font-medium text-white shadow transition",
                                                            isCancelling
                                                                ? "bg-red-300 cursor-not-allowed shadow-none"
                                                                : "bg-red-700 hover:bg-red-800",
                                                        ].join(" ")}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="rounded-full bg-green-600 px-5 py-2 text-[14px] font-medium text-white shadow hover:bg-green-700"
                                                    >
                                                        Join
                                                    </button>
                                                </div>
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
            
            <PageCard className="mt-4 p-4">
                <section className="mt-4">
                    <div className="border-b-2 border-black/30 pb-3">
                        <h2 className="text-[24px] font-bold font-mono text-black">
                            Past Sessions
                        </h2>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        {pastSessions.length === 0 ? (
                            <div className="flex rounded-[22px] bg-[#EFEFEF] px-6 py-10 text-center text-[18px] font-mono font-semibold text-black/60">
                                No past sessions yet.
                            </div>
                        ) : (
                            <>
                                <div className="grid flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {visiblePastSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="w-full rounded-[22px] bg-[#D9D9D9] px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src="/avatar.png"
                                                    alt="Tutor"
                                                    className="h-[58px] w-[58px] rounded-full object-cover"
                                                />

                                                <div className="font-mono">
                                                    <div className="text-[20px] font-extrabold leading-none text-black">
                                                        {session.tutorName}
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
                                            <div className="mt-6 flex flex-wrap items-center gap-2">
                                                <div className="inline-flex items-center justify-center rounded-full bg-[#5C8354] px-4 py-2 text-[13px] font-medium text-white">
                                                    <img
                                                        src="/location_on.png"
                                                        alt="location"
                                                        className="h-3.5 w-3.5"
                                                    />
                                                    {session.mode}
                                                </div>
                                                <div className="inline-flex items-center justify-center rounded-full bg-[#3F5368] px-4 py-2 text-[13px] font-medium text-white">
                                                    {session.sessionType === "GROUP" ? "Group" : "One-on-one"}
                                                </div>
                                                <div className="inline-flex items-center justify-center rounded-full bg-[#3F5368] px-4 py-2 text-[13px] font-medium text-white">
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
                <CancelConfirmationModal
                    open={showCancelConfirmation}
                    session={sessionToCancel}
                    onClose={() => {
                        setShowCancelConfirmation(false);
                        setSessionToCancel(null);
                    }}
                    onConfirm={() => {
                        handleCancel(sessionToCancel);
                    }}
                />
        </DashboardLayout>
    );
}

