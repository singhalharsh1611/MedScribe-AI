"use client";


export default function ChoosePathPage({ onNext }: { onNext: (step: string, data?: any) => void }) {
  return (
    <div className="w-full px-4 md:px-margin-desktop py-space-xl max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-2xl">
        <div className="space-y-space-xs max-w-2xl">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-container-tint text-primary text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Step 3 of 3: Practice Setup</span>
          </div>
          <h1 className="text-[36px] font-bold text-text-ink tracking-tight">Set up your practice</h1>
          <p className="text-[16px] text-on-surface-variant">Create a new clinic or join an existing one to configure your clinical workspace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl items-stretch">
        {/* Create Clinic */}
        <div className="group relative flex flex-col justify-between bg-card-surface rounded-xl p-space-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="space-y-space-lg">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-container-tint text-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-[32px]">domain_add</span>
              </div>
              <span className="px-space-sm py-1 rounded bg-success-bg text-clinical-success text-[11px] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                Direct Admin Access
              </span>
            </div>

            <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Hospital Suite" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdive8CvikKLvAEnMgLgtfUEzX4qjW9BLp2F0jnLuoa75beK3S9uMawlDHm5jlJqhv2qH3wygOXOCXX9-BD8Pk58d4h6ixsTIpV2BGkShgy8IGpZE7B25SSNH3ZtWuvzz040Min8StQUhKn1IS5kzWU63-3U2wNd08gWclufRXZ9de_BIzwo9Fpr7MCpzTHpOI8vswxrkYjVntGgDrgHN8r4MOHbi7lR6fENq26Uvzw-ghRVL5T2ow6g" />
              <div className="absolute inset-0 bg-gradient-to-t from-text-ink/60 via-text-ink/10 to-transparent"></div>
            </div>

            <div className="space-y-space-xs">
              <h2 className="text-[22px] font-bold text-text-ink">Create New Clinic / Hospital</h2>
              <p className="text-[14px] text-on-surface-variant leading-relaxed">Set up a new practice and become its administrator. Configure departments, invite medical personnel, and manage clinical billing.</p>
            </div>

            <div className="space-y-space-2xs pt-space-xs">
              {["Instant organization-level NPI binding", "Multi-room Ambient Voice node deployment", "EHR integration orchestration (Epic, Cerner)"].map((item) => (
                <div key={item} className="flex items-center gap-space-xs text-text-muted text-[12px]">
                  <span className="material-symbols-outlined text-clinical-success text-[18px]">check_circle</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-space-xl mt-space-lg">
            <button type="button" onClick={() => onNext('create-clinic')} className="w-full inline-flex items-center justify-center gap-space-xs bg-primary-container hover:bg-accent-dark text-card-surface font-bold text-[18px] py-3.5 px-6 rounded-lg transition-colors duration-200 shadow-md no-underline">
              <span>Create Clinic</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Join Clinic */}
        <div className="group relative flex flex-col justify-between bg-card-surface rounded-xl p-space-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <div className="space-y-space-lg">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-xl bg-container-tint text-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-[32px]">corporate_fare</span>
              </div>
              <span className="px-space-sm py-1 rounded bg-warning-bg text-clinical-warning text-[11px] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">pending</span>
                Requires Verification
              </span>
            </div>

            <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Medical Team" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpVQWO1Y07J-WPYcAwkiXrX32H_pv7WNnu-J1OnuejNyU0J1oH6rRUqrgMos-Y6EfCGNUiwLxfbUXG9klmIMMcHG9i5TrmYKjzd7GjIpK2gZWKStUMiCIfc3iMZnRyXIk-quChIhcjbRBHhX_S7Zdg_ceeNCY6htR2z8dGa6KX8CbIhorCtdmnqTChXj2zfpNPrF6hCoyWN6-QYUKT4iUEdr55KyBOwWZJJzh7D8psruwJsiPzFB1Raw" />
              <div className="absolute inset-0 bg-gradient-to-t from-text-ink/60 via-text-ink/10 to-transparent"></div>
            </div>

            <div className="space-y-space-xs">
              <h2 className="text-[22px] font-bold text-text-ink">Join Existing Clinic / Hospital</h2>
              <p className="text-[14px] text-on-surface-variant leading-relaxed">Request access to a clinic you are already associated with. Access is granted once verified by the clinic administrator.</p>
            </div>

            <div className="space-y-space-2xs pt-space-xs">
              {["Seamless association with established billing", "Zero setup overhead for facility voice profiles", "Fast-track 24-hour verification turnaround"].map((item) => (
                <div key={item} className="flex items-center gap-space-xs text-text-muted text-[12px]">
                  <span className="material-symbols-outlined text-secondary text-[18px]">hub</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-space-xl mt-space-lg">
            <button type="button" onClick={() => onNext('find-clinic')} className="w-full inline-flex items-center justify-center gap-space-xs bg-card-surface hover:bg-container-tint text-text-ink font-bold text-[18px] py-3.5 px-6 rounded-lg transition-colors duration-200 shadow-sm no-underline border border-outline-variant/40">
              <span>Join Clinic</span>
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
