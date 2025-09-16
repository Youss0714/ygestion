import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReactNode } from "react";
import Breadcrumb from "@/components/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
}

interface HeaderProps {
  title: string | ReactNode;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
}

export default function Header({ title, subtitle, action, breadcrumbs, showBreadcrumbs = true }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="px-6 py-2 border-b border-gray-100 bg-gray-50">
          <Breadcrumb items={breadcrumbs} />
        </div>
      )}
      
      {/* Main Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {action && (
            <div className="flex items-center space-x-4">
              <Button onClick={action.onClick}>
                <Plus className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Dernière synchronisation</p>
                <p className="text-sm font-medium text-gray-900">Il y a 2 minutes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
