import DashboardLayout from "../../components/layout/DashboardLayout";

const UPCOMING_SESSIONS = [
  {
    id: 1,
    studentName: "Anne Hathaway",
    date: "Feb 27, 2026",
    time: "10:00 AM - 11:00 AM",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    isOnline: true,
  },
  {
    id: 2,
    studentName: "Emma Watson",
    date: "Feb 28, 2026",
    time: "2:00 PM - 3:00 PM",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    isOnline: true,
  },
  {
    id: 3,
    studentName: "Jennifer Lawrence",
    date: "Mar 1, 2026",
    time: "11:00 AM - 12:00 PM",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    isOnline: false,
  },
];

const PAST_SESSIONS = [
  {
    id: 4,
    studentName: "Lindsay Lohan",
    date: "Feb 13, 2026",
    time: "10:00 AM - 11:00 AM",
    avatar: "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=100&h=100&fit=crop&crop=face",
    isOnline: true,
  },
  {
    id: 5,
    studentName: "Scarlett Johansson",
    date: "Feb 10, 2026",
    time: "3:00 PM - 4:00 PM",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    isOnline: true,
  },
];

export default function TutorMySession() {
  return (
    <DashboardLayout>
      <div className="px-0 mt-10">
            <h1 className="text-[32px] font-extrabold text-black" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, sans-serif" }}>
              Session Management
            </h1>
            <p className="mt-2 text-[18px] text-black/80" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, sans-serif" }}>
              View and manage your upcoming, past, and cancelled tutoring sessions.
            </p>

            {/* Upcoming Sessions */}
            <section className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h2 className="text-[20px] font-bold text-black">Upcoming Sessions</h2>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#A21626] text-white text-sm font-semibold hover:opacity-90"
                >
                  Cancel
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 pt-4" style={{ minHeight: "180px" }}>
                {UPCOMING_SESSIONS.map((session) => (
                  <div
                    key={session.id}
                    className="flex-shrink-0 w-[280px] rounded-xl p-4 bg-[#D9D9D9] border border-gray-200/80"
                  >
                    <div className="flex gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                        <img src={session.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-black truncate">{session.studentName}</h3>
                        <p className="text-sm text-black/80 flex items-center gap-1.5 mt-0.5">
                          <span>📅</span> {session.date}
                        </p>
                        <p className="text-sm text-black/80 flex items-center gap-1.5">
                          <span>🕐</span> {session.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#59855C] text-white text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" /> Online
                      </span>
                      <button
                        type="button"
                        className="px-4 py-1.5 rounded-lg bg-[#DC143C] text-white text-sm font-semibold hover:opacity-90"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex-shrink-0 w-8 flex items-center justify-center text-2xl text-gray-500">→</div>
              </div>
            </section>

            {/* Past Sessions */}
            <section className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="pb-3 border-b border-gray-200 mb-4">
                <h2 className="text-[20px] font-bold text-black">Past Sessions</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ minHeight: "180px" }}>
                {PAST_SESSIONS.map((session) => (
                  <div
                    key={session.id}
                    className="flex-shrink-0 w-[280px] rounded-xl p-4 bg-[#D9D9D9] border border-gray-200/80"
                  >
                    <div className="flex gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                        <img src={session.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-black truncate">{session.studentName}</h3>
                        <p className="text-sm text-black/80 flex items-center gap-1.5 mt-0.5">
                          <span>📅</span> {session.date}
                        </p>
                        <p className="text-sm text-black/80 flex items-center gap-1.5">
                          <span>🕐</span> {session.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#59855C] text-white text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" /> Online
                      </span>
                      <span className="px-4 py-1.5 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold">
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
      </div>
    </DashboardLayout>
  );
}
