'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Settings, BarChart2, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useMobileNavigation } from '@/hooks/useMobileNavigation';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Rewards', href: '/admin/rewards', icon: Package },
  { name: 'Statistics', href: '/admin/statistics', icon: BarChart2 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAdminAuth();
  const {
    isMobileMenuOpen,
    sidebarRef,
    menuButtonRef,
    toggleMobileMenu,
    closeMobileMenu,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useMobileNavigation();

  if (!isAdmin) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50 safe-area">
        <Button
          ref={menuButtonRef}
          variant="outline"
          size="sm"
          onClick={toggleMobileMenu}
          className="btn-touch bg-white shadow-lg border-gray-200 hover:bg-gray-50"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={closeMobileMenu}
          onTouchStart={closeMobileMenu}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 w-64 border-r bg-white shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col safe-area",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Admin navigation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex h-16 items-center border-b px-4 sm:px-6 bg-gray-50">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            onClick={closeMobileMenu}
          >
            <Package className="h-6 w-6" />
            <span className="text-base">Admin Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 btn-touch',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t p-4 bg-gray-50">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 btn-touch text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
            onClick={closeMobileMenu}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </Button>
        </div>
        
        {/* Mobile safe area */}
        <div className="md:hidden pb-safe"></div>
      </div>
    </>
  );
}
