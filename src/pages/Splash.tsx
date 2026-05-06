import { Link } from "react-router-dom";

const Splash = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <h1 className="text-4xl font-semibold sm:text-5xl">WhisperBox</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Secure your conversations with end-to-end encryption while keeping
            the chat experience simple and modern.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 sm:w-auto"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200/10 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 sm:w-auto"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
