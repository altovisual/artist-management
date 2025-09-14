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

export function TemplatesTable({ templates }: { templates: any[] }) {
  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No templates found.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Language</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template: any) => (
          <TableRow key={template.id}>
            <TableCell>{template.type}</TableCell>
            <TableCell>{template.language}</TableCell>
            <TableCell>{template.version}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/management/templates/${template.id}/edit`}>Edit</Link>
                </Button>
                <DeleteButton id={template.id} resource="templates" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TemplatesTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
