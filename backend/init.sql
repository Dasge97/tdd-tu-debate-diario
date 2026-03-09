SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS user_notifications;
DROP TABLE IF EXISTS chat_participants;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_conversations;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS revoked_tokens;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS debates;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio VARCHAR(280) NULL,
  avatar_url VARCHAR(255) NULL,
  location VARCHAR(120) NULL,
  reliability_score INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE debates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  context TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  day_date DATE NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_debates_day_date (day_date),
  CONSTRAINT fk_debates_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  debate_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  score INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_comments_debate_id (debate_id),
  KEY idx_comments_parent_id (parent_id),
  CONSTRAINT fk_comments_debate
    FOREIGN KEY (debate_id) REFERENCES debates(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent
    FOREIGN KEY (parent_id) REFERENCES comments(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE votes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  comment_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_votes_user_comment (user_id, comment_id),
  CONSTRAINT fk_votes_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_votes_comment
    FOREIGN KEY (comment_id) REFERENCES comments(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE positions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  debate_id BIGINT UNSIGNED NOT NULL,
  position ENUM('support', 'oppose', 'neutral') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_positions_user_debate (user_id, debate_id),
  KEY idx_positions_debate_id (debate_id),
  CONSTRAINT fk_positions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_positions_debate
    FOREIGN KEY (debate_id) REFERENCES debates(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE revoked_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token_jti VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_revoked_tokens_jti (token_jti),
  KEY idx_revoked_tokens_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  debate_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorites_user_debate (user_id, debate_id),
  KEY idx_favorites_user_created_at (user_id, created_at),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_debate
    FOREIGN KEY (debate_id) REFERENCES debates(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE friends (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  requester_id BIGINT UNSIGNED NOT NULL,
  addressee_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_friends_directional (requester_id, addressee_id),
  KEY idx_friends_status_addressee (status, addressee_id),
  KEY idx_friends_status_requester (status, requester_id),
  CONSTRAINT fk_friends_requester
    FOREIGN KEY (requester_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_friends_addressee
    FOREIGN KEY (addressee_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  dm_key VARCHAR(64) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_chat_conversations_dm_key (dm_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chat_messages_conversation_id (conversation_id, id),
  CONSTRAINT fk_chat_messages_conversation
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chat_messages_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_participants (
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_read_message_id BIGINT UNSIGNED NULL,
  last_read_at DATETIME NULL,
  PRIMARY KEY (conversation_id, user_id),
  KEY idx_chat_participants_user (user_id),
  CONSTRAINT fk_chat_participants_conversation
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_chat_participants_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(120) NOT NULL,
  body VARCHAR(255) NOT NULL,
  data_json JSON NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_user_notifications_user_read_created (user_id, is_read, created_at),
  CONSTRAINT fk_user_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, email, password_hash, bio, location, reliability_score) VALUES
('ana_debate', 'ana@example.com', '$2a$10$Y3MyZqpOEzByo7CPG1n5LewMbg4RWRJny8.1ThLriuzZnx1N.EsP6', 'Analizo debates de tecnología y trabajo.', 'Madrid', 94),
('carlos_opinion', 'carlos@example.com', '$2a$10$YtgjFbB6a1I5JFr83tznFunEpPli71cVZk2QL5gbW9u9CsVk5oq9u', 'Me interesa política pública y ciudad.', 'Valencia', 91),
('maria_criterio', 'maria@example.com', '$2a$10$mxnbiYW/.v45fn8kRHSh0ud5zhZjvdShxBCu3iPr8jfrxtSa/ISru', 'Debato sobre energía y economía.', 'Barcelona', 89);

INSERT INTO debates (title, context, day_date, created_by) VALUES
(
  '¿Es viable la jornada laboral de 4 días?',
  'Cada vez más empresas prueban semanas laborales reducidas y reportan mejoras en productividad y bienestar, aunque persisten dudas sobre su aplicación en sectores con turnos continuos.',
  CURDATE(),
  1
),
(
  '¿La IA reemplazará a los programadores?',
  'Las herramientas de asistencia con IA aceleran tareas de desarrollo, pero el debate sigue abierto sobre si sustituyen empleo o si transforman el perfil técnico requerido.',
  CURDATE(),
  2
),
(
  '¿Debe limitarse Airbnb en grandes ciudades?',
  'Distintas ciudades estudian límites al alquiler turístico para aliviar la presión sobre el mercado residencial y reducir el encarecimiento del alquiler de larga duración.',
  CURDATE(),
  3
),
(
  '¿Es necesaria la energía nuclear para la transición energética?',
  'En plena descarbonización, algunos expertos defienden la nuclear como soporte estable de la red, mientras otros cuestionan sus costes y gestión de residuos.',
  CURDATE(),
  1
),
(
  '¿Deben regularse las redes sociales?',
  'La discusión enfrenta protección frente a desinformación y riesgos en salud mental con la necesidad de preservar la libertad de expresión y la innovación digital.',
  CURDATE(),
  2
);

INSERT INTO comments (debate_id, user_id, parent_id, content, score) VALUES
(1, 1, NULL, 'Creo que es viable en sectores de oficina si se mide por objetivos.', 12),
(1, 2, NULL, 'Sin cambios en procesos, reducir días puede generar cuellos de botella.', 7),
(2, 3, NULL, 'La IA ayuda mucho, pero todavía necesita supervisión experta.', 15),
(2, 1, 3, 'Totalmente de acuerdo: acelera, pero no reemplaza criterio técnico.', 5),
(5, 2, NULL, 'Regular sí, pero con límites claros para no censurar debate legítimo.', 9);

INSERT INTO votes (user_id, comment_id) VALUES
(2, 1),
(3, 1),
(1, 3),
(2, 3),
(3, 5);

INSERT INTO positions (user_id, debate_id, position) VALUES
(1, 1, 'support'),
(2, 1, 'oppose'),
(3, 1, 'neutral'),
(1, 2, 'neutral'),
(2, 2, 'oppose'),
(3, 2, 'support'),
(1, 3, 'support'),
(2, 3, 'neutral'),
(3, 3, 'support'),
(1, 4, 'support'),
(2, 4, 'oppose'),
(3, 4, 'neutral'),
(1, 5, 'support'),
(2, 5, 'support'),
(3, 5, 'neutral');

INSERT INTO favorites (user_id, debate_id) VALUES
(1, 2),
(1, 5),
(2, 1),
(3, 4);

INSERT INTO friends (requester_id, addressee_id, status, responded_at) VALUES
(1, 2, 'accepted', NOW()),
(2, 3, 'pending', NULL);

INSERT INTO chat_conversations (dm_key) VALUES
('1:2');

INSERT INTO chat_participants (conversation_id, user_id, last_read_message_id, last_read_at) VALUES
(1, 1, NULL, NULL),
(1, 2, NULL, NULL);

INSERT INTO chat_messages (conversation_id, sender_id, content) VALUES
(1, 1, 'Hola Carlos, ¿qué opinas del debate de la jornada de 4 días?'),
(1, 2, 'Lo veo interesante, pero dependerá mucho del tipo de empresa.');
