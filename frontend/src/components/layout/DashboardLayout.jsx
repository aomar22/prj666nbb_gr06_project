import Sidebar from "./Sidebar";
import Topbar from "./Topbar";


export default function DashboardLayout({
  children,
  bgClass = "bg-[#F4E4D7]",
  mainClass = "px-10 py-6",
  showSearch = true,
}) {
  
  return (
    <div className={`h-screen ${bgClass} overflow-hidden`}>
      <div className="flex h-screen">
        <Sidebar />
        <main className={`flex-1 overflow-y-auto ${mainClass}`}>
          <Topbar showSearch={showSearch} />
          {children}
        </main>
      </div>
    </div>
  );
}
