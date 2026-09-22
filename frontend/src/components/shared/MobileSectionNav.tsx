"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileSectionNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <details className="fixed left-3 top-[4.5rem] z-40 lg:hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-surface-container bg-card-surface px-3 py-2 text-sm font-bold text-text-ink shadow-md">
        <span className="material-symbols-outlined text-[20px]">menu</span>
        Menu
      </summary>
      <nav className="mt-2 flex w-[min(19rem,calc(100vw-1.5rem))] flex-col gap-1 rounded-xl border border-surface-container bg-card-surface p-2 shadow-xl">
        {items.map((item) => {
          const sectionRoot = item.href.split("/").filter(Boolean).length === 1;
          const active = sectionRoot ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${active ? "bg-primary-container text-white" : "text-on-surface-variant hover:bg-surface-container"}`}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </details>
  );
}
