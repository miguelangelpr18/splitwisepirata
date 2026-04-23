"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/",         label: "Dashboard", icon: HomeIcon },
  { href: "/activity", label: "Activity",  icon: ListIcon },
  { href: "/add",      label: "Add",       icon: PlusIcon, primary: true },
  { href: "/settle",   label: "Settle up", icon: HandshakeIcon },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t border-gray-100 bg-white">
      <ul className="flex items-center justify-around">
        {items.map((it) => {
          const active = path === it.href;
          const Icon = it.icon;
          if (it.primary) {
            return (
              <li key={it.href} className="-mt-6">
                <Link
                  href={it.href}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white transition hover:bg-brand-dark"
                  aria-label="Add expense"
                >
                  <Icon active />
                </Link>
              </li>
            );
          }
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] ${
                  active ? "text-brand-dark" : "text-muted hover:text-ink"
                }`}
              >
                <Icon active={active} />
                <span className="font-medium">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function ListIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function HandshakeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12l4-4 4 4-4 4-4-4z" />
      <path d="M22 12l-4-4-4 4 4 4 4-4z" />
      <path d="M10 10l2 2 2-2" />
    </svg>
  );
}
