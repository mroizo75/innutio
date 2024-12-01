"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"

export function SuperAdminHeader({ currentUser }: { currentUser: any }) {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/superadmin/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          
          <Avatar>
            <AvatarImage src={currentUser.bildeUrl || ''} />
            <AvatarFallback>{currentUser.navn?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => signOut({
              callbackUrl: process.env.NEXT_PUBLIC_APP_URL
            })}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}