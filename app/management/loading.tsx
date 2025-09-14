import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ManagementLoading() {
  return (
    <div className="space-y-6">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-48" />
              <div className="text-muted-foreground">
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="flex border-b">
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24 mr-4" />
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[...Array(5)].map((_, i) => (
                        <TableHead key={i}><Skeleton className="h-5 w-20" /></TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(8)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-5 w-24" /></div></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                        <TableCell><div className="flex items-center gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
