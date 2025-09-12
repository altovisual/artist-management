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
import { createClient } from "@/lib/supabase/server";
import { Pool } from 'pg';

// Create a connection pool to the database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_POOLER,
});

async function getContracts(userId: string | null) {
  let client;
  try {
    client = await pool.connect();
    let query = `
      SELECT c.*,
             json_agg(json_build_object('id', p.id, 'name', p.name, 'role', cp.role)) as participants
      FROM public.contracts c
      LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
      LEFT JOIN public.participants p ON cp.participant_id = p.id
    `;
    const queryParams = [];

    if (userId) {
      query += ` WHERE c.id IN (SELECT contract_id FROM public.contract_participants WHERE participant_id IN (SELECT id FROM public.participants WHERE user_id = $1))`;
      queryParams.push(userId);
    }

    query += ` GROUP BY c.id;`;
    const { rows } = await client.query(query, queryParams);
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

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === 'admin';
  const currentUserId = user?.id || null;

  // Fetch all data in parallel for efficiency
  const [contracts, works, templates] = await Promise.all([
    getContracts(isAdmin ? null : currentUserId),
    getWorks(),
    getTemplates()
  ]);

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