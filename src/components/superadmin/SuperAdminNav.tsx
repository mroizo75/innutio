"use client"

import { Button } from "@/components/ui/button"
import { 
  Building2, 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText,
  Package
} from "lucide-react"
import Link from "next/link"

export function SuperAdminNav() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-100/40 dark:bg-gray-800/40">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Superadmin</h2>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <Link href="/superadmin">
          <Button variant="ghost" className="w-full justify-start">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link href="/superadmin/bedrifter">
          <Button variant="ghost" className="w-full justify-start">
            <Building2 className="mr-2 h-4 w-4" />
            Bedrifter
          </Button>
        </Link>
        <Link href="/superadmin/brukere">
          <Button variant="ghost" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Brukere
          </Button>
        </Link>
        <Link href="/superadmin/stoffkartotek">
          <Button variant="ghost" className="w-full justify-start">
            <Package className="mr-2 h-4 w-4" />
            Stoffkartotek
          </Button>
        </Link>
        <Link href="/superadmin/support">
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            Support
          </Button>
        </Link>
      </nav>
      <div className="border-t p-4">
        <Link href="/superadmin/settings">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Innstillinger
          </Button>
        </Link>
      </div>
    </div>
  )
}