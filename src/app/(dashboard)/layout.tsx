import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sitePassword = process.env.SITE_PASSWORD;
  if (sitePassword) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("site-auth")?.value;
    if (authCookie !== sitePassword) {
      redirect("/login");
    }
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
