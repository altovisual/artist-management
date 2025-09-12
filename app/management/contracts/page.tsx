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
import { createClient } from "@/lib/supabase/server"; // Import createClient

async function getContracts(userId: string | null) {
  const url = userId ? `http://localhost:3000/api/contracts?user_id=${userId}` : 'http://localhost:3000/api/contracts';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch contracts');
  }
  return res.json();
}

async function getWorks() {
  const res = await fetch('http://localhost:3000/api/works', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch works');
  }
  return res.json();
}

async function getTemplates() {
  const res = await fetch('http://localhost:3000/api/templates', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch templates');
  }
  return res.json();
}

export default async function ContractsPage() {
  const supabase = await createClient(); // Added await here
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === 'admin';
  const currentUserId = user?.id || null;

  console.log("isAdmin:", isAdmin);
  console.log("currentUserId:", currentUserId);

  const contracts = await getContracts(isAdmin ? null : currentUserId);
  console.log("Contracts fetched:", contracts);

  const works = await getWorks();
  const templates = await getTemplates();

  const getWorkName = (workId: string) => {
    const work = works.find((w: any) => w.id === workId);
    return work ? work.name : "Unknown Work";
  };

  const getTemplateName = (templateId: number) => {
    const template = templates.find((t: any) => t.id === templateId);
    return template ? `${template.type} v${template.version}` : "Unknown Template";
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contracts</h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/management/contracts/new">Create Contract</Link>
          </Button>
        )}
      </div>
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
              <TableCell>{getWorkName(contract.work_id)}</TableCell>
              <TableCell>{getTemplateName(contract.template_id)}</TableCell>
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
    </div>
  );
}
