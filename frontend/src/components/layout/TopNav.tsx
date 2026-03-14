import { Bell, Search, Hexagon } from "lucide-react";

export function TopNav() {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff, payroll runs, or reports..."
            className="w-full bg-secondary border-none rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-border"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">Admin User</p>
            <p className="text-xs text-muted-foreground mt-1">TechStart Nigeria</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
