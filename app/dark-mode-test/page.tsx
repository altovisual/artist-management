'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export default function DarkModeTestPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6 bg-card border">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Dark Mode Test - iOS Safari
          </h1>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={() => setTheme('light')}
                variant={theme === 'light' ? 'default' : 'outline'}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </Button>
              <Button 
                onClick={() => setTheme('dark')}
                variant={theme === 'dark' ? 'default' : 'outline'}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </Button>
              <Button 
                onClick={() => setTheme('system')}
                variant={theme === 'system' ? 'default' : 'outline'}
              >
                System
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-card border">
                <h3 className="font-semibold text-foreground mb-2">Current Theme</h3>
                <p className="text-muted-foreground">Theme: {theme}</p>
                <p className="text-muted-foreground">
                  HTML Classes: {typeof window !== 'undefined' ? document.documentElement.className : 'Loading...'}
                </p>
                <p className="text-muted-foreground">
                  Body Classes: {typeof window !== 'undefined' ? document.body.className : 'Loading...'}
                </p>
              </Card>

              <Card className="p-4 bg-card border">
                <h3 className="font-semibold text-foreground mb-2">Device Info</h3>
                <p className="text-muted-foreground">
                  User Agent: {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'Loading...'}
                </p>
                <p className="text-muted-foreground">
                  iOS Device: {typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'Yes' : 'No'}
                </p>
              </Card>
            </div>

            <Card className="p-4 bg-primary text-primary-foreground">
              <h3 className="font-semibold mb-2">Primary Card</h3>
              <p>This should have proper contrast in both light and dark modes.</p>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-primary hover:bg-primary/90">
                Primary Button
              </Button>
              <Button variant="outline">
                Outline Button
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
