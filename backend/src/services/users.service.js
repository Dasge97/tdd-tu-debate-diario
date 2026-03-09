import { query } from "../database/db.js";

export async function getUserById(id) {
  const rows = await query(
    `
      SELECT id, username, email, bio, avatar_url, location, reliability_score, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );
  return rows[0] || null;
}

export async function getPublicUserById(id) {
  const rows = await query(
    `
      SELECT id, username, bio, avatar_url, location, reliability_score, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );
  return rows[0] || null;
}

export async function getPublicUserByUsername(username) {
  const rows = await query(
    `
      SELECT id, username, bio, avatar_url, location, reliability_score, created_at, updated_at
      FROM users
      WHERE username = ?
      LIMIT 1
    `,
    [username]
  );
  return rows[0] || null;
}

export async function updateUserProfile(userId, { bio, avatarUrl, location }) {
  await query(
    `
      UPDATE users
      SET bio = ?, avatar_url = ?, location = ?
      WHERE id = ?
    `,
    [bio || null, avatarUrl || null, location || null, userId]
  );
  return getUserById(userId);
}

export async function getTopUsers(limit = 6) {
  const rows = await query(
    `
      SELECT id, username, bio, avatar_url, reliability_score, created_at
      FROM users
      ORDER BY reliability_score DESC, created_at ASC
      LIMIT ?
    `,
    [Number(limit)]
  );

  return rows;
}

export async function searchPublicUsers({ q = "", limit = 20, page = 1 }) {
  const normalized = String(q || "").trim().toLowerCase();
  const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 50) : 20;
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const offset = (safePage - 1) * safeLimit;

  const whereSql = normalized
    ? `
      WHERE username LIKE ?
         OR bio LIKE ?
         OR location LIKE ?
    `
    : "";

  const whereParams = normalized
    ? [`%${normalized}%`, `%${normalized}%`, `%${normalized}%`]
    : [];

  const countRows = await query(
    `
      SELECT COUNT(*) AS total
      FROM users
      ${whereSql}
    `,
    whereParams
  );
  const total = Number(countRows[0]?.total || 0);

  const rows = await query(
    `
      SELECT id, username, bio, avatar_url, location, reliability_score, created_at, updated_at
      FROM users
      ${whereSql}
      ORDER BY reliability_score DESC, username ASC
      LIMIT ? OFFSET ?
    `,
    [...whereParams, safeLimit, offset]
  );

  return {
    items: rows,
    total,
    page: safePage,
    pageSize: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit))
  };
}
