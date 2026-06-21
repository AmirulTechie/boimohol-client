export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <main>{children}</main>
    </div>
  );
}