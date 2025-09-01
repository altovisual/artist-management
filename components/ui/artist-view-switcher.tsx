'use client'

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LayoutGrid, List } from "lucide-react"

interface ArtistViewSwitcherProps {
  view: string;
  setView: (view: string) => void;
}

export function ArtistViewSwitcher({ view, setView }: ArtistViewSwitcherProps) {
  return (
    <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value)} aria-label="View mode">
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}