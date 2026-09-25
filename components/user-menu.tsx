"use client"

import { BadgeCheckIcon, LogOutIcon } from "lucide-react"
import { Menu } from "@base-ui/react/menu"
import Link from "next/link"

import { logout } from "@/app/(auth)/logout/actions"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

export function UserMenu({ email }: { email?: string | null }) {
  const initials = email?.charAt(0).toUpperCase() ?? "U"

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="ghost"
            className="h-auto gap-2 rounded-full px-2 py-1.5"
            aria-label="Abrir menu do usuário"
          />
        }
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700">
          {initials}
        </span>
        <span className="hidden max-w-48 truncate text-sm font-medium sm:inline">
          {email ?? "Usuário"}
        </span>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup
            className={cn(
              "z-50 min-w-48 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none",
              "data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95",
            )}
          >
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground">Usuário conectado</p>
              <p className="truncate text-sm font-medium" title={email ?? "Usuário"}>
                {email ?? "Usuário"}
              </p>
            </div>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item
              render={<Link href="/perfil" />}
              className="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              <BadgeCheckIcon className="size-4" />
              Conta
            </Menu.Item>
            <form action={logout}>
              <Menu.Item
                nativeButton
                render={<button type="submit" />}
                className="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
              >
                <LogOutIcon className="size-4" />
                Sair
              </Menu.Item>
            </form>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
