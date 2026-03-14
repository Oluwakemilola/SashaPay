import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Wallet, 
  ShieldCheck, 
  Settings 
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Payroll", href: "/payroll", icon: Wallet },
  { name: "Financial Passport", href: "/passport", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-primary">CiviHR</h1>
        <p className="text-xs text-muted-foreground mt-1">Payroll & Financial Identity</p>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground text-muted-foreground"
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-6 border-t">
        <div className="bg-secondary p-4 rounded-xl text-sm">
          <p className="font-semibold">Need Help?</p>
          <p className="text-muted-foreground text-xs mt-1 mb-3">Check our documentation or contact support.</p>
          <button className="w-full bg-background border shadow-sm text-foreground py-1.5 rounded-md hover:bg-muted transition-colors">
            Support
          </button>
        </div>
      </div>
    </aside>
  );
}
