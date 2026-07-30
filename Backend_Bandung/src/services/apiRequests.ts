import { pool } from "../db.js";

export interface ApiRequestDTO {
  id: number;
  name: string;
  institution: string;
  website: string | null;
  email: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

function toApiRequest(row: Record<string, unknown>): ApiRequestDTO {
  return {
    id: Number(row.id),
    name: row.name as string,
    institution: row.institution as string,
    website: row.website as string | null,
    email: row.email as string,
    notes: row.notes as string | null,
    status: row.status as string,
    createdAt: row.created_at as string,
  };
}

export interface CreateApiRequestInput {
  name: string;
  institution: string;
  website?: string | null;
  email: string;
  notes?: string | null;
}

export async function createRequest(input: CreateApiRequestInput): Promise<ApiRequestDTO> {
  const result = await pool.query(
    `INSERT INTO api_requests (name, institution, website, email, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [input.name, input.institution, input.website ?? null, input.email, input.notes ?? null]
  );
  return toApiRequest(result.rows[0]);
}

export async function listRequests(): Promise<ApiRequestDTO[]> {
  const result = await pool.query(`SELECT * FROM api_requests ORDER BY created_at DESC`);
  return result.rows.map(toApiRequest);
}

export async function updateStatus(id: number, status: string): Promise<ApiRequestDTO | null> {
  const result = await pool.query(
    `UPDATE api_requests SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows.length ? toApiRequest(result.rows[0]) : null;
}
