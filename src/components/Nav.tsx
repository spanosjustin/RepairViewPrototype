"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const baseLink = "px-3 py-2 rounded-xl text-sm font-medium transition hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60";
const activeLink = "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:opacity-90";

// creates an item for the navigation bar
function NavItem({ href, label }: { href: string; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`${baseLink} ${isActive ? activeLink : ""}`}>
            {label}
        </Link>
    );
}

function InventroyMenu() {
    const pathname = usePathname();
    const [open, setOpen ] = useState(false);
    const parentActive = pathname?.startsWith("/inventory");

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((s) => !s)}
                className={`${baseLink} flex item-center gap-1 ${parentActive ? activeLink : ""}`}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                Inventory <ChevronDown className="h-4 w-4`" />
            </button>
            {open ? (
                <div
                    role="menu"
                    className="absolute left-0 mt-2 w-44 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                    onMouseLeave={() => setOpen(false)}
                >
                    <Link
                        role="menuitem"
                        href="/inventory/list"
                        className={`${baseLink} block w-full text-left ${pathname === '/inventory/list' ? activeLink : ""}`}
                        onClick={() => setOpen(false)}
                    >
                        List
                    </Link>
                    <Link
                        role="menuitem"
                        href="/inventory/tree"
                        className={`${baseLink} block w-full text-left ${pathname === '/inventory/tree' ? activeLink : ""}`}
                        onClick={() => setOpen(false)}
                    >
                        Tree
                    </Link>
                </div>
            ) : null}
        </div>
    )
}

export default function NavBar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:border-zinc-800 dark:bg-zinc-950/60">
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
                            RV
                        </div>
                        <span className="hidden text-sm font-semibold sm:inline">Repair View</span>
                    </Link>
                </div>
                <div className="hidden items-center gap-1 sm:flex">
                    <NavItem href="/matrix" label="Matrix" />
                    <InventroyMenu />
                    <NavItem href="/repair" label="Repair" />
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                    <Link href="/settings" className={baseLink}>
                        Settings
                    </Link>
                </div>

                {/* Mobile burger */}
                <button
                    className="grid h-10 w-10 place-items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 sm:hidden"
                    onClick={() => setMobileOpen((s) => !s)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileOpen}
                    >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Mobile menu */}
                {mobileOpen ? (
                    <div className="border-t border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950 sm:hidden">
                        <div className="flex flex-col gap-1 py-2">
                            <Link href="/matrix" className="{baseLink}" onClick={() => setMobileOpen(false)}>
                                Matrix
                            </Link>
                            <details className="[&_summary::-webkit-details-marker]:hidden">
                                <summary className={`${baseLink} flex items-center gap-1`}>
                                    Inventory <ChevronDown className="inline h-4 w-4" />
                                </summary>
                                <div className="ml-3 mt-1 flex flex-col gap-1">
                                    <Link href="/inventory/list" className={baseLink} onClick={() => setMobileOpen(false)}>
                                        List
                                    </Link>
                                    <Link href="/inventory/tree" className={baseLink} onClick={() => setMobileOpen(false)}>
                                        Tree
                                    </Link>
                                </div>
                            </details>
                            <Link href="/repair" className={baseLink} onClick={() => setMobileOpen(false)}>
                                Repair
                            </Link>
                            <Link href="/settings" className={baseLink} onClick={() => setMobileOpen(false)}>
                                Settings
                            </Link>
                        </div>
                    </div>
                ) : null}
            </nav>
        </header>
    )
}