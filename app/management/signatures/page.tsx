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

async function getSignatures() {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT * FROM public.signatures ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    console.error('Database Error fetching signatures:', error);
    throw new Error('Failed to fetch signatures.');
  } finally {
    if (client) client.release();
  }
}

async function getContracts() {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT id, work_id, template_id FROM public.contracts');
    return rows;
  } catch (error) {
    console.error('Database Error fetching contracts:', error);
    throw new Error('Failed to fetch contracts.');
  } finally {
    if (client) client.release();
  }
}

async function getWorks() {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT id, name FROM public.projects');
    return rows;
  } catch (error) {
    console.error('Database Error fetching works:', error);
    throw new Error('Failed to fetch works.');
  } finally {
    if (client) client.release();
  }
}

async function getTemplates() {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT id, type, version FROM public.templates');
    return rows;
  } catch (error) {
    console.error('Database Error fetching templates:', error);
    throw new Error('Failed to fetch templates.');
  } finally {
    if (client) client.release();
  }
}

export default async function SignaturesPage() {
  const [signatures, contracts, works, templates] = await Promise.all([
    getSignatures(),
    getContracts(),
    getWorks(),
    getTemplates()
  ]);

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