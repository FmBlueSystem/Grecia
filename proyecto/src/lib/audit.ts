import { query } from "./db";

interface ChangeEntry {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

export async function logChanges(
  userId: number,
  userName: string,
  entityType: "caso" | "user" | "department" | "settings",
  entityId: string,
  changes: ChangeEntry[],
  country?: string
): Promise<void> {
  if (changes.length === 0) return;

  const values: unknown[] = [];
  const rows: string[] = [];
  let i = 1;

  for (const c of changes) {
    rows.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
    values.push(userId, userName, entityType, entityId, country || null, c.field, c.oldValue, c.newValue);
  }

  await query(
    `INSERT INTO casos.change_logs (user_id, user_name, entity_type, entity_id, country, field, old_value, new_value) VALUES ${rows.join(", ")}`,
    values
  );
}

export interface ChangeLog {
  id: number;
  user_id: number;
  user_name: string;
  entity_type: string;
  entity_id: string;
  country: string | null;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export async function getChangeLogs(
  entityType: string,
  entityId: string
): Promise<ChangeLog[]> {
  return query<ChangeLog>(
    "SELECT * FROM casos.change_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC LIMIT 100",
    [entityType, entityId]
  );
}
