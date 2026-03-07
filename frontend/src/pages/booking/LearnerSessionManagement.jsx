import DashboardLayout from "../../components/layout/DashboardLayout";
import PageCard from "../../components/ui/PageCard";

export default function LearnerSessionManagement() {
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
        <PageCard className="mt-6 p-8">
            
        </PageCard>
        <br/>
        <PageCard className="mt-6 p-8">
            
        </PageCard>

    </DashboardLayout>
    );
}