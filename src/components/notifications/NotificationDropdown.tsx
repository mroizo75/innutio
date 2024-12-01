"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { useNotification } from "@/components/NotificationProvider"

interface Notification {
  id: string
  message: string
  url: string
  read: boolean
  createdAt: Date
}

export function NotificationDropdown() {
  const { notifications: socketNotifications } = useNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (socketNotifications?.length) {
      setNotifications(prev => [...socketNotifications, ...prev]);
      setUnreadCount(prev => prev + socketNotifications.length);
    }
  }, [socketNotifications]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error('Feil ved henting av varsler:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'POST',
        })
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ))
      } catch (error) {
        console.error('Feil ved markering av varsel som lest:', error)
      }
    }
    router.push(notification.url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b last:border-0 cursor-pointer ${
                  !notification.read ? 'bg-slate-50 dark:bg-slate-900' : ''
                }`}
              >
                <div>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString('nb-NO')}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Ingen varsler
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}