import Navbar from './Navbar';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#EBF2F2] text-[#1A2B48]">
      {/* Fixed / absolute public navigation */}
      <Navbar />

      {/* Responsive navbar offset */}
      <main
        className="
          w-full
          pt-[76px]
          sm:pt-[84px]
          md:pt-[92px]
          lg:pt-[100px]
        "
      >
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}