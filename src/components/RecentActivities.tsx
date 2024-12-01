"use client"

import { User, Activity } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface RecentActivitiesProps {
  activities: Activity[]
}

export const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  if (!activities.length) {
    return <p className="text-gray-500">Ingen nylige aktiviteter.</p>
  }

  return (
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={activity.user.bildeUrl || "/images/default-avatar.png"} alt={activity.user.navn} />
            <AvatarFallback>{activity.user.navn.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{activity.user.navn} {activity.action}</p>
            <p className="text-sm text-gray-500">{new Date(activity.createdAt).toLocaleString()}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}