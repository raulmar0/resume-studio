import { NavBar } from "@/components/dashboard/nav-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
