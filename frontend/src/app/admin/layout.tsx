import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="pt-16 md:pt-0 px-4 md:px-6">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthProvider>
  );
}
