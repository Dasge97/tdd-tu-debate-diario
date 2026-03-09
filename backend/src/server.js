import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import debatesRouter from "./routes/debates.routes.js";
import commentsRouter from "./routes/comments.routes.js";
import positionsRouter from "./routes/positions.routes.js";
import authRouter from "./routes/auth.routes.js";
import usersRouter from "./routes/users.routes.js";
import favoritesRouter from "./routes/favorites.routes.js";
import friendsRouter from "./routes/friends.routes.js";
import chatRouter from "./routes/chat.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import { ensureChatSchema } from "./services/chat.service.js";
import { ensureNotificationsSchema } from "./services/notifications.service.js";
import { setupChatGateway } from "./realtime/chat.gateway.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = Number(process.env.APP_PORT || 3000);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/debates", debatesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/positions", positionsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/friends", friendsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/notifications", notificationsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

const httpServer = createServer(app);

async function startServer() {
  await ensureChatSchema();
  await ensureNotificationsSchema();
  setupChatGateway(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Backend TDD escuchando en http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("No se pudo iniciar el servidor:", error);
  process.exit(1);
});
