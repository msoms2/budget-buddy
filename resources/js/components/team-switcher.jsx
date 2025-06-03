import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import ApplicationLogo from '@/components/ApplicationLogo'
import { Link } from "@inertiajs/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState({
    name: "Budget Buddy",
    plan: "Finance Manager"
  })

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href={route('dashboard')}>
            <div
              className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#008080] text-white">
              <ApplicationLogo className="h-6 w-6 fill-current" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-[#008080]">
                {activeTeam.name}
              </span>
              <span className="truncate text-xs">{activeTeam.plan}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
