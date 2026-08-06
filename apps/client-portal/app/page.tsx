export default function PortalHome() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">You&apos;re signed in.</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your project dashboard is being built. In the meantime, contact Doubleday Expressions directly for updates.
        </p>
        <form action="/api/logout" method="POST" className="mt-6">
          <button type="submit" className="text-sm font-semibold text-blue-900 hover:text-blue-700">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
