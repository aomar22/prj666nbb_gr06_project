//"Availability is a reusable page accessed from onboarding and dashboard navigation"
import { Link, useLocation } from "react-router-dom";
import { getUser } from "../../api";

export default function Availability() {
    const location = useLocation();
    const user = getUser();

    // Determine if user came from onboarding or has completed setup
    const fromOnboarding = location.state?.from?.startsWith("/onboarding");
    const isOnboarded = Boolean(user?.isOnboarded);

    
    const backTo = fromOnboarding
        ? "/onboarding/tutor"
        : "/dashboard";
    
    const backLabel = fromOnboarding
        ? "Back to Tutor Setup"
        : "Back to Dashboard";
    console.log("USER:", user);
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-xl rounded-xl border border-black/10 bg-white p-6 shadow">
                <h1 className="text-2xl font-bold">Availability</h1>
                <p className="mt-2 text-black/70">
                    Placeholder page. We'll build the availability UI next.
                </p>

                <div className="mt-6 flex gap-3">
                    <Link
                        to={backTo}
                        className="rounded-lg border border-black/15 px-4 py-2"
                    >
                        {backLabel}
                    </Link>
                    {/* {isOnboarded && (
                    <Link to="/dashboard">Back</Link>
                    )}
                    {!isOnboarded && (
                    <Link to="/onboarding/tutor">Back</Link>
                    )} */}

                    
                </div>
            </div>
        </div>
    );
}
