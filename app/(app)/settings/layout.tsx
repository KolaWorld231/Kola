import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background-darkMode">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Settings Content */}
          <div className="lg:col-span-3">
            {children}
          </div>

          {/* Right Column - Navigation Sidebar */}
          <div className="lg:col-span-1">
            <SettingsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}



