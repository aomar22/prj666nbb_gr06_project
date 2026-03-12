import DashboardLayout from "../../components/layout/DashboardLayout";
import PageCard from "../../components/ui/PageCard";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getLearnerSessions, cancelLearnerBooking } from "../../api";

//Mapping function to convert backend session data to frontend format
// function mapSlotToSessionCard(slot) {
//   return {
//     id: slot.id,
//     tutorId: slot.tutorId,
//     learnerId: slot.learnerId,
//     status: slot.status,
//     date: slot.date,
//     time: `${slot.startTime} - ${slot.endTime}`,
//     tutorName: "Tutor",        // temporary until tutor info endpoint is added
//     rating: "—",
//     reviews: "0 reviews",
//     mode: "Online",
//   };
// }

export default function LearnerSessionManagement() {
    const navigate = useNavigate();
    const [slots, setSlots] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [page, setPage] = useState(0);
    const [selectedUpcomingSessionId, setSelectedUpcomingSessionId] = useState(null);  
    const [pastPage, setPastPage] = useState(0);

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
                    const computedStatus = slotEndDate < now ? "COMPLETED" : "BOOKED";
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
                    };
                });

                setSlots(mapped);
            } catch (e) {
                console.error("Failed to load learner sessions", e);
                setLoadError("Failed to load sessions.");
            } finally {
                setLoading(false);
            }
        }
        loadSessions();
    }, [user?.id]);
  
//state for loading (actual functionality to be implemented when backend is ready)
    // const [loading, setLoading] = useState(true);
    // const [loadError, setLoadError] = useState("");

    // useEffect(() => {
    //     async function loadSessions() {
    //         try {
    //         setLoading(true);
    //         setLoadError("");

    //         const learnerId = getUser()?.id;
    //         if (!learnerId) {
    //             setSlots([]);
    //             return;
    //         }

    //         const data = await getLearnerSessions(learnerId);

    //         const mapped = (Array.isArray(data) ? data : []).map((slot) => ({
    //             id: slot.id,
    //             tutorId: slot.tutorId,
    //             learnerId: slot.learnerId,
    //             status: slot.status,
    //             date: slot.date,
    //             time: `${slot.startTime} - ${slot.endTime}`,
    //             tutorName: "Tutor",
    //             rating: "—",
    //             reviews: "0 reviews",
    //             mode: "Online",
    //         }));

    //         setSlots(mapped);
    //         } catch (e) {
    //         console.error("Failed to load learner sessions", e);
    //         setLoadError("Failed to load sessions.");
    //         setSlots([]);
    //         } finally {
    //         setLoading(false);
    //         }
    //     }

    //     loadSessions();
    //     }, []);
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
    
    async function handleCancel() {
        if (!selectedUpcomingSession) return;

        try {
            await cancelLearnerBooking(selectedUpcomingSession.id, user.id);

            setSlots((prevSlots) =>
                prevSlots.filter((slot) => slot.id !== selectedUpcomingSession.id)
            );
            setSelectedUpcomingSessionId(null);
            setPage(0);
        } catch (err) {
            alert("Could not cancel session. Please try again.");
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
                                onClick={handleCancel}
                                className={`px-4 py-2 rounded-lg text-white font-semibold shadow transition ${
                                    hasSelectedUpcomingSession
                                    ? "bg-red-700 hover:bg-red-800"
                                    : "bg-red-300 cursor-not-allowed shadow-none"
                                }`}
                            >
                                Cancel
                            </button>

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
                                                ? "bg-[#CFCFCF] ring-4 ring-[#7C8DB5] scale-[1.01]"
                                                : "bg-[#D9D9D9] hover:bg-[#D3D3D3]",
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
                                            <div className="mt-6 flex items-center gap-2">
                                                <div className="inline-flex min-w-[105px] items-center justify-center rounded-full bg-[#5C8354] px-5 py-2 text-[14px] font-medium text-white">
                                                    <img
                                                        src="/location_on.png"
                                                        alt="location"
                                                        className="h-[14px] w-[14px]"
                                                    />
                                                    {session.mode}
                                                </div>

                                                <div className="min-w-[105px] items-center justify-center rounded-full bg-[#3F5368] px-5 py-2 text-[14px] font-medium text-white">
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
        </DashboardLayout>
    );
}