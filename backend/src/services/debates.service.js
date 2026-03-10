import { query } from "../database/db.js";

const toPercent = (value, total) => (total > 0 ? Math.round((value * 100) / total) : 0);
const parseJsonArray = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_error) {
    return fallback;
  }
};

const mapDebate = (row) => {
  const support = Number(row.support_count || 0);
  const oppose = Number(row.oppose_count || 0);
  const neutral = Number(row.neutral_count || 0);
  const total = support + oppose + neutral;
  const authorType = row.author_type || "ai";

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
    },
    author:
      authorType === "user" && row.created_by
        ? {
            type: "user",
            id: Number(row.created_by),
            name: row.author_username || "Usuario",
            label: row.author_user_tagline || "Miembro de la comunidad",
            bio: row.author_user_bio || "",
            avatarUrl: row.author_user_avatar_url || "",
            reliabilityScore: Number(row.author_user_reliability_score || 0),
            location: row.author_user_location || "",
            focus: row.author_user_tagline || "Autor de la comunidad",
            traits: parseJsonArray(row.author_user_traits_json, [])
          }
        : {
            type: "ai",
            id: null,
            name: row.ai_persona_name || "Redacción TDD",
            label: row.ai_persona_label || "Analista editorial sintético",
            bio:
              row.ai_persona_bio ||
              "Una voz editorial creada para proponer debates diarios con un enfoque consistente y legible.",
            focus: row.ai_persona_focus || "Observa la actualidad desde una mirada editorial concreta.",
            traits: parseJsonArray(row.ai_persona_traits_json, [])
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
    d.author_type,
    d.ai_persona_name,
    d.ai_persona_label,
    d.ai_persona_bio,
    d.ai_persona_focus,
    d.ai_persona_traits_json,
    COUNT(DISTINCT c.id) AS comment_count,
    COUNT(DISTINCT CASE WHEN p.position = 'support' THEN p.id END) AS support_count,
    COUNT(DISTINCT CASE WHEN p.position = 'oppose' THEN p.id END) AS oppose_count,
    COUNT(DISTINCT CASE WHEN p.position = 'neutral' THEN p.id END) AS neutral_count,
    au.username AS author_username,
    au.bio AS author_user_bio,
    au.avatar_url AS author_user_avatar_url,
    au.location AS author_user_location,
    au.reliability_score AS author_user_reliability_score,
    au.profile_tagline AS author_user_tagline,
    au.profile_traits_json AS author_user_traits_json
  FROM debates d
  LEFT JOIN comments c ON c.debate_id = d.id
  LEFT JOIN positions p ON p.debate_id = d.id
  LEFT JOIN users au ON au.id = d.created_by
`;

export async function ensureDebateAuthorSchema() {
  await query(`
    ALTER TABLE debates
    ADD COLUMN author_type ENUM('ai', 'user') NOT NULL DEFAULT 'ai'
  `).catch(() => {});

  await query(`
    ALTER TABLE debates
    ADD COLUMN ai_persona_name VARCHAR(120) NULL
  `).catch(() => {});

  await query(`
    ALTER TABLE debates
    ADD COLUMN ai_persona_label VARCHAR(160) NULL
  `).catch(() => {});

  await query(`
    ALTER TABLE debates
    ADD COLUMN ai_persona_bio VARCHAR(255) NULL
  `).catch(() => {});

  await query(`
    ALTER TABLE debates
    ADD COLUMN ai_persona_focus VARCHAR(180) NULL
  `).catch(() => {});

  await query(`
    ALTER TABLE debates
    ADD COLUMN ai_persona_traits_json JSON NULL
  `).catch(() => {});

  await query(`
    ALTER TABLE users
    ADD COLUMN profile_tagline VARCHAR(160) NULL
  `).catch(() => {});

  await query(`
    ALTER TABLE users
    ADD COLUMN profile_traits_json JSON NULL
  `).catch(() => {});

  await query(`
    UPDATE debates
    SET
      author_type = COALESCE(author_type, 'ai'),
      ai_persona_name = COALESCE(ai_persona_name, 'Redacción TDD'),
      ai_persona_label = COALESCE(ai_persona_label, 'Analista editorial sintético'),
      ai_persona_bio = COALESCE(ai_persona_bio, 'Una voz editorial creada para proponer debates diarios con un enfoque consistente y legible.'),
      ai_persona_focus = COALESCE(ai_persona_focus, 'Observa la actualidad desde una mirada editorial concreta.'),
      ai_persona_traits_json = COALESCE(ai_persona_traits_json, JSON_ARRAY('didáctica', 'contextual', 'serena'))
  `).catch(() => {});

  await query(`
    UPDATE users
    SET
      profile_tagline = COALESCE(profile_tagline, 'Miembro de la comunidad'),
      profile_traits_json = COALESCE(profile_traits_json, JSON_ARRAY())
  `).catch(() => {});
}

export async function getTodayDebates() {
  let rows = await query(
    `${baseSelect}
      WHERE d.day_date = CURDATE()
      GROUP BY d.id
      ORDER BY d.created_at ASC
      LIMIT 5
    `
  );

  // En desarrollo puede no haber debates para la fecha actual; en ese caso
  // mostramos el ultimo bloque diario disponible para no dejar la home vacia.
  if (rows.length === 0) {
    rows = await query(
      `${baseSelect}
        WHERE d.day_date = (
          SELECT MAX(d2.day_date)
          FROM debates d2
        )
        GROUP BY d.id
        ORDER BY d.created_at ASC
        LIMIT 5
      `
    );
  }

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
