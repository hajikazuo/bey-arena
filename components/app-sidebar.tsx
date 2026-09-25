"use client"

import {
  LayoutDashboard,
  Tags,
  ArrowLeftRight,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
   {
    title: "Transações",
    url: "/transacoes",
    icon: ArrowLeftRight,
  },
  {
    title: "Receitas",
    url: "/transacoes?tipo=receita",
    icon: ArrowUpCircle,
  },
  {
    title: "Despesas",
    url: "/transacoes?tipo=despesa",
    icon: ArrowDownCircle,
  },
  {
    title: "Categorias",
    url: "/categorias",
    icon: Tags,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/dashboard" />}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white">
                X
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Bey Arena
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Gerencie seus torneios 
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<a href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
