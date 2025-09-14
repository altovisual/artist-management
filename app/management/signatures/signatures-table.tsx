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

export function SignaturesTable({ signatures }: { signatures: any[] }) {
  if (signatures.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No signatures found.</p>
      </div>
    );
  }

  const getContractDetails = (contract: any) => {
    if (!contract) return "Unknown Contract";

    const workName = contract.projects ? contract.projects.name : "Unknown Work";
    const templateName = contract.templates ? `${contract.templates.type} v${contract.templates.version}` : "Unknown Template";

    return `${workName} - ${templateName}`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contract</TableHead>
          <TableHead>Signer Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {signatures.map((signature: any) => (
          <TableRow key={signature.id}>
            <TableCell>{getContractDetails(signature.contracts)}</TableCell>
            <TableCell>{signature.signer_email}</TableCell>
            <TableCell>{signature.status}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/management/signatures/${signature.id}/edit`}>Edit</Link>
                </Button>
                <DeleteButton id={signature.id} resource="signatures" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SignaturesTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
