export default function AdminSettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <nav
        aria-label="Breadcrumb"
        className="breadcrumb mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-600"
      >
        <a href="/" className="hover:text-slate-900">
          Home
        </a>
        <span>/</span>
        <a href="/admin" className="hover:text-slate-900">
          Admin
        </a>
        <span>/</span>
        <span className="font-medium text-slate-900">Settings</span>
      </nav>

      <section
        data-testid="settings"
        className="settings-panel max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-semibold">System Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Minimal settings surface for administrative validation.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-medium">
            Application name
          </span>
          <input
            type="text"
            defaultValue="Report Builder"
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
          />
        </label>

        <button
          type="button"
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Save
        </button>
      </section>
    </main>
  );
}
