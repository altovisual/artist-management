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
import { Pool } from 'pg';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

async function getWorks() {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM public.projects');
    return rows;
  } catch (error) {
    console.error('Database Error fetching works:', error);
    throw new Error('Failed to fetch works.');
  } finally {
    if (client) client.release();
  }
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
