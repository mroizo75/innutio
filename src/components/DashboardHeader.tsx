"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@prisma/client"
import Image from "next/image"
import { NotificationDropdown } from "@/components/NotificationDropdown"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

const getRolePath = (role: string) => {
  if (role === "USER") return "ansatt"
  if (role === "ADMIN") return "admin"
  if (role === "LEDER") return "leder"
  if (role === "PROSJEKTLEDER") return "prosjektleder"
  return role.toLowerCase()
}

export default function DashboardHeader({ currentUser }: { currentUser: any }) {

  if (!currentUser) return null

  const menuItems = [
    { label: "Hjem", href: `/${getRolePath(currentUser.role)}`, roles: ["ADMIN", "LEDER", "PROSJEKTLEDER", "USER"] },
    { label: "Prosjekter", href: "/prosjekter", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER"] },
    //{ label: "Ansatte", href: "/ansatte", roles: ["ADMIN", "LEDER"] },
    // { label: 'Timer per Oppgave', href: '/timer-per-oppgave', roles: ['ADMIN', 'LEDER', 'PROSJEKTLEDER'] },
    { label: "HMS", href: "/hms", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER", "USER"] },
    { label: "Stoffkartotek", href: "/stoffkartotek", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER", "USER"] },
    // { label: "Mine Oppgaver", href: "/oppgaver", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER", "USER"] },
    //{ label: "SHA", href: "/sha", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER"] },
    { label: "Skjemabehandling", href: "/skjemaboard", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER"] },
    { label: "Risikobehandling", href: "/risiko", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER"] },
    { label: "SJA-behandling", href: "/sja", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER", "USER"] },
    { label: "Arkiv", href: "/arkiv", roles: ["ADMIN", "LEDER", "PROSJEKTLEDER"] },
  ]

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role))

  const UserNav = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
          size="icon"
          variant="ghost"
        >
<Avatar className="h-8 w-8">
  <AvatarImage 
              src={currentUser?.bildeUrl || ""} 
              alt="Avatar"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder-avatar.jpg";
              }}
            />
            <AvatarFallback>
              {currentUser?.navn?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{currentUser.navn}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profil">Profil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/innstillinger">Innstillinger</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/auth/logout">Logg ut</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href={`/${getRolePath(currentUser.role)}`} className="flex items-center gap-2 mr-6">
          <Image src="/images/nav-logo.png" alt="Logo" width={150} height={150} className="block dark:hidden"/> 
          <Image src="/images/nav_logo_dark.png" alt="Logo" width={150} height={150} className="hidden dark:block"/> 
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center gap-6">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <NotificationDropdown />
          <ModeToggle />
          <UserNav />
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden ml-auto">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Meny</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 py-4">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <Separator />
              <div className="flex items-center gap-4">
                <NotificationDropdown />
                <ModeToggle />
                <UserNav />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}