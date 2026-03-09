import { Router } from "express";
import {
  getDebateByIdController,
  getTodayDebatesController,
  getTrendingDebatesController,
  searchDebatesController
} from "../controllers/debates.controller.js";

const debatesRouter = Router();

debatesRouter.get("/today", getTodayDebatesController);
debatesRouter.get("/search", searchDebatesController);
debatesRouter.get("/trending", getTrendingDebatesController);
debatesRouter.get("/:id", getDebateByIdController);

export default debatesRouter;
