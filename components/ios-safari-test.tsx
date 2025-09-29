'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, PlusCircle } from "lucide-react"

export function IOSSafariTest() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">iOS Safari Test Components</h2>
      
      {/* Hero Section Test */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 backdrop-blur-sm">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 transform" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 transform" />
        </div>
        
        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">iOS Safari Test</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground mb-4">
            Testing glassmorphism and gradients on iOS Safari
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Test Button
          </Button>
        </div>
      </div>

      {/* Stats Cards Test */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="relative overflow-hidden bg-card border shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-300 transform">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Artists</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">3</div>
            <p className="text-sm text-muted-foreground">Active profiles</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-card border shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-300 transform">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <PlusCircle className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Projects</h3>
            </div>
            <div className="text-3xl font-bold text-foreground">3</div>
            <p className="text-sm text-muted-foreground">In development</p>
          </div>
        </Card>
      </div>

      {/* Button Tests */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Button Tests</h3>
        <div className="space-y-3">
          <Button className="bg-primary hover:bg-primary/90 w-full">
            Primary Button Test
          </Button>
          <Button variant="outline" className="w-full">
            Outline Button Test
          </Button>
          <Button variant="secondary" className="w-full">
            Secondary Button Test
          </Button>
        </div>
      </Card>

      {/* Modal Test */}
      <Card className="p-4 bg-card border">
        <h3 className="font-semibold mb-2">Modal/Card Background Test</h3>
        <p className="text-muted-foreground">
          This card should have proper background opacity and not be transparent.
        </p>
      </Card>

      {/* Device Info */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Device Detection</h3>
        <div className="space-y-1 text-sm">
          <p>User Agent: <span className="font-mono text-xs">{typeof window !== 'undefined' ? navigator.userAgent : 'Loading...'}</span></p>
          <p>iOS Device: <span className="font-semibold">{typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'Yes' : 'No'}</span></p>
          <p>Safari: <span className="font-semibold">{typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? 'Yes' : 'No'}</span></p>
          <p>Body Classes: <span className="font-mono text-xs">{typeof window !== 'undefined' ? document.body.className : 'Loading...'}</span></p>
        </div>
      </Card>
    </div>
  )
}
