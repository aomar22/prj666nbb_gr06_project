import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function maskEmail(email) {
  const value = String(email || "").trim();
  const at = value.indexOf("@");
  if (at < 0) return value;

  const name = value.slice(0, at);
  const domain = value.slice(at + 1);

  
  const prefix = name.slice(0, 2);
  const stars = "*".repeat(Math.max(4, name.length - 2));
  return `${prefix}${stars}@${domain}`;
}

export default function EmailVerification() {
  const { state } = useLocation();

  // If user refreshes, location state disappears -> fallback to localStorage
  const initialUser = useMemo(() => {
    if (state?.email) return state;
    try {
      const raw = localStorage.getItem("scholarly_initial_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [state]);

  const roleLabel =
    initialUser?.role?.toLowerCase() === "tutor" ? "Tutor" : "Learner";

  const maskedEmail = useMemo(
    () => maskEmail(initialUser?.email),
    [initialUser?.email]
  );

  // 4-digit code UI
  const [digits, setDigits] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current?.[0]?.focus?.();
  }, []);

  const codeOk = digits.every((d) => d.length === 1);

  const setDigit = (idx, value) => {
    const digit = String(value).replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const copy = [...prev];
      copy[idx] = digit;
      return copy;
    });

    if (digit && idx < 3) inputsRef.current[idx + 1]?.focus?.();
  };

  const onKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        setDigit(idx, "");
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus?.();
        setDigit(idx - 1, "");
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus?.();
    if (e.key === "ArrowRight" && idx < 3) inputsRef.current[idx + 1]?.focus?.();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!text) return;

    e.preventDefault();
    const next = text.split("");
    setDigits([next[0] || "", next[1] || "", next[2] || "", next[3] || ""]);
    inputsRef.current[Math.min(text.length, 4) - 1]?.focus?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!codeOk) return;

    // UI-only: no API. 
  };

  return (
    <div className="min-h-screen bg-[url('/seneca-4.png')] bg-cover bg-center flex items-start justify-start p-6">
      {/* Card */}
      <div className="w-[700px] bg-white rounded shadow-xl overflow-visible">
        {/* Header */}
        <div className="relative bg-[#8D0103] h-[266px] flex flex-col items-center justify-center">
          {/* Floating logo */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <div className="h-[79.21px] w-[88.85px] rounded-full bg-white flex items-center justify-center">
              <img src="/hat.png" alt="Scholarly logo" className="h-[48px] w-[48px]" />
            </div>
          </div>

          <h2 className="text-white text-[50px] leading-[40px] font-bold mt-6 font-['Inter']">
            Scholarly
          </h2>
          <p className="text-white text-[20px] font-semibold mt-2 font-['Inter']">
            Connect. Learn. Grow.
          </p>
        </div>

        {/* Body */}
        <div className="px-14 py-12">
          {/* Figma-style title */}
          <h1 className="font-mono text-[#6B6B6B] text-[44px] leading-none tracking-wide mb-8">
            Verification - {roleLabel}
          </h1>

          {/* Blue instruction (two lines) */}
          <p className="font-mono text-[#0066CC] text-[20px] font-semibold leading-snug">
            Please enter the verification code
          </p>
          <p className="font-mono text-[#0066CC] text-[20px] font-semibold leading-snug mb-10">
            sent to {maskedEmail || "your email"}
          </p>

          <p className="font-mono text-[#6B6B6B] text-[22px] font-semibold mb-6">
            Enter the 4 digit code
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* 4 digit inputs */}
            <div className="flex gap-6" onPaste={onPaste}>
              {digits.map((d, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  value={d}
                  onChange={(e) => setDigit(idx, e.target.value)}
                  onKeyDown={(e) => onKeyDown(idx, e)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="—"
                  className="w-[88px] h-[62px] rounded-[10px] border border-[#E5E5E5] text-center font-mono text-[28px] font-semibold shadow-md outline-none"
                  aria-label={`Verification digit ${idx + 1}`}
                />
              ))}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={!codeOk}
              className={`w-full h-[64px] rounded-[10px] font-mono text-[26px] shadow-lg ${
                codeOk
                  ? "bg-[#0066CC] text-white"
                  : "bg-[#0066CC] text-white opacity-50 cursor-not-allowed"
              }`}
            >
              Verify Email
            </button>

            <p className="text-center font-mono text-[16px] text-[#6B6B6B]">
              Back to{" "}
              <Link to="/login" className="text-[#0066CC] font-semibold">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
