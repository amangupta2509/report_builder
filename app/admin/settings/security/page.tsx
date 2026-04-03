export default function AdminSecuritySettingsPage() {
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
        <a href="/admin/settings" className="hover:text-slate-900">
          Settings
        </a>
        <span>/</span>
        <span className="font-medium text-slate-900">Security</span>
      </nav>

      <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Security Settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Breadcrumb route for admin security coverage.
        </p>
      </section>
    </main>
  );
}
