import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#EBF2F2]">
      {/* Fixed sidebar */}
      <AdminSidebar />

      {/* Scrollable page content */}
      <main className="min-h-screen pl-[270px]">
        {children}
      </main>
    </div>
  );
}