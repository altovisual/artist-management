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
  connectionString: process.env.DATABASE_URL,
});

async function getTemplates() {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM public.templates');
    return rows;
  } catch (error) {
    console.error('Database Error fetching templates:', error);
    throw new Error('Failed to fetch templates.');
  } finally {
    if (client) client.release();
  }
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Button asChild>
          <Link href="/management/templates/new">Create Template</Link>
        </Button>
      </div>
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
    </div>
  );
}
