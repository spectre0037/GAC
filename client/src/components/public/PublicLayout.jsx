import Navbar from './Navbar';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {children}
    </div>
  );
}