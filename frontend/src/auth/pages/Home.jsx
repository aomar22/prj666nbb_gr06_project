import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-[url('/home-bg.jpg')] bg-cover bg-center flex items-center justify-center p-6">
      {/* Card */}
      <div className="w-[900.84px] h-[1000px] bg-white rounded shadow-xl overflow-visible">
        {/* Header */}
        <div className="relative bg-[#0B2F86] h-[215.25px] flex flex-col items-center justify-center pt-[52px]">
          {/* Floating logo */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2">
            <div className="h-[79.21px] w-[88.85px] rounded-full bg-white flex items-center justify-center">
              <span className="text-5xl">🎓</span>
            </div>
          </div>

          <h1 className="font-['Inter'] text-white text-[50px] leading-[40px] font-bold mt-6 font-inter">Scholarly</h1>
          <p className="text-white text-[20px] font-semibold mt-2 font-inter">
            Connect. Learn. Grow.
          </p>
        </div>

        {/* Body */}
        <div className="font-['Ligconsolata'] px-14 py-12 flex flex-col min-h-[589.22]px">
            {/* Top content */}
            <div>
          <h2 className="text-[60px] -top-320 font-extrabold text-[#0066CC] mb-4">Welcome!</h2>
          <p className="text-[40px] text-base font-semibold mb-10">
            Connecting Seneca students
            <br />
            with peer tutors for personalized support.
          </p>
          </div>

            {/* Buttons */}

          <div className="space-y-10 font-['Ligconsolata'] pt-15">
            <Link
              to="/login"
              className="block mx-auto rounded-[10px] text-center bg-[#0066CC] text-white text-[40px] w-[530px] py-4 rounded-md font-normal shadow"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="block mx-auto rounded-[10px] text-center bg-[#0066CC] text-white py-4 rounded-md text-[40px] w-[530px] font-normal shadow"
            >
              SignUp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
