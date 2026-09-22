import Link from "next/link";

const roles = [
  { id: "admin", name: "Clinic Administrator", description: "Manage clinic staff, settings, schedules, and operational access.", icon: "admin_panel_settings" },
  { id: "doctor", name: "Doctor", description: "Review patients, conduct encounters, and authorize prescriptions.", icon: "stethoscope" },
  { id: "receptionist", name: "Receptionist", description: "Register patients, book appointments, and manage the waiting queue.", icon: "support_agent" },
  { id: "pharmacist", name: "Pharmacist", description: "Review and dispense finalized prescriptions for the clinic.", icon: "local_pharmacy" },
];

export default function RolesAndPermissionsPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-primary">Access control</p>
          <h1 className="mt-1 text-3xl font-bold text-text-ink">Roles &amp; Permissions</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-text-muted">Review the responsibilities assigned to each clinic role or create a role for a specialized workflow.</p>
        </div>
        <Link href="/admin/create-custom-role" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-container">
          <span className="material-symbols-outlined text-[19px]">add</span>
          Create custom role
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <Link key={role.id} href={`/admin/roles/${role.id}`} className="group flex items-start gap-4 rounded-xl border border-surface-container bg-card-surface p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
            <span className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">{role.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-text-ink">{role.name}</span>
              <span className="mt-1 block text-sm leading-6 text-text-muted">{role.description}</span>
            </span>
            <span className="material-symbols-outlined mt-2 text-text-muted transition group-hover:translate-x-1 group-hover:text-primary">arrow_forward</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
