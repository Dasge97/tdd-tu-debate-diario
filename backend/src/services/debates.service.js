import { query } from "../database/db.js";

const toPercent = (value, total) => (total > 0 ? Math.round((value * 100) / total) : 0);

const mapDebate = (row) => {
  const support = Number(row.support_count || 0);
  const oppose = Number(row.oppose_count || 0);
  const neutral = Number(row.neutral_count || 0);
  const total = support + oppose + neutral;

  return {
    id: Number(row.id),
    title: row.title,
    context: row.context,
    createdAt: row.created_at,
    dayDate: row.day_date,
    createdBy: row.created_by,
    commentCount: Number(row.comment_count || 0),
    positions: {
      favor: toPercent(support, total),
      contra: toPercent(oppose, total),
      neutral: toPercent(neutral, total)
    },
    positionsRaw: {
      support,
      oppose,
      neutral
    }
  };
};

const baseSelect = `
  SELECT
    d.id,
    d.title,
    d.context,
    d.created_at,
    d.day_date,
    d.created_by,
    COUNT(DISTINCT c.id) AS comment_count,
    COUNT(DISTINCT CASE WHEN p.position = 'support' THEN p.id END) AS support_count,
    COUNT(DISTINCT CASE WHEN p.position = 'oppose' THEN p.id END) AS oppose_count,
    COUNT(DISTINCT CASE WHEN p.position = 'neutral' THEN p.id END) AS neutral_count
  FROM debates d
  LEFT JOIN comments c ON c.debate_id = d.id
  LEFT JOIN positions p ON p.debate_id = d.id
`;

export async function getTodayDebates() {
  const rows = await query(
    `${baseSelect}
      WHERE d.day_date = CURDATE()
      GROUP BY d.id
      ORDER BY d.created_at ASC
      LIMIT 5
    `
  );

  return rows.map(mapDebate);
}

export async function getDebateById(id) {
  const rows = await query(
    `${baseSelect}
      WHERE d.id = ?
      GROUP BY d.id
    `,
    [id]
  );

  if (rows.length === 0) return null;
  return mapDebate(rows[0]);
}

export async function searchDebates({ q = "", sort = "new", from = "", to = "", position = "" }) {
  const where = [];
  const params = [];

  if (q) {
    where.push("(d.title LIKE ? OR d.context LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  if (from) {
    where.push("d.day_date >= ?");
    params.push(from);
  }

  if (to) {
    where.push("d.day_date <= ?");
    params.push(to);
  }

  if (["support", "oppose", "neutral"].includes(position)) {
    where.push("EXISTS (SELECT 1 FROM positions px WHERE px.debate_id = d.id AND px.position = ?)");
    params.push(position);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const orderByMap = {
    new: "d.created_at DESC",
    old: "d.created_at ASC",
    comments: "comment_count DESC, d.created_at DESC",
    votes: "(support_count + oppose_count + neutral_count) DESC, d.created_at DESC"
  };
  const orderBy = orderByMap[sort] || orderByMap.new;

  const rows = await query(
    `${baseSelect}
      ${whereSql}
      GROUP BY d.id
      ORDER BY ${orderBy}
      LIMIT 50
    `,
    params
  );

  return rows.map(mapDebate);
}

export async function getTrendingDebates(limit = 10) {
  const rows = await query(
    `
      SELECT
        d.id,
        d.title,
        d.context,
        d.created_at,
        d.day_date,
        d.created_by,
        COUNT(DISTINCT c.id) AS comment_count,
        COUNT(DISTINCT CASE WHEN p.position = 'support' THEN p.id END) AS support_count,
        COUNT(DISTINCT CASE WHEN p.position = 'oppose' THEN p.id END) AS oppose_count,
        COUNT(DISTINCT CASE WHEN p.position = 'neutral' THEN p.id END) AS neutral_count,
        (
          COUNT(DISTINCT c.id) * 2 +
          (COUNT(DISTINCT p.id) * 1.5) +
          GREATEST(0, 48 - TIMESTAMPDIFF(HOUR, d.created_at, NOW()))
        ) AS trend_score
      FROM debates d
      LEFT JOIN comments c ON c.debate_id = d.id
      LEFT JOIN positions p ON p.debate_id = d.id
      GROUP BY d.id
      ORDER BY trend_score DESC, d.created_at DESC
      LIMIT ?
    `,
    [Number(limit)]
  );

  return rows.map((row) => ({
    ...mapDebate(row),
    trendScore: Number(row.trend_score || 0)
  }));
}
