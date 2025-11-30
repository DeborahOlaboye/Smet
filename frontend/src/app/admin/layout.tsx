import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}
