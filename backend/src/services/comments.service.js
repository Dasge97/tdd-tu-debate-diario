import { query } from "../database/db.js";

export async function getCommentsByDebateId(debateId) {
  const rows = await query(
    `
      SELECT
        c.id,
        c.debate_id,
        c.user_id,
        c.parent_id,
        c.content,
        c.created_at,
        c.score,
        u.username
      FROM comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.debate_id = ?
      ORDER BY c.created_at ASC
    `,
    [debateId]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    debateId: Number(row.debate_id),
    userId: Number(row.user_id),
    username: row.username,
    parentId: row.parent_id ? Number(row.parent_id) : null,
    content: row.content,
    createdAt: row.created_at,
    score: Number(row.score)
  }));
}

export async function createComment({ debateId, userId, parentId, content }) {
  const result = await query(
    `
      INSERT INTO comments (debate_id, user_id, parent_id, content)
      VALUES (?, ?, ?, ?)
    `,
    [debateId, userId, parentId || null, content]
  );

  const insertedId = Number(result.insertId);
  const rows = await query(
    `
      SELECT id, debate_id, user_id, parent_id, content, created_at, score
      FROM comments
      WHERE id = ?
    `,
    [insertedId]
  );

  return rows[0];
}

export async function getCommentById(commentId) {
  const rows = await query(
    `
      SELECT id, debate_id, user_id, parent_id, content, created_at, score
      FROM comments
      WHERE id = ?
      LIMIT 1
    `,
    [commentId]
  );
  return rows[0] || null;
}

export async function voteComment({ commentId, userId }) {
  const comment = await getCommentById(commentId);
  if (!comment) {
    const err = new Error("Comentario no encontrado.");
    err.code = "COMMENT_NOT_FOUND";
    throw err;
  }
  if (Number(comment.user_id) === Number(userId)) {
    const err = new Error("No puedes votar tu propio comentario.");
    err.code = "OWN_COMMENT";
    throw err;
  }

  const voteInsert = await query(
    `
      INSERT IGNORE INTO votes (user_id, comment_id)
      VALUES (?, ?)
    `,
    [userId, commentId]
  );

  if (!voteInsert.affectedRows) {
    const err = new Error("Ya votaste este comentario.");
    err.code = "ALREADY_VOTED";
    throw err;
  }

  await query(
    `
      UPDATE comments
      SET score = score + 1
      WHERE id = ?
    `,
    [commentId]
  );

  const updated = await getCommentById(commentId);
  return updated;
}
