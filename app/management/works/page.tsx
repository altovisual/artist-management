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

async function getWorks() {
  const res = await fetch('http://localhost:3000/api/works', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch works');
  }
  return res.json();
}

export default async function WorksPage() {
  const works = await getWorks();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Works</h1>
        <Button asChild>
          <Link href="/management/works/new">Create Work</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {works.map((work: any) => (
            <TableRow key={work.id}>
              <TableCell>{work.name}</TableCell>
              <TableCell>{work.type}</TableCell>
              <TableCell>{work.status}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/management/works/${work.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton id={work.id} resource="works" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}