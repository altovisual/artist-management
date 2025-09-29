'use client'

import { 
  iPhoneLayout as IPhoneLayout, 
  iPhoneCard as IPhoneCard, 
  iPhoneGrid as IPhoneGrid, 
  iPhoneSection as IPhoneSection, 
  iPhoneHeader as IPhoneHeader 
} from "@/components/ui/iphone-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Music, TrendingUp, Plus, Settings, Eye } from "lucide-react"

export default function iPhoneDemoPage() {
  return (
    <IPhoneLayout>
      {/* Header Section */}
      <IPhoneHeader
        title="Participant Management"
        subtitle="Managing participants across the platform with active verification."
        avatar={
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              P
            </AvatarFallback>
          </Avatar>
        }
        badge={
          <Badge variant="secondary" className="text-xs">
            2 Total
          </Badge>
        }
        actions={[
          <Button key="settings" variant="outline" size="sm" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>,
          <Button key="create" size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        ]}
      />

      {/* Stats Grid */}
      <IPhoneSection title="Overview">
        <IPhoneGrid columns={2}>
          <IPhoneCard className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">1</div>
            <div className="text-sm text-muted-foreground">Verified</div>
            <Badge variant="secondary" className="text-xs mt-1">
              ✅ Active
            </Badge>
          </IPhoneCard>

          <IPhoneCard className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Pending</div>
            <Badge variant="outline" className="text-xs mt-1">
              ⏳ Waiting
            </Badge>
          </IPhoneCard>

          <IPhoneCard className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
            <Badge variant="destructive" className="text-xs mt-1">
              ❌ Declined
            </Badge>
          </IPhoneCard>

          <IPhoneCard className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">2</div>
            <div className="text-sm text-muted-foreground">Total</div>
            <Badge variant="secondary" className="text-xs mt-1">
              📊 All
            </Badge>
          </IPhoneCard>
        </IPhoneGrid>
      </IPhoneSection>

      {/* Participants List */}
      <IPhoneSection 
        title="All Participants" 
        subtitle="2 participants found"
        action={
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      >
        <div className="space-y-3">
          <IPhoneCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-foreground">John Doe</div>
                  <div className="text-sm text-muted-foreground">john@example.com</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  ✅ verified
                </Badge>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          </IPhoneCard>

          <IPhoneCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    JS
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-foreground">Jane Smith</div>
                  <div className="text-sm text-muted-foreground">jane@example.com</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  ⏳ not_verified
                </Badge>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          </IPhoneCard>
        </div>
      </IPhoneSection>

      {/* Quick Actions */}
      <IPhoneSection title="Quick Actions">
        <IPhoneGrid columns={2}>
          <Button variant="outline" className="h-12 justify-start">
            <Plus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
          <Button variant="outline" className="h-12 justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </IPhoneGrid>
      </IPhoneSection>
    </IPhoneLayout>
  )
}
