import DashboardLayout from "../../components/layout/DashboardLayout";
import PageCard from "../../components/ui/PageCard";
import { Calendar, Clock } from "lucide-react";
import { useState } from "react";

export default function LearnerSessionManagement() {
    
    
    const upcomingSessions = [
  {
    id: 1,
    tutorName: "Brad Pitt",
    rating: "4.7",
    reviews: "78 reviews",
    date: "Mar 20, 2026",
    time: "10:00 AM - 11:00 AM",
    mode: "Online",
  },
  {
    id: 2,
    tutorName: "Brad Pitt",
    rating: "4.7",
    reviews: "78 reviews",
    date: "Mar 24, 2026",
    time: "10:00 AM - 11:00 AM",
    mode: "Online",
  },
  {
    id: 3,
    tutorName: "Brad Pitt",
    rating: "4.7",
    reviews: "78 reviews",
    date: "Mar 30, 2026",
    time: "10:00 AM - 11:00 AM",
    mode: "Online",
  },
];
const [page, setPage] = useState(0);
    const sessionsPrepPage = 3;
    const visibleSessions = upcomingSessions.slice(
        page * sessionsPrepPage,
        page * sessionsPrepPage + sessionsPrepPage
    );
    const pastSessions = [
  {
    id: 1,
    tutorName: "Brad Pitt",
    rating: "4.7",
    reviews: "78 reviews",
    date: "Feb 13, 2026",
    time: "10:00 AM - 11:00 AM",
    mode: "Online",
    status: "Completed",
  },
  {
    id: 2,
    tutorName: "Brad Pitt",
    rating: "4.7",
    reviews: "78 reviews",
    date: "Feb 20, 2026",
    time: "10:00 AM - 11:00 AM",
    mode: "Online",
    status: "Completed",
  },
];
const totalPages = Math.ceil(upcomingSessions.length / sessionsPrepPage);

const [selectedUpcomingSessionId, setSelectedUpcomingSessionId] = useState(null);  
const hasSelectedUpcomingSession = selectedUpcomingSessionId !== null;

return (
    <DashboardLayout>
      
        {/*Page Title*/}
            <div className="mb-[30px] px-8 py-7 font-mono">
            <h1 className="m-0 mb-1 text-[44px] font-extrabold leading-[1.2] tracking-[-0.025em] text-black">
                Session Management
            </h1>
            <p className="m-0 text-[18px] font-bold leading-[1.4] text-black/70">
                View and manage your upcoming, past, and cancelled tutoring sessions.
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
                    <div className="grid flex-1 gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                    {visibleSessions.map((session) => (
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
                        className="ml-2 shrink-0 text-[32px] font-semibold leading-none text-black/60 hover:text-black"
                        aria-label="Next sessions"
                        >
                        →
                        </button>
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

                <div className="mt-6 grid grid-cols-3 gap-6">
                {pastSessions.map((session) => (
                    <div
                    key={session.id}
                    className="w-full rounded-[22px] bg-[#D9D9D9] px-5 py-4 shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
                    >
                    {/* Tutor Info */}
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

                    {/* Date + Time */}
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

                    {/* Status */}
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
                        {session.status}
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </section>
            </PageCard>
      
    </DashboardLayout>
    );
}