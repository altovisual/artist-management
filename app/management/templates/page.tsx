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

async function getTemplates() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/templates`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch templates');
  }
  return res.json();
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