import { pool } from "../db.js";

export async function getAllViews(): Promise<Record<string, number>> {
  const result = await pool.query(`SELECT sector_id, views FROM sector_views`);
  const map: Record<string, number> = {};
  for (const row of result.rows) map[row.sector_id] = Number(row.views);
  return map;
}

export async function incrementView(sectorId: string): Promise<number> {
  const result = await pool.query(
    `INSERT INTO sector_views (sector_id, views, updated_at) VALUES ($1, 1, now())
     ON CONFLICT (sector_id) DO UPDATE SET views = sector_views.views + 1, updated_at = now()
     RETURNING views`,
    [sectorId]
  );
  return Number(result.rows[0].views);
}
