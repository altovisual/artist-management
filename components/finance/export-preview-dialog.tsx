'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Download, Eye, TrendingUp, TrendingDown, BarChart3, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ExportPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmExport: () => void
  transactionCount: number
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export function ExportPreviewDialog({
  open,
  onOpenChange,
  onConfirmExport,
  transactionCount,
  totalIncome,
  totalExpenses,
  netBalance
}: ExportPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Export Professional Financial Report
          </DialogTitle>
          <DialogDescription>
            Your report will include multiple analysis sheets with professional formatting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Net Balance */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {transactionCount} transactions
              </p>
            </CardContent>
          </Card>

          {/* Report Contents */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Report Contents:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Executive Summary</span>
                <span className="text-muted-foreground ml-auto">Overview & Statistics</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="font-medium">Transaction Details</span>
                <span className="text-muted-foreground ml-auto">{transactionCount} rows</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <FileSpreadsheet className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Category Analysis</span>
                <span className="text-muted-foreground ml-auto">By Category</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <FileSpreadsheet className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Artist Analysis</span>
                <span className="text-muted-foreground ml-auto">Performance by Artist</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Professional Features:
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Multiple analysis sheets</li>
              <li>✅ Professional formatting & styling</li>
              <li>✅ Running balance calculations</li>
              <li>✅ Category & artist breakdowns</li>
              <li>✅ Ready for Excel, Google Sheets, Numbers</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              onConfirmExport()
              onOpenChange(false)
            }} className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
