import { createComment, getCommentsByDebateId, voteComment } from "../services/comments.service.js";
import { createNotification } from "../services/notifications.service.js";
import { emitToUser } from "../realtime/realtime.hub.js";

const parseData = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
};

export async function getCommentsByDebateIdController(req, res, next) {
  try {
    const debateId = Number(req.params.debateId);
    if (!Number.isInteger(debateId) || debateId <= 0) {
      return res.status(400).json({ error: "El id del debate no es válido." });
    }

    const comments = await getCommentsByDebateId(debateId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
}

export async function createCommentController(req, res, next) {
  try {
    const { debateId, parentId = null, content } = req.body;
    const userId = req.auth.userId;

    if (!Number.isInteger(Number(debateId)) || Number(debateId) <= 0) {
      return res.status(400).json({ error: "debateId es obligatorio y debe ser numérico." });
    }
    if (parentId !== null && (!Number.isInteger(Number(parentId)) || Number(parentId) <= 0)) {
      return res.status(400).json({ error: "parentId debe ser null o numérico." });
    }
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "content es obligatorio." });
    }

    const comment = await createComment({
      debateId: Number(debateId),
      userId: Number(userId),
      parentId: parentId === null ? null : Number(parentId),
      content: content.trim()
    });

    res.status(201).json({
      id: Number(comment.id),
      debateId: Number(comment.debate_id),
      userId: Number(comment.user_id),
      parentId: comment.parent_id ? Number(comment.parent_id) : null,
      content: comment.content,
      createdAt: comment.created_at,
      score: Number(comment.score)
    });
  } catch (error) {
    next(error);
  }
}

export async function voteCommentController(req, res, next) {
  try {
    const commentId = Number(req.params.commentId);
    if (!Number.isInteger(commentId) || commentId <= 0) {
      return res.status(400).json({ error: "commentId no válido." });
    }

    const updated = await voteComment({
      commentId,
      userId: req.auth.userId
    });

    const ownerId = Number(updated.user_id);
    if (ownerId !== Number(req.auth.userId)) {
      const notification = await createNotification(ownerId, {
        type: "comment_vote",
        title: "Nuevo voto en tu comentario",
        body: "Alguien ha valorado positivamente uno de tus comentarios.",
        data: {
          commentId: Number(updated.id),
          debateId: Number(updated.debate_id),
          voterUserId: Number(req.auth.userId)
        }
      });

      if (notification) {
        emitToUser(ownerId, {
          type: "notification:new",
          notification: {
            id: Number(notification.id),
            userId: Number(notification.user_id),
            type: notification.type,
            title: notification.title,
            body: notification.body,
            data: parseData(notification.data_json),
            isRead: Boolean(notification.is_read),
            createdAt: notification.created_at,
            readAt: notification.read_at
          }
        });
      }
    }

    res.json({
      id: Number(updated.id),
      debateId: Number(updated.debate_id),
      userId: Number(updated.user_id),
      parentId: updated.parent_id ? Number(updated.parent_id) : null,
      content: updated.content,
      createdAt: updated.created_at,
      score: Number(updated.score)
    });
  } catch (error) {
    if (error.code === "COMMENT_NOT_FOUND") {
      return res.status(404).json({ error: error.message });
    }
    if (error.code === "OWN_COMMENT" || error.code === "ALREADY_VOTED") {
      return res.status(409).json({ error: error.message });
    }
    return next(error);
  }
}
