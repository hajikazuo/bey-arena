import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/user-menu";

export function PageHeader({ email }: { email?: string | null }) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6">
      <SidebarTrigger />
      <UserMenu email={email} />
    </header>
  );
}
