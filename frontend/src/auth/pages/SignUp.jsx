import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../api";


export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    role: false,
  });


  const isSenecaEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@myseneca\.ca$/i.test(value.trim());

  const emailOk = isSenecaEmail(email);
  const passwordOk = password.length >= 8;
  const roleOk = Boolean(role);
  const formOk = emailOk && passwordOk && roleOk;


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formOk || loading) return;

    setError("");
    setLoading(true);

    const payload = {
      email: email.trim().toLowerCase(),
      password,
      role: role.toUpperCase() // API expects "LEARNER" or "TUTOR"
    };

    try {
      await register(payload);

      localStorage.setItem("scholarly_initial_user", JSON.stringify({ email: payload.email, role }));
      navigate("/verify-email", { state: { email: payload.email, role } });
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-[50px] -top-320 font-extrabold text-[#0066CC] mb-4">
            Sign Up
          </h1>
          <p className="text-[30px] text-[#0066CC] font-semibold mb-10">
            Let’s start off with some basic information about you!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <input
                className="w-full rounded-md border px-4 py-3 shadow-sm w-[467px] h-[47.12px] text-[25px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="Seneca Email"
              />
              {touched.email && !emailOk && (
                <p className="text-red-600 text-sm font-medium text-[18px]">
                  Please enter a valid Seneca email (ending with @myseneca.ca).
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                className="w-full rounded-md border px-4 py-3 shadow-sm w-[467px] h-[47.12px] text-[25px]"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Seneca Password"
              />
              {touched.password && !passwordOk && (
                <p className="text-red-600 text-sm font-medium text-[18px]">
                  Password must be at least 8 characters.
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <p className="mb-2 pt-6 font-medium text-[25px]">Who will you be?</p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setRole("learner");
                    setTouched((t) => ({ ...t, role: true }));
                  }}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-md border px-4 py-3 text-[25px] ${
                    role === "learner"
                      ? "bg-[#82C6E3] text-black font-bold"
                      : "bg-white"
                  }`}
                >
                  <img src="/person-search.png" alt="" aria-hidden="true" className="w-[35px] h-[35px]" />
                  Learner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("tutor");
                    setTouched((t) => ({ ...t, role: true }));
                  }}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-md border px-4 py-3 text-[25px] ${
                    role === "tutor"
                      ? "bg-[#82C6E3] text-black font-bold"
                      : "bg-white"
                  }`}
                >
                  <img src="/user-tie.png" alt="" aria-hidden="true" className="w-[28px] h-[28px]" />
                  Tutor
                </button>
              </div>

              {touched.role && !roleOk && (
                <p className="text-red-600 text-[18px] mt-2">
                  Please select a role.
                </p>
              )}
            </div>

            {/* Backend error */}
            {error && (
              <p className="text-red-700 text-[18px] font-semibold">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!formOk || loading}
              className={`w-full py-3 rounded-md text-[25px] font-normal shadow ${
                formOk ? "bg-[#0066CC] text-white" : "bg-[#0066CC] text-white opacity-50 cursor-not-allowed"
              }`}
            >
              {loading ? "Creating account..." : "Create Account"}
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