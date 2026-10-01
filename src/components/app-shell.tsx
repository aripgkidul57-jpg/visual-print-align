import { Link, useNavigate } from "@tanstack/react-router";
import { FilePlus2, FileText, LayoutDashboard, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type AppShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

const navItems = [
  { to: "/dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/surat" as const, label: "Surat Perintah", icon: FileText },
];

export function AppShell({ children, title, description, action }: AppShellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const keluar = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {open ? <button aria-label="Tutup menu" className="fixed inset-0 z-30 bg-foreground/35 lg:hidden" onClick={() => setOpen(false)} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><ShieldCheck aria-hidden="true" /></span>
            <span><strong className="block text-sm">POLRES SITUBONDO</strong><span className="text-xs text-sidebar-foreground/65">Administrasi Surat</span></span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup menu"><X /></Button>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
              <item.icon className="h-4 w-4" aria-hidden="true" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Button asChild className="mb-2 w-full justify-start" size="sm"><Link to="/surat/baru"><FilePlus2 />Buat surat baru</Link></Button>
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={keluar}><LogOut />Keluar</Button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex min-h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu"><Menu /></Button>
            <div className="min-w-0 flex-1"><h1 className="truncate text-xl font-bold">{title}</h1>{description ? <p className="mt-0.5 truncate text-sm text-muted-foreground">{description}</p> : null}</div>
            {action}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}