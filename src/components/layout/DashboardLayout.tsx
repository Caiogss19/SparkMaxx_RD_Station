import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Mail,
  Workflow,
  PanelTop,
  LogOut,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Visão Geral', path: '/overview', icon: LayoutDashboard },
  { name: 'Workflows', path: '/workflows', icon: Workflow },
  { name: 'E-mails', path: '/emails', icon: Mail },
  { name: 'LP & Forms', path: '/assets', icon: PanelTop },
  { name: 'Sincronizações', path: '/sync', icon: Activity },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col transition-all duration-300 relative z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Zap className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-lg font-bold tracking-tight">Spark Maxx</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
