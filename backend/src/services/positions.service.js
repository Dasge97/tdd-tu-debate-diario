import { query } from "../database/db.js";

const allowedPositions = new Set(["support", "oppose", "neutral"]);

export function isValidPosition(position) {
  return allowedPositions.has(position);
}

export async function upsertPosition({ userId, debateId, position }) {
  const result = await query(
    `
      INSERT INTO positions (user_id, debate_id, position)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE position = VALUES(position)
    `,
    [userId, debateId, position]
  );

  const id = Number(result.insertId || 0);
  if (id > 0) {
    const rows = await query(
      "SELECT id, user_id, debate_id, position FROM positions WHERE id = ?",
      [id]
    );
    return rows[0];
  }

  const rows = await query(
    "SELECT id, user_id, debate_id, position FROM positions WHERE user_id = ? AND debate_id = ?",
    [userId, debateId]
  );
  return rows[0];
}
