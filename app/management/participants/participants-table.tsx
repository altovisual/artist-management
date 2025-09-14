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

export function ParticipantsTable({ participants }: { participants: any[] }) {
  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No participants found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant: any) => (
          <TableRow key={participant.id}>
            <TableCell>{participant.name}</TableCell>
            <TableCell>{participant.email}</TableCell>
            <TableCell>{participant.type}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/management/participants/${participant.id}/edit`}>Edit</Link>
                </Button>
                <DeleteButton id={participant.id} resource="participants" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ParticipantsTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
