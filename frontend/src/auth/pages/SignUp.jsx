import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // "learner" | "tutor"
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isSenecaEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@myseneca\.ca$/i.test(value.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isSenecaEmail(email)) {
      setError("Use a valid Seneca email (@myseneca.ca).");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!role) {
      setError("Please select Learner or Tutor.");
      return;
    }

    const initialUser = { email: email.trim().toLowerCase(), role };
    localStorage.setItem("scholarly_initial_user", JSON.stringify(initialUser));

    navigate("/verify-email", { state: initialUser });
  };

  return (
    <div className="min-h-screen bg-[url('/seneca-4.png')] bg-cover bg-center flex items-center justify-start p-6">
      {/* Card */}
      <div className="w-[530px] bg-white rounded shadow-xl overflow-visible">
        {/* Header */}
        <div className="relative bg-[#8D0103] h-[266px] flex flex-col items-center justify-center">
          {/* Floating logo */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2">
            <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
          </div>

          <h2 className="mt-10 text-white text-5xl font-extrabold">
            Scholarly
          </h2>
          <p className="text-white text-lg font-semibold mt-2">
            Connect. Learn. Grow.
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          <h1 className="text-xl font-semibold mb-2 text-blue-700">
            Sign Up
          </h1>
          <p className="text-sm text-blue-600 mb-6 font-Ligconsolata">
            Let’s start off with some basic information about you!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                className="w-full rounded-md border px-4 py-3 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seneca Email"
              />
            </div>

            <div>
              <input
                className="w-full rounded-md border px-4 py-3 shadow-sm"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Seneca Password"
              />
            </div>

            <div>
              <p className="mb-2 font-medium">Who will you be?</p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("learner")}
                  className={`flex-1 rounded-md border px-4 py-3 ${
                    role === "learner"
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                >
                  Learner
                </button>
                <button
                  type="button"
                  onClick={() => setRole("tutor")}
                  className={`flex-1 rounded-md border px-4 py-3 ${
                    role === "tutor"
                      ? "bg-blue-400 text-white"
                      : "bg-white"
                  }`}
                >
                  Tutor
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md text-lg font-semibold shadow"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
