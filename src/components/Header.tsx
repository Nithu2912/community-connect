import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { LogOut, MapPin, User, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  userRole?: UserRole;
  userName?: string;
  onLogout?: () => void;
}

export function Header({ userRole, userName, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/' || location.pathname.includes('login');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-hero">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">CivicHelp</span>
            <span className="text-xs text-muted-foreground -mt-1">Report • Track • Resolve</span>
          </div>
        </div>

        {!isAuthPage && userRole && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
              {userRole === 'citizen' ? (
                <User className="h-4 w-4 text-primary" />
              ) : (
                <Shield className="h-4 w-4 text-primary" />
              )}
              <span className="text-sm font-medium">
                {userName || (userRole === 'citizen' ? 'Citizen' : 'Authority')}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
