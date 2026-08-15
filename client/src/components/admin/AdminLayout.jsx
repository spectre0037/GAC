import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#EBF2F2]">
      <AdminSidebar />

      <main
        className="
          min-h-screen w-full min-w-0
          pt-[72px]
          transition-[padding] duration-300 ease-in-out
          md:pt-0
          md:pl-[225px]
          lg:pl-[245px]
          xl:pl-[270px]
        "
      >
        <div className="min-h-screen w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}