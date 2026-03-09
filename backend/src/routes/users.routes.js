import { Router } from "express";
import {
  getMeController,
  searchUsersController,
  getTopUsersController,
  getUserByIdController,
  getUserByUsernameController,
  updateMeController
} from "../controllers/users.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const usersRouter = Router();

usersRouter.get("/top", getTopUsersController);
usersRouter.get("/search", searchUsersController);
usersRouter.get("/me", requireAuth, getMeController);
usersRouter.put("/me", requireAuth, updateMeController);
usersRouter.get("/username/:username", getUserByUsernameController);
usersRouter.get("/:id", getUserByIdController);

export default usersRouter;
