import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  Package, 
  Tags, 
  FileText, 
  TrendingUp, 
  Settings, 
  Download,
  LogOut,
  X,
  Shield,
  Calculator,
  Bell,
  BookOpen
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import type { SelectBusinessAlert } from "@shared/schema";



export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { t } = useTranslation(settings?.language);

  // Get unread alerts count
  const { data: alerts = [] } = useQuery<SelectBusinessAlert[]>({
    queryKey: ['/api/alerts', true], // unreadOnly = true
    queryFn: async () => {
      const response = await fetch('/api/alerts?unreadOnly=true');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!user, // Only fetch if user is authenticated
  });

  const unreadAlertsCount = alerts.length;

  const navigation = [
    { name: t('dashboard'), href: "/", icon: BarChart3 },
    { name: t('clients'), href: "/clients", icon: Users },
    { name: t('products'), href: "/products", icon: Package },
    { name: t('categories'), href: "/categories", icon: Tags },
    { name: t('invoices'), href: "/invoices", icon: FileText },
    { name: t('sales'), href: "/sales", icon: TrendingUp },
    { name: t('accounting'), href: "/accounting", icon: Calculator },
    { name: t('alerts'), href: "/alerts", icon: Bell },
  ];

  const secondaryNavigation = [
    { name: t('settings'), href: "/settings", icon: Settings },
    { name: t('export'), href: "/export", icon: Download },
    { name: "Guide utilisateur", href: "/user-guide", icon: BookOpen },
  ];

  // Add admin navigation for Fatimata
  const adminNavigation = [
    { name: "Admin Licences", href: "/admin", icon: Shield },
  ];

  return (
    <div className="w-64 sidebar-glass flex flex-col">
      {/* Logo and Title */}
      <div className="p-6 border-b border-white/20 dark:border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">YGestion</h1>
            <p className="text-sm text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          const isAlertsItem = item.href === "/alerts";
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start relative transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-sm",
                  isActive
                    ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
                {isAlertsItem && unreadAlertsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto text-xs h-5 px-1.5 min-w-[20px] flex items-center justify-center"
                  >
                    {unreadAlertsCount > 99 ? '99+' : unreadAlertsCount}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
        
        <div className="border-t border-white/20 dark:border-white/10 pt-4 mt-4 space-y-2">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-sm",
                    isActive
                      ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}

          {/* Admin navigation for Youssouphafils */}
          {(user?.firstName?.toLowerCase() === "youssouphafils" || user?.email?.toLowerCase().includes("youssouphafils")) && (
            <div className="border-t border-white/20 dark:border-white/10 pt-2 mt-2">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:shadow-sm",
                        isActive
                          ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                          : "text-purple-700 hover:bg-purple-100 hover:text-purple-800"
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/20 dark:border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "Utilisateur"
              }
            </p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 ease-in-out transform hover:scale-105"
              onClick={() => {
                if (confirm(settings?.language === 'en' 
                  ? 'Are you sure you want to close the application?' 
                  : 'Êtes-vous sûr de vouloir fermer l\'application ?'
                )) {
                  window.close();
                }
              }}
              title={settings?.language === 'en' ? 'Close Application' : 'Fermer l\'application'}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 ease-in-out transform hover:scale-105"
              onClick={async () => {
                try {
                  await fetch('/api/logout', { method: 'POST' });
                  window.location.href = '/';
                } catch (error) {
                  console.error('Erreur lors de la déconnexion:', error);
                }
              }}
              title={settings?.language === 'en' ? 'Logout' : 'Se déconnecter'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
