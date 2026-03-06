import DashboardLayout from "../../components/layout/DashboardLayout";
import PageCard from "../../components/ui/PageCard";

export default function LearnerSessionManagement() {
  return (
    <DashboardLayout>
        <PageCard className="mt-6 p-8">
            <h1 className="text-[32px] font-extrabold">Session Management</h1>
            <p className="mt-2 text-[18px] opacity-90 text-black/70">
                View and manage your upcoming and past tutoring sessions.
            </p>
        </PageCard>
    </DashboardLayout>
    );
}