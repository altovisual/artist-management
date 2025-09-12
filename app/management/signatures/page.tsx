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

async function getSignatures() {
  const res = await fetch('http://localhost:3000/api/signatures', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch signatures');
  }
  return res.json();
}

async function getContracts() {
  const res = await fetch('http://localhost:3000/api/contracts', { cache: 'no-store' });
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

export default async function SignaturesPage() {
  const signatures = await getSignatures();
  const contracts = await getContracts();
  const works = await getWorks();
  const templates = await getTemplates();

  const getContractDetails = (contractId: number) => {
    const contract = contracts.find((c: any) => c.id === contractId);
    if (!contract) return "Unknown Contract";

    const work = works.find((w: any) => w.id === contract.work_id);
    const template = templates.find((t: any) => t.id === contract.template_id);

    const workName = work ? work.name : "Unknown Work";
    const templateName = template ? `${template.type} v${template.version}` : "Unknown Template";

    return `${workName} - ${templateName}`;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Signatures</h1>
        <Button asChild>
          <Link href="/management/signatures/new">Create Signature</Link>
        </Button>
      </div>
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
              <TableCell>{getContractDetails(signature.contract_id)}</TableCell>
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
    </div>
  );
}
