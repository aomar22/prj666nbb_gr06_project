import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";


export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
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
      <div className="w-[700px] h-[1000px] bg-white rounded shadow-xl overflow-visible">
        {/* Header */}
        <div className="relative bg-[#8D0103] h-[266px] flex flex-col items-center justify-center">
          {/* Floating logo */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <div className="h-[79.21px] w-[88.85px] rounded-full bg-white flex items-center justify-center">
              <img
                src="/hat.png"
                alt="Scholarly logo"
                className="h-[48px] w-[48px]"
              />
            </div>
          </div>

          <h2 className="font-['Inter'] text-white text-[50px] leading-[40px] font-bold mt-6 font-inter">
            Scholarly
          </h2>
          <p className="text-white text-[20px] font-semibold mt-2 font-inter">
            Connect. Learn. Grow.
          </p>
        </div>

        {/* Body */}
        <div className="font-['Inter'] px-14 py-12 flex flex-col min-h-[589.22px]">
          <h1 className="text-[60px] -top-320 font-extrabold text-[#0066CC] mb-4">
            Sign Up
          </h1>
          <p className="text-[40px] text-base font-semibold mb-10">
            Let’s start off with some basic information about you!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                className="w-full rounded-md border px-4 py-3 shadow-sm w-[467px] h-[47.12px] text-[25px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seneca Email"
              />
            </div>

            <div>
              <input
                className="w-full rounded-md border px-4 py-3 shadow-sm w-[467px] h-[47.12px] text-[25px]"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Seneca Password"
              />
            </div>

            <div>
              <p className="mb-2 pt-6 font-medium text-[25px]">Who will you be?</p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("learner")}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-md border px-4 py-3 text-[25px] ${
                    role === "learner"
                      ? "bg-[#82C6E3] text-black font-bold"
                      : "bg-white"
                  }`}
                >
                  <img src="/person-search.png" alt="Learner" className="w-[28px] h-[28px]" />
                  Learner
                </button>
                <button
                  type="button"
                  onClick={() => setRole("tutor")}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-md border px-4 py-3 text-[25px] ${
                    role === "tutor"
                      ? "bg-[#82C6E3] text-black font-bold"
                      : "bg-white"
                  }`}
                >
                  <img src="/user-tie.png" alt="Tutor" className="w-[28px] h-[28px]" />
                  Tutor
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm font-medium text-[25px]">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#0066CC] text-white py-3 rounded-md text-[25px] font-normal shadow"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[20px] font-roboto">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0066CC] font-semibold text-[20px] font-roboto">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}