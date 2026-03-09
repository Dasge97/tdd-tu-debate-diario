import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../services/auth.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
const parseBearer = (authorization = "") => {
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export async function requireAuth(req, res, next) {
  try {
    const token = parseBearer(req.headers.authorization || "");
    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado." });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const revoked = await isTokenRevoked(payload.jti);
    if (revoked) {
      return res.status(401).json({ error: "Token revocado." });
    }

    req.auth = {
      token,
      userId: Number(payload.sub),
      jti: payload.jti,
      exp: payload.exp
    };

    next();
  } catch (_error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = parseBearer(req.headers.authorization || "");
    if (!token) {
      req.auth = null;
      return next();
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const revoked = await isTokenRevoked(payload.jti);
    if (revoked) {
      req.auth = null;
      return next();
    }

    req.auth = {
      token,
      userId: Number(payload.sub),
      jti: payload.jti,
      exp: payload.exp
    };
    return next();
  } catch (_error) {
    req.auth = null;
    return next();
  }
}
