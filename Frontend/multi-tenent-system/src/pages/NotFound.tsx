import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <main className="relative z-10 flex h-screen w-full items-center justify-center overflow-hidden px-6">
        <div className="w-full max-w-2xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <SearchX className="h-7 w-7 text-blue-400" />
          </div>

          {/* 404 */}
          <div className="relative">
            <h1 className="select-none text-[6rem] font-black leading-none tracking-tighter sm:text-[8rem]">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                404
              </span>
            </h1>

            {/* Decorative text */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.9em] text-white/10 sm:text-xl">
              Page Not Found
            </div>
          </div>

          {/* Heading */}
          <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
            We couldn't locate that destination.
          </h2>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-lg text-sm leading-5 text-slate-400">
            The page you're trying to access may have been moved, removed, or
            the URL may be incorrect. Please verify the address or navigate back
            to a known location.
          </p>

          {/* Buttons */}
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-600/30 sm:w-auto"
            >
              <Home className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              Return Home
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur transition-all duration-200 hover:bg-white/10 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>

          {/* Status */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Error Code: 404 · Resource Unavailable
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
