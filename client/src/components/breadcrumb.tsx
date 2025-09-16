import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const [location] = useLocation();

  // Generate breadcrumbs automatically based on current route if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Accueil", href: "/", icon: Home }
    ];

    // Route mapping for better labels
    const routeLabels: Record<string, string> = {
      'clients': 'Clients',
      'products': 'Produits',
      'categories': 'Catégories',
      'invoices': 'Factures',
      'sales': 'Ventes',
      'accounting': 'Comptabilité',
      'settings': 'Paramètres',
      'export': 'Exporter',
      'admin': 'Administration'
    };

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Handle dynamic routes (like /invoices/123)
      if (isNaN(Number(segment))) {
        breadcrumbs.push({
          label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : currentPath
        });
      } else {
        // For ID-based routes, show a generic label
        const parentSegment = pathSegments[index - 1];
        if (parentSegment === 'invoices') {
          breadcrumbs.push({
            label: `Facture #${segment}`,
            href: isLast ? undefined : currentPath
          });
        } else if (parentSegment === 'clients') {
          breadcrumbs.push({
            label: `Client #${segment}`,
            href: isLast ? undefined : currentPath
          });
        } else if (parentSegment === 'products') {
          breadcrumbs.push({
            label: `Produit #${segment}`,
            href: isLast ? undefined : currentPath
          });
        } else {
          breadcrumbs.push({
            label: `#${segment}`,
            href: isLast ? undefined : currentPath
          });
        }
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs for homepage
  if (location === '/' && !items) {
    return null;
  }

  return (
    <nav 
      aria-label="Fil d'Ariane" 
      className={cn("flex items-center space-x-1 text-sm text-gray-500", className)}
      data-testid="breadcrumb-nav"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const Icon = item.icon;

        return (
          <div key={index} className="flex items-center space-x-1">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" data-testid="breadcrumb-separator" />
            )}
            
            {item.href ? (
              <Link href={item.href}>
                <span className="flex items-center space-x-1 hover:text-gray-700 cursor-pointer transition-colors" data-testid={`breadcrumb-link-${index}`}>
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </span>
              </Link>
            ) : (
              <span 
                className={cn(
                  "flex items-center space-x-1",
                  isLast ? "text-gray-900 font-medium" : "text-gray-500"
                )}
                data-testid={`breadcrumb-current-${index}`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;