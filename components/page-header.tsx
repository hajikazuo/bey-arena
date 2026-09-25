import { SidebarTrigger } from "@/components/ui/sidebar";

export function PageHeader() {
  return (
    <header className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
      <SidebarTrigger />
    </header>
  );
}