import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DeleteButton } from "../DeleteButton";
import { Skeleton } from "@/components/ui/skeleton";

export function ContractsTable({ contracts }: { contracts: any[] }) {
  if (contracts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No contracts found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Work</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract: any) => (
          <TableRow key={contract.id}>
            <TableCell>{contract.work_name}</TableCell>
            <TableCell>{`${contract.template_type} v${contract.template_version}`}</TableCell>
            <TableCell>{contract.status}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/management/contracts/${contract.id}/edit`}>Edit</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/management/contracts/${contract.id}/generate`}>Generate</Link>
                </Button>
                <DeleteButton id={contract.id} resource="contracts" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ContractsTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
